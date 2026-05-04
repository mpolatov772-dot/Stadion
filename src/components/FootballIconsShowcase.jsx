import { Crown, Shield, Star } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { AnimatedSection } from './AnimatedSection';

const footballIcons = [
  {
    id: 'barcelona',
    title: 'Barcelona',
    subtitle: 'Catalonia pride',
    image:
      'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    accent: 'from-[#1f3c88]/90 via-[#700035]/70 to-[#0b1220]',
  },
  {
    id: 'realmadrid',
    title: 'Real Madrid',
    subtitle: 'Royal champions',
    image:
      'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    accent: 'from-[#d9b650]/80 via-[#f6f1d3]/35 to-[#0f172a]',
  },
  {
    id: 'messi',
    title: 'Leo Messi',
    subtitle: 'Magic in motion',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/640px-Lionel_Messi_20180626.jpg',
    accent: 'from-sky-500/50 via-cyan-400/20 to-[#08131f]',
  },
  {
    id: 'ronaldo',
    title: 'Cristiano Ronaldo',
    subtitle: 'Power and precision',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/640px-Cristiano_Ronaldo_2018.jpg',
    accent: 'from-emerald-500/50 via-lime-400/15 to-[#07130f]',
  },
];

export function FootballIconsShowcase() {
  const { t } = useI18n();

  return (
    <AnimatedSection className="app-card overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-green-300">
            {t('home.iconsEyebrow')}
          </p>
          <h2 className="mt-3 heading-font text-3xl font-semibold text-white md:text-4xl">
            {t('home.iconsTitle')}
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            {t('home.iconsDescription')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
          <Star className="h-4 w-4 text-amber-300" />
          {t('home.iconsBadge')}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {footballIcons.map((item, index) => (
          <AnimatedSection as="article" key={item.id} delay={index * 90}>
            <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d131c] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_48%)]" />

              <div className="relative flex aspect-[4/5] items-end overflow-hidden p-4">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081018] via-[#081018]/35 to-transparent" />
                <div className="relative z-10 w-full rounded-[20px] border border-white/10 bg-[#09111a]/72 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-green-200">
                      {item.subtitle}
                    </p>
                    {item.id === 'realmadrid' || item.id === 'barcelona' ? (
                      <Shield className="h-4 w-4 text-white/80" />
                    ) : (
                      <Crown className="h-4 w-4 text-white/80" />
                    )}
                  </div>
                  <h3 className="mt-2 heading-font text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  );
}
