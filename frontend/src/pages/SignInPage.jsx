import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, KeyRound, ArrowRight, ArrowLeft, Sparkles, CheckCircle2,
  AlertCircle, Radio, Clock, ShieldCheck
} from 'lucide-react';
import logoWithText from '../assets/ParkPlus-Logo-Transparent-WithText.png';
import DecryptedText from '../components/reactbits/DecryptedText';
import TechLoader from '../components/reactbits/TechLoader';

export default function SignInPage({ onNavigate, onAuthSuccess }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Step 1: Request 6-Digit OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Verification code sent to your email.');
        setStep(2);
      } else {
        setErrorMsg(data.detail || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onAuthSuccess(data.user);
        onNavigate('/dashboard');
      } else {
        setErrorMsg(data.detail || 'Invalid or expired code.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
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

      {/* Google-Style 2-Column Split Authentication Card */}
      <div className="glass-card auth-split-card" style={{
        width: '100%',
        maxWidth: '920px',
        padding: '48px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px'
      }}>
        {/* Left Column: Brand, Pitch & Highlights */}
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
            <h1 className="heading-lg" style={{ fontSize: '32px', marginBottom: '8px', lineHeight: '1.2' }}>
              <DecryptedText text="Sign in" speed={30} />
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.5' }}>
              to continue to your ParkPulse Smart Parking Dashboard
            </p>

            {/* Benefit Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {[
                { icon: Radio, text: '1-Tap physical RFID check-in verification' },
                { icon: Clock, text: 'Instant 10-minute hold reservation window' },
                { icon: ShieldCheck, text: 'Zero kiosk queues and automated session logs' }
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

          <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Protected by MFA &bull; <span style={{ color: 'var(--color-voltage-violet)', fontWeight: 600 }}>Zero Passwords</span>
          </div>
        </div>

        {/* Center Vertical Divider Line */}
        <div className="auth-vertical-divider" style={{
          width: '1px',
          height: '100%',
          minHeight: '340px',
          background: 'var(--border-glass)',
          opacity: 0.8
        }}></div>

        {/* Right Column: Form & OTP Interactions */}
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
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
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
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step-email"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSendOtp}
              >
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px' }}>
                    <Mail size={15} color="var(--color-voltage-violet)" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '15px', padding: '13px 16px', borderRadius: '12px' }}
                    autoFocus
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', display: 'block' }}>
                    We'll send a 6-digit one-time passcode to your inbox.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('/signup')}
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
                    Create account
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
                    Change Email
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '12px', borderRadius: '12px' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <TechLoader size={16} color="#ffffff" text="Verifying..." />
                    ) : (
                      'Verify & Enter'
                    )}
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
                      color: 'var(--color-midnight-ink)',
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
        @media (max-width: 820px) {
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
