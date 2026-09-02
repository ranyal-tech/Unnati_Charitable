import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function About() {
  return (
    <>
      <section className="hero-pattern py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="section-eyebrow !text-emerald-100">About Us</p>
          <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">
            About Unnati Charitable Trust
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50/90">
            We believe small acts of kindness, when combined, create transformative
            change for families, children, and individuals facing hardship.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: 'Our Mission',
              text: 'To provide essential support — food, education, care, and shelter — to those who need it most, with transparency and compassion.',
              accent: 'from-brand-600 to-teal-600',
            },
            {
              title: 'Our Vision',
              text: 'A society where every person has access to basic necessities, education, and the opportunity to live with dignity.',
              accent: 'from-teal-600 to-cyan-600',
            },
          ].map((item) => (
            <div key={item.title} className="card card-hover overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${item.accent}`} />
              <div className="p-7">
                <h2 className="font-display text-2xl font-bold text-brand-900">{item.title}</h2>
                <p className="mt-3 leading-relaxed text-stone-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-10 overflow-hidden">
          <div className="bg-brand-50 px-7 py-5">
            <h2 className="font-display text-2xl font-bold text-brand-900">
              How Your Donation Helps
            </h2>
          </div>
          <ul className="grid gap-4 p-7 sm:grid-cols-2">
            {[
              { emoji: '🍲', text: 'Nutritious meals for families struggling with food insecurity' },
              { emoji: '📚', text: 'School supplies for students who cannot afford basic stationery' },
              { emoji: '🏠', text: 'Care, education, and wellbeing support for children in orphanages' },
              { emoji: '🧣', text: 'Blankets and warm clothing for communities facing harsh winters' },
            ].map((item) => (
              <li
                key={item.text}
                className="flex gap-3 rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700"
              >
                <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="card mt-10 p-8 text-center md:p-10">
          <Logo size={56} className="mx-auto justify-center" />
          <h2 className="font-display mt-6 text-2xl font-bold text-stone-900">Get in Touch</h2>
          <div className="mt-6 space-y-3 text-stone-600">
            <p>
              <a href="mailto:contact@unnaticharitable.org" className="font-medium text-brand-700 hover:underline">
                contact@unnaticharitable.org
              </a>
            </p>
            <p>
              <a href="tel:+919876543210" className="font-medium text-brand-700 hover:underline">
                +91 98765 43210
              </a>
            </p>
            <p>India</p>
          </div>
          <Link to="/donations" className="btn-primary mt-8">
            Support Our Programs
          </Link>
        </div>
      </section>
    </>
  );
}
