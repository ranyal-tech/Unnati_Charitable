const prisma = require('../lib/prisma');
const {
  CashfreeConfigError,
  createCashfreeOrder,
  getCashfreeOrderStatus,
  getCashfreePublicUrls,
} = require('../config/cashfree');

function validateDonationInput(body) {
  const { categorySlug, amount, donorName, donorEmail } = body;

  if (!categorySlug || !amount || !donorName || !donorEmail) {
    return 'categorySlug, amount, donorName, and donorEmail are required';
  }

  if (typeof amount !== 'number' || amount < 1) {
    return 'Amount must be a number greater than 0';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(donorEmail)) {
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

  if (cashfreeError?.message) {
    return { status: 502, message: cashfreeError.message };
  }

  return { status: 500, message: 'Failed to create donation order' };
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

    const category = await prisma.donationCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const donation = await prisma.donation.create({
      data: {
        categoryId: category.id,
        donorName,
        donorEmail,
        donorPhone: donorPhone || null,
        amount,
        message: message || null,
        status: 'PENDING',
      },
    });

    donationId = donation.id;
    const orderId = `DON_${donation.id}`;
    const { frontendUrl, backendUrl } = getCashfreePublicUrls();

    const cashfreeOrder = await createCashfreeOrder({
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: donorEmail.replace(/[^a-zA-Z0-9_-]/g, '_'),
        customer_email: donorEmail,
        customer_phone: donorPhone || '9999999999',
        customer_name: donorName,
      },
      order_meta: {
        return_url: `${frontendUrl}/donation-success?donation_id=${donation.id}`,
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
    const payload = req.body?.data || req.body;
    const orderId = payload?.order?.order_id || payload?.order_id;
    const orderStatus = payload?.order?.order_status || payload?.order_status;
    const paymentId =
      payload?.payment?.cf_payment_id || payload?.cf_payment_id;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    if (orderStatus === 'PAID') {
      await prisma.donation.updateMany({
        where: { cfOrderId: orderId },
        data: {
          status: 'COMPLETED',
          cfPaymentId: paymentId || null,
        },
      });
    } else if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED') {
      await prisma.donation.updateMany({
        where: { cfOrderId: orderId },
        data: { status: 'FAILED' },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('handleWebhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function getDonationStatus(req, res) {
  try {
    const { id } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status === 'PENDING' && donation.cfOrderId) {
      try {
        const cashfreeOrder = await getCashfreeOrderStatus(donation.cfOrderId);
        const orderStatus = cashfreeOrder.order_status;

        if (orderStatus === 'PAID') {
          const updated = await prisma.donation.update({
            where: { id },
            data: {
              status: 'COMPLETED',
              cfPaymentId: cashfreeOrder.cf_payment_id || donation.cfPaymentId,
            },
            include: {
              category: {
                select: { name: true, slug: true },
              },
            },
          });
          return res.json(updated);
        }

        if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED') {
          const updated = await prisma.donation.update({
            where: { id },
            data: { status: 'FAILED' },
            include: {
              category: {
                select: { name: true, slug: true },
              },
            },
          });
          return res.json(updated);
        }
      } catch (pollError) {
        console.error('Cashfree poll error:', pollError.message);
      }
    }

    res.json(donation);
  } catch (error) {
    console.error('getDonationStatus error:', error);
    res.status(500).json({ error: 'Failed to fetch donation status' });
  }
}

module.exports = {
  createOrder,
  handleWebhook,
  getDonationStatus,
};
