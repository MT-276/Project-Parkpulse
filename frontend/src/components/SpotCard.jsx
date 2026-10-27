import React from 'react';
import { Car, Clock, SquareParking, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import PrecisionButton from './reactbits/PrecisionButton';

export default function SpotCard({
  spot,
  onReserve,
  onCancel,
  getRemainingHoldTime
}) {
  const isHold = spot.status === 'HOLD';
  const isOccupied = spot.status === 'OCCUPIED';
  const isWrongSpot = spot.status === 'WRONG_SPOT';
  const isAvailable = spot.status === 'AVAILABLE';

  let statusPillClass = 'pill-available';
  let bayClass = 'bay-available';
  if (isHold) { statusPillClass = 'pill-hold'; bayClass = 'bay-hold'; }
  if (isOccupied) { statusPillClass = 'pill-occupied'; bayClass = 'bay-occupied'; }
  if (isWrongSpot) { statusPillClass = 'pill-wrong-spot'; bayClass = 'bay-wrong-spot'; }

  return (
    <div className="glass-card">
      {/* Spot Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 className="heading-sm" style={{ fontSize: '22px' }}>{spot.spot_number}</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Smart Bay ID: #{spot.id}
          </span>
        </div>

        <span className={`pill-badge ${statusPillClass}`}>
          {isWrongSpot && <AlertTriangle size={14} />}
          {isHold && <Clock size={14} />}
          {isOccupied && <CheckCircle2 size={14} />}
          {isAvailable && <SquareParking size={14} />}
          {spot.status}
        </span>
      </div>

      {/* Visual Bay Status */}
      <div className={`parking-bay-visual ${bayClass}`}>
        {isOccupied || isWrongSpot ? (
          <div style={{ textAlign: 'center' }}>
            <Car
              size={44}
              color={isWrongSpot ? '#ef4444' : '#10b981'}
            />
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              marginTop: '4px',
              color: isWrongSpot ? '#ef4444' : '#10b981',
              letterSpacing: '0.05em'
            }}>
              {isWrongSpot ? '⚠️ UNAUTHORIZED OCCUPANCY' : '✓ VEHICLE PARKED & VERIFIED'}
            </div>
          </div>
        ) : isHold ? (
          <div style={{ textAlign: 'center' }}>
            <Clock
              size={38}
              color="#d97706"
            />
            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#d97706' }}>
              10-MIN HOLD LOCKED ({getRemainingHoldTime(spot.active_reservation?.hold_expires_at)})
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <SquareParking
              size={36}
              color="#059669"
            />
            <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px', color: '#059669', letterSpacing: '0.08em' }}>
              BAY OPEN
            </div>
          </div>
        )}
      </div>

      {/* Ultrasonic Sensor Gauge */}
      <div className="spot-sonar-box">
        <div className="spot-sonar-header">
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sonar Telemetry:</span>
          <strong style={{
            color: spot.is_occupied ? '#dc2626' : '#059669',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {spot.distance_cm.toFixed(1)} cm
          </strong>
        </div>
        <div className="spot-gauge-track">
          <div
            className="spot-gauge-fill"
            style={{
              width: `${Math.min(100, Math.max(5, (spot.distance_cm / 150) * 100))}%`,
              background: spot.is_occupied ? '#ef4444' : '#10b981'
            }}
          />
        </div>
      </div>

      {/* User / Reservation Info */}
      {spot.active_reservation ? (
        <div className="spot-user-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              User Account:
            </span>
            {isHold && (
              <span style={{ fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                {getRemainingHoldTime(spot.active_reservation.hold_expires_at)}
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '14px' }}>
            {spot.active_reservation.user_name}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {spot.active_reservation.user_email}
          </div>
        </div>
      ) : (
        <div className="spot-empty-note">
          No active hold reservation. Spot available for instant booking.
        </div>
      )}

      {/* Action Buttons */}
      <div>
        {isAvailable && (
          <PrecisionButton
            variant="primary"
            size="md"
            style={{ width: '100%' }}
            onClick={() => onReserve(spot)}
          >
            <Clock size={16} />
            Reserve Spot (10-Min Hold)
          </PrecisionButton>
        )}
        {isHold && (
          <button
            className="btn-ghost"
            style={{ width: '100%', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => onCancel(spot.id)}
          >
            <XCircle size={16} />
            Cancel Hold Reservation
          </button>
        )}
        {isOccupied && (
          <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px', color: 'var(--color-voltage-violet)', fontWeight: 600 }}>
            ✓ Physical RFID Check-In Verified
          </div>
        )}
        {isWrongSpot && (
          <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px', color: '#dc2626', fontWeight: 600 }}>
            ⚠️ Unauthorized Occupancy Alert Sent
          </div>
        )}
      </div>
    </div>
  );
}
