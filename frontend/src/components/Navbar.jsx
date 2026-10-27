import React from 'react';
import { Sun, Moon, Eye, EyeOff, Mail, UserPlus, Trash2 } from 'lucide-react';
import logoNoText from '../assets/ParkPlus-Logo-Transparent-NoText.png';

export default function Navbar({
  isConnected,
  theme,
  setTheme,
  showDevConsole,
  setShowDevConsole,
  onOpenEmailModal,
  onOpenUserModal,
  onResetAll
}) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <img src={logoNoText} alt="ParkPulse" className="navbar-logo" />
          <div>
            <span className="navbar-title">ParkPulse</span>
            <span className="navbar-subtitle">SMART PARKING</span>
          </div>
        </div>

        {/* Controls */}
        <div className="navbar-controls">
          {/* Status Indicator */}
          <span className={`status-pill ${isConnected ? 'online' : 'offline'}`}>
            <span className={`pulsing-dot ${isConnected ? 'online' : 'offline'}`}></span>
            {isConnected ? 'System Online' : 'Connecting...'}
          </span>

          {/* Theme Switcher */}
          <button
            className="btn-ghost"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ padding: '8px 12px' }}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#fbbf24" />
            ) : (
              <Moon size={17} color="var(--color-voltage-violet)" />
            )}
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Dev Controls Toggle */}
          <button
            className="btn-ghost"
            title={showDevConsole ? 'Hide Developer Controls' : 'Show Developer Controls'}
            onClick={() => setShowDevConsole(!showDevConsole)}
            style={{
              padding: '8px 12px',
              borderColor: showDevConsole ? 'var(--color-voltage-violet)' : undefined,
              background: showDevConsole ? 'rgba(134, 47, 231, 0.15)' : undefined
            }}
          >
            {showDevConsole ? <EyeOff size={16} color="var(--color-voltage-violet)" /> : <Eye size={16} />}
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {showDevConsole ? 'Hide Dev Controls' : 'Behind The Scenes'}
            </span>
          </button>

          {/* Email Test Modal Trigger */}
          <button className="btn-ghost" onClick={onOpenEmailModal} style={{ padding: '8px 12px' }}>
            <Mail size={16} color="var(--color-voltage-violet)" />
            Email Test
          </button>

          {/* Add User Trigger */}
          <button className="btn-ghost" onClick={onOpenUserModal} style={{ padding: '8px 12px' }}>
            <UserPlus size={16} color="#059669" />
            Add User
          </button>

          {/* Reset Spots */}
          <button
            className="btn-ghost"
            onClick={onResetAll}
            style={{ padding: '8px 12px', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Reset all spots to Available"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      </div>
    </header>
  );
}
