import { Link } from 'react-router-dom';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand-400" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function HeroSection({
  totalDonors,
  programCount,
  loading,
  onStartDonating,
}) {
  const stats = [
    { label: 'Donors', value: loading ? '—' : totalDonors.toLocaleString('en-IN') },
    { label: 'Programs', value: loading ? '—' : String(programCount) },
  ];

  return (
    <section className="relative">
      {/* Background image */}
      <div className="relative min-h-[520px] lg:min-h-[600px]">
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/75 to-stone-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-stone-900/20" />

        {/* Content */}
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col justify-center px-6 py-20 lg:min-h-[600px] lg:px-8 lg:py-24">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                Registered Charitable Trust
              </span>
            </div>

            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Empowering lives
              <span className="block text-brand-300">across India</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-300 sm:text-lg">
              Support food, education, orphanage care, and winter essentials.
              Your donation goes directly to the program you choose.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartDonating}
                className="btn-primary !rounded-lg !px-8 !py-3.5 !text-base shadow-lg shadow-black/20"
              >
                Donate Now
              </button>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
              >
                Learn about our work
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {['Secure Cashfree payments', 'Transparent progress', 'Direct program impact'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-400">
                    <CheckIcon />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating stats card */}
      <div className="relative z-10 mx-auto -mt-16 max-w-4xl px-4 pb-4 lg:-mt-20">
        <div className="grid overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xl shadow-stone-900/10 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-6 py-7 text-center sm:py-8 ${
                index > 0 ? 'border-t border-stone-100 sm:border-l sm:border-t-0' : ''
              }`}
            >
              <p className="font-display text-2xl font-bold text-brand-800 lg:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
