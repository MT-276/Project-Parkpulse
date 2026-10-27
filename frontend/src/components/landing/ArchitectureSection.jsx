import React from 'react';
import { Database, Server, Cpu, Cloud, ShieldCheck, Layers } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function ArchitectureSection() {
  const sectionRevealRef = useScrollReveal();

  const pillars = [
    {
      icon: Cloud,
      title: 'Oracle VPS Cloud Infrastructure',
      desc: 'Deployed on an enterprise-grade Oracle Virtual Private Server (VPS) at parkpulse.meitsant.dev, ensuring rock-solid network reliability, zero-downtime availability, and rapid global response times for edge hardware dispatches.',
      tag: 'Virtual Private Server'
    },
    {
      icon: Server,
      title: 'High-Performance FastAPI Python Backend',
      desc: 'Built on asynchronous Python 3.13 FastAPI server architecture. Handles incoming REST API payloads from edge hardware nodes, processes user authentication, and manages spot reservation state transitions with sub-millisecond overhead.',
      tag: 'FastAPI Python 3.13 Backend'
    },
    {
      icon: Database,
      title: 'Normalized SQLite3 Relational DBMS',
      desc: 'A robust, 3NF relational database logging transactional user data, active reservations, and real-time spot occupancy. Configured with Foreign Key constraints to guarantee absolute data integrity.',
      tag: 'SQLite3 Database'
    },
    {
      icon: Cpu,
      title: 'Realtime Website Updates',
      desc: 'The Single Page Application (SPA) frontend employs a high-frequency 200ms polling loop, fetching state updates from our server so the physical-to-digital parking grid flashes instantly to mirror physical car arrivals without page reloads.',
      tag: 'Realtime Website Updates'
    },
    {
      icon: Layers,
      title: 'Decoupled Modular Architecture',
      desc: 'Clear separation of concerns between physical edge microcontrollers, server-side business logic, and client-side web rendering. Designed from the ground up for seamless horizontal scaling and future hardware node expansion.',
      tag: 'Decoupled Design'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Hardware Ingestion & Event Validation',
      desc: 'All hardware event payloads sent by the hardware node undergo strict JSON payload verification, timestamp validation, and payload integrity checks before changing spot states in the database.',
      tag: 'Security'
    }
  ];

  return (
    <section id="architecture" className="full-screen-section" style={{
      background: 'var(--color-lavender-field)',
      padding: '80px 0'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }} ref={sectionRevealRef}>

        {/* Two-Column Header Split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '48px'
        }}>
          {/* Left Column */}
          <div>
            <span className="section-eyebrow section-eyebrow-dark">
              ENTERPRISE CLOUD INFRASTRUCTURE &amp; BACKEND
            </span>
            <h2 className="heading-lg" style={{ color: 'var(--color-midnight-ink)' }}>
              Architected for Real-Time Precision
            </h2>
          </div>

          {/* Right Column */}
          <div>
            <p style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '16px',
              color: 'var(--color-graphite)',
              lineHeight: '1.6'
            }}>
              ParkPulse combines high-availability cloud hosting on Oracle VPS with asynchronous Python execution,
              relational database integrity, and high-frequency UI synchronization to bridge physical IoT hardware with digital users.
            </p>
          </div>
        </div>

        {/* 6 Glassmorphism Architecture Pillars Grid (3x2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(134, 47, 231, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-voltage-violet)',
                    marginBottom: '16px',
                    border: '1px solid rgba(134, 47, 231, 0.15)'
                  }}>
                    <Icon size={22} />
                  </div>

                  <h3 className="heading-sm" style={{ fontSize: '19px', marginBottom: '8px' }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    color: 'var(--color-graphite)',
                    lineHeight: '1.6'
                  }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <span className="pill-badge pill-violet" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
