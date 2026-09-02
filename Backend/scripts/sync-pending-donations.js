require('dotenv').config();
const prisma = require('../src/lib/prisma');
const {
  getCashfreeOrderStatus,
  getCashfreeOrderPayments,
} = require('../src/config/cashfree');

async function syncPendingDonations() {
  const pending = await prisma.donation.findMany({
    where: { status: 'PENDING', cfOrderId: { not: null } },
  });

  console.log(`Found ${pending.length} pending donation(s) to check.`);

  for (const donation of pending) {
    try {
      const order = await getCashfreeOrderStatus(donation.cfOrderId);
      let orderStatus = order.order_status;
      let paymentId = order.cf_payment_id;

      if (orderStatus !== 'PAID') {
        const payments = await getCashfreeOrderPayments(donation.cfOrderId);
        const success = payments.find((p) => p.payment_status === 'SUCCESS');
        if (success) {
          orderStatus = 'PAID';
          paymentId = success.cf_payment_id;
        }
      }

      if (orderStatus === 'PAID') {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'COMPLETED', cfPaymentId: paymentId || null },
        });
        console.log(`✓ ${donation.id} marked COMPLETED (₹${donation.amount})`);
      } else if (['FAILED', 'EXPIRED', 'TERMINATED'].includes(orderStatus)) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'FAILED' },
        });
        console.log(`✗ ${donation.id} marked FAILED (${orderStatus})`);
      } else {
        const payments = await getCashfreeOrderPayments(donation.cfOrderId);
        const failed = payments.find((p) =>
          ['FAILED', 'CANCELLED', 'USER_DROPPED', 'VOID'].includes(p.payment_status)
        );
        const pending = payments.some((p) => p.payment_status === 'PENDING');

        if (failed && !pending) {
          await prisma.donation.update({
            where: { id: donation.id },
            data: { status: 'FAILED' },
          });
          console.log(`✗ ${donation.id} marked FAILED (${failed.payment_status})`);
        } else {
          console.log(`- ${donation.id} still ${orderStatus}`);
        }
      }
    } catch (error) {
      console.error(`✗ ${donation.id}: ${error.message}`);
    }
  }
}

syncPendingDonations()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
