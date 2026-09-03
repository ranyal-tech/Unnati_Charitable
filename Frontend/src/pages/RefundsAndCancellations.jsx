const SECTIONS = [
  {
    title: "1. Nature of Donations",
    body: `Donations made to Unnati Charitable Trust are voluntary contributions towards our
    charitable programs. As donations are not payments for goods or services, they are
    generally non-refundable once processed.`,
  },
  {
    title: "2. Duplicate or Erroneous Payments",
    body: `If you accidentally make a duplicate donation, or a payment is deducted from your
    account without a successful donation being recorded on our platform, please contact us
    within 7 days of the transaction with your payment reference/transaction ID. We will
    verify the issue with our payment partner, Cashfree, and process a refund to the original
    payment method where an error is confirmed.`,
  },
  {
    title: "3. Refund Timeline",
    body: `Approved refunds are typically initiated within 5–7 business days of confirmation
    and may take an additional 5–10 business days to reflect in your account, depending on
    your bank or payment provider.`,
  },
  {
    title: "4. Cancellations",
    body: `Since donations are processed immediately upon successful payment, they cannot be 
    cancelled once completed. If you wish to stop a donation before completing payment, simply close the payment window before confirming the transaction.`,
  },
  {
    title: "5. How to Request a Refund",
    body: `Email contact@unnaticharitable.org with the subject "Refund Request", along with your
    name, the email/phone used for the donation, the amount donated, and the payment reference/transaction ID. Our team will review your request and respond within 3 business days.`,
  },
  {
    title: "6. Contact",
    body: `For any questions about this policy, please reach out via our Contact Us page.`,
  },
];

export default function RefundsAndCancellations() {
  return (
    <>
      <section className="hero-pattern py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="section-eyebrow !text-emerald-100">Legal</p>
          <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">
            Refunds &amp; Cancellations
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50/90">
            Our policy on refunds and cancellations for donations made through
            this website.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="card divide-y divide-stone-100 overflow-hidden">
          {SECTIONS.map((section) => (
            <div key={section.title} className="p-7">
              <h2 className="font-display text-xl font-bold text-brand-900">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-600">
                {section.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">
          Last updated: September 2026
        </p>
      </section>
    </>
  );
}
