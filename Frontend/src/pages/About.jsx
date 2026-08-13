export default function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold text-stone-900">About Unnati Charitable Trust</h1>
      <p className="mt-6 text-lg leading-relaxed text-stone-600">
        Unnati Charitable Trust is committed to uplifting underserved communities
        across India. We believe that small acts of kindness, when combined, create
        transformative change for families, children, and individuals facing hardship.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[
          {
            title: 'Our Mission',
            text: 'To provide essential support — food, education, care, and shelter — to those who need it most, with transparency and compassion.',
          },
          {
            title: 'Our Vision',
            text: 'A society where every person has access to basic necessities, education, and the opportunity to live with dignity.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-emerald-900">{item.title}</h2>
            <p className="mt-3 leading-relaxed text-stone-600">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-emerald-50 p-8">
        <h2 className="text-2xl font-bold text-emerald-900">How Your Donation Helps</h2>
        <ul className="mt-4 space-y-3 text-stone-700">
          <li>• Nutritious meals for families struggling with food insecurity</li>
          <li>• School supplies for students who cannot afford basic stationery</li>
          <li>• Care, education, and wellbeing support for children in orphanages</li>
          <li>• Blankets and warm clothing for communities facing harsh winters</li>
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-stone-900">Contact Us</h2>
        <div className="mt-4 space-y-2 text-stone-600">
          <p>Email: contact@unnaticharitable.org</p>
          <p>Phone: +91 98765 43210</p>
          <p>Address: India</p>
        </div>
      </div>
    </section>
  );
}
