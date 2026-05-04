import { ArrowRight, Radio, Sparkles, TimerReset, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useI18n } from '../hooks/useI18n';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedSection } from './AnimatedSection';

const formatKickoff = (match) => {
  if (match?.startTime) {
    return match.startTime;
  }

  if (match?.date) {
    return match.date;
  }

  return '--:--';
};

const defaultHighlights = [
  {
    title: 'Live analytics',
    description: 'Jadval, forma va jonli o‘yin oqimi bitta view ichida.',
    icon: Radio,
  },
  {
    title: 'Match intelligence',
    description: 'Katta ligalar uchun tezkor signal va premium stats.',
    icon: TimerReset,
  },
  {
    title: 'Elite atmosphere',
    description: 'Stadion kayfiyati, neon glow va glassmorphism qatlamlari.',
    icon: Trophy,
  },
];

export function FootballHero({
  headline,
  matches = [],
  stats = [],
  isAuthenticated,
  topTeams = [],
}) {
  const { t } = useI18n();
  const heroMatches = matches.slice(0, 3);
  const featuredTeams = topTeams.slice(0, 4);

  return (
    <AnimatedSection className="hero-surface relative overflow-hidden rounded-[32px] border border-white/10 p-6 md:p-8 xl:p-10">
      <div className="hero-aurora hero-aurora-left" />
      <div className="hero-aurora hero-aurora-right" />
      <div className="hero-pitch-grid" />
      <div className="hero-light-beam" />
      <div className="hero-floating-ball" aria-hidden="true">
        <div className="hero-floating-ball-shadow" />
        <div className="hero-floating-ball-core">
          <span className="hero-ball-panel hero-ball-panel-1" />
          <span className="hero-ball-panel hero-ball-panel-2" />
          <span className="hero-ball-panel hero-ball-panel-3" />
          <span className="hero-ball-panel hero-ball-panel-4" />
        </div>
      </div>

      <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-200">
            <Sparkles className="h-4 w-4" />
            {t('home.heroEyebrow')}
          </div>

          <div className="space-y-4">
            <h1 className="heading-font max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
              {t('home.heroTitle')}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
              {t('home.heroDescription')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="#jonli-oyinlar" className="app-button football-button">
              {t('buttons.openMatches')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="app-button-secondary">
              {isAuthenticated ? t('buttons.openDashboard') : t('buttons.createAccount')}
            </Link>
          </div>

          <div className="hero-glass-band">
            <div className="hero-headline-card">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-white/5 p-3 text-green-200">
                  <Radio className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-green-200">
                    {t('home.heroHeadlineLabel')}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-gray-300">
                    {headline?.title || t('ticker.fallbackHeadline')}
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-team-strip">
              {featuredTeams.length ? (
                featuredTeams.map((team, index) => (
                  <div key={team.team} className="hero-team-pill" style={{ animationDelay: `${index * 100}ms` }}>
                    {team.teamLogo ? (
                      <img src={team.teamLogo} alt={team.team} className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="team-token h-8 w-8 text-xs">{team.team.slice(0, 2).toUpperCase()}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{team.team}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-green-200">
                        {team.points} pts
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="hero-team-pill">
                  <span className="team-token h-8 w-8 text-xs">FC</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Top clubs loading</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-green-200">League pulse</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={stat.label} className="hero-stat-card" style={{ animationDelay: `${index * 120}ms` }}>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{stat.label}</p>
                <div className="mt-3 heading-font text-4xl font-semibold text-white">
                  <AnimatedNumber value={stat.value} />
                </div>
                <p className="mt-2 text-sm text-gray-400">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="hero-visual-panel">
            <div className="hero-visual-copy">
              <p className="text-xs uppercase tracking-[0.32em] text-green-200">Matchday control room</p>
              <h2 className="heading-font text-3xl font-semibold text-white md:text-4xl">
                Stadion neon, tactical grid va sekin harakatlanuvchi football sphere.
              </h2>
            </div>

            <div className="hero-highlight-grid">
              {defaultHighlights.map((item) => (
                <div key={item.title} className="glass-mini-card">
                  <item.icon className="h-5 w-5 text-green-200" />
                  <p className="mt-4 heading-font text-2xl font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-side-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">
                  {t('home.heroPanelEyebrow')}
                </p>
                <h2 className="mt-2 heading-font text-3xl font-semibold text-white">
                  {t('home.heroPanelTitle')}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
                {heroMatches.length} {t('home.heroPanelCount')}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {heroMatches.map((match) => (
                <div key={match._id} className="hero-match-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-gray-500">{match.league}</p>
                      <p className="mt-2 heading-font text-xl font-semibold text-white">
                        {match.homeTeam} <span className="text-gray-500">vs</span> {match.awayTeam}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-200">{formatKickoff(match)}</p>
                      <p className="mt-1 text-xs text-gray-400">{match.status || t('common.live')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
