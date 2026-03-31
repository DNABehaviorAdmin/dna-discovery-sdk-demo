import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Overview', to: '/' },
  { label: 'Setup Guide', to: '/setup' },
  { label: 'Live Demo', to: '/demo' },
  { label: 'Code Examples', to: '/code' },
  { label: 'Webhooks', to: '/webhooks' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2' 
          : 'bg-white/40 backdrop-blur-sm border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://dnabehavior.com/hs-fs/hubfs/DNA%20Behavior%20Logo%20for%20Website_Behavior%20and%20Money_Hubspot%20CMS.png" 
              alt="DNA Behavior Logo" 
              className="h-8 w-auto transform transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-gray-100 -z-10 animate-in fade-in zoom-in-95 duration-200" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-5">
            <a
              href="https://dnabehavior.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-primary-500 after:transition-all hover:after:w-full"
            >
              Main Site
            </a>
            <Link
              to="/demo"
              className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 bg-linear-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 hover:to-primary-400 shadow-[0_4px_20px_-4px_rgba(51,153,102,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(51,153,102,0.5)] hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-linear-to-b from-transparent via-transparent to-black" />
              <span className="relative flex items-center gap-2">
                Try Demo <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden relative p-2 rounded-xl text-gray-600 hover:bg-white/80 transition-colors border border-transparent hover:border-gray-200/50 hover:shadow-sm"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full border-b border-gray-200/50 bg-white/95 backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100 py-4 shadow-xl' : 'max-h-0 opacity-0 py-0 border-transparent'
        }`}
      >
        <div className="px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-linear-to-r from-primary-50 to-transparent text-primary-700 border-l-[3px] border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <Link
              to="/demo"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-linear-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-all"
            >
              Try Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
