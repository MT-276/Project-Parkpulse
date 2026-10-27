import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import SpotCard from './SpotCard';

export default function ParkingBays({
  spots,
  onReserve,
  onCancel,
  onRefresh,
  getRemainingHoldTime
}) {
  return (
    <main className="container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header Row */}
      <div className="bays-header-row">
        <div>
          <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="var(--color-voltage-violet)" />
            Live Parking Bays
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Real-time ultrasonic occupancy telemetry and instant 1-tap RFID check-ins.
          </p>
        </div>
        <button className="btn-ghost" onClick={onRefresh} style={{ fontSize: '13px' }}>
          <RefreshCw size={14} /> Sync Live Bays
        </button>
      </div>

      {/* Grid of 3 Spots */}
      <div className="bays-grid">
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onReserve={onReserve}
            onCancel={onCancel}
            getRemainingHoldTime={getRemainingHoldTime}
          />
        ))}
      </div>
    </main>
  );
}
