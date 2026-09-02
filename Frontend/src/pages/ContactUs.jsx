export default function ContactUs() {
  return (
    <>
      <section className="hero-pattern py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="section-eyebrow !text-emerald-100">Get in Touch</p>
          <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50/90">
            Have a question about a donation, a program, or your certificate? We're happy to help.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="card overflow-hidden">
          <div className="bg-brand-50 px-7 py-5">
            <h2 className="font-display text-2xl font-bold text-brand-900">Unnati Charitable Trust</h2>
          </div>
          <div className="grid gap-6 p-7 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">✉</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Email</p>
                <a
                  href="mailto:contact@unnaticharitable.org"
                  className="text-sm text-stone-600 hover:text-brand-700 hover:underline"
                >
                  contact@unnaticharitable.org
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">☎</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Phone</p>
                <a href="tel:+919876543210" className="text-sm text-stone-600 hover:text-brand-700 hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">📍</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Address</p>
                <p className="text-sm text-stone-600">India</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">🕐</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Response Time</p>
                <p className="text-sm text-stone-600">We typically reply within 1–2 business days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-8 p-7 text-sm leading-relaxed text-stone-600">
          <p>
            For queries about a specific donation — including payment status, receipts, or your
            80G donation certificate — please write to us with the donor name, email, and the
            approximate date of the transaction so we can locate it quickly.
          </p>
        </div>
      </section>
    </>
  );
}
