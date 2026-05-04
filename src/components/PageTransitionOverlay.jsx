import { useEffect, useRef, useState } from 'react';

import footballBall from '../assets/football-ball.svg';
import MetallicPaint from './MetallicPaint';

export function PageTransitionOverlay({ routeKey }) {
  const [visible, setVisible] = useState(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return undefined;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 820);

    return () => window.clearTimeout(timer);
  }, [routeKey]);

  if (!visible) {
    return null;
  }

  return (
    <div className="page-transition-overlay" aria-hidden="true">
      <div className="page-transition-card">
        <div className="page-transition-ball">
          <MetallicPaint
            imageSrc={footballBall}
            seed={77}
            scale={4}
            patternSharpness={1}
            noiseScale={0.55}
            speed={0.45}
            liquid={0.8}
            brightness={2}
            contrast={0.55}
            refraction={0.012}
            blur={0.012}
            chromaticSpread={2}
            fresnel={1}
            waveAmplitude={1}
            distortion={1}
            contour={0.2}
            lightColor="#ffffff"
            darkColor="#030712"
            tintColor="#86efac"
          />
        </div>
        <p className="page-transition-text">Sahifa ochilmoqda</p>
      </div>
    </div>
  );
}
