import React from 'react';

/**
 * PixelInvertText (React Bits Component)
 * Dynamically inverts the color of text based on the exact pixel directly behind it
 * using GPU-accelerated compositing (mix-blend-mode: difference).
 *
 * - Over bright/white pixels -> Inverts to crisp black
 * - Over dark/black pixels -> Inverts to crisp white
 * - Over colored waves -> Inverts to high-contrast complementary color
 */
export default function PixelInvertText({
  children,
  as: Component = 'span',
  className = '',
  style = {},
  ...props
}) {
  return (
    <Component
      className={`pixel-invert-text ${className}`}
      style={{
        mixBlendMode: 'difference',
        color: '#ffffff',
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
