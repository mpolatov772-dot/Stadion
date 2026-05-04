import { useEffect, useMemo, useRef, useState } from 'react';

const easeOutCubic = (value) => 1 - (1 - value) ** 3;

export function AnimatedNumber({
  value,
  className = '',
  duration = 900,
  prefix = '',
  suffix = '',
}) {
  const numericValue = useMemo(() => Number(value), [value]);
  const isNumeric = Number.isFinite(numericValue);
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);
  const [isBouncing, setIsBouncing] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const previousValueRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const node = rootRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return undefined;
    }

    if (!hasEnteredView) {
      setDisplayValue(0);
      return undefined;
    }

    const startValue = Number.isFinite(previousValueRef.current) ? previousValueRef.current : 0;
    const difference = numericValue - startValue;
    const animationStart = performance.now();
    let frameId = 0;
    let bounceTimer = 0;

    setIsBouncing(true);
    bounceTimer = window.setTimeout(() => setIsBouncing(false), 480);

    const animate = (now) => {
      const progress = Math.min((now - animationStart) / duration, 1);
      const nextValue = startValue + difference * easeOutCubic(progress);

      setDisplayValue(Math.round(nextValue));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        previousValueRef.current = numericValue;
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(bounceTimer);
    };
  }, [duration, hasEnteredView, isNumeric, numericValue, value]);

  return (
    <span ref={rootRef} className={`${isBouncing ? 'score-bounce' : ''} ${className}`.trim()}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
