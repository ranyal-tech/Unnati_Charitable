const prisma = require('../lib/prisma');
const {
  CashfreeConfigError,
  createCashfreeOrder,
  getCashfreeOrderStatus,
  getCashfreeOrderPayments,
  getCashfreePublicUrls,
} = require('../config/cashfree');
const {
  completeDonation,
  completeDonationsByOrderId,
  sendCertificateIfNeeded,
} = require('../services/donationCompletionService');

const categoryInclude = {
  category: {
    select: { name: true, slug: true },
  },
};

function validateDonationInput(body) {
  const { categorySlug, amount, donorName, donorEmail } = body;

  if (!categorySlug || amount === undefined || amount === null || !donorName || !donorEmail) {
    return 'categorySlug, amount, donorName, and donorEmail are required';
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return 'Amount must be a number greater than 0';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(donorEmail).trim())) {
    return 'Invalid email address';
  }

  return null;
}

function mapCashfreeError(error) {
  if (error instanceof CashfreeConfigError) {
    return { status: 400, message: error.message };
  }

  const cashfreeError = error.response?.data;

  if (cashfreeError?.type === 'authentication_error') {
    return {
      status: 502,
      message:
        'Cashfree authentication failed. Use sandbox keys with sandbox mode, or production keys with production mode.',
    };
  }

  if (cashfreeError?.code === 'order_meta.return_url_invalid') {
    return {
      status: 400,
      message:
        'Cashfree rejected the return URL. Production requires HTTPS URLs. For local testing, use sandbox credentials.',
    };
  }

  if (cashfreeError?.code === 'order_meta.notify_url_invalid') {
    return {
      status: 400,
      message:
        'Cashfree rejected the webhook URL. Set BACKEND_URL to only your API URL (no quotes, no BACKEND_URL= prefix).',
    };
  }

  if (cashfreeError?.message) {
    return { status: 502, message: cashfreeError.message };
  }

  return { status: 500, message: 'Failed to create donation order' };
}

function extractWebhookOrderId(payload = {}) {
  return (
    payload.order?.order_id ||
    payload.order_id ||
    payload.payment?.order_id ||
    null
  );
}

function isCashfreePaymentSuccess({ paymentStatus, orderStatus, webhookType }) {
  return (
    paymentStatus === 'SUCCESS' ||
    orderStatus === 'PAID' ||
    webhookType === 'PAYMENT_SUCCESS_WEBHOOK'
  );
}

const FAILED_PAYMENT_STATUSES = new Set([
  'FAILED',
  'CANCELLED',
  'USER_DROPPED',
  'VOID',
]);

const FAILED_ORDER_STATUSES = new Set(['FAILED', 'EXPIRED', 'TERMINATED']);

function isFailedPaymentStatus(status) {
  return FAILED_PAYMENT_STATUSES.has(status);
}

function isFailedOrderStatus(status) {
  return FAILED_ORDER_STATUSES.has(status);
}

function isCashfreePaymentFailed({ paymentStatus, orderStatus, webhookType }) {
  return (
    isFailedPaymentStatus(paymentStatus) ||
    isFailedOrderStatus(orderStatus) ||
    webhookType === 'PAYMENT_FAILED_WEBHOOK' ||
    webhookType === 'PAYMENT_USER_DROPPED_WEBHOOK'
  );
}

function findSuccessfulPayment(payments = []) {
  return payments.find((payment) => payment.payment_status === 'SUCCESS');
}

function findFailedPayment(payments = []) {
  return payments.find((payment) => isFailedPaymentStatus(payment.payment_status));
}

function hasPendingPayment(payments = []) {
  return payments.some((payment) => payment.payment_status === 'PENDING');
}

async function failDonation(donationId) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: categoryInclude,
  });

  if (!donation || donation.status !== 'PENDING') {
    return donation;
  }

  return prisma.donation.update({
    where: { id: donationId },
    data: { status: 'FAILED' },
    include: categoryInclude,
  });
}

async function failDonationsByOrderId(cfOrderId) {
  const donations = await prisma.donation.findMany({
    where: { cfOrderId, status: 'PENDING' },
    include: categoryInclude,
  });

  if (donations.length === 0) {
    return [];
  }

  await prisma.donation.updateMany({
    where: { cfOrderId, status: 'PENDING' },
    data: { status: 'FAILED' },
  });

  return prisma.donation.findMany({
    where: { cfOrderId },
    include: categoryInclude,
  });
}

