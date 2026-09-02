function TrustIcon({ children }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
      {children}
    </div>
  );
}

const TRUST_ITEMS = [
  {
    title: 'Transparent Progress',
    text: 'Track real-time fundraising for every program and see exactly how much has been raised.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Secure Payments',
    text: 'Every transaction is encrypted and processed through Cashfree, a trusted payment gateway.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Direct Impact',
    text: 'Your contribution goes straight to the program you select — food, education, care, or warmth.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function TrustSection() {
  return (
    <section className="border-y border-stone-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="section-eyebrow">Why Unnati</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-stone-900">
            A trusted way to give
          </h2>
          <p className="mt-3 text-stone-600">
            We are committed to transparency, security, and making sure your generosity reaches those who need it.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <TrustIcon>{item.icon}</TrustIcon>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
