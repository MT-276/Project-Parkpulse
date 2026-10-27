import React, { useEffect } from 'react';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import TechLoader from '../reactbits/TechLoader';

export default function CancelHoldModal({
  isOpen,
  onClose,
  onConfirm,
  spotNumber = 'Spot',
  remainingTime = '',
  loading = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="glass-card modal-card"
        style={{
          maxWidth: '440px',
          textAlign: 'center',
          padding: '28px 24px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
          animation: 'modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Warning Icon Badge */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h3 className="heading-sm" style={{ fontSize: '20px', marginBottom: '8px' }}>
          Release Reserved Bay?
        </h3>

        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '16px' }}>
          Are you sure you want to cancel your active hold on <strong>{spotNumber}</strong>? The bay will immediately become available for other drivers.
        </p>

        {/* Time Remaining Chip */}
        {remainingTime && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'var(--sonar-box-bg)',
              border: '1px solid var(--border-glass)',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#d97706',
              marginBottom: '24px'
            }}
          >
            <Clock size={14} />
            <span>Time remaining on hold: <strong style={{ fontFamily: 'monospace' }}>{remainingTime}</strong></span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ flex: 1, padding: '11px 16px', fontSize: '13.5px' }}
            onClick={onClose}
            disabled={loading}
          >
            Keep Reservation
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '12px',
              background: '#dc2626',
              color: '#ffffff',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <TechLoader size={16} color="#ffffff" text="Releasing..." />
            ) : (
              <>
                <XCircle size={16} />
                <span>Yes, Cancel Hold</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
