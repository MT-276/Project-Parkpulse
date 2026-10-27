import { useEffect, useRef } from 'react';

/**
 * Custom hook that adds a fade-in reveal animation when an element
 * scrolls into the viewport using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0-1). Default: 0.15
 * @param {string} options.rootMargin - IntersectionObserver rootMargin. Default: '0px 0px -40px 0px'
 * @returns {React.RefObject} ref to attach to the target element
 */
export default function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Add the pre-animation class
    el.classList.add('scroll-reveal');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el); // Only animate once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
