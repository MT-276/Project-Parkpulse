import React from 'react';
import { ExternalLink } from 'lucide-react';
import logoNoText from '../assets/ParkPlus-Logo-Transparent-NoText.png';

export default function Footer() {
  const techStack = [
    'React 18 SPA',
    'FastAPI (Python)',
    'Oracle VPS',
    'SQLite3 Database',
    'Arduino R4 Master',
    'Arduino R3 Slave',
    'I2C Sensor Bridge',
    'RFID RC522'
  ];

  return (
    <footer className="app-footer">
      <div className="container">
        {/* Top 3 Columns Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Overview */}
          <div>
            <div className="footer-brand-row">
              <img src={logoNoText} alt="ParkPulse" style={{ height: '32px', width: 'auto' }} />
              <span className="footer-brand-title">
                ParkPulse
              </span>
            </div>
            <p className="footer-desc">
              Smart Parking Reservation System — Deployed on Oracle VPS integrating I2C Arduino Master-Slave edge hardware, FastAPI, and React 200ms UI sync.
            </p>
            <a
              href="https://parkpulse.meitsant.dev"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Project Endpoint: parkpulse.meitsant.dev <ExternalLink size={14} />
            </a>
          </div>

          {/* Column 2: Core Architecture */}
          <div>
            <h4 className="footer-col-title">
              Core Architecture
            </h4>
            <ol className="footer-list">
              <li>Oracle VPS Deployment</li>
              <li>I2C Master-Slave (Arduino R3 &amp; R4)</li>
              <li>Python FastAPI REST Backend</li>
              <li>React SPA with 200ms UI Polling</li>
            </ol>
          </div>

          {/* Column 3: Technology Stack */}
          <div>
            <h4 className="footer-col-title">
              Technology Stack
            </h4>
            <div className="footer-tags-wrap">
              {techStack.map((tech, idx) => (
                <span key={idx} className="footer-tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="footer-divider" />

        {/* Bottom Credits Row */}
        <div className="footer-bottom-row">
          <div>
            &copy; 2026 ParkPulse Smart Parking System.
          </div>
          <div className="footer-credits">
            <div>
              Meit Vikrant Sant | 24BCE1654 | <a href="https://meitsant.dev" target="_blank" rel="noreferrer" className="footer-credit-link">meitsant.dev</a>
            </div>
            <div>
              Aarush Vardhan | 24BCE5070 | <a href="https://aarushv.me" target="_blank" rel="noreferrer" className="footer-credit-link">aarushv.me</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
