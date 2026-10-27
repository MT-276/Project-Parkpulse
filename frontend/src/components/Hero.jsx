import React from 'react';
import { Cpu, Clock, Mail, Database } from 'lucide-react';
import logoWithText from '../assets/ParkPlus-Logo-Transparent-WithText.png';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <img
          src={logoWithText}
          alt="ParkPulse Brand"
          className="hero-logo"
        />

        <h1 className="display-title hero-title">
          Skip the Lines. Stop Circling. <br />
          <span className="hero-highlight">
            Park Instantly.
          </span>
        </h1>

        <p className="hero-text">
          Finding a parking spot shouldn't be a frustrating chore. <strong>ParkPulse</strong> lets you pre-book guaranteed parking spots in real-time, skip entry and exit kiosk queues, and check in effortlessly with a single tap of your physical ID card.
        </p>

        {/* Stats Bar Pills */}
        <div className="stats-row">
          <div className="stats-pill">
            <Cpu size={15} color="var(--color-voltage-violet)" />
            <span><strong>3 Smart Bays</strong> Hardware Monitored</span>
          </div>
          <div className="stats-pill">
            <Clock size={15} color="#d97706" />
            <span><strong>10-Min Hold</strong> Reservation Window</span>
          </div>
          <div className="stats-pill">
            <Mail size={15} color="#0284c7" />
            <span><strong>Automated Email Receipts</strong></span>
          </div>
          <div className="stats-pill">
            <Database size={15} color="#059669" />
            <span><strong>Real-Time Sync</strong> Cloud Database</span>
          </div>
        </div>
      </div>
    </section>
  );
}
