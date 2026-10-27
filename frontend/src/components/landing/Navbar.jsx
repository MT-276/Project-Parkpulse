import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import logoNoText from '../../assets/ParkPlus-Logo-Transparent-NoText.png';

export default function Navbar({ onNavigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const observerRef = useRef(null);

  const navItems = [
    { label: 'Overview', id: 'overview' },
    { label: 'Workflow', id: 'how-it-works' },
    { label: 'Impact', id: 'features' },
    { label: 'Hardware Edge', id: 'hardware' },
    { label: 'Architecture', id: 'architecture' },
    { label: 'Roadmap', id: 'roadmap' },
    { label: 'FAQ', id: 'faq' }
  ];

  // Scroll to section using native scrollIntoView
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // IntersectionObserver-based active section tracking
  useEffect(() => {
    const sectionIds = navItems.map(item => item.id);
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: [0, 0.25, 0.5]
      }
    );

    sections.forEach(section => observerRef.current.observe(section));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <nav className="site-navbar">
      <div className="nav-inner glass-nav">
        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--color-midnight-ink)'
          }}
        >
          <img
            src={logoNoText}
            alt="ParkPulse Logo"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(134, 47, 231, 0.25))'
            }}
          />
          <span style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em'
          }}>
            ParkPulse
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }} className="desktop-links">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={isActive ? 'nav-link-active' : ''}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-voltage-violet)' : 'var(--color-midnight-ink)',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Auth Actions (Right Side) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-auth-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-primary"
                onClick={() => onNavigate('/dashboard')}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
              <button
                className="btn-ghost"
                onClick={onLogout}
                title="Sign Out"
                style={{ padding: '8px 12px', fontSize: '13px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-ghost"
                onClick={() => onNavigate('/signin')}
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                className="btn-primary"
                onClick={() => onNavigate('/signup')}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}
              >
                <UserPlus size={15} />
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              background: 'rgba(134, 47, 231, 0.08)',
              border: '1px solid rgba(134, 47, 231, 0.2)',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'var(--color-midnight-ink)',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={22} color="var(--color-voltage-violet)" /> : <Menu size={22} color="var(--color-voltage-violet)" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mobile-dropdown glass-card mobile-dropdown-animated"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    background: isActive ? 'rgba(134, 47, 231, 0.08)' : 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '16px',
                    fontWeight: 600,
                    padding: '12px 16px',
                    color: isActive ? 'var(--color-voltage-violet)' : 'var(--color-midnight-ink)',
                    borderRadius: '12px',
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/dashboard'); }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <LayoutDashboard size={16} />
                    User Dashboard
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    style={{ width: '100%', justifyContent: 'center', color: '#dc2626' }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-ghost"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/signin'); }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/signup'); }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <UserPlus size={16} />
                    Register Account
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .site-navbar {
          position: sticky;
          top: 16px;
          z-index: 1000;
          max-width: var(--page-max-width);
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        .glass-nav {
          background: #ffffff;
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .glass-nav:hover {
          border-color: var(--border-glass-hover);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .mobile-dropdown {
          margin-top: 8px;
          background: #ffffff;
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 860px) {
          .site-navbar {
            top: 0;
            padding: 0;
            position: sticky;
          }

          .glass-nav {
            border-radius: 0 0 16px 16px;
            padding: 12px 16px;
            border-top: none;
          }

          .desktop-links, .desktop-auth-actions {
            display: none !important;
          }

          .mobile-dropdown {
            margin: 8px 16px 0 16px;
          }
        }

        @media (min-width: 861px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
