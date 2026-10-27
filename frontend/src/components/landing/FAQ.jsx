import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const answerRefs = useRef([]);
  const sectionRevealRef = useScrollReveal();

  const faqs = [
    {
      q: 'How does ParkPulse eliminate parking kiosk lines and queue waiting?',
      a: 'ParkPulse allows users to view live lot availability and pre-book a specific spot in advance on parkpulse.meitsant.dev. Upon arrival, simply pull into your designated bay and tap your physical RFID ID card—eliminating paper tickets, entry lines, and exit payment booths entirely.'
    },
    {
      q: 'Why is an I2C Master-Slave configuration necessary?',
      a: 'Ultrasonic distance sensors (HC-SR04) require uninterrupted microsecond timing to calculate sound echo distance. To prevent network latency or HTTP request blocking from interrupting these microsecond readings, the Slave Node (Arduino UNO R3) handles sonar polling exclusively, while the Master Node (Arduino UNO R4 WiFi) manages I2C communication, SPI RFID card taps, and async REST dispatches to our Servers.'
    },
    {
      q: 'How does the website ensure real-time visual grid synchronization?',
      a: 'The React Single Page Application (SPA) frontend employs an aggressive polling engine requesting state updates every 200ms from our servers. When a physical car pulls into a spot, the UI grid flashes to reflect the physical reality in near real-time without requiring manual page refreshes.'
    },
    {
      q: 'Where is ParkPulse hosted and what technology powers the server?',
      a: 'ParkPulse is deployed on an Oracle Virtual Private Server (VPS) at parkpulse.meitsant.dev. The backend is built using Python FastAPI for low-overhead async request handling, backed by a normalized SQLite3 relational database logging transactional user data and spot status events.'
    },
    {
      q: 'What happens if an unregistered driver ("rogue parker") occupies a reserved spot?',
      a: 'Future deployments will integrate physical boom barriers and dedicated ParkPulse express lanes for access control. If an unreserved vehicle occupies a spot, a 15-minute grace period is triggered, automatically dispatching warning emails.'
    },
    {
      q: 'What is the 5-strikes enforcement and penalty policy?',
      a: 'If a vehicle is not relocated within the 15-minute grace period, the system issues monetary fines and logs a strike against the account. Under our 5-strikes policy, accumulating 5 strikes leads to account suspension. Strikes automatically expire on a rolling 30-day schedule to encourage long-term compliance.'
    },
    {
      q: 'How does ParkPulse contribute to fuel and carbon emission reduction?',
      a: 'Traditional parking forces drivers to circle parking garages for 15-30 minutes, burning excess fuel and creating urban congestion. By routing drivers directly to a pre-booked, guaranteed spot, ParkPulse eliminates circling, conserves fuel, and significantly reduces greenhouse gas emissions.'
    },
  ];

  // Measure and set max-height for open panel
  const updatePanelHeight = useCallback(() => {
    answerRefs.current.forEach((panel, idx) => {
      if (!panel) return;
      if (idx === openIndex) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0px';
      }
    });
  }, [openIndex]);

  useEffect(() => {
    updatePanelHeight();
  }, [updatePanelHeight]);

  return (
    <section id="faq" className="full-screen-section" style={{ background: 'var(--color-fog)' }}>
      <div className="container" style={{ maxWidth: '840px', position: 'relative', zIndex: 1 }} ref={sectionRevealRef}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="heading-lg">
            Frequently Asked Questions
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-slate)', marginTop: '12px', fontSize: '16px' }}>
            Everything you need to know about ParkPulse urban vision, I2C edge hardware, Oracle VPS backend, and enforcement roadmap.
          </p>
        </div>

        {/* Animated Glassmorphism Accordion Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  borderColor: isOpen ? 'var(--color-voltage-violet)' : 'rgba(255, 255, 255, 0.7)',
                  background: isOpen ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)',
                  transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-bricolage)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-midnight-ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span>{faq.q}</span>
                  <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    color: isOpen ? 'var(--color-voltage-violet)' : 'var(--color-slate)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                {/* Always-rendered answer panel with CSS max-height transition */}
                <div
                  ref={(el) => { answerRefs.current[i] = el; }}
                  className={`faq-answer-panel ${isOpen ? 'faq-open' : ''}`}
                  style={{
                    maxHeight: isOpen ? undefined : '0px'
                  }}
                >
                  <div style={{
                    padding: '0 24px 20px 24px',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    color: 'var(--color-graphite)',
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(134, 47, 231, 0.1)',
                    paddingTop: '14px'
                  }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
