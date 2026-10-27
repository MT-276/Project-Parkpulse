import React from 'react';

export default function ReserveModal({
  spot,
  users,
  selectedUserId,
  setSelectedUserId,
  reserveLoading,
  onClose,
  onSubmit
}) {
  if (!spot) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-card modal-card">
        <h3 className="heading-sm" style={{ marginBottom: '8px' }}>
          Reserve {spot.spot_number}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Lock this spot on a <strong>10-minute hold window</strong>. A confirmation email will be dispatched automatically to your registered account.
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Select Registered User:</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="form-select"
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — RFID: {u.rfid_uid}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={reserveLoading}
            >
              {reserveLoading ? 'Reserving...' : 'Confirm 10-Min Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
