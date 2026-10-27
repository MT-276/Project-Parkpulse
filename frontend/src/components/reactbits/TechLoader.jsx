import React from 'react';

export default function TechLoader({
  size = 20,
  color = '#862fe7',
  trackColor = 'rgba(148, 163, 184, 0.25)',
  text = '',
  className = ''
}) {
  return (
    <span
      className={`tech-loader-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        verticalAlign: 'middle'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'techSpin 0.9s linear infinite',
          flexShrink: 0
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={trackColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12 3C7.02944 3 3 7.02944 3 12"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {text && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'inherit' }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes techSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}
