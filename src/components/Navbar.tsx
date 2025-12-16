import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Menu, X, User, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Place Order' },
    { href: '/track', label: 'Track Order' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || !isHome
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
        : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  location.pathname === link.href 
                    ? 'bg-primary text-white' 
                    : scrolled || !isHome
                      ? 'text-foreground hover:bg-muted'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/account">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 rounded-full",
                  scrolled || !isHome ? '' : 'text-white hover:bg-white/10'
                )}
              >
                <User className="w-4 h-4" />
                Account
              </Button>
            </Link>
            <Link to="/staff">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "rounded-full",
                  scrolled || !isHome ? '' : 'text-white hover:bg-white/10'
                )}
              >
                Staff
              </Button>
            </Link>
            <Link to="/admin">
              <Button 
                size="sm" 
                className="rounded-full bg-primary hover:bg-primary/90 gap-1"
              >
                Admin
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg",
              scrolled || !isHome ? '' : 'text-white'
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white animate-fade-in rounded-b-2xl">
            <div className="flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-3 rounded-xl transition-colors font-medium',
                    location.pathname === link.href
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/account"
                className={cn(
                  'px-4 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium',
                  location.pathname === '/account'
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted'
                )}
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                My Account
              </Link>
              <div className="flex gap-2 mt-3 px-2">
                <Link to="/staff" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl">Staff</Button>
                </Link>
                <Link to="/admin" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl bg-primary">Admin</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
