export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Unnati Charitable Trust</h3>
          <p className="mt-3 text-sm leading-relaxed">
            Dedicated to uplifting communities through food, education, care, and
            essential support for those in need.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Our Programs</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Food for Needy People</li>
            <li>Stationery for Schools</li>
            <li>Orphanage Donations</li>
            <li>Winter Essentials</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Email: contact@unnaticharitable.org</li>
            <li>Phone: +91 98765 43210</li>
            <li>Location: India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-sm">
        © {new Date().getFullYear()} Unnati Charitable Trust. All rights reserved.
      </div>
    </footer>
  );
}
