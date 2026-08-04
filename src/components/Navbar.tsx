import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/dictionary', label: 'Kamus' },
  { to: '/practice', label: 'Latihan' },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <nav className="navbar navbar-border" style={{ height: '4rem' }}>
      <div className="container-page h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="TanganBicara Home"
        >
          <div
            style={{
              width: '2.25rem', height: '2.25rem',
              background: '#1f2937', borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
            TanganBicara
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-neutral-900 border-b-2 border-neutral-900 rounded-none pb-1.5'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button className="btn btn-secondary text-sm" style={{ borderRadius: '0.5rem', padding: '0.45rem 1rem' }}>
            Masuk
          </button>
          <button className="btn btn-primary text-sm" style={{ borderRadius: '0.5rem', padding: '0.45rem 1rem' }}>
            Daftar
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-fade-in-down">
          <div className="container-page py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'block px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-neutral-100 flex gap-2">
              <button className="flex-1 btn btn-secondary text-sm">Masuk</button>
              <button className="flex-1 btn btn-primary text-sm">Daftar</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
