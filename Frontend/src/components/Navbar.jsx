import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-700 text-white shadow-sm'
        : 'text-stone-600 hover:bg-brand-50 hover:text-brand-800'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-2xl px-4 py-3 text-base font-medium transition ${
      isActive
        ? 'bg-brand-700 text-white'
        : 'text-stone-700 hover:bg-brand-50 hover:text-brand-800'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="min-w-0 shrink" onClick={() => setMenuOpen(false)}>
          <Logo size={48} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <Link to="/#programs" className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-brand-50 hover:text-brand-800">
            Programs
          </Link>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <Link to="/donations" className="btn-primary ml-2 !py-2.5 !text-sm">
            Give Now
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-stone-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <NavLink to="/" end className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <Link
              to="/#programs"
              className="block rounded-2xl px-4 py-3 text-base font-medium text-stone-700 transition hover:bg-brand-50 hover:text-brand-800"
              onClick={() => setMenuOpen(false)}
            >
              Programs
            </Link>
            <NavLink to="/about" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              About
            </NavLink>
            <Link
              to="/donations"
              className="btn-primary mt-2 w-full"
              onClick={() => setMenuOpen(false)}
            >
              Give Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
