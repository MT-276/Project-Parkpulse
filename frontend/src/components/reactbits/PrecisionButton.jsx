import React, { useState, useRef } from 'react';

export default function PrecisionButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary', // 'primary' | 'success' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  icon: Icon = null,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Sizing Styles
  const sizeStyles = {
    sm: { padding: '8px 14px', fontSize: '13px', borderRadius: '10px' },
    md: { padding: '11px 20px', fontSize: '14px', borderRadius: '12px' },
    lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '14px' }
  }[size] || { padding: '11px 20px', fontSize: '14px', borderRadius: '12px' };

  // Variant Styles
  let bg = '#0f172a';
  let color = '#ffffff';
  let border = '1px solid #1e293b';
  let shineColor = 'rgba(255, 255, 255, 0.14)';

  if (variant === 'success') {
    bg = '#10b981';
    color = '#ffffff';
    border = '1px solid #059669';
    shineColor = 'rgba(255, 255, 255, 0.2)';
  } else if (variant === 'ghost') {
    bg = '#ffffff';
    color = '#0f172a';
    border = '1px solid #cbd5e1';
    shineColor = 'rgba(15, 23, 42, 0.05)';
  } else if (variant === 'danger') {
    bg = '#ef4444';
    color = '#ffffff';
    border = '1px solid #dc2626';
    shineColor = 'rgba(255, 255, 255, 0.2)';
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`precision-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontFamily: 'var(--font-inter)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: isHovered && !disabled
          ? '0 4px 14px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)'
          : '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 1px rgba(0, 0, 0, 0.04)',
        background: bg,
        color,
        border,
        position: 'relative',
        overflow: 'hidden',
        ...sizeStyles,
        ...style
      }}
      {...props}
    >
      {/* Specular Radial Sheen */}
      {isHovered && !disabled && (
        <span
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: mousePos.y - 40,
            left: mousePos.x - 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${shineColor} 0%, transparent 80%)`,
            transition: 'opacity 0.2s ease',
            zIndex: 0
          }}
        />
      )}

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {Icon && <Icon size={size === 'sm' ? 14 : (size === 'lg' ? 18 : 16)} />}
        {children}
      </span>
    </button>
  );
}
