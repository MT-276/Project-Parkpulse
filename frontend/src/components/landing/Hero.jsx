import React from 'react';
import { Zap, Leaf, CreditCard, BarChart3, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import logoWithText from '../../assets/ParkPlus-Logo-Transparent-WithText.png';
import useScrollReveal from '../../hooks/useScrollReveal';
import ShinyText from '../reactbits/ShinyText';

export default function Hero({ onNavigate, user }) {
  const contentRef = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="overview" className="hero-screen-section" style={{
      textAlign: 'center',
      overflow: 'hidden',
      paddingTop: '60px',
      position: 'relative'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '840px' }} ref={contentRef}>

        {/* Centered Hero Brand Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <img
            src={logoWithText}
            alt="ParkPulse Logo"
            style={{
              height: 'clamp(180px, 25vw, 250px)',
              maxWidth: '90%',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Display Title - Precision Engineered */}
        <h1 className="display-title" style={{ marginTop: '0px', marginBottom: '20px' }}>
          <ShinyText
            speed={1.8}
            color="var(--color-midnight-ink)"
            shineColor="var(--color-voltage-violet)"
            spread={120}
          >
            Skip the Lines. Stop Circling. <br />
            Park Instantly.
          </ShinyText>
        </h1>

        {/* Pitch Description */}
        <p style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '17px',
          color: 'var(--color-slate)',
          lineHeight: '1.6',
          maxWidth: '700px',
          margin: '0 auto 32px auto'
        }}>
          Finding a parking spot shouldn't be a frustrating chore. <strong>ParkPulse</strong> lets you pre-book guaranteed parking spots in real-time, skip entry and exit kiosk queues, and check in effortlessly with a single tap of your physical ID card.
        </p>

        {/* Action CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '36px'
        }}>
          {user ? (
            <button
              className="btn-primary"
              onClick={() => onNavigate('/dashboard')}
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                borderRadius: '14px',
                cursor: 'pointer'
              }}
            >
              <UserCheck size={18} />
              Go to User Dashboard
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                className="btn-primary"
                onClick={() => onNavigate('/signin')}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  borderRadius: '14px',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={18} />
                Sign In to Reserve
                <ArrowRight size={18} />
              </button>

              <button
                className="btn-ghost"
                onClick={() => onNavigate('/signup')}
                style={{
                  padding: '14px 24px',
                  fontSize: '15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--color-midnight-ink)',
                  background: 'var(--bg-card-surface)'
                }}
              >
                Register User Account
              </button>
            </>
          )}
        </div>

        {/* Precision Value Proposition Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          fontSize: '12.5px',
          color: 'var(--color-graphite)',
          fontWeight: 600
        }}>
          {[
            { icon: Zap, text: 'Zero Kiosk Queues' },
            { icon: Leaf, text: 'Fuel & Emission Savings' },
            { icon: CreditCard, text: '1-Tap Physical ID Card' },
            { icon: BarChart3, text: 'Real-Time Facility Control' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-card-surface)',
                  border: '1px solid var(--border-glass)',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              >
                <Icon size={14} color="var(--color-voltage-violet)" />
                {item.text}
              </span>
            );
          })}
        </div>

      </div>
    </section>
  );
}
