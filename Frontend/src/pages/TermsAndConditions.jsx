const SECTIONS = [
  {
    title: '1. Introduction',
    body: `These Terms & Conditions govern your use of the Unnati Charitable Trust website and
    your donations made through it. By accessing this website or making a donation, you agree
    to be bound by these terms.`,
  },
  {
    title: '2. Donations',
    body: `All donations made through this website are voluntary contributions to Unnati
    Charitable Trust and are used to support our programs, including food assistance,
    educational supplies, orphanage support, and winter relief. Donors are responsible for
    ensuring the accuracy of the information provided during the donation process, including
    name, email, and PAN (where applicable for tax receipts).`,
  },
  {
    title: '3. Payment Processing',
    body: `Payments are processed securely through Cashfree Payments, a licensed and regulated
    payment gateway. We do not store your card, UPI, or banking credentials on our servers. By
    proceeding with a payment, you also agree to Cashfree's applicable terms of use.`,
  },
  {
    title: '4. Receipts & Certificates',
    body: `A donation receipt and, where applicable, an 80G certificate will be sent to the
    email address provided at the time of donation, typically after successful payment
    confirmation. Please ensure your email address is entered correctly.`,
  },
  {
    title: '5. Website Use',
    body: `The content on this website — including text, images, and logos — is the property of
    Unnati Charitable Trust unless otherwise stated, and may not be reproduced without
    permission. We aim to keep information on this site accurate and up to date, but do not
    guarantee it is free of errors or omissions.`,
  },
  {
    title: '6. Changes to These Terms',
    body: `We may update these Terms & Conditions from time to time. Continued use of the
    website after changes are posted constitutes acceptance of the revised terms.`,
  },
  {
    title: '7. Contact',
    body: `For any questions regarding these terms, please reach out via our Contact Us page.`,
  },
];

export default function TermsAndConditions() {
  return (
    <>
      <section className="hero-pattern py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="section-eyebrow !text-emerald-100">Legal</p>
          <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">Terms &amp; Conditions</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50/90">
            Please read these terms carefully before using this website or making a donation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="card divide-y divide-stone-100 overflow-hidden">
          {SECTIONS.map((section) => (
            <div key={section.title} className="p-7">
              <h2 className="font-display text-xl font-bold text-brand-900">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-600">{section.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">Last updated: September 2026</p>
      </section>
    </>
  );
}
