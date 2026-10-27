import React from 'react';
import { MapPin, Navigation, Radio, LogOut } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function InteractiveDemo() {
  const sectionRevealRef = useScrollReveal();

  const steps = [
    {
      step: '01',
      title: 'Pre-Book & Live Grid Map',
      desc: 'Open parkpulse.meitsant.dev from home or on the go. View live parking lot availability and reserve a specific spot in advance.',
      icon: MapPin,
      color: '#862fe7'
    },
    {
      step: '02',
      title: 'Express Direct Navigation',
      desc: 'Drive straight to your reserved spot upon arrival. Skip entrance ticket queues, paper receipts, and 20-minute lot circling entirely.',
      icon: Navigation,
      color: '#dc5f05'
    },
    {
      step: '03',
      title: '1-Tap Physical RFID Check-In',
      desc: 'Pull into your bay and tap your physical RFID ID card on the spot reader. The edge hardware verifies your UID and logs arrival.',
      icon: Radio,
      color: '#0b6b55'
    },
    {
      step: '04',
      title: 'Automated Exit & Zero Kiosk Lines',
      desc: 'Your parking state and session duration sync automatically in the background. Leave seamlessly without standing in payment booth lines.',
      icon: LogOut,
      color: '#ef4444'
    }
  ];

  return (
    <section id="how-it-works" className="full-screen-section" style={{ background: 'var(--color-fog)' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }} ref={sectionRevealRef}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 36px auto' }}>
          <span className="section-eyebrow">THE DRIVER EXPERIENCE</span>
          <h2 className="heading-lg" style={{ marginBottom: '10px' }}>
            How ParkPulse Works
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-slate)', fontSize: '15px', lineHeight: '1.5' }}>
            A four-step frictionless experience taking you from pre-booking at home to 1-tap physical check-in and zero-queue exits.
          </p>
        </div>

        {/* Glassmorphism Workflow Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-bricolage)',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: 'var(--color-voltage-violet)',
                      opacity: 0.7
                    }}>
                      {item.step}
                    </span>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(255,255,255,0.9)'
                    }}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="heading-sm" style={{ fontSize: '18px', marginBottom: '6px' }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '13.5px',
                    color: 'var(--color-slate)',
                    lineHeight: '1.55'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
