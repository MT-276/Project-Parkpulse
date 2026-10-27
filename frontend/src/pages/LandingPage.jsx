import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import InteractiveDemo from '../components/landing/InteractiveDemo';
import Features from '../components/landing/Features';
import HardwareSection from '../components/landing/HardwareSection';
import ArchitectureSection from '../components/landing/ArchitectureSection';
import FutureScope from '../components/landing/FutureScope';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function LandingPage({ onNavigate, user, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={onNavigate} user={user} onLogout={onLogout} />
      <main style={{ flex: 1 }}>
        <Hero onNavigate={onNavigate} user={user} />
        <InteractiveDemo />
        <Features />
        <HardwareSection />
        <ArchitectureSection />
        <FutureScope />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
