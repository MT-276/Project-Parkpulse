import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Radio, Bell, Network, RefreshCw } from 'lucide-react';
import animationVideo from '../../assets/Animation/0001-0200.mp4';

gsap.registerPlugin(ScrollTrigger);

export default function HardwareSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Track video download progress & readiness
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onProgress = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = Math.floor((bufferedEnd / video.duration) * 100);
        setLoadProgress(percent);
      }
    };

    const onCanPlay = () => {
      setIsLoaded(true);
      setLoadProgress(100);
    };

    // If already fully buffered (cached)
    if (video.readyState >= 4) {
      setIsLoaded(true);
      setLoadProgress(100);
      return;
    }

    video.addEventListener('progress', onProgress);
    video.addEventListener('canplaythrough', onCanPlay);

    return () => {
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('canplaythrough', onCanPlay);
    };
  }, []);

  // Bind GSAP ScrollTrigger to scrub video playback across 200vh scroll
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    // Wait for video metadata to load so we know the duration
    const onMetaLoaded = () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          if (video.duration) {
            video.currentTime = self.progress * video.duration;
          }
        }
      });

      return () => trigger.kill();
    };

    if (video.readyState >= 1) {
      const cleanup = onMetaLoaded();
      return cleanup;
    } else {
      video.addEventListener('loadedmetadata', onMetaLoaded, { once: true });
      return () => video.removeEventListener('loadedmetadata', onMetaLoaded);
    }
  }, []);

  // Hardware items highlighting I2C Master-Slave configuration
  const hardwareCards = [
    {
      icon: Cpu,
      title: 'Master Node (Arduino R4 WiFi)',
      desc: 'Edge brain managing I2C bridge, SPI RFID reader, and async HTTP POST JSON server dispatches.',
      tag: 'I2C Master'
    },
    {
      icon: Network,
      title: 'Slave Node (Arduino UNO R3)',
      desc: 'Dedicated to microsecond-precise HC-SR04 sonar polling, preventing network HTTP latency blocking.',
      tag: 'I2C Slave'
    },
    {
      icon: Radio,
      title: 'RC522 RFID Card Reader',
      desc: '13.56MHz SPI reader authenticating physical ID card UIDs instantly upon vehicle arrival.',
      tag: 'SPI Reader'
    },
    {
      icon: Bell,
      title: 'Piezo Alarm & Indicator LEDs',
      desc: 'Local hardware alert system sounding audio warning pulses during unauthorized spot occupancy.',
      tag: 'Alerts'
    }
  ];

  return (
    <div
      ref={sectionRef}
      id="hardware"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '200vh',
        background: '#090d16',
        color: '#ffffff'
      }}
    >
      {/* Sticky Full-Bleed Background Video */}
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(227, 154, 248, 1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(227, 152, 202, 1) 0%, transparent 50%), #ffffffff'
      }}>
        {/* H.264 MP4 Video — scroll-scrubbed */}
        <video
          ref={videoRef}
          src={animationVideo}
          muted
          playsInline
          preload="auto"
          className="hw-video"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease'
          }}
        />

        {/* Loading State — visible until video is buffered */}
        {!isLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'radial-gradient(ellipse at center, rgba(9, 13, 22, 0.85) 0%, rgba(9, 13, 22, 0.95) 100%)'
          }}>
            <RefreshCw size={28} color="var(--color-orchid-wash)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-orchid-wash)',
              letterSpacing: '0.02em'
            }}>
              Loading 3D Hardware Model…
            </span>
            {/* Progress bar */}
            <div style={{
              width: '200px',
              height: '4px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.12)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${loadProgress}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, var(--color-voltage-violet), var(--color-orchid-wash))',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              {loadProgress}%
            </span>
          </div>
        )}

        {/* Translucent Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(9, 13, 22, 0.3) 0%, rgba(9, 13, 22, 0.45) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Mobile video responsive override */}
        <style>{`
          @media (max-width: 768px) {
            .hw-video {
              min-width: 100% !important;
              min-height: unset !important;
              width: 100% !important;
              height: auto !important;
              object-fit: contain !important;
            }
          }
        `}</style>
      </div>

      {/* Foreground Scrollable Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        marginTop: '-100vh',
        padding: '80px 0 60px 0',
        minHeight: '200vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>

          {/* Top Header */}
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
            <span className="section-eyebrow" style={{ color: 'var(--color-orchid-wash)', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              I2C MASTER-SLAVE EMBEDDED ARCHITECTURE
            </span>
            <h2 className="heading-lg" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              Microsecond-Precise Edge Hardware
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', color: '#f3f4f6', marginTop: '10px', fontSize: '16px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              Dual microcontroller node configuration separating ultrasonic timing from Wi-Fi HTTP communication.
            </p>
          </div>

          {/* Single-Line Cards Row at Bottom */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            maxWidth: '1140px',
            margin: '0 auto',
            width: '100%',
            marginBottom: '40px'
          }}>
            {hardwareCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '16px',
                    padding: '18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-voltage-violet)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--color-voltage-violet)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(134, 47, 231, 0.4)'
                      }}>
                        <Icon size={18} />
                      </div>

                      <span className="pill-badge pill-violet" style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(134, 47, 231, 0.3)', color: '#f3e8ff', border: '1px solid rgba(134, 47, 231, 0.4)' }}>
                        {card.tag}
                      </span>
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-bricolage)',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: '6px'
                    }}>
                      {card.title}
                    </h3>

                    <p style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '12px',
                      color: '#d1d5db',
                      lineHeight: '1.5'
                    }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
