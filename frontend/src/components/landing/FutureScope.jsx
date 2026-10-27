import React from 'react';
import { ShieldAlert, Mail, Zap, TrendingUp, Lock } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function FutureScope() {
  const sectionRevealRef = useScrollReveal();

  const roadmapItems = [
    {
      icon: Lock,
      title: 'Express Lanes & Physical Boom Barriers',
      desc: 'Integrating physical boom barriers and dedicated ParkPulse express entry lanes to enforce strict access control before vehicles reach the parking bays.',
      badge: 'Access Control',
      color: 'var(--color-voltage-violet)'
    },
    {
      icon: Mail,
      title: 'Automated SMTP Warning Dispatches',
      desc: 'Granting a 15-minute grace period for unauthorized or wrong-spot parkers, automatically sending real-time alert emails via SMTP relay.',
      badge: 'SMTP Relay',
      color: '#dc5f05'
    },
    {
      icon: ShieldAlert,
      title: '5-Strikes Rolling Ban Policy',
      desc: 'Issuing monetary fines and logging strikes on non-compliant accounts. Strikes automatically expire on a rolling 30-day schedule to encourage long-term compliance.',
      badge: 'Enforcement Engine',
      color: '#ef4444'
    },
    {
      icon: Zap,
      title: 'Full-Duplex WebSockets Transition',
      desc: 'Upgrading the current HTTP polling architecture to full-duplex WebSockets for true, zero-latency server-to-client push updates.',
      badge: 'Zero-Latency WebSockets',
      color: '#0b6b55'
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Demand-Based Surge Pricing',
      desc: 'Algorithmic tariff adjustments based on real-time lot occupancy and time-of-day demand to maximize revenue for facility operators.',
      badge: 'Dynamic Pricing',
      color: 'var(--color-ultra-violet)'
    }
  ];

  return (
    <section id="roadmap" className="full-screen-section" style={{ background: '#ffffff' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }} ref={sectionRevealRef}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 48px auto' }}>
          <span className="section-eyebrow">PRODUCTION ROADMAP &amp; ENFORCEMENT</span>
          <h2 className="heading-lg">
            Future Scope &amp; Scale
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-slate)', marginTop: '12px', fontSize: '16px', lineHeight: '1.6' }}>
            Production-grade enhancements designed to handle edge cases, eliminate rogue parkers, and scale ParkPulse to high-density smart cities.
          </p>
        </div>

        {/* Roadmap Items Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {roadmapItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-base"
                style={{
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(134, 47, 231, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      border: '1px solid rgba(134, 47, 231, 0.15)'
                    }}>
                      <Icon size={20} />
                    </div>

                    <span className="pill-badge pill-violet" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="heading-sm" style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '13px',
                    color: 'var(--color-graphite)',
                    lineHeight: '1.5'
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
