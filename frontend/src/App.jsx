import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import Background from './components/reactbits/Background';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [checkoutSpot, setCheckoutSpot] = useState(null);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation helper
  const navigate = (path, state = {}) => {
    if (state.spot) {
      setCheckoutSpot(state.spot);
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCheckout = (spot) => {
    setCheckoutSpot(spot);
    navigate('/checkout', { spot });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Route Dispatcher
  const renderPage = () => {
    // 1. Sign In Route
    if (currentPath === '/signin') {
      if (user && !loading) {
        return <DashboardPage user={user} onNavigate={navigate} onLogout={handleLogout} onStartCheckout={handleStartCheckout} />;
      }
      return <SignInPage onNavigate={navigate} onAuthSuccess={login} />;
    }

    // 2. Sign Up Route
    if (currentPath === '/signup') {
      if (user && !loading) {
        return <DashboardPage user={user} onNavigate={navigate} onLogout={handleLogout} onStartCheckout={handleStartCheckout} />;
      }
      return <SignUpPage onNavigate={navigate} onAuthSuccess={login} />;
    }

    // 3. Checkout Route
    if (currentPath === '/checkout') {
      if (!user && !loading) {
        return <SignInPage onNavigate={navigate} onAuthSuccess={login} />;
      }
      return <CheckoutPage spot={checkoutSpot} user={user} onNavigate={navigate} />;
    }

    // 4. Dashboard Route
    if (currentPath === '/dashboard') {
      if (!user && !loading) {
        return <SignInPage onNavigate={navigate} onAuthSuccess={login} />;
      }
      return <DashboardPage user={user} onNavigate={navigate} onLogout={handleLogout} onStartCheckout={handleStartCheckout} />;
    }

    // 5. Default: Landing Page (/)
    return <LandingPage onNavigate={navigate} user={user} onLogout={handleLogout} />;
  };

  return (
    <div className="app-root" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Global Modular Background Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <Background />
      </div>

      <div style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
