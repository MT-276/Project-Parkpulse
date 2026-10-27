import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

export default function DecryptedText({
  text,
  speed = 45,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%',
  className = '',
  encryptedClassName = '',
  parentClassName = '',
  animateOn = 'view',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const allowedChars = useOriginalCharsOnly
    ? Array.from(new Set(text.split(''))).filter(c => c !== ' ')
    : characters.split('');

  const getRandomChar = useCallback(() => {
    return allowedChars[Math.floor(Math.random() * allowedChars.length)] || '*';
  }, [allowedChars]);

  const shuffleText = useCallback(
    (originalText, currentRevealed) => {
      return originalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (currentRevealed.has(i)) return originalText[i];
          return getRandomChar();
        })
        .join('');
    },
    [getRandomChar]
  );

  const triggerDecrypt = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setRevealedIndices(new Set());

    let iteration = 0;
    const currentRevealed = new Set();

    intervalRef.current = setInterval(() => {
      iteration++;

      if (sequential) {
        if (currentRevealed.size < text.length) {
          const nextIdx = revealDirection === 'end' ? text.length - 1 - currentRevealed.size : currentRevealed.size;
          currentRevealed.add(nextIdx);
          setRevealedIndices(new Set(currentRevealed));
          setDisplayText(shuffleText(text, currentRevealed));
        } else {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsDecrypted(true);
          setDisplayText(text);
        }
      } else {
        if (iteration >= maxIterations) {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsDecrypted(true);
          setDisplayText(text);
        } else {
          setDisplayText(shuffleText(text, currentRevealed));
        }
      }
    }, speed);
  }, [isAnimating, sequential, text, revealDirection, shuffleText, speed, maxIterations]);

  useEffect(() => {
    if (animateOn === 'view') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              setHasAnimated(true);
              triggerDecrypt();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, hasAnimated, triggerDecrypt]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      onMouseEnter={() => {
        if (animateOn === 'hover') triggerDecrypt();
      }}
      {...props}
    >
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealed = revealedIndices.has(index) || isDecrypted;
          return (
            <span
              key={index}
              className={isRevealed ? className : (encryptedClassName || 'font-mono opacity-60')}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
