import React from 'react';
import { Code, Sliders, Send, Radio, RefreshCw } from 'lucide-react';

export default function DevConsole({
  spots,
  users,
  logs,
  simSpotId,
  setSimSpotId,
  simDistance,
  setSimDistance,
  simIsOccupied,
  setSimIsOccupied,
  simRfidUid,
  setSimRfidUid,
  onHardwareDispatch,
  onRefreshLogs
}) {
  return (
    <div className="container dev-console-wrapper">
      <div className="dev-console-title-row">
        <Code size={22} color="var(--color-voltage-violet)" />
        <h3 className="heading-md" style={{ fontSize: '22px' }}>
          Behind The Scenes — Developer Controls
        </h3>
      </div>

      <div className="dev-console-grid">
        {/* Sensor Hardware Simulator */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--color-voltage-violet)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h4 className="heading-sm" style={{ fontSize: '18px' }}>Sensor Hardware Simulator</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Simulate microsecond sensor dispatches</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            {/* Spot Selection */}
            <div>
              <label className="form-label">Target Spot:</label>
              <select
                value={simSpotId}
                onChange={(e) => setSimSpotId(e.target.value)}
                className="form-select"
              >
                {spots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.spot_number} (Current: {s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-muted)' }}>Sonar Distance:</span>
                <span style={{ color: simIsOccupied ? '#dc2626' : '#059669' }}>
                  {simDistance} cm ({simIsOccupied ? 'Car Parked' : 'Empty Bay'})
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={simDistance}
                onChange={(e) => {
                  const dist = parseFloat(e.target.value);
                  setSimDistance(dist);
                  setSimIsOccupied(dist < 30);
                }}
                style={{ width: '100%', accentColor: 'var(--color-voltage-violet)' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => { setSimDistance(12.5); setSimIsOccupied(true); }}
                >
                  Simulate Car Parked (12cm)
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => { setSimDistance(120.0); setSimIsOccupied(false); }}
                >
                  Simulate Empty (120cm)
                </button>
              </div>
            </div>

            {/* RFID Card Selection */}
            <div>
              <label className="form-label">RFID Card Tap (13.56MHz SPI):</label>
              <select
                value={simRfidUid}
                onChange={(e) => setSimRfidUid(e.target.value)}
                className="form-select"
              >
                <option value="">No Card Tapped (Sonar Only)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.rfid_uid}>
                    {u.name} ({u.rfid_uid})
                  </option>
                ))}
                <option value="UNKNOWN_CARD_999">Unauthorized Card (XXYYZZ)</option>
              </select>
            </div>

            <button className="btn-primary" onClick={onHardwareDispatch} style={{ marginTop: '6px' }}>
              <Send size={16} />
              Dispatch Hardware Update
            </button>
          </div>
        </div>

        {/* System Audit Log Stream */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(134, 47, 231, 0.15)',
                color: 'var(--color-voltage-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Radio size={18} />
              </div>
              <div>
                <h4 className="heading-sm" style={{ fontSize: '18px' }}>System Audit Stream</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time database event logs</span>
              </div>
            </div>
            <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onRefreshLogs}>
              <RefreshCw size={14} /> Refresh Logs
            </button>
          </div>

          <div className="terminal-container terminal-scroll" style={{ maxHeight: '310px', overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>
                No system logs recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: log.event_type.includes('WRONG') || log.event_type.includes('ALERT')
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (log.event_type.includes('WRONG') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)')
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                    <span style={{
                      color: log.event_type.includes('WRONG')
                        ? '#ef4444'
                        : (log.event_type.includes('SUCCESS') ? '#10b981' : 'var(--color-orchid-wash)')
                    }}>
                      {log.event_type} {log.spot_id ? `(Spot #${log.spot_id})` : ''}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', wordBreak: 'break-all' }}>
                    {log.payload}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
