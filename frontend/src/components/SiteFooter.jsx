import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = 'text-sm text-muted transition-colors hover:text-ink';

export default function SiteFooter() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="site-chrome border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-on">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </span>
            Find My Class
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Indoor navigation for the LGU campus. A final year project at Lahore Garrison University, built with React
            and Leaflet.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          <Link to="/search" className={linkClass}>
            Search
          </Link>
          <Link to="/map" className={linkClass}>
            Campus map
          </Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className={linkClass}>
              Dashboard
            </Link>
          )}
          {!isAuthenticated && (
            <Link to="/login" className={linkClass}>
              Log in
            </Link>
          )}
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Find My Class
        </p>
      </div>
    </footer>
  );
}

