import React from 'react';
import logoNoText from '../../assets/ParkPlus-Logo-Transparent-NoText.png';
import { ExternalLink } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function Footer() {
  const footerRef = useScrollReveal({ threshold: 0.1 });

  return (
    <footer style={{
      background: 'var(--color-midnight-ink)',
      color: '#ffffff',
      padding: '56px 0 32px 0',
      borderTop: '1px solid #1f2937',
      position: 'relative'
    }}>
      <div className="container" ref={footerRef}>
        
        {/* Top Split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img 
                src={logoNoText} 
                alt="ParkPulse Logo" 
                style={{ 
                  height: '36px', 
                  width: 'auto', 
                  objectFit: 'contain'
                }} 
              />
              <span style={{
                fontFamily: 'var(--font-bricolage)',
                fontSize: '22px',
                fontWeight: 600,
                color: '#ffffff'
              }}>
                ParkPulse
              </span>
            </div>

            <p style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              color: '#9ca3af',
              lineHeight: '1.6',
              maxWidth: '300px'
            }}>
              Smart Parking Reservation System — Deployed on Oracle VPS integrating I2C Arduino Master-Slave edge hardware, FastAPI, and React 200ms UI sync.
            </p>

            <div style={{ marginTop: '16px' }}>
              <a
                href="https://parkpulse.meitsant.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-orchid-wash)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-lavender-mist)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-orchid-wash)'}
              >
                Project Endpoint: parkpulse.meitsant.dev
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Core Architecture */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-bricolage)', fontSize: '16px', marginBottom: '16px', color: '#f3f4f6' }}>
              Core Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#9ca3af' }}>
              <li>1. Oracle VPS Deployment</li>
              <li>2. I2C Master-Slave (Arduino R3 &amp; R4)</li>
              <li>3. Python FastAPI REST Backend</li>
              <li>4. React SPA with 200ms UI Polling</li>
            </ul>
          </div>

          {/* Column 3: Tech Stack Tags */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-bricolage)', fontSize: '16px', marginBottom: '16px', color: '#f3f4f6' }}>
              Technology Stack
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'React 18 SPA',
                'FastAPI (Python)',
                'Oracle VPS',
                'SQLite3 Database',
                'Arduino R4 Master',
                'Arduino R3 Slave',
                'I2C Sensor Bridge',
                'RFID RC522'
              ].map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    color: '#e5e7eb',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-inter)',
                    transition: 'background 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(134, 47, 231, 0.2)';
                    e.target.style.borderColor = 'rgba(134, 47, 231, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Student Details */}
        <div style={{
          borderTop: '1px solid #1f2937',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '14px',
          color: '#9ca3af',
          fontFamily: 'var(--font-inter)'
        }}>
          <div>
            &copy; 2026 ParkPulse Smart Parking System.
          </div>

          {/* Clickable Student Credentials */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            textAlign: 'right'
          }}>
            <div>
              Meit Vikrant Sant | 24BCE1654 |{' '}
              <a
                href="https://meitsant.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-orchid-wash)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                meitsant.dev
              </a>
            </div>
            <div>
              Aarush Vardhan | 24BCE5070 |{' '}
              <a
                href="https://aarushv.me"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-orchid-wash)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                aarushv.me
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