async function syncDonationFromCashfree(donation) {
  if (!donation.cfOrderId) {
    return donation;
  }

  if (donation.status === 'COMPLETED') {
    return sendCertificateIfNeeded(donation);
  }

  if (donation.status !== 'PENDING') {
    return donation;
  }

  try {
    const cashfreeOrder = await getCashfreeOrderStatus(donation.cfOrderId);
    let orderStatus = cashfreeOrder.order_status;
    let paymentId = cashfreeOrder.cf_payment_id || donation.cfPaymentId;

    const payments = await getCashfreeOrderPayments(donation.cfOrderId);
    const successfulPayment = findSuccessfulPayment(payments);

    if (successfulPayment) {
      orderStatus = 'PAID';
      paymentId = successfulPayment.cf_payment_id || paymentId;
    }

    if (orderStatus === 'PAID' || successfulPayment) {
      const completed = await completeDonation(
        donation.id,
        paymentId || donation.cfPaymentId
      );
      return completed || donation;
    }

    if (isFailedOrderStatus(orderStatus)) {
      return failDonation(donation.id);
    }

    const failedPayment = findFailedPayment(payments);

    if (failedPayment && !hasPendingPayment(payments)) {
      return failDonation(donation.id);
    }
  } catch (syncError) {
    console.error('syncDonationFromCashfree error:', syncError.message);
  }

  return donation;
}

async function markDonationFailed(donationId) {
  if (!donationId) {
    return;
  }

  try {
    await prisma.donation.update({
      where: { id: donationId },
      data: { status: 'FAILED' },
    });
  } catch (updateError) {
    console.error('Failed to mark donation as FAILED:', updateError.message);
  }
}

async function createOrder(req, res) {
  let donationId = null;

  try {
    const validationError = validateDonationInput(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const {
      categorySlug,
      amount,
      donorName,
      donorEmail,
      donorPhone,
      message,
    } = req.body;

    const parsedAmount = Number(amount);
    const trimmedName = String(donorName).trim();
    const trimmedEmail = String(donorEmail).trim();

    const category = await prisma.donationCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const donation = await prisma.donation.create({
      data: {
        categoryId: category.id,
        donorName: trimmedName,
        donorEmail: trimmedEmail,
        donorPhone: donorPhone ? String(donorPhone).trim() : null,
        amount: parsedAmount,
        message: message ? String(message).trim() : null,
        status: 'PENDING',
      },
    });

    donationId = donation.id;
    const orderId = `DON_${donation.id}`;
    const { frontendUrl, backendUrl } = getCashfreePublicUrls();

    const cashfreeOrder = await createCashfreeOrder({
      order_id: orderId,
      order_amount: parsedAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: trimmedEmail.replace(/[^a-zA-Z0-9_-]/g, '_'),
        customer_email: trimmedEmail,
        customer_phone: donorPhone ? String(donorPhone).trim() : '9999999999',
        customer_name: trimmedName,
      },
      order_meta: {
        return_url: `${frontendUrl}/donation-status?donation_id=${donation.id}`,
        notify_url: `${backendUrl}/api/donations/webhook`,
      },
    });

    if (!cashfreeOrder.payment_session_id) {
      throw new Error('Cashfree did not return a payment session id');
    }

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        cfOrderId: orderId,
        cfPaymentSessionId: cashfreeOrder.payment_session_id,
      },
    });

    res.json({
      donationId: donation.id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      orderId,
    });
  } catch (error) {
    console.error('createOrder error:', error.response?.data || error.message);

    await markDonationFailed(donationId);

    const mappedError = mapCashfreeError(error);
    res.status(mappedError.status).json({ error: mappedError.message });
  }
}

async function handleWebhook(req, res) {
  try {
    const body = req.body || {};
    const payload = body.data || body;
    const webhookType = body.type;

    const orderId = extractWebhookOrderId(payload);
    const orderStatus = payload?.order?.order_status || payload?.order_status;
    const paymentStatus =
      payload?.payment?.payment_status || payload?.payment_status;
    const paymentId =
      payload?.payment?.cf_payment_id || payload?.cf_payment_id;

    if (!orderId) {
      console.warn('Cashfree webhook ignored: missing order_id');
      return res.status(200).json({ success: true, ignored: true });
    }

    const paid = isCashfreePaymentSuccess({ paymentStatus, orderStatus, webhookType });
    const failed = isCashfreePaymentFailed({ paymentStatus, orderStatus, webhookType });

    if (paid) {
      const completed = await completeDonationsByOrderId(orderId, paymentId || null);

      if (completed.length === 0) {
        console.warn('Cashfree webhook: no donation found for order', orderId);
      }
    } else if (failed) {
      await failDonationsByOrderId(orderId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('handleWebhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function getDonationById(id) {
  return prisma.donation.findUnique({
    where: { id },
    include: categoryInclude,
  });
}

async function refreshDonationStatus(id) {
  const donation = await getDonationById(id);

  if (!donation) {
    return null;
  }

  return syncDonationFromCashfree(donation);
}

async function getDonationStatus(req, res) {
  try {
    const donation = await refreshDonationStatus(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('getDonationStatus error:', error);
    res.status(500).json({ error: 'Failed to fetch donation status' });
  }
}

async function verifyDonation(req, res) {
  try {
    let donation = await refreshDonationStatus(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status === 'PENDING' && req.body?.paymentCancelled) {
      donation = (await failDonation(donation.id)) || donation;
    }

    res.json(donation);
  } catch (error) {
    console.error('verifyDonation error:', error);
    res.status(500).json({ error: 'Failed to verify donation' });
  }
}

module.exports = {
  createOrder,
  handleWebhook,
  getDonationStatus,
  verifyDonation,
};
