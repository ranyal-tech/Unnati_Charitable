const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BRAND = {
  blue: '#1e40af',
  pink: '#db2777',
  cream: '#faf9f7',
  text: '#1c1917',
  muted: '#57534e',
};

function getLogoPath() {
  const candidates = [
    path.join(__dirname, '../../assets/logo.png'),
    path.join(process.cwd(), 'assets/logo.png'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getLogoBuffer() {
  const logoPath = getLogoPath();
  return logoPath ? fs.readFileSync(logoPath) : null;
}

function getLogoBase64() {
  const buffer = getLogoBuffer();
  return buffer ? buffer.toString('base64') : null;
}

function buildEmailLogoMarkup() {
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const base64 = getLogoBase64();

  // Production: load logo from the live website (no email attachment needed).
  if (frontendUrl.startsWith('https://')) {
    return `<img src="${escapeHtml(frontendUrl)}/logo.png" alt="" width="220" style="display:block;margin:0 auto 12px;max-width:220px;height:auto;border:0;" />`;
  }

  // Local/dev: embed logo directly in HTML (still no separate attachment).
  if (base64) {
    return `<img src="data:image/png;base64,${base64}" alt="" width="220" style="display:block;margin:0 auto 12px;max-width:220px;height:auto;border:0;" />`;
  }

  return `<p style="margin:0 0 12px;font-size:15px;color:#1e40af;font-weight:bold;">Unnati Charitable Trust</p>`;
}

function formatCurrency(amount) {
  const num = Math.round(Number(amount));
  if (!Number.isFinite(num)) {
    return 'Rs. 0/-';
  }
  return `Rs. ${num.toLocaleString('en-IN')}/-`;
}

/** PDF-safe amount — no commas (PDFKit can split "1,500" across lines). */
function formatCurrencyPdf(amount) {
  const num = Math.round(Number(amount));
  if (!Number.isFinite(num)) {
    return 'Rs. 0/-';
  }
  return `Rs. ${num.toLocaleString('en-IN').replace(/,/g, '')}/-`;
}

function twoDigitsToWords(n) {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (n < 20) {
    return ones[n];
  }
  const word = tens[Math.floor(n / 10)];
  const remainder = n % 10;
  return remainder ? `${word} ${ones[remainder]}` : word;
}

function threeDigitsToWords(n) {
  if (n < 100) {
    return twoDigitsToWords(n);
  }
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredPart = `${twoDigitsToWords(hundreds)} Hundred`;
  return remainder ? `${hundredPart} ${twoDigitsToWords(remainder)}` : hundredPart;
}

function formatAmountWords(amount) {
  const num = Math.round(Number(amount));
  if (!Number.isFinite(num) || num < 0) {
    return 'Zero Rupees Only';
  }
  if (num === 0) {
    return 'Zero Rupees Only';
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  const parts = [];
  if (crore) {
    parts.push(`${twoDigitsToWords(crore)} Crore`);
  }
  if (lakh) {
    parts.push(`${twoDigitsToWords(lakh)} Lakh`);
  }
  if (thousand) {
    parts.push(`${twoDigitsToWords(thousand)} Thousand`);
  }
  if (remainder) {
    parts.push(threeDigitsToWords(remainder));
  }

  return `${parts.join(' ')} Rupees Only`;
}

function getProgramImpactText(programName = '') {
  const impacts = {
    'Food for Needy People':
      'Your gift helps provide nutritious meals to families facing food insecurity.',
    'Stationery for Schools':
      'Your gift helps supply notebooks, pens, and learning materials to students in need.',
    'Orphanage Donations':
      'Your gift supports care, education, and wellbeing for children in orphanages.',
    'Winter Essentials':
      'Your gift provides blankets and warm clothing to communities during harsh winters.',
  };

  return (
    impacts[programName] ||
    'Your gift directly supports communities in need through our charitable programs.'
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDonationCertificateHtml(donation) {
  const amount = formatCurrency(donation.amount);
  const amountWords = formatAmountWords(donation.amount);
  const date = formatDate(donation.updatedAt || donation.createdAt);
  const programName = escapeHtml(donation.category?.name || 'Charitable Program');
  const donorName = escapeHtml(donation.donorName);
  const donationId = escapeHtml(donation.id);
  const impactText = escapeHtml(getProgramImpactText(donation.category?.name));
  const replyEmail = escapeHtml(
    process.env.REPLY_TO_EMAIL || process.env.SMTP_USER || 'contact@unnaticharitable.org'
  );
  const logoMarkup = buildEmailLogoMarkup();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Donation receipt</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f4;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e7e5e4;border-radius:8px;">
          <tr>
            <td style="padding:24px 28px 20px;border-bottom:1px solid #e7e5e4;background:#faf9f7;text-align:center;">
              ${logoMarkup}
              <h1 style="margin:0;font-size:22px;color:#1c1917;">Thank you for your donation</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Dear ${donorName},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                We are grateful for your generous support. Your payment has been received successfully,
                and your contribution will go directly to the program you selected.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#44403c;">
                ${impactText}
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
                Because of donors like you, we can reach more families, students, and children
                who depend on our programs. Your kindness creates real change on the ground.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="padding:12px 16px;background:#047857;color:#ffffff;font-size:14px;font-weight:bold;">
                    Donation summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#57534e;border-bottom:1px solid #e7e5e4;">Amount paid</td>
                  <td style="padding:12px 16px;font-size:16px;font-weight:bold;color:#047857;border-bottom:1px solid #e7e5e4;text-align:right;">${amount}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#57534e;border-bottom:1px solid #e7e5e4;">Amount in words</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1c1917;border-bottom:1px solid #e7e5e4;text-align:right;">${escapeHtml(amountWords)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#57534e;border-bottom:1px solid #e7e5e4;">Program</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1c1917;border-bottom:1px solid #e7e5e4;text-align:right;">${programName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#57534e;border-bottom:1px solid #e7e5e4;">Payment date</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1c1917;border-bottom:1px solid #e7e5e4;text-align:right;">${date}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#57534e;">Receipt number</td>
                  <td style="padding:12px 16px;font-size:13px;color:#1c1917;text-align:right;font-family:Consolas,monospace;">${donationId}</td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                Please find your official <strong>Certificate of Donation</strong> attached as a PDF document.
                You may save or print it for your records.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                At Unnati Charitable Trust, we are committed to transparency and direct impact.
                Every rupee you donate is used for the program you choose to support.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                If you would like to stay connected with our work, you can reply to this email
                anytime. We would love to share updates on how your donation is making a difference.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#57534e;">
                With gratitude,<br/>
                <strong style="color:#047857;">Team Unnati Charitable Trust</strong><br/>
                Questions? Reply to this email or write to
                <a href="mailto:${replyEmail}" style="color:#047857;">${replyEmail}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#fafaf9;border-top:1px solid #e7e5e4;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#78716c;">
                This is an automated receipt for your donation on the Unnati Charitable Trust website.
                If you did not make this donation, please reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildDonationCertificateText(donation) {
  const amount = formatCurrency(donation.amount);
  const amountWords = formatAmountWords(donation.amount);
  const date = formatDate(donation.updatedAt || donation.createdAt);
  const programName = donation.category?.name || 'Charitable Program';
  const impactText = getProgramImpactText(programName);
  const replyEmail =
    process.env.REPLY_TO_EMAIL || process.env.SMTP_USER || 'contact@unnaticharitable.org';

  return `Unnati Charitable Trust - Thank you for your donation

Dear ${donation.donorName},

We are grateful for your generous support. Your payment has been received successfully, and your contribution will go directly to the program you selected.

${impactText}

Because of donors like you, we can reach more families, students, and children who depend on our programs. Your kindness creates real change on the ground.

Donation summary
----------------
Amount paid: ${amount}
Amount in words: ${amountWords}
Program: ${programName}
Payment date: ${date}
Receipt number: ${donation.id}

Your official Certificate of Donation is attached as a PDF document. You may save or print it for your records.

At Unnati Charitable Trust, we are committed to transparency and direct impact. Every rupee you donate is used for the program you choose to support.

If you would like to stay connected with our work, you can reply to this email anytime. We would love to share updates on how your donation is making a difference.

With gratitude,
Team Unnati Charitable Trust

Questions? Contact us at ${replyEmail}

Together we rise.`;
}

function generateDonationCertificatePdf(donation) {
  const amount = formatCurrencyPdf(donation.amount);
  const amountWords = formatAmountWords(donation.amount);
  const date = formatDate(donation.updatedAt || donation.createdAt);
  const programName = donation.category?.name || 'Charitable Program';
  const donorName = donation.donorName;
  const donationId = donation.id;
  const impactText = getProgramImpactText(programName);
  const logoPath = getLogoPath();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const innerWidth = pageWidth - margin * 2 - 16;

    // Outer border
    doc
      .lineWidth(3)
      .strokeColor(BRAND.blue)
      .rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
      .stroke();

    // Inner border
    doc
      .lineWidth(1)
      .strokeColor(BRAND.pink)
      .rect(margin + 8, margin + 8, innerWidth, pageHeight - margin * 2 - 16)
      .stroke();

    const headerTop = margin + 8;
    const logoWidth = 150;
    const titleFontSize = 22;
    let logoHeight = 0;
    let titleY = headerTop + 24;

    if (logoPath) {
      const logoImage = doc.openImage(logoPath);
      logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      titleY = headerTop + 14 + logoHeight + 16;
    }

    const headerHeight = titleY - headerTop + titleFontSize + 18;
    const contentTop = headerTop + headerHeight + 18;
    const contentWidth = pageWidth - margin * 2 - 80;

    // Header band (drawn after layout is calculated)
    doc.rect(margin + 8, headerTop, innerWidth, headerHeight).fill(BRAND.cream);

    if (logoPath) {
      const logoX = (pageWidth - logoWidth) / 2;
      doc.image(logoPath, logoX, headerTop + 14, { width: logoWidth });
    } else {
      doc
        .fillColor(BRAND.blue)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('UNNATI CHARITABLE TRUST', margin + 8, headerTop + 16, {
          width: innerWidth,
          align: 'center',
        });
    }

    doc
      .fillColor(BRAND.blue)
      .font('Helvetica-Bold')
      .fontSize(titleFontSize)
      .text('Certificate of Donation', margin + 8, titleY, {
        width: innerWidth,
        align: 'center',
      });

    doc
      .fillColor(BRAND.muted)
      .font('Helvetica')
      .fontSize(14)
      .text('This is to certify that', margin + 40, contentTop, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .fillColor(BRAND.text)
      .font('Helvetica-Bold')
      .fontSize(32)
      .text(donorName, margin + 40, contentTop + 36, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .fillColor(BRAND.muted)
      .font('Helvetica')
      .fontSize(14)
      .text('has generously contributed', margin + 40, contentTop + 82, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .fillColor(BRAND.pink)
      .font('Helvetica-Bold')
      .fontSize(36)
      .text(amount, margin + 40, contentTop + 108, {
        width: contentWidth,
        align: 'center',
        lineBreak: false,
      });

    doc
      .fillColor('#78716c')
      .font('Helvetica')
      .fontSize(11)
      .text(`(${amountWords})`, margin + 40, contentTop + 152, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .fillColor(BRAND.muted)
      .font('Helvetica')
      .fontSize(14)
      .text(`towards ${programName}`, margin + 40, contentTop + 172, {
        width: contentWidth,
        align: 'center',
      });

    // Divider
    const dividerY = contentTop + 210;
    doc
      .moveTo(margin + 60, dividerY)
      .lineTo(pageWidth - margin - 60, dividerY)
      .strokeColor('#d6d3d1')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#78716c')
      .font('Helvetica')
      .fontSize(11)
      .text(`Date: ${date}`, margin + 60, dividerY + 16);

    doc.text(`Receipt No: ${donationId}`, pageWidth - margin - 260, dividerY + 16, {
      width: 200,
      align: 'right',
    });

    doc
      .fillColor(BRAND.muted)
      .font('Helvetica-Oblique')
      .fontSize(11)
      .text(
        `${impactText} Thank you for your compassion and support — together we bring hope to communities across India.`,
        margin + 60,
        dividerY + 44,
        { width: pageWidth - margin * 2 - 120, align: 'center' }
      );

    // Footer
    doc
      .fillColor(BRAND.blue)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Unnati Charitable Trust  ·  Together we rise', margin + 40, pageHeight - margin - 36, {
        width: contentWidth,
        align: 'center',
      });

    doc.end();
  });
}

function getCertificateFilename(donation) {
  const safeId = String(donation.id).replace(/[^a-zA-Z0-9_-]/g, '');
  return `Donation-Certificate-${safeId}.pdf`;
}

module.exports = {
  buildDonationCertificateHtml,
  buildDonationCertificateText,
  generateDonationCertificatePdf,
  getCertificateFilename,
  getLogoBuffer,
  getLogoPath,
};
