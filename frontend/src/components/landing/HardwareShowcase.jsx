import React, { useState } from 'react';
import { Cpu, Radio, Zap, Bell, Check, Copy } from 'lucide-react';

const codeSnippet = `// ParkPulse IoT Gateway (Arduino UNO R4 WiFi)
#include <WiFiS3.h>
#include <Wire.h>
#include <MFRC522.h>
#include <ArduinoHttpClient.h>

const char* serverAddress = "10.249.147.194";
const int port = 1654;
WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);

void loop() {
  // 1. Request telemetry from I2C Slave
  Wire.requestFrom(8, 6);
  // 2. Scan RC522 RFID Card UID
  if (mfrc522.PICC_IsNewCardPresent()) {
    String cardUID = readCardUID();
    sendTelemetryPayload(spotId, distance, cardUID);
  }
  delay(200);
}`;

export default function HardwareShowcase() {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hardware" className="section-padding" style={{ position: 'relative', background: '#ffffff', padding: '80px 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
          <span className="section-eyebrow">EMBEDDED SYSTEMS &amp; IOT HARDWARE</span>
          <h2 className="heading-lg">
            Powered by Arduino R4 WiFi &amp; IoT Sensors
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-slate)', marginTop: '16px', fontSize: '16px' }}>
            Every parking spot is equipped with ultrasonic distance sensors, RFID card readers, and local audio buzzers streaming JSON hardware payloads to our cloud server.
          </p>
        </div>

        {/* Content Split: Left Hardware Components Grid, Right C++ Code Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Left: Hardware Component Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                icon: Cpu,
                title: 'Arduino Uno R4 WiFi',
                desc: 'Main microcontroller node operating an asynchronous event loop with native Wi-Fi 802.11 b/g/n transport.'
              },
              {
                icon: Zap,
                title: 'HC-SR04 Ultrasonic Distance Sensor',
                desc: 'Detects vehicle presence within < 50cm threshold, triggering instant car_detected server events.'
              },
              {
                icon: Radio,
                title: 'MFRC522 RFID Card Reader',
                desc: 'Reads Aadhaar RFID card UIDs on check-in, authenticating ownership against active database reservations.'
              },
              {
                icon: Bell,
                title: 'Local Warning Buzzer & LEDs',
                desc: 'Emits audio alerts and red warning LED pulses when a wrong-spot violation is detected.'
              }
            ].map((hw, idx) => {
              const Icon = hw.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-fog)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    border: '1px solid var(--color-mist)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--color-voltage-violet)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-bricolage)', fontSize: '18px', marginBottom: '4px' }}>
                      {hw.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: '1.5' }}>
                      {hw.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Code Snippet Card */}
          <div style={{
            background: 'var(--color-midnight-ink)',
            borderRadius: 'var(--radius-cards)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(17, 24, 39, 0.2)'
          }}>
            {/* Header bar */}
            <div style={{
              background: '#1f2937',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>
                  hardware/Master.ino
                </span>
              </div>
              <button
                onClick={copyCode}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-inter)'
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code view */}
            <pre style={{
              padding: '20px',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              overflowX: 'auto'
            }}>
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
}
