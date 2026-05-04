import { Clock3, MapPin, RadioTower } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { AnimatedNumber } from './AnimatedNumber';
import { EmptyState } from './EmptyState';

const groupMatchesByLeague = (matches = []) =>
  matches.reduce((accumulator, match) => {
    const league = match.league || 'Futbol';

    if (!accumulator[league]) {
      accumulator[league] = [];
    }

    accumulator[league].push(match);
    return accumulator;
  }, {});

const getTeamInitials = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

function MatchScore({ match }) {
  const hasScore =
    match.homeScore !== null &&
    match.homeScore !== undefined &&
    match.awayScore !== null &&
    match.awayScore !== undefined;

  if (!hasScore) {
    return <span className="heading-font text-2xl font-semibold text-green-200">{match.startTime || '--:--'}</span>;
  }

  return (
    <div className="flex items-center gap-2 text-3xl font-semibold text-white">
      <AnimatedNumber value={match.homeScore} className="heading-font" duration={700} />
      <span className="heading-font text-green-300">:</span>
      <AnimatedNumber value={match.awayScore} className="heading-font" duration={700} />
    </div>
  );
}

function TeamBadge({ name, logo }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {logo ? (
        <img src={logo} alt={name} className="h-12 w-12 shrink-0 rounded-full border border-white/10 bg-white/5 object-cover p-1" />
      ) : (
        <span className="team-token">{getTeamInitials(name)}</span>
      )}
      <div className="min-w-0">
        <p className="heading-font text-lg font-semibold leading-tight text-white sm:text-xl">
          {name}
        </p>
      </div>
    </div>
  );
}

export function FootballMatchesPanel({ matches = [] }) {
  const { t } = useI18n();
  const grouped = Object.entries(groupMatchesByLeague(matches));

  if (!grouped.length) {
    return (
      <EmptyState
        title={t('empty.noFootballMatches')}
        description={t('empty.noFootballMatchesDescription')}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {grouped.map(([league, leagueMatches]) => (
        <section key={league} className="app-card football-card league-panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-green-300">{t('home.footballMatchesEyebrow')}</p>
              <h3 className="mt-2 heading-font text-3xl font-semibold text-white">{league}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
              {leagueMatches.length} {t('home.heroPanelCount')}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {leagueMatches.map((match) => (
              <article key={match._id} className="match-card group">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                  <div className="min-w-0">
                    <TeamBadge name={match.homeTeam} logo={match.homeLogo} />
                  </div>

                  <div className="match-score-panel">
                    {match.isLive ? (
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-red-200">
                        <span className="live-ping" />
                        <RadioTower className="h-3.5 w-3.5" />
                        {t('common.live')}
                      </div>
                    ) : null}
                    <MatchScore match={match} />
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-gray-400">
                      {match.status || t('home.matchStatusFallback')}
                    </p>
                  </div>

                  <div className="min-w-0 lg:text-right">
                    <div className="flex justify-start lg:justify-end">
                      <TeamBadge name={match.awayTeam} logo={match.awayLogo} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-green-300" />
                    {match.date} {match.startTime}
                  </span>
                  {match.venue ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-300" />
                      {match.venue}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
