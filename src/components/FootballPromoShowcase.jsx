import { ArrowUpRight, Sparkles, Star, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const promoSlides = [
  {
    id: 'barcelona',
    title: 'Barcelona Pulse',
    subtitle: 'Kataloniya ruhi',
    blurb: "Tezkor yangiliklar, trend klub kayfiyati va kuchli futbol atmosferasi bir joyda.",
    image:
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-[#1d4ed8]/60 via-[#1e3a8a]/20 to-transparent',
  },
  {
    id: 'realmadrid',
    title: 'Real Madrid Elite',
    subtitle: 'Chempionlar ruhi',
    blurb: "Premium sport ko'rinishi, katta o'yinlar va zamonaviy statistik sahifalar bilan.",
    image:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-[#f59e0b]/50 via-[#f8fafc]/10 to-transparent',
  },
  {
    id: 'messi',
    title: 'Messi Vision',
    subtitle: 'Yulduzlar markazi',
    blurb: "Maydon ichidagi ritm, yumshoq motion va diqqatni tortadigan futbol vizuallari.",
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/960px-Lionel_Messi_20180626.jpg',
    accent: 'from-[#22c55e]/45 via-[#0f172a]/10 to-transparent',
  },
  {
    id: 'ronaldo',
    title: 'Ronaldo Drive',
    subtitle: 'Kuch va tezlik',
    blurb: "Katta sarlavhalar, aniq CTA va telefon uchun yig'ilgan premium sports interface.",
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/960px-Cristiano_Ronaldo_2018.jpg',
    accent: 'from-[#16a34a]/45 via-[#14532d]/10 to-transparent',
  },
];

const SLIDE_DELAY = 5600;

export function FootballPromoShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % promoSlides.length);
    }, SLIDE_DELAY);

    return () => window.clearInterval(id);
  }, []);

  const activeSlide = promoSlides[activeIndex];
  const statItems = useMemo(
    () => [
      { icon: Trophy, label: 'Top klublar' },
      { icon: Star, label: 'Yulduzlar' },
      { icon: Sparkles, label: 'Jonli ritm' },
    ],
    [],
  );

  return (
    <section className="promo-showcase">
      <div className="promo-showcase-frame">
        <img src={activeSlide.image} alt={activeSlide.title} className="promo-showcase-image" />
        <div className="promo-showcase-overlay" />
        <div className={`promo-showcase-accent bg-gradient-to-br ${activeSlide.accent}`} />

        <div className="promo-showcase-content">
          <div className="promo-showcase-copy">
            <p className="promo-showcase-kicker">{activeSlide.subtitle}</p>
            <h2 className="heading-font text-3xl font-semibold text-white md:text-4xl">
              {activeSlide.title}
            </h2>
            <p className="text-sm leading-7 text-gray-200 md:text-base">{activeSlide.blurb}</p>
          </div>

          <div className="promo-showcase-stats">
            {statItems.map((item) => (
              <div key={item.label} className="promo-showcase-stat">
                <item.icon className="h-4 w-4 text-green-200" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link to="/statistics" className="promo-showcase-link">
            Statistika
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="promo-showcase-nav" aria-label="Football promotion">
        {promoSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`promo-showcase-chip ${index === activeIndex ? 'is-active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {slide.id === 'realmadrid' ? 'Real Madrid' : slide.title.split(' ')[0]}
          </button>
        ))}
      </div>
    </section>
  );
}
