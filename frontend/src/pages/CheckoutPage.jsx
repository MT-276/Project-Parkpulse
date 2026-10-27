import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, CheckCircle2, ArrowRight, ArrowLeft,
  ShieldCheck, AlertCircle, RefreshCw, Calendar, AlertTriangle
} from 'lucide-react';
import qrImage from '../assets/QR.jpeg';
import logoWithText from '../assets/ParkPlus-Logo-Transparent-WithText.png';
import DecryptedText from '../components/reactbits/DecryptedText';
import TechLoader from '../components/reactbits/TechLoader';
import PrecisionButton from '../components/reactbits/PrecisionButton';

// Helper to format Date object into "YYYY-MM-DDTHH:mm" for datetime-local input
const toDateTimeLocalValue = (date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

export default function CheckoutPage({ spot, user, onNavigate }) {
  const [step, setStep] = useState(1); // 1: Select Time, 2: Review, 3: Payment
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Time & Duration State
  // Default start time: rounded to next 5 minutes
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    return now;
  });

  const [durationHours, setDurationHours] = useState(2); // default 2 hours

  // Compute boundaries for 24-hour booking window
  const now = new Date();
  const minStartIso = toDateTimeLocalValue(new Date(now.getTime() - 2 * 60 * 1000)); // allow now
  const maxEndIso = toDateTimeLocalValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // 24h limit

  // Compute End Time
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  // Step 3 Payment Simulation Timer (3 seconds delay before enable)
  const [paymentReady, setPaymentReady] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  // 15-minute payment expiry countdown
  const [paymentExpirySeconds, setPaymentExpirySeconds] = useState(15 * 60);

  // Calculate Price: ₹20 for 1st hour, ₹5 for each additional hour up to 12 hours
  const calculatePrice = (hours) => {
    const validHours = Math.max(1, Math.min(12, hours));
    return 20 + Math.max(0, validHours - 1) * 5;
  };

  const totalPrice = calculatePrice(durationHours);

  // Format Date/Time for display (e.g. "Today, 02:00 PM" or "21 Aug, 04:00 PM")
  const formatDateTime = (date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
    const dayLabel = isToday ? 'Today' : (isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    const timeLabel = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dayLabel}, ${timeLabel}`;
  };

  // Quick Start Presets (e.g. Now, +30m, +1h, +2h)
  const handleSetStartOffsetMinutes = (offsetMins) => {
    const base = new Date();
    const target = new Date(base.getTime() + offsetMins * 60 * 1000);
    target.setMinutes(Math.ceil(target.getMinutes() / 5) * 5, 0, 0);
    setStartTime(target);
  };

  // Custom Start Time change handler
  const handleStartTimeChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const selectedDate = new Date(val);
    const maxAllowed = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    if (selectedDate < new Date(now.getTime() - 5 * 60 * 1000)) {
      setErrorMsg('Start time cannot be in the past.');
      return;
    }
    if (selectedDate > maxAllowed) {
      setErrorMsg('Reservations must start within 24 hours from now.');
      return;
    }
    setErrorMsg(null);
    setStartTime(selectedDate);
  };

  // Custom End Time change handler (adjusts duration)
  const handleEndTimeChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const selectedEnd = new Date(val);
    const diffMs = selectedEnd.getTime() - startTime.getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    if (hours < 1) {
      setErrorMsg('Minimum reservation duration is 1 hour.');
      return;
    }
    if (hours > 12) {
      setErrorMsg('Maximum reservation duration is 12 hours.');
      return;
    }
    if (selectedEnd > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      setErrorMsg('End time cannot exceed the 24-hour reservation window.');
      return;
    }

    setErrorMsg(null);
    setDurationHours(Math.max(1, Math.min(12, Math.ceil(hours))));
  };

  // Step 3 Countdown & Payment Enable
  useEffect(() => {
    if (step === 3) {
      setPaymentReady(false);
      setCountdownSeconds(3);

      const simInterval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(simInterval);
            setPaymentReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Payment 15-minute countdown
      const expiryInterval = setInterval(() => {
        setPaymentExpirySeconds((prev) => {
          if (prev <= 1) {
            clearInterval(expiryInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(simInterval);
        clearInterval(expiryInterval);
      };
    }
  }, [step]);

  // Format 15-minute countdown timer
  const formatExpiryTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Step 2 -> Step 3: Trigger Reservation in Backend
  const handleConfirmReservation = async () => {
    if (!spot || !user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const nowStr = startTime.toISOString().replace('T', ' ').slice(0, 19);
      const endStr = endTime.toISOString().replace('T', ' ').slice(0, 19);

      const res = await fetch('/api/spots/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spot_id: spot.id,
          start_time: nowStr,
          end_time: endStr,
          duration_hours: durationHours,
          amount_paid: totalPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setErrorMsg(data.detail || 'Failed to lock parking reservation.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If no spot is selected, redirect back to dashboard
  if (!spot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No parking bay selected for booking.</p>
        <button className="btn-primary" onClick={() => onNavigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px 60px 20px',
      position: 'relative',
      overflowX: 'hidden',
      background: 'transparent'
    }}>
      {/* Top Bar Navigation */}
      <div style={{
        width: '100%',
        maxWidth: '740px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        position: 'relative',
        zIndex: 10
      }}>
        <button
          className="btn-ghost"
          onClick={() => onNavigate('/dashboard')}
          style={{ gap: '8px', padding: '8px 16px' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <img
          src={logoWithText}
          alt="ParkPulse"
          style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* STEPPER / 3 BUBBLES HEADER */}
      <div style={{
        width: '100%',
        maxWidth: '680px',
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {/* Bubble 1: Duration */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '95px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step > 1 ? '#10b981' : (step === 1 ? '#0f172a' : 'var(--bg-card-surface)'),
              color: step >= 1 ? '#ffffff' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              border: step > 1 ? '2px solid #10b981' : (step === 1 ? '2px solid #0f172a' : '1px solid var(--border-glass)'),
              boxShadow: step === 1 ? '0 2px 8px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.25s ease'
            }}>
              {step > 1 ? <CheckCircle2 size={18} /> : '1'}
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '8px',
              color: step === 1 ? 'var(--text-main)' : (step > 1 ? '#10b981' : 'var(--text-muted)')
            }}>
              1. Select Time
            </span>
          </div>

          {/* Connector Line 1-2 */}
          <div style={{
            flex: 1,
            height: '2px',
            background: step >= 2 ? '#0f172a' : 'var(--border-glass)',
            margin: '0 8px 24px 8px',
            borderRadius: '9999px',
            transition: 'background 0.25s ease'
          }} />

          {/* Bubble 2: Review Details */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '95px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step > 2 ? '#10b981' : (step === 2 ? '#0f172a' : 'var(--bg-card-surface)'),
              color: step >= 2 ? '#ffffff' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              border: step > 2 ? '2px solid #10b981' : (step === 2 ? '2px solid #0f172a' : '1px solid var(--border-glass)'),
              boxShadow: step === 2 ? '0 2px 8px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.25s ease'
            }}>
              {step > 2 ? <CheckCircle2 size={18} /> : '2'}
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '8px',
              color: step === 2 ? 'var(--text-main)' : (step > 2 ? '#10b981' : 'var(--text-muted)')
            }}>
              2. Review Details
            </span>
          </div>

          {/* Connector Line 2-3 */}
          <div style={{
            flex: 1,
            height: '2px',
            background: step >= 3 ? '#0f172a' : 'var(--border-glass)',
            margin: '0 8px 24px 8px',
            borderRadius: '9999px',
            transition: 'background 0.25s ease'
          }} />

          {/* Bubble 3: Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '95px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step === 3 ? '#0f172a' : 'var(--bg-card-surface)',
              color: step === 3 ? '#ffffff' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              border: step === 3 ? '2px solid #0f172a' : '1px solid var(--border-glass)',
              boxShadow: step === 3 ? '0 2px 8px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.25s ease'
            }}>
              3
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '8px',
              color: step === 3 ? 'var(--text-main)' : 'var(--text-muted)'
            }}>
              3. UPI Payment
            </span>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="status-alert error"
            style={{ maxWidth: '740px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CHECKOUT CARD CONTAINER */}
      <div className="glass-card checkout-main-card" style={{
        width: '100%',
        maxWidth: '740px',
        padding: '36px',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <AnimatePresence mode="wait">
          {/* ============================================================
              SEGMENT 1: START TIME & DURATION SELECTION
              ============================================================ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
            <div style={{ marginBottom: '24px' }}>
              <span className="section-eyebrow" style={{ color: 'var(--color-voltage-violet)', marginBottom: '4px' }}>
                STEP 1 OF 3
              </span>
              <h2 className="heading-md" style={{ fontSize: '26px', marginBottom: '6px' }}>
                <DecryptedText text={`Choose Schedule for ${spot.spot_number}`} speed={25} />
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Select when you want your parking slot to begin and how long you'll stay (1 to 12 hours within 24h window).
              </p>
            </div>

            {/* START TIME SECTION */}
            <div style={{ marginBottom: '28px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={15} color="var(--color-voltage-violet)" />
                Parking Start Time:
              </label>

              {/* Quick Start Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleSetStartOffsetMinutes(0)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ⚡ Start Now
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStartOffsetMinutes(30)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  +30 Mins
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStartOffsetMinutes(60)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  +1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStartOffsetMinutes(120)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  +2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStartOffsetMinutes(180)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  +3 Hours
                </button>
              </div>

              {/* Datetime Input for Start Time */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(startTime)}
                  min={minStartIso}
                  max={maxEndIso}
                  onChange={handleStartTimeChange}
                  className="form-input"
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '12px 14px',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    flex: 1
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', display: 'block' }}>
                Selected Start: <strong>{formatDateTime(startTime)}</strong>
              </span>
            </div>

            {/* DURATION & END TIME SECTION */}
            <div style={{ marginBottom: '28px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Calendar size={15} color="var(--color-voltage-violet)" />
                Parking Duration (Hours):
              </label>

              {/* Quick Duration Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))',
                gap: '10px',
                marginBottom: '14px'
              }}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '12px',
                      border: durationHours === hrs ? '2px solid #0f172a' : '1px solid var(--border-glass)',
                      background: durationHours === hrs ? '#0f172a' : 'var(--bg-card-surface)',
                      color: durationHours === hrs ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{hrs} {hrs === 1 ? 'Hr' : 'Hrs'}</span>
                    <span style={{ fontSize: '11px', color: durationHours === hrs ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-dim)', fontWeight: 500 }}>
                      ₹{calculatePrice(hrs)}
                    </span>
                  </button>
                ))}
              </div>

              {/* End Time Picker / Sync */}
              <div style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Or select custom End Time directly:
                </label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(endTime)}
                  min={toDateTimeLocalValue(new Date(startTime.getTime() + 60 * 60 * 1000))}
                  max={maxEndIso}
                  onChange={handleEndTimeChange}
                  className="form-input"
                  style={{
                    fontSize: '14px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Time & Price Summary Box */}
            <div style={{
              background: 'var(--sonar-box-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Booking Window
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatDateTime(startTime)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  &darr; to {formatDateTime(endTime)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Duration
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                  (Min: 1 hr &bull; Max: 12 hrs)
                </span>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Total Payable
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{totalPrice}.00
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  (₹20 for 1st hr + ₹5/hr for next)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-ghost"
                onClick={() => onNavigate('/dashboard')}
                style={{ padding: '12px 20px' }}
              >
                Cancel
              </button>

              <PrecisionButton
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                Continue to Review
                <ArrowRight size={16} />
              </PrecisionButton>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            SEGMENT 2: REVIEW RESERVATION DETAILS
            ============================================================ */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ marginBottom: '24px' }}>
              <span className="section-eyebrow" style={{ color: 'var(--color-voltage-violet)', marginBottom: '4px' }}>
                STEP 2 OF 3
              </span>
              <h2 className="heading-md" style={{ fontSize: '26px', marginBottom: '6px' }}>
                <DecryptedText text="Review Reservation Details" speed={25} />
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Please confirm your spot details, scheduled window, and total fare before proceeding to payment.
              </p>
            </div>

            {/* Detailed Review Table */}
            <div style={{
              background: 'var(--sonar-box-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Reserved Parking Spot</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{spot.spot_number} (Smart Bay #{spot.id})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>User Account</span>
                <strong style={{ fontSize: '14px' }}>{user?.name} ({user?.email})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Linked RFID UID</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--color-voltage-violet)' }}>[{user?.rfid_uid}]</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Scheduled Start Time</span>
                <strong style={{ fontSize: '14px' }}>{formatDateTime(startTime)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Scheduled End Time</span>
                <strong style={{ fontSize: '14px' }}>{formatDateTime(endTime)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Duration</span>
                <strong style={{ fontSize: '14px' }}>{durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                <span style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 700 }}>Total Amount Due</span>
                <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>₹{totalPrice}.00</strong>
              </div>
            </div>

            {/* Check-in Reminder Note */}
            <div style={{
              background: 'var(--sonar-box-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
              <span>
                Upon arriving at <strong>{spot.spot_number}</strong>, tap your physical RFID card (<strong style={{ fontFamily: 'monospace' }}>{user?.rfid_uid}</strong>) on the bay scanner to verify your arrival.
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-ghost"
                onClick={() => setStep(1)}
                style={{ padding: '12px 20px' }}
              >
                &larr; Edit Time
              </button>

              <PrecisionButton
                variant="primary"
                size="md"
                onClick={handleConfirmReservation}
                disabled={loading}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                {loading ? (
                  <TechLoader size={16} color="#ffffff" text="Locking Spot..." />
                ) : (
                  <>
                    Make Payment (₹{totalPrice}) &rarr;
                  </>
                )}
              </PrecisionButton>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            SEGMENT 3: MOCK UPI QR CODE PAYMENT
            ============================================================ */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {/* Step 3 Header */}
            <div style={{ marginBottom: '20px' }}>
              <span className="section-eyebrow" style={{ color: 'var(--color-voltage-violet)', marginBottom: '4px' }}>
                STEP 3 OF 3 &bull; INSTANT UPI PAYMENT
              </span>
              <h2 className="heading-md" style={{ fontSize: '26px', marginBottom: '6px' }}>
                <DecryptedText text={`Scan to Pay ₹${totalPrice}.00`} speed={25} />
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
                Scan the QR code with any UPI app (GPay, PhonePe, Paytm, BHIM) to finalize your reservation on {spot.spot_number}.
              </p>
            </div>

            {/* 15-Minute Countdown Timer Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '9999px',
              background: 'rgba(217, 119, 6, 0.1)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              color: '#d97706',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              <Clock size={15} />
              <span>Payment QR expires in: <strong>{formatExpiryTime(paymentExpirySeconds)}</strong></span>
            </div>

            {/* QR Code Card Frame */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                src={qrImage}
                alt="ParkPulse UPI Payment QR"
                style={{
                  width: '240px',
                  height: '240px',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>
                ParkPulse Smart Parking &bull; Spot #{spot.id}
              </div>
            </div>

            {/* Payment Verification Simulation Notice */}
            <div style={{
              maxWidth: '480px',
              margin: '0 auto 24px auto',
              fontSize: '13.5px',
              color: 'var(--text-dim)',
              lineHeight: '1.5'
            }}>
              {paymentReady ? (
                <div style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  UPI payment authorization received! Click below to enter your dashboard.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <TechLoader size={16} text={`Awaiting UPI Payment Confirmation (${countdownSeconds}s)...`} />
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <PrecisionButton
              variant={paymentReady ? "success" : "primary"}
              size="lg"
              disabled={!paymentReady}
              onClick={() => onNavigate('/dashboard')}
              style={{
                width: '100%',
                maxWidth: '420px',
                opacity: paymentReady ? 1 : 0.5,
                cursor: paymentReady ? 'pointer' : 'not-allowed'
              }}
            >
              {paymentReady ? (
                <>
                  <CheckCircle2 size={18} />
                  Payment Confirmed — Go to Dashboard
                </>
              ) : (
                <TechLoader size={16} color="#ffffff" text={`Confirming Payment (${countdownSeconds}s)...`} />
              )}
            </PrecisionButton>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
