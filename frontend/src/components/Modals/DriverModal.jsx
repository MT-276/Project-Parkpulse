import React from 'react';

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  rfid,
  setRfid
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-card modal-card">
        <h3 className="heading-sm" style={{ marginBottom: '8px' }}>
          Register User &amp; RFID Card
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Add a new user account and bind their physical RFID card UID.
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Goutham Krishna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address:</label>
            <input
              type="email"
              required
              placeholder="goutham.krishna2024@vitstudent.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number:</label>
            <input
              type="text"
              placeholder="+919876543212"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical RFID Card UID:</label>
            <input
              type="text"
              required
              placeholder="e.g. F3C291A8"
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              className="form-input"
            />
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
            >
              Register User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
