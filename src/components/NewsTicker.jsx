import { CalendarDays, RadioTower } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '../hooks/useI18n';
import { contentService } from '../services/contentService';
import { formatDate } from '../utils/formatters';

const fallbackTickerItems = [
  {
    _id: 'ticker-fallback-1',
    title: "Bugungi futbol yangiliklari tayyorlanmoqda",
    description: "Yangiliklar manbasi vaqtincha sekin ishlasa ham sayt futbol ritmida davom etadi.",
    image:
      'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22360%22 viewBox=%220 0 1200 360%22%3E%3Cdefs%3E%3ClinearGradient id=%22a%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23081411%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%2315813d%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%221200%22 height=%22360%22 fill=%22url(%23a)%22/%3E%3Ccircle cx=%22980%22 cy=%2290%22 r=%2280%22 fill=%22rgba(255,255,255,0.08)%22/%3E%3Ccircle cx=%221060%22 cy=%22158%22 r=%2236%22 fill=%22rgba(255,255,255,0.08)%22/%3E%3Ccircle cx=%22170%22 cy=%22270%22 r=%22100%22 fill=%22rgba(255,255,255,0.04)%22/%3E%3Cpath d=%22M0 300h1200%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%223%22/%3E%3Cpath d=%22M120 300c70-60 180-110 300-110s230 50 300 110%22 stroke=%22rgba(255,255,255,0.07)%22 stroke-width=%224%22 fill=%22none%22/%3E%3C/svg%3E',
    link: 'https://www.uefa.com/news/',
    publishedAt: new Date().toISOString(),
    sourceName: 'GoalX',
  },
  {
    _id: 'ticker-fallback-2',
    title: "Jonli o'yinlar va yangiliklar bir joyda yig'ilmoqda",
    description: "Sarlavhalar va asosiy futbol kartalari yangilanib, foydalanuvchiga tayyor holatda uzatiladi.",
    image:
      'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22360%22 viewBox=%220 0 1200 360%22%3E%3Cdefs%3E%3ClinearGradient id=%22a%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23070c16%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%231d4ed8%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%221200%22 height=%22360%22 fill=%22url(%23a)%22/%3E%3Ccircle cx=%22970%22 cy=%2298%22 r=%2284%22 fill=%22rgba(255,255,255,0.08)%22/%3E%3Ccircle cx=%221070%22 cy=%22174%22 r=%2238%22 fill=%22rgba(255,255,255,0.08)%22/%3E%3Ccircle cx=%22220%22 cy=%22280%22 r=%22120%22 fill=%22rgba(255,255,255,0.04)%22/%3E%3Cpath d=%22M0 304h1200%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%223%22/%3E%3Cpath d=%22M160 304c50-46 120-88 210-88s160 42 210 88%22 stroke=%22rgba(255,255,255,0.06)%22 stroke-width=%224%22 fill=%22none%22/%3E%3C/svg%3E',
    link: 'https://www.uefa.com/news/',
    publishedAt: new Date().toISOString(),
    sourceName: 'GoalX',
  },
];

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const SLIDE_INTERVAL_MS = 6500;

export function NewsTicker() {
  const { t } = useI18n();
  const [items, setItems] = useState(fallbackTickerItems);
  const [fallbackMode, setFallbackMode] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTicker = async () => {
      try {
        const payload = await contentService.news({ limit: 8 });
        const nextItems = Array.isArray(payload?.items) && payload.items.length ? payload.items : fallbackTickerItems;

        if (active) {
          setItems(nextItems);
          setFallbackMode(Boolean(payload?.fallbackUsed));
          setActiveIndex((current) => Math.min(current, Math.max(nextItems.length - 1, 0)));
        }
      } catch {
        if (active) {
          setItems(fallbackTickerItems);
          setFallbackMode(true);
          setActiveIndex(0);
        }
      }
    };

    loadTicker();
    const intervalId = window.setInterval(loadTicker, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (paused || items.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [items.length, paused]);

  const marqueeItems = useMemo(() => [...items, ...items], [items]);
  const activeItem = items[activeIndex] || fallbackTickerItems[0];
  const getNewsLink = (item) => item?.link || activeItem?.link || 'https://www.uefa.com/news/';

  return (
    <section
      className="news-spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="news-spotlight-stage">
        <div
          className="news-spotlight-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item) => (
            <a
              key={item._id}
              href={getNewsLink(item)}
              target="_blank"
              rel="noreferrer"
              className="news-spotlight-slide"
              aria-label={`${item.title} - ${t('buttons.readNews')}`}
            >
              <img
                src={item.image || fallbackTickerItems[0].image}
                alt={item.title}
                className="news-spotlight-image"
              />
              <div className="news-spotlight-overlay" />
              <div className="news-spotlight-content">
                <div className="news-spotlight-shell">
                  <div className="news-spotlight-main">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="ticker-pill">
                        <RadioTower className="h-4 w-4" />
                        <span>{t('ticker.liveLabel')}</span>
                      </div>
                      <span className={`ticker-status ${fallbackMode ? 'is-fallback' : ''}`}>
                        {fallbackMode ? t('ticker.fallbackLabel') : t('ticker.liveStatus')}
                      </span>
                    </div>

                    <div className="news-spotlight-copy">
                      <h2 className="heading-font text-balance text-3xl font-semibold text-white md:text-5xl xl:text-6xl">
                        {item.title}
                      </h2>
                      <p className="text-base leading-8 text-gray-200 md:text-lg">
                        {item.description || t('ticker.fallbackHeadline')}
                      </p>
                    </div>

                    <div className="news-spotlight-meta">
                      <span>{item.sourceName || t('newsPage.fallbackSource')}</span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="news-spotlight-poster-wrap">
                    <div className="news-spotlight-poster-frame">
                      <img
                        src={item.image || fallbackTickerItems[0].image}
                        alt={item.title}
                        className="news-spotlight-poster"
                      />
                    </div>
                    <div className="news-spotlight-poster-glow" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="news-spotlight-controls">
          {items.map((item, index) => (
            <button
              key={`${item._id}-dot`}
              type="button"
              className={`news-spotlight-dot ${index === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}-yangilik`}
            />
          ))}
        </div>
      </div>

      <div className="news-spotlight-marquee">
        <div className="news-spotlight-marquee-track">
          {marqueeItems.map((item, index) => (
            <a
              key={`${item._id}-${index}`}
              href={getNewsLink(item)}
              target="_blank"
              rel="noreferrer"
              className="news-spotlight-marquee-item"
            >
              <span className="news-spotlight-marquee-dot" />
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="news-spotlight-side">
        <div className="news-spotlight-side-card">
          <p className="text-xs uppercase tracking-[0.28em] text-green-200">{t('ticker.liveLabel')}</p>
          <p className="mt-2 text-sm text-gray-300">
            {activeItem.title}
          </p>
        </div>
        <div className="news-spotlight-side-card">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{t('common.status')}</p>
          <p className="mt-2 text-sm text-white">
            {fallbackMode ? t('ticker.fallbackHeadline') : t('home.newsDescription')}
          </p>
        </div>
      </div>
    </section>
  );
}
