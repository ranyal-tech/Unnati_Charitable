import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-700 text-white'
        : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
            U
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-900">Unnati Charitable Trust</p>
            <p className="text-xs text-stone-500">Together we rise</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/donations" className={linkClass}>
            Donate
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
