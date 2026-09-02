/**
 * Send a test donation receipt email to verify inbox delivery (not spam).
 *
 * Usage:
 *   node scripts/test-email.js you@example.com
 */
require('dotenv').config();

const {
  isEmailConfigured,
  logEmailConfig,
  sendDonationCertificateEmail,
} = require('../src/services/emailService');

async function main() {
  const to = process.argv[2];

  if (!to) {
    console.error('Usage: node scripts/test-email.js recipient@example.com');
    process.exit(1);
  }

  if (!isEmailConfigured()) {
    console.error('SMTP is not configured. Fill in SMTP_* vars in Backend/.env first.');
    process.exit(1);
  }

  logEmailConfig();

  const sampleDonation = {
    id: 'test-donation-' + Date.now(),
    donorName: 'Test Donor',
    donorEmail: to,
    amount: 1500,
    status: 'COMPLETED',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      name: 'Food for Needy People',
      slug: 'food-for-needy',
    },
  };

  console.log(`Sending test receipt to ${to}...`);

  const sent = await sendDonationCertificateEmail(sampleDonation);

  if (sent) {
    console.log('Test email sent. Check inbox and spam folder.');
    console.log('If it is in spam, switch to Brevo SMTP — see Backend/.env.example.');
  } else {
    console.error('Test email was not sent.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Test email failed:', error.message);
  process.exit(1);
});
