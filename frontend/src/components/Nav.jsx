import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Clock3, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search' },
  { to: '/map', label: 'Campus map' }
];

const desktopLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-soft text-brand-strong' : 'text-muted hover:bg-sunken hover:text-ink'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2.5 text-base font-medium ${
    isActive ? 'bg-brand-soft text-brand-strong' : 'text-ink hover:bg-sunken'
  }`;

function formatPakistanTime() {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date());
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pakistanTime, setPakistanTime] = useState(() => formatPakistanTime());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => setPakistanTime(formatPakistanTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="site-chrome fixed inset-x-0 top-0 z-[1200] border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-brand-on">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            Find My Class
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/timetable" className={desktopLinkClass}>
              Timetable
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-brand-strong lg:flex" title="Live time in Pakistan">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pakistan · {pakistanTime}</span>
            </div>
            <ThemeToggle />
            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin/dashboard"
                      className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sunken"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <span className="max-w-[10rem] truncate px-2 text-sm font-medium text-ink" title={user?.name || 'Signed in'}>
                      {user?.name || 'Signed in'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-on transition-colors hover:bg-brand-strong"
                >
                  Log in
                </Link>
              )}
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-sunken md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="border-t border-line/70 px-4 py-1.5 text-center text-[11px] font-semibold text-brand-strong lg:hidden">
          Pakistan · {pakistanTime}
        </div>

        {mobileOpen && (
          <div id="mobile-menu" className="border-t border-line bg-surface md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6" aria-label="Mobile">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
                  {label}
                </NavLink>
              ))}
              <NavLink to="/timetable" className={mobileLinkClass}>
                Timetable
              </NavLink>
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        className="rounded-md border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sunken"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <p className="px-3 py-1 text-sm font-medium text-ink">{user?.name || 'Signed in'}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sunken"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-on hover:bg-brand-strong"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* spacer for the fixed header: 64px bar plus 1px border */}
      <div className="h-[97px] shrink-0 lg:h-[65px]" aria-hidden="true" />
    </>
  );
}
