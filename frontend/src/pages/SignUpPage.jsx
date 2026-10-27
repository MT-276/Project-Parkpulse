import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, CreditCard, KeyRound, ArrowRight, ArrowLeft,
  UserPlus, CheckCircle2, AlertCircle, RefreshCw, Radio, Zap, ShieldCheck
} from 'lucide-react';
import logoWithText from '../assets/ParkPlus-Logo-Transparent-WithText.png';
import DecryptedText from '../components/reactbits/DecryptedText';
import TechLoader from '../components/reactbits/TechLoader';

export default function SignUpPage({ onNavigate, onAuthSuccess }) {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Step 1: Send OTP for Signup
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!rfidUid.trim()) {
      setErrorMsg('Please provide your physical RFID Card UID (e.g. F3C291A8).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          rfid_uid: rfidUid.trim().toUpperCase(),
          purpose: 'signup'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Verification code sent to ${email}. Check your inbox!`);
        setStep(2);
      } else {
        setErrorMsg(data.detail || 'Failed to initiate user registration.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp_code: otpCode.trim(),
          name: name.trim(),
          phone: phone.trim(),
          rfid_uid: rfidUid.trim().toUpperCase(),
          purpose: 'signup'
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
        onNavigate('/dashboard');
      } else {
        setErrorMsg(data.detail || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setErrorMsg('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* Top Bar Back Link */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 10
      }}>
        <button
          className="btn-ghost"
          onClick={() => onNavigate('/')}
          style={{ gap: '8px', padding: '8px 16px' }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      {/* Google-Style 2-Column Split Registration Card */}
      <div className="glass-card auth-split-card" style={{
        width: '100%',
        maxWidth: '960px',
        padding: '44px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1.15fr',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px'
      }}>
        {/* Left Column: Brand & User Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <img
              src={logoWithText}
              alt="ParkPulse"
              style={{
                height: '76px',
                width: 'auto',
                marginBottom: '20px'
              }}
            />
            <h1 className="heading-lg" style={{ fontSize: '30px', marginBottom: '8px', lineHeight: '1.2' }}>
              <DecryptedText text="Create an Account" speed={30} />
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Pre-book guaranteed smart spots and check in with 1 tap of your physical ID card.
            </p>

            {/* Benefit Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {[
                { icon: CreditCard, text: 'Bind your physical RFID card UID directly to your car' },
                { icon: Zap, text: 'Instant 10-minute hold window before arrival' },
                { icon: ShieldCheck, text: 'Skip entry kiosk queues and manual ticketing forever' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(134, 47, 231, 0.1)',
                      color: 'var(--color-voltage-violet)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={15} />
                    </div>
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>
            One account works seamlessly across all ParkPulse smart parking bays.
          </div>
        </div>

        {/* Center Vertical Divider Line */}
        <div className="auth-vertical-divider" style={{
          width: '1px',
          height: '100%',
          minHeight: '400px',
          background: 'var(--border-glass)',
          opacity: 0.8
        }}></div>

        {/* Right Column: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="error-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="status-alert error"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                key="success-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="status-alert success"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step-details"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSendOtp}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <User size={14} color="var(--color-voltage-violet)" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      style={{ padding: '11px 14px', borderRadius: '10px' }}
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Phone size={14} color="var(--color-voltage-violet)" />
                      Phone (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="+9198XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      style={{ padding: '11px 14px', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Mail size={14} color="var(--color-voltage-violet)" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ padding: '11px 14px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <CreditCard size={14} color="var(--color-voltage-violet)" />
                    Physical RFID Card UID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDEF12"
                    value={rfidUid}
                    onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', padding: '11px 14px', borderRadius: '10px' }}
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    Used by the Arduino RC522 reader to identify your car on arrival.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('/signin')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-voltage-violet)',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '8px 0'
                    }}
                  >
                    Sign in instead
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '12px 24px', fontSize: '15px', borderRadius: '12px' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <TechLoader size={16} color="#ffffff" text="Sending..." />
                    ) : (
                      <>
                        Next
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleVerifyOtp}
              >
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px' }}>
                    <KeyRound size={15} color="var(--color-voltage-violet)" />
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="form-input"
                    style={{
                      fontSize: '26px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '14px',
                      borderRadius: '12px'
                    }}
                    autoFocus
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', display: 'block', textAlign: 'center' }}>
                    Code sent to <strong>{email}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => { setStep(1); setOtpCode(''); setErrorMsg(null); }}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
                  >
                    Edit Info
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '12px', borderRadius: '12px' }}
                    disabled={loading}
                  >
                    {loading ? <TechLoader size={16} color="#ffffff" text="Creating..." /> : 'Verify & Register'}
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '18px' }}>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-voltage-violet)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Didn't get code? Resend OTP
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Media Query Styling for Split Layout */}
      <style>{`
        @media (max-width: 860px) {
          .auth-split-card {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 32px 24px !important;
          }
          .auth-vertical-divider {
            width: 100% !important;
            height: 1px !important;
            min-height: 1px !important;
          }
        }
      `}</style>
    </div>
  );
}
