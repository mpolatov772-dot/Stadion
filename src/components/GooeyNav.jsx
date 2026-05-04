import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './GooeyNav.css';

const GooeyNav = ({
  items = [],
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        href: item.href || '#',
      })),
    [items],
  );

  const noise = (number = 1) => number / 2 - Math.random() * number;

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (index, time, distances, radius) => {
    const rotate = noise(radius / 10);

    return {
      start: getXY(distances[0], particleCount - index, particleCount),
      end: getXY(distances[1] + noise(7), particleCount - index, particleCount),
      time,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + radius / 20) * 10 : (rotate - radius / 20) * 10,
    };
  };

  const makeParticles = (element) => {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let index = 0; index < particleCount; index += 1) {
      const particleTime = animationTime * 2 + noise(timeVariance * 2);
      const particleProps = createParticle(index, particleTime, particleDistances, particleR);
      element.classList.remove('active');

      window.setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');

        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${particleProps.start[0]}px`);
        particle.style.setProperty('--start-y', `${particleProps.start[1]}px`);
        particle.style.setProperty('--end-x', `${particleProps.end[0]}px`);
        particle.style.setProperty('--end-y', `${particleProps.end[1]}px`);
        particle.style.setProperty('--time', `${particleProps.time}ms`);
        particle.style.setProperty('--scale', `${particleProps.scale}`);
        particle.style.setProperty('--color', `var(--gooey-color-${particleProps.color}, white)`);
        particle.style.setProperty('--rotate', `${particleProps.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add('active');
        });

        window.setTimeout(() => {
          if (element.contains(particle)) {
            element.removeChild(particle);
          }
        }, particleTime);
      }, 30);
    }
  };

  const updateEffectPosition = (element) => {
    if (!containerRef.current || !filterRef.current || !textRef.current || !element) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const position = element.getBoundingClientRect();
    const styles = {
      left: `${position.x - containerRect.x}px`,
      top: `${position.y - containerRect.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const activateIndex = (index, element) => {
    if (activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(element);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach((particle) => filterRef.current.removeChild(particle));
      makeParticles(filterRef.current);
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
  };

  const handleNavigation = (event, item, index) => {
    const listItem = event.currentTarget.closest('li');
    if (!listItem) return;

    activateIndex(index, listItem);

    const href = item.href;
    const isInternalRoute = href.startsWith('/');
    const isHashRoute = href.startsWith('#');

    if (isInternalRoute) {
      event.preventDefault();
      navigate(href);
      return;
    }

    if (isHashRoute) {
      event.preventDefault();
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleKeyDown = (event, item, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(event, item, index);
    }
  };

  useEffect(() => {
    const matchedIndex = normalizedItems.findIndex((item) => item.href === location.pathname);
    if (matchedIndex >= 0) {
      setActiveIndex(matchedIndex);
    }
  }, [location.pathname, normalizedItems]);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return undefined;

    const activeItem = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeItem) {
      updateEffectPosition(activeItem);
      textRef.current?.classList.add('active');
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveItem = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveItem) {
        updateEffectPosition(currentActiveItem);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  if (!normalizedItems.length) {
    return null;
  }

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="Tezkor navigatsiya">
        <ul ref={navRef}>
          {normalizedItems.map((item, index) => (
            <li key={`${item.label}-${item.href}`} className={activeIndex === index ? 'active' : ''}>
              <a
                href={item.href}
                onClick={(event) => handleNavigation(event, item, index)}
                onKeyDown={(event) => handleKeyDown(event, item, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
