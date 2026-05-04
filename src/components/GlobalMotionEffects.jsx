import { useEffect } from 'react';

const RIPPLE_SELECTOR = [
  '.app-button',
  '.app-button-secondary',
  '.statistics-tab',
  '.statistics-team-button',
  '.statistics-mobile-button',
  '.mobile-bottom-link',
].join(', ');

export function GlobalMotionEffects() {
  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target instanceof Element ? event.target.closest(RIPPLE_SELECTOR) : null;

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.15;

      ripple.className = 'ripple-wave';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      target.classList.add('ripple-surface');
      target.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 650);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return null;
}
