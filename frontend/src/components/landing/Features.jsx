import React from 'react';
import { Zap, Leaf, CreditCard, BarChart3, Mail, Map } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function Features() {
  const sectionRevealRef = useScrollReveal();

  const featureList = [
    {
      icon: Zap,
      eyebrow: 'ZERO FRICTION ENTRY',
      title: 'Zero Waiting & Queue Jumping',
      description: 'Bypass long entrance ticket queues and exit payment kiosk lines entirely. Drive straight into your pre-booked spot without pulling paper receipts or waiting at boom barriers.',
      badge: 'Zero Kiosk Lines',
      color: 'var(--color-voltage-violet)'
    },
    {
      icon: Leaf,
      eyebrow: 'SUSTAINABLE URBAN MOBILITY',
      title: 'Fuel & Carbon Emissions Reduction',
      description: 'Eliminate wasted time spent circling parking garages. Route drivers directly to a guaranteed space, conserving fuel and slashing greenhouse gas emissions caused by vehicle idling.',
      badge: 'Eco Friendly',
      color: '#0b6b55'
    },
    {
      icon: CreditCard,
      eyebrow: 'UNIFIED HARDWARE WALLET',
      title: '1-Tap Physical ID Card Check-In',
      description: 'Your registered physical RFID ID card doubles as your digital wallet, booking confirmation, and parking ticket—all authenticated in a single physical tap on the spot reader.',
      badge: '1-Tap Verification',
      color: '#dc5f05'
    },
    {
      icon: BarChart3,
      eyebrow: 'FACILITY INTELLIGENCE',
      title: 'Optimized Real-Time Lot Management',
      description: 'Facility managers gain an instant, high-frequency birds-eye view of lot occupancy, traffic flow, and peak tariffs to maximize lot efficiency and spot utilization.',
      badge: 'Live Dashboard',
      color: 'var(--color-ultra-violet)'
    },
    {
      icon: Mail,
      eyebrow: 'INSTANT NOTIFICATIONS',
      title: 'Automated Email Alerts',
      description: 'Receive real-time email notifications for booking confirmations, 10-minute hold reminders, and spot displacement warnings delivered straight to your inbox.',
      badge: 'Email Alerts',
      color: '#2563eb'
    },
    {
      icon: Map,
      eyebrow: 'LIVE MAP OCCUPANCY',
      title: 'Real-Time Grid Map',
      description: 'View a live, grid map of destination parking lots. Instantly see open, occupied, and reserved spots in real time before you even arrive.',
      badge: 'Live Grid Map',
      color: '#e22ba4'
    }
  ];

  return (
    <section id="features" className="full-screen-section" style={{ background: '#ffffff' }}>

      {/* Background Atmosphere */}
      <div className="gradient-orb orb-amber" style={{ top: '10%', right: '5%' }}></div>
      <div className="gradient-orb orb-violet" style={{ bottom: '10%', left: '5%' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }} ref={sectionRevealRef}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span className="section-eyebrow">REAL-WORLD URBAN IMPACT</span>
          <h2 className="heading-lg">
            Why ParkPulse Changes the Game
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-slate)', marginTop: '12px', fontSize: '16px', lineHeight: '1.6' }}>
            Transforming urban mobility by replacing outdated paper ticketing and kiosk lines with automated smart reservations and real-time lot visibility,
            while still costing less captial than other europian solutions.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {featureList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-base"
                style={{
                  padding: '28px var(--spacing-24)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(134, 47, 231, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      border: '1px solid rgba(134, 47, 231, 0.15)'
                    }}>
                      <Icon size={22} />
                    </div>
                    <span className="pill-badge pill-violet" style={{ fontSize: '11px' }}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Eyebrow & Title */}
                  <div style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--color-slate)',
                    marginBottom: '6px'
                  }}>
                    {item.eyebrow}
                  </div>

                  <h3 className="heading-sm" style={{ fontSize: '20px', marginBottom: '8px' }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    color: 'var(--color-graphite)',
                    lineHeight: '1.5'
                  }}>
                    {item.description}
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
