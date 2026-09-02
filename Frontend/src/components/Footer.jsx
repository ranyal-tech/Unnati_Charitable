import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-800/10 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
            <Logo size={48} variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
              Dedicated to uplifting communities through food, education, care, and
              essential support for those who need it most across India.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Transparent', 'Secure Payments', 'Direct Impact'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-stone-700 bg-stone-800/60 px-3 py-1 text-xs font-medium text-stone-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Programs
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Food for Needy People', slug: 'food-for-needy' },
                { label: 'Stationery for Schools', slug: 'stationery-for-schools' },
                { label: 'Orphanage Donations', slug: 'orphanage-donations' },
                { label: 'Winter Essentials', slug: 'winter-essentials' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/donations?program=${item.slug}`}
                    className="transition hover:text-warm-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand-500">✉</span>
                <a href="mailto:contact@unnaticharitable.org" className="hover:text-white">
                  contact@unnaticharitable.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand-500">☎</span>
                <a href="tel:+919876543210" className="hover:text-white">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand-500">📍</span>
                <span>India</span>
              </li>
            </ul>

            <Link to="/donations" className="btn-primary mt-6 !text-sm">
              Make a Donation
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-stone-500 sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Unnati Charitable Trust. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/contact-us" className="transition hover:text-warm-400">
              Contact Us
            </Link>
            <Link to="/terms-and-conditions" className="transition hover:text-warm-400">
              Terms &amp; Conditions
            </Link>
            <Link to="/refunds-and-cancellations" className="transition hover:text-warm-400">
              Refunds &amp; Cancellations
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
