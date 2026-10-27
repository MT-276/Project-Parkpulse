import React from 'react';
import { Send } from 'lucide-react';

export default function EmailTestModal({
  isOpen,
  onClose,
  onSubmit,
  email,
  setEmail,
  status
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-card modal-card">
        <h3 className="heading-sm" style={{ marginBottom: '8px' }}>
          Send Test Notification Email
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Dispatches an automated email notification receipt.
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Recipient Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          {status && (
            <div className={`status-alert ${status === 'success' ? 'success' : (status === 'sending' ? 'sending' : 'error')}`}>
              {status === 'sending' && 'Sending notification email...'}
              {status === 'success' && '✓ Notification sent! Check your inbox.'}
              {status.startsWith('error') && `❌ ${status}`}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
            >
              <Send size={16} />
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
