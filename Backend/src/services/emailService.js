const nodemailer = require('nodemailer');
const {
  buildDonationCertificateHtml,
  buildDonationCertificateText,
  generateDonationCertificatePdf,
  getCertificateFilename,
} = require('./certificateService');

let transporter = null;
let verifiedOnce = false;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getSmtpProvider() {
  const host = (process.env.SMTP_HOST || '').toLowerCase();

  if (host.includes('brevo') || host.includes('sendinblue')) {
    return 'brevo';
  }
  if (host.includes('sendgrid')) {
    return 'sendgrid';
  }
  if (host.includes('gmail') || host.includes('google')) {
    return 'gmail';
  }
  if (host.includes('amazonaws') || host.includes('ses')) {
    return 'ses';
  }

  return 'generic';
}

function getEmailIdentity() {
  const authUser = process.env.SMTP_USER.trim();
  let fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || authUser;
  const provider = getSmtpProvider();

  // Gmail only allows sending as the authenticated mailbox (or configured alias).
  if (provider === 'gmail' && fromEmail.toLowerCase() !== authUser.toLowerCase()) {
    console.warn(
      'Gmail SMTP: SMTP_FROM_EMAIL ignored — From must match SMTP_USER to avoid spam filtering.'
    );
    fromEmail = authUser;
  }

  let displayName =
    process.env.SMTP_FROM_NAME?.trim() || 'Unnati Charitable Trust';

  const configuredFrom = process.env.SMTP_FROM?.trim();
  if (configuredFrom) {
    const namedMatch = configuredFrom.match(/^["']?(.+?)["']?\s*<[^>]+>$/);
    if (namedMatch) {
      displayName = namedMatch[1].trim();
    } else if (!configuredFrom.includes('@')) {
      displayName = configuredFrom.replace(/^["']|["']$/g, '');
    }
  }

  // Personal Gmail + charity display name is a common spam signal.
  if (provider === 'gmail' && fromEmail.endsWith('@gmail.com')) {
    displayName = process.env.SMTP_FROM_NAME?.trim() || 'Unnati Charitable Trust';
  }

  const replyTo = process.env.REPLY_TO_EMAIL?.trim() || fromEmail;
  const domain = fromEmail.split('@')[1] || 'localhost';

  return {
    fromEmail,
    displayName,
    replyTo,
    domain,
    provider,
    authUser,
  };
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!isEmailConfigured()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const provider = getSmtpProvider();

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim().replace(/\s+/g, ''),
    },
    tls: {
      minVersion: 'TLSv1.2',
    },
    pool: provider !== 'gmail',
    maxConnections: provider === 'gmail' ? 1 : 3,
    maxMessages: provider === 'gmail' ? 10 : 100,
  });

  return transporter;
}

async function verifyEmailTransport() {
  const mailTransport = getTransporter();

  if (!mailTransport) {
    return { ok: false, reason: 'SMTP not configured' };
  }

  try {
    await mailTransport.verify();
    verifiedOnce = true;
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

function logEmailConfig() {
  if (!isEmailConfigured()) {
    console.warn(
      'Email: SMTP not configured — donation certificates will not be emailed.'
    );
    return;
  }

  const { fromEmail, displayName, provider } = getEmailIdentity();

  console.log(`Email: configured via ${provider} (${process.env.SMTP_HOST})`);
  console.log(`Email: sending as "${displayName}" <${fromEmail}>`);

  if (provider === 'gmail') {
    console.warn(
      'Email: Gmail SMTP from a cloud server often lands in spam. ' +
        'For production, use Brevo (free) — see Backend/.env.example.'
    );
  }

  verifyEmailTransport().then((result) => {
    if (result.ok) {
      console.log('Email: SMTP connection verified');
    } else {
      console.error('Email: SMTP verification failed —', result.reason);
    }
  });
}

function buildTransactionalHeaders(donation, domain) {
  const shortId = String(donation.id).slice(-8);

  return {
    'X-Mailer': 'Unnati-Charitable-Trust/1.0',
    'X-Auto-Response-Suppress': 'OOF, AutoReply',
    'X-Entity-Ref-ID': String(donation.id),
    'Feedback-ID': `donation-${shortId}:unnaticharitable:${domain}`,
  };
}

async function sendDonationCertificateEmail(donation) {
  if (!donation?.donorEmail) {
    console.warn('Certificate email skipped: missing donor email');
    return false;
  }

  const mailTransport = getTransporter();

  if (!mailTransport) {
    console.warn(
      'Certificate email skipped: SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Backend/.env'
    );
    return false;
  }

  if (!verifiedOnce) {
    const verification = await verifyEmailTransport();
    if (!verification.ok) {
      console.error('Certificate email skipped: SMTP verify failed —', verification.reason);
      return false;
    }
  }

  const { fromEmail, displayName, replyTo, domain } = getEmailIdentity();
  const pdfBuffer = await generateDonationCertificatePdf(donation);
  const filename = getCertificateFilename(donation);
  const shortId = String(donation.id).slice(-8);

  const subject = `Your donation receipt #${shortId} — Unnati Charitable Trust`;

  await mailTransport.sendMail({
    from: {
      name: displayName,
      address: fromEmail,
    },
    sender: fromEmail,
    to: donation.donorEmail,
    replyTo: {
      name: displayName,
      address: replyTo,
    },
    subject,
    text: buildDonationCertificateText(donation),
    html: buildDonationCertificateHtml(donation),
    messageId: `<donation-${donation.id}@${domain}>`,
    date: new Date(),
    headers: buildTransactionalHeaders(donation, domain),
    envelope: {
      from: fromEmail,
      to: donation.donorEmail,
    },
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
        contentDisposition: 'attachment',
      },
    ],
  });

  console.log(
    `Donation certificate PDF emailed to ${donation.donorEmail} (${donation.id})`
  );
  return true;
}

module.exports = {
  isEmailConfigured,
  logEmailConfig,
  sendDonationCertificateEmail,
  verifyEmailTransport,
};
