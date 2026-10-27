import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car, Clock, Zap, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Sun, Moon, Eye, EyeOff, Mail, LogOut, Home, Shield, Code, User, CreditCard, Trash2,
  Menu, X, ChevronLeft, ChevronRight, AlertCircle, SquareParking
} from 'lucide-react';
import logoNoText from '../assets/ParkPlus-Logo-Transparent-NoText.png';
import DevConsole from '../components/DevConsole';
import EmailTestModal from '../components/Modals/EmailTestModal';
import CancelHoldModal from '../components/Modals/CancelHoldModal';
import Footer from '../components/Footer';
import DecryptedText from '../components/reactbits/DecryptedText';
import PrecisionButton from '../components/reactbits/PrecisionButton';
import PixelInvertText from '../components/reactbits/PixelInvertText';

const API_BASE = '/api';

export default function DashboardPage({ user, onNavigate, onLogout, onStartCheckout }) {
  const [spots, setSpots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  // Theme & Dev Mode
  const [theme, setTheme] = useState(() => localStorage.getItem('parkpulse_theme') || 'light');
  const [showDevConsole, setShowDevConsole] = useState(false);

  // In-App Toast Notification State
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Cancel Hold Modal State
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    spotId: null,
    spotNumber: '',
    remainingTime: '',
    loading: false
  });

  const openCancelModal = (spotId, spotNumber, remainingTime) => {
    setCancelModalState({
      isOpen: true,
      spotId,
      spotNumber: spotNumber || `Spot ${spotId}`,
      remainingTime: remainingTime || '',
      loading: false
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalState.spotId) return;
    setCancelModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/spots/cancel?spot_id=${cancelModalState.spotId}`, {
        method: 'POST'
      });
      if (res.ok) {
        setCancelModalState({ isOpen: false, spotId: null, spotNumber: '', remainingTime: '', loading: false });
        showToast('Reservation hold cancelled. Spot released.', 'success');
        fetchDashboardData();
      } else {
        const data = await res.json();
        setCancelModalState(prev => ({ ...prev, loading: false }));
        showToast(data.detail || 'Failed to cancel reservation.', 'error');
      }
    } catch (err) {
      setCancelModalState(prev => ({ ...prev, loading: false }));
      showToast('Error cancelling reservation: ' + err.message, 'error');
    }
  };

  // Mobile Navigation & Carousel State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSpotIndex, setActiveSpotIndex] = useState(0);
  const carouselRef = useRef(null);
  const spotRefs = useRef([]);

  // Email Test Modal (Admin only)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('meitsant@gmail.com');
  const [emailStatus, setEmailStatus] = useState(null);

  // Hardware Simulator Controls (Admin only)
  const [simSpotId, setSimSpotId] = useState(1);
  const [simDistance, setSimDistance] = useState(15.0);
  const [simIsOccupied, setSimIsOccupied] = useState(true);
  const [simRfidUid, setSimRfidUid] = useState(user?.rfid_uid || '7EF53EA9');

  // Checkout Bypass Toggle (Admin only)
  const [isCheckoutBypassed, setIsCheckoutBypassed] = useState(false);

  // Clock
  const [now, setNow] = useState(new Date());

  // Carousel & Tab Synchronization
  const scrollToSpot = (index) => {
    setActiveSpotIndex(index);
    if (spotRefs.current[index]) {
      spotRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.88;
    const index = Math.round(scrollLeft / (cardWidth || 1));
    const clamped = Math.max(0, Math.min(spots.length - 1, index));
    if (clamped !== activeSpotIndex) {
      setActiveSpotIndex(clamped);
    }
  };

  // Synchronize Theme Class on <body>
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('parkpulse_theme', theme);
  }, [theme]);

  // Live Timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch spots (and logs if admin)
  const fetchDashboardData = async () => {
    try {
      const spotsRes = await fetch(`${API_BASE}/spots`);
      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        setSpots(spotsData);
        setIsConnected(true);
      }

      // If admin, also fetch logs and users list
      if (user?.role === 'admin') {
        const [logsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/logs`),
          fetch(`${API_BASE}/users`)
        ]);
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
        }
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
      setIsConnected(false);
    }
  };

  // High-frequency polling (every 1.5 seconds)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 1500);
    return () => clearInterval(interval);
  }, [user]);

  // Reserve Spot Handler (1-click direct booking for authenticated user)
  const handleReserveSpot = async (spotId) => {
    try {
      const res = await fetch(`${API_BASE}/spots/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spot_id: spotId })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Spot reserved! 10-minute hold active.', 'success');
        fetchDashboardData();
      } else {
        showToast(data.detail || 'Failed to reserve spot.', 'error');
      }
    } catch (err) {
      showToast('Error reserving spot: ' + err.message, 'error');
    }
  };

  // Send Test Notification Email (Admin only)
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setEmailStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailInput })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus('success');
        showToast('Test notification email dispatched!', 'success');
      } else {
        setEmailStatus('error: ' + (data.detail || 'Failed to send email.'));
        showToast(data.detail || 'Failed to send email.', 'error');
      }
    } catch (err) {
      setEmailStatus('error: ' + err.message);
      showToast('Error sending email: ' + err.message, 'error');
    }
  };

  // Hardware Update Simulator Dispatch (Admin only)
  const handleHardwareDispatch = async () => {
    try {
      const res = await fetch(`${API_BASE}/hardware/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spot_id: parseInt(simSpotId),
          distance_cm: parseFloat(simDistance),
          is_occupied: simIsOccupied,
          rfid_uid: simRfidUid || null
        })
      });
      if (res.ok) {
        showToast(`Dispatched sensor update for Spot ${simSpotId}`, 'success');
        fetchDashboardData();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Hardware update failed.', 'error');
      }
    } catch (err) {
      showToast('Hardware simulation error: ' + err.message, 'error');
    }
  };

  // Reset All Spots (Admin only)
  const handleResetAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
      if (res.ok) {
        showToast('All 3 bays reset to AVAILABLE.', 'success');
        fetchDashboardData();
      } else {
        showToast('Failed to reset spots.', 'error');
      }
    } catch (err) {
      showToast('Error resetting spots: ' + err.message, 'error');
    }
  };

  // Remaining Hold Calculator
  // Backend stores all timestamps in IST (UTC+05:30). Append the offset so
  // the browser interprets them correctly regardless of the viewer's timezone.
  const getRemainingHoldTime = (expiresAtStr) => {
    if (!expiresAtStr) return '00:00';
    const isoStr = expiresAtStr.replace(' ', 'T');
    // Append IST offset if the string has no timezone info
    const expiresAt = new Date(isoStr.includes('+') || isoStr.endsWith('Z') ? isoStr : isoStr + '+05:30');
    const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const mins = Math.floor(diff / 60).toString().padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Check if current user has an active hold reservation (spot is in HOLD status)
  const myHoldReservation = spots.find(
    s => s.status === 'HOLD' && s.active_reservation && s.active_reservation.user_email === user?.email
  );

  // Check if current user has an active parked session (spot is in OCCUPIED status)
  const myOccupiedSession = spots.find(
    s => s.status === 'OCCUPIED' && s.active_reservation && s.active_reservation.user_email === user?.email
  );

  const hasActiveReservation = Boolean(myHoldReservation || myOccupiedSession);
  const activeSpotNumber = myHoldReservation ? myHoldReservation.spot_number : (myOccupiedSession ? myOccupiedSession.spot_number : null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dashboard Soft Atmospheric Background Blur Layer */}
      <div className="dashboard-bg-blur-layer" />

      {/* DASHBOARD NAVBAR */}
      <header className="navbar-wrapper">
        <div className="navbar-inner">
          {/* Logo & Brand */}
          <div className="navbar-brand">
            <img src={logoNoText} alt="ParkPulse" className="navbar-logo" />
            <div>
              <span className="navbar-title">ParkPulse</span>
              <span className="navbar-subtitle">
                {user?.role === 'admin' ? 'ADMIN CONSOLE' : 'USER DASHBOARD'}
              </span>
            </div>
          </div>

          {/* Mobile Header Quick Actions */}
          <div className="navbar-mobile-quick-actions">
            {/* Compact Live Dot */}
            <span className={`status-pill status-pill-compact ${isConnected ? 'online' : 'offline'}`} title={isConnected ? 'System Live' : 'Offline'}>
              <span className={`pulsing-dot ${isConnected ? 'online' : 'offline'}`}></span>
              <span>{isConnected ? 'Live' : 'Off'}</span>
            </span>

            {/* Quick Theme Switcher */}
            <button
              className="btn-ghost"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ padding: '6px 8px', minWidth: '34px', minHeight: '34px' }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={15} color="#fbbf24" />
              ) : (
                <Moon size={15} color="var(--color-voltage-violet)" />
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              className="btn-ghost navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                padding: '6px 8px',
                minWidth: '34px',
                minHeight: '34px',
                background: mobileMenuOpen ? 'rgba(134, 47, 231, 0.15)' : undefined,
                borderColor: mobileMenuOpen ? 'var(--color-voltage-violet)' : undefined
              }}
            >
              {mobileMenuOpen ? <X size={17} color="var(--color-voltage-violet)" /> : <Menu size={17} />}
            </button>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="navbar-controls-desktop">
            {/* Status Indicator */}
            <span className={`status-pill ${isConnected ? 'online' : 'offline'}`}>
              <span className={`pulsing-dot ${isConnected ? 'online' : 'offline'}`}></span>
              {isConnected ? 'System Live' : 'Reconnecting...'}
            </span>

            {/* User Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'var(--bg-card-surface)',
              border: '1px solid var(--border-glass)',
              fontSize: '13px'
            }}>
              <User size={14} color="var(--color-voltage-violet)" />
              <span style={{ fontWeight: 600 }}>{user?.name}</span>
              {user?.role === 'admin' ? (
                <span style={{
                  background: 'rgba(134, 47, 231, 0.15)',
                  color: 'var(--color-voltage-violet)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  ADMIN
                </span>
              ) : (
                <span style={{
                  color: 'var(--text-dim)',
                  fontSize: '11.5px',
                  fontFamily: 'monospace'
                }}>
                  [{user?.rfid_uid}]
                </span>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              className="btn-ghost"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ padding: '8px 12px' }}
            >
              {theme === 'dark' ? (
                <Sun size={16} color="#fbbf24" />
              ) : (
                <Moon size={16} color="var(--color-voltage-violet)" />
              )}
            </button>

            {/* Admin Developer Controls */}
            {user?.role === 'admin' && (
              <>
                <button
                  className="btn-ghost"
                  onClick={() => setShowDevConsole(!showDevConsole)}
                  style={{
                    padding: '8px 12px',
                    borderColor: showDevConsole ? 'var(--color-voltage-violet)' : undefined,
                    background: showDevConsole ? 'rgba(134, 47, 231, 0.15)' : undefined
                  }}
                >
                  {showDevConsole ? <EyeOff size={16} color="var(--color-voltage-violet)" /> : <Code size={16} />}
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {showDevConsole ? 'Hide Controls' : 'Dev Controls'}
                  </span>
                </button>

                <button
                  className="btn-ghost"
                  onClick={() => setIsCheckoutBypassed(!isCheckoutBypassed)}
                  title={isCheckoutBypassed ? "Enable Checkout Flow" : "Bypass Checkout Flow"}
                  style={{
                    padding: '8px 12px',
                    color: isCheckoutBypassed ? '#d97706' : 'var(--text-muted)',
                    borderColor: isCheckoutBypassed ? 'rgba(217, 119, 6, 0.4)' : undefined,
                    background: isCheckoutBypassed ? 'rgba(217, 119, 6, 0.08)' : undefined,
                    gap: '6px'
                  }}
                >
                  <CreditCard size={15} color={isCheckoutBypassed ? '#d97706' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {isCheckoutBypassed ? 'Checkout Bypassed' : 'Bypass Checkout'}
                  </span>
                </button>

                <button className="btn-ghost" onClick={() => setShowEmailModal(true)} style={{ padding: '8px 12px' }}>
                  <Mail size={16} color="var(--color-voltage-violet)" />
                  Email Test
                </button>

                <button
                  className="btn-ghost"
                  onClick={handleResetAll}
                  title="Reset All 3 Spots to Available"
                  style={{
                    padding: '8px 12px',
                    color: '#dc2626',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={15} color="#ef4444" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Reset Spots</span>
                </button>
              </>
            )}

            {/* Back to Home */}
            <button className="btn-ghost" onClick={() => onNavigate('/')} style={{ padding: '8px 12px' }}>
              <Home size={16} />
              Website
            </button>

            {/* Sign Out */}
            <button className="btn-ghost" onClick={onLogout} title="Sign Out" style={{ padding: '8px 12px', color: '#dc2626' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="navbar-mobile-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="navbar-mobile-menu"
            >
              <div className="navbar-mobile-user-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="navbar-mobile-avatar">
                    <User size={16} color="var(--color-voltage-violet)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                      {user?.name || 'Driver'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      RFID: {user?.rfid_uid || 'Unlinked'}
                    </div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <span className="admin-badge-pill">ADMIN</span>
                )}
              </div>

              <div className="navbar-mobile-divider" />

              <div className="navbar-mobile-grid">
                {user?.role === 'admin' && (
                  <>
                    <button
                      className="btn-ghost mobile-menu-btn"
                      onClick={() => { setShowDevConsole(!showDevConsole); setMobileMenuOpen(false); }}
                      style={{
                        borderColor: showDevConsole ? 'var(--color-voltage-violet)' : undefined,
                        background: showDevConsole ? 'rgba(134, 47, 231, 0.12)' : undefined
                      }}
                    >
                      {showDevConsole ? <EyeOff size={14} color="var(--color-voltage-violet)" /> : <Code size={14} />}
                      <span>{showDevConsole ? 'Hide Dev' : 'Dev Controls'}</span>
                    </button>

                    <button
                      className="btn-ghost mobile-menu-btn"
                      onClick={() => { setIsCheckoutBypassed(!isCheckoutBypassed); setMobileMenuOpen(false); }}
                      style={{
                        color: isCheckoutBypassed ? '#d97706' : undefined,
                        borderColor: isCheckoutBypassed ? 'rgba(217, 119, 6, 0.4)' : undefined,
                        background: isCheckoutBypassed ? 'rgba(217, 119, 6, 0.08)' : undefined
                      }}
                    >
                      <CreditCard size={14} color={isCheckoutBypassed ? '#d97706' : 'var(--text-muted)'} />
                      <span>{isCheckoutBypassed ? 'Bypassed' : 'Bypass'}</span>
                    </button>

                    <button
                      className="btn-ghost mobile-menu-btn"
                      onClick={() => { setShowEmailModal(true); setMobileMenuOpen(false); }}
                    >
                      <Mail size={14} color="var(--color-voltage-violet)" />
                      <span>Email Test</span>
                    </button>

                    <button
                      className="btn-ghost mobile-menu-btn"
                      onClick={() => { handleResetAll(); setMobileMenuOpen(false); }}
                      style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash2 size={14} color="#ef4444" />
                      <span>Reset Spots</span>
                    </button>
                  </>
                )}

                <button
                  className="btn-ghost mobile-menu-btn"
                  onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
                >
                  <Home size={14} />
                  <span>Website</span>
                </button>

                <button
                  className="btn-ghost mobile-menu-btn"
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* DASHBOARD HERO / WELCOME HEADER */}
      <section className="dashboard-welcome-section" style={{ padding: '36px 0 20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <PixelInvertText as="div" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={13} />
                LIVE SMART PARKING FACILITY
              </span> */}
              <h1 className="display-title dashboard-welcome-title" style={{ fontSize: '36px', marginBottom: '8px' }}>
                <DecryptedText text={`Welcome, ${user?.name || 'Driver'}`} speed={25} />
              </h1>
              <p style={{ fontSize: '15px', margin: 0 }}>
                Your RFID Card: <strong style={{ fontFamily: 'monospace' }}>{user?.rfid_uid}</strong>
              </p>
            </PixelInvertText>

            <button className="btn-ghost" onClick={fetchDashboardData} style={{ fontSize: '13px' }}>
              <RefreshCw size={14} /> Refresh Live Bays
            </button>
          </div>
        </div>
      </section>

      {/* ACTIVE HOLD RESERVATION BANNER (Spot status === 'HOLD') */}
      {myHoldReservation && (
        <section style={{ marginBottom: '28px' }}>
          <div className="container">
            <div className="glass-card hold-reservation-card" style={{
              background: 'var(--banner-hold-bg)',
              borderColor: 'var(--banner-hold-border)',
              borderWidth: '1px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#d97706',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                  }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Your Active Reservation Hold
                    </div>
                    <h3 className="heading-sm" style={{ fontSize: '22px', margin: '2px 0' }}>
                      {myHoldReservation.spot_number} is locked for your vehicle
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                      Arrive at <strong>{myHoldReservation.spot_number}</strong> and tap your RFID card (<strong>{user?.rfid_uid}</strong>) on the bay scanner to complete check-in.
                    </p>
                  </div>
                </div>

                <div className="hold-banner-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                      Time Remaining
                    </div>
                    <div style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#d97706',
                      fontFamily: 'monospace'
                    }}>
                      {getRemainingHoldTime(myHoldReservation.active_reservation?.hold_expires_at)}
                    </div>
                  </div>

                  <button
                    className="btn-ghost"
                    onClick={() => openCancelModal(myHoldReservation.id, myHoldReservation.spot_number, getRemainingHoldTime(myHoldReservation.active_reservation?.hold_expires_at))}
                    style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '10px 16px' }}
                  >
                    <XCircle size={16} />
                    Cancel Hold
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ACTIVE PARKED SESSION BANNER (Spot status === 'OCCUPIED') */}
      {myOccupiedSession && (
        <section style={{ marginBottom: '28px' }}>
          <div className="container">
            <div className="glass-card" style={{
              background: 'var(--banner-occupied-bg)',
              borderColor: 'var(--banner-occupied-border)',
              borderWidth: '1px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                  }}>
                    <Car size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Parking Session Active &bull; Check-In Verified
                    </div>
                    <h3 className="heading-sm" style={{ fontSize: '22px', margin: '2px 0' }}>
                      Vehicle Parked at {myOccupiedSession.spot_number}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                      Checked in with RFID Card (<strong style={{ fontFamily: 'monospace' }}>{user?.rfid_uid}</strong>). Telemetry is actively monitored by IoT sensors.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="pill-badge pill-available" style={{ padding: '8px 16px', fontSize: '13px', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    Session Active &bull; Parked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LIVE 3-BAY PARKING GRID */}
      <main className="container" style={{ flex: 1 }}>
        {/* MOBILE 3-BAY QUICK TABS */}
        <div className="mobile-bay-tabs" role="tablist" aria-label="Parking Bays">
          {spots.map((spot, idx) => {
            const isHold = spot.status === 'HOLD';
            const isOccupied = spot.status === 'OCCUPIED';
            const isWrongSpot = spot.status === 'WRONG_SPOT';
            const isAvailable = spot.status === 'AVAILABLE';
            const isActive = activeSpotIndex === idx;

            let dotColor = '#10b981';
            let statusLabel = 'FREE';
            if (isHold) { dotColor = '#f59e0b'; statusLabel = 'HOLD'; }
            if (isOccupied) { dotColor = '#ef4444'; statusLabel = 'OCCUPIED'; }
            if (isWrongSpot) { dotColor = '#ef4444'; statusLabel = 'ALERT'; }

            return (
              <button
                key={spot.id}
                role="tab"
                aria-selected={isActive}
                className={`mobile-bay-tab ${isActive ? 'active' : ''}`}
                onClick={() => scrollToSpot(idx)}
              >
                <span className="mobile-tab-dot" style={{ background: dotColor }} />
                <span className="mobile-tab-name">{spot.spot_number}</span>
                <span className="mobile-tab-status" style={{ color: dotColor }}>
                  {statusLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* BAYS GRID / MOBILE SWIPE CAROUSEL */}
        <div
          className="bays-grid"
          ref={carouselRef}
          onScroll={handleCarouselScroll}
        >
          {spots.map((spot, idx) => {
            const isHold = spot.status === 'HOLD';
            const isOccupied = spot.status === 'OCCUPIED';
            const isWrongSpot = spot.status === 'WRONG_SPOT';
            const isAvailable = spot.status === 'AVAILABLE';
            const isMyHold = isHold && spot.active_reservation?.user_email === user?.email;

            let statusPillClass = 'pill-available';
            let bayClass = 'bay-available';
            if (isHold) { statusPillClass = 'pill-hold'; bayClass = 'bay-hold'; }
            if (isOccupied) { statusPillClass = 'pill-occupied'; bayClass = 'bay-occupied'; }
            if (isWrongSpot) { statusPillClass = 'pill-wrong-spot'; bayClass = 'bay-wrong-spot'; }

            return (
              <div
                key={spot.id}
                ref={(el) => (spotRefs.current[idx] = el)}
                className={`glass-card ${activeSpotIndex === idx ? 'spot-card-active-mobile' : ''}`}
              >
                {/* Spot Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="heading-sm" style={{ fontSize: '22px' }}>{spot.spot_number}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Smart Bay ID: #{spot.id}
                    </span>
                  </div>

                  <span className={`pill-badge ${statusPillClass}`}>
                    {isWrongSpot && <AlertTriangle size={14} />}
                    {isHold && <Clock size={14} />}
                    {isOccupied && <CheckCircle2 size={14} />}
                    {isAvailable && <SquareParking size={14} />}
                    {spot.status}
                  </span>
                </div>

                {/* Visual Bay Graphic */}
                <div className={`parking-bay-visual ${bayClass}`}>
                  {isOccupied || isWrongSpot ? (
                    <div style={{ textAlign: 'center' }}>
                      <Car
                        size={44}
                        color={isWrongSpot ? '#ef4444' : '#10b981'}
                      />
                      <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px', color: isWrongSpot ? '#ef4444' : '#10b981', letterSpacing: '0.05em' }}>
                        {isWrongSpot ? '⚠️ UNAUTHORIZED OCCUPANCY' : '✓ VEHICLE PARKED & VERIFIED'}
                      </div>
                    </div>
                  ) : isHold ? (
                    <div style={{ textAlign: 'center' }}>
                      <Clock size={38} color="#d97706" />
                      <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#d97706' }}>
                        {isMyHold
                          ? `YOUR HOLD LOCKED (${getRemainingHoldTime(spot.active_reservation?.hold_expires_at)})`
                          : `HOLD LOCKED (${getRemainingHoldTime(spot.active_reservation?.hold_expires_at)})`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <SquareParking size={36} color="#059669" />
                      <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px', color: '#059669', letterSpacing: '0.08em' }}>
                        BAY OPEN
                      </div>
                    </div>
                  )}
                </div>

                {/* Telemetry Gauge */}
                <div className="spot-sonar-box">
                  <div className="spot-sonar-header">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sonar Telemetry:</span>
                    <strong style={{
                      color: spot.is_occupied ? '#dc2626' : '#059669',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}>
                      {spot.distance_cm.toFixed(1)} cm
                    </strong>
                  </div>
                  <div className="spot-gauge-track">
                    <div
                      className="spot-gauge-fill"
                      style={{
                        width: `${Math.min(100, Math.max(5, (spot.distance_cm / 150) * 100))}%`,
                        background: spot.is_occupied ? '#ef4444' : '#10b981'
                      }}
                    />
                  </div>
                </div>

                {/* User / Reservation Info */}
                {spot.active_reservation ? (
                  <div className="spot-user-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {isMyHold ? 'Your Reservation:' : 'Reserved By:'}
                      </span>
                      {isHold && (
                        <span style={{ fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {getRemainingHoldTime(spot.active_reservation.hold_expires_at)}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '14px' }}>
                      {spot.active_reservation.user_name}
                    </div>
                    {/* Only show email if it's the user's own reservation or user is admin */}
                    {(isMyHold || user?.role === 'admin') && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {spot.active_reservation.user_email}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="spot-empty-note">
                    Bay available for instant 10-minute hold reservation.
                  </div>
                )}

                {/* Action Buttons */}
                <div>
                  {isAvailable && (
                    hasActiveReservation ? (
                      <div>
                        <button
                          className="btn-ghost"
                          disabled
                          style={{
                            width: '100%',
                            opacity: 0.6,
                            cursor: 'not-allowed',
                            fontSize: '13px',
                            gap: '6px'
                          }}
                          title={`You already hold an active reservation or session on ${activeSpotNumber}.`}
                        >
                          <AlertTriangle size={15} color="#d97706" />
                          1-Spot Limit Reached
                        </button>
                        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          Active on {activeSpotNumber}
                        </div>
                      </div>
                    ) : (
                      <PrecisionButton
                        variant="primary"
                        size="md"
                        style={{ width: '100%' }}
                        onClick={() => (onStartCheckout && !isCheckoutBypassed) ? onStartCheckout(spot) : handleReserveSpot(spot.id)}
                      >
                        <Clock size={16} />
                        Reserve Spot
                      </PrecisionButton>
                    )
                  )}
                  {isMyHold && (
                    <button
                      className="btn-ghost"
                      style={{ width: '100%', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={() => openCancelModal(spot.id, spot.spot_number, getRemainingHoldTime(spot.active_reservation?.hold_expires_at))}
                    >
                      <XCircle size={16} />
                      Cancel Hold Reservation
                    </button>
                  )}
                  {isHold && !isMyHold && user?.role === 'admin' && (
                    <button
                      className="btn-ghost"
                      style={{ width: '100%', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={() => openCancelModal(spot.id, spot.spot_number, getRemainingHoldTime(spot.active_reservation?.hold_expires_at))}
                    >
                      <XCircle size={16} />
                      Admin Cancel Hold
                    </button>
                  )}
                  {isHold && !isMyHold && user?.role !== 'admin' && (
                    <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px', color: '#d97706', fontWeight: 600 }}>
                      🔒 Reserved by another user
                    </div>
                  )}
                  {isOccupied && (
                    <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px', color: 'var(--color-voltage-violet)', fontWeight: 600 }}>
                      ✓ Physical RFID Check-In Verified
                    </div>
                  )}
                  {isWrongSpot && (
                    <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px', color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Unauthorized Occupancy Alert Sent
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE CAROUSEL CONTROLS & DOTS */}
        <div className="mobile-carousel-controls">
          <button
            className="btn-ghost mobile-nav-arrow"
            onClick={() => scrollToSpot(Math.max(0, activeSpotIndex - 1))}
            disabled={activeSpotIndex === 0}
            aria-label="Previous Spot"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="mobile-carousel-dots">
            {spots.map((s, idx) => (
              <button
                key={s.id}
                className={`mobile-dot ${activeSpotIndex === idx ? 'active' : ''}`}
                onClick={() => scrollToSpot(idx)}
                aria-label={`Jump to Spot ${s.spot_number}`}
              />
            ))}
          </div>

          <button
            className="btn-ghost mobile-nav-arrow"
            onClick={() => scrollToSpot(Math.min(spots.length - 1, activeSpotIndex + 1))}
            disabled={activeSpotIndex === spots.length - 1}
            aria-label="Next Spot"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </main>

      {/* BEHIND THE SCENES DEVELOPER CONTROLS (ADMIN ONLY) */}
      <AnimatePresence>
        {user?.role === 'admin' && showDevConsole && (
          <motion.div
            key="dev-console"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <DevConsole
              spots={spots}
              users={usersList}
              logs={logs}
              simSpotId={simSpotId}
              setSimSpotId={setSimSpotId}
              simDistance={simDistance}
              setSimDistance={setSimDistance}
              simIsOccupied={simIsOccupied}
              setSimIsOccupied={setSimIsOccupied}
              simRfidUid={simRfidUid}
              setSimRfidUid={setSimRfidUid}
              onHardwareDispatch={handleHardwareDispatch}
              onRefreshLogs={fetchDashboardData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMAIL TEST MODAL (ADMIN ONLY) */}
      {user?.role === 'admin' && (
        <EmailTestModal
          isOpen={showEmailModal}
          onClose={() => { setShowEmailModal(false); setEmailStatus(null); }}
          onSubmit={handleSendTestEmail}
          email={testEmailInput}
          setEmail={setTestEmailInput}
          status={emailStatus}
        />
      )}

      {/* CANCEL HOLD CONFIRMATION MODAL */}
      <CancelHoldModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmCancel}
        spotNumber={cancelModalState.spotNumber}
        remainingTime={cancelModalState.remainingTime}
        loading={cancelModalState.loading}
      />

      {/* IN-APP TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="dashboard-toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`dashboard-toast toast-${toast.type}`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
            {toast.type === 'info' && <Zap size={18} color="var(--color-voltage-violet)" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close-btn" aria-label="Close Notification">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
