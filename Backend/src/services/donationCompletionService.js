const prisma = require('../lib/prisma');
const { sendDonationCertificateEmail } = require('./emailService');

const categoryInclude = {
  category: {
    select: { name: true, slug: true },
  },
};

async function sendCertificateIfNeeded(donation) {
  if (!donation || donation.certificateSentAt) {
    return donation;
  }

  if (donation.status !== 'COMPLETED') {
    return donation;
  }

  try {
    const sent = await sendDonationCertificateEmail(donation);

    if (sent) {
      return prisma.donation.update({
        where: { id: donation.id },
        data: { certificateSentAt: new Date() },
        include: categoryInclude,
      });
    }
  } catch (error) {
    console.error('sendCertificateIfNeeded error:', error.message);
  }

  return donation;
}

async function completeDonation(donationId, cfPaymentId = null) {
  const existing = await prisma.donation.findUnique({
    where: { id: donationId },
    include: categoryInclude,
  });

  if (!existing) {
    return null;
  }

  let donation = existing;

  if (existing.status !== 'COMPLETED') {
    donation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'COMPLETED',
        cfPaymentId: cfPaymentId || existing.cfPaymentId,
      },
      include: categoryInclude,
    });
  }

  return sendCertificateIfNeeded(donation);
}

async function completeDonationsByOrderId(cfOrderId, cfPaymentId = null) {
  const donations = await prisma.donation.findMany({
    where: { cfOrderId },
    include: categoryInclude,
  });

  const results = [];
  for (const donation of donations) {
    const updated = await completeDonation(donation.id, cfPaymentId);
    if (updated) {
      results.push(updated);
    }
  }

  return results;
}

module.exports = {
  completeDonation,
  completeDonationsByOrderId,
  sendCertificateIfNeeded,
};
