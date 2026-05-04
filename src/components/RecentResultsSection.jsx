import { Clock3, Trophy } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { AnimatedSection } from './AnimatedSection';
import { EmptyState } from './EmptyState';
import { PageHeader } from './PageHeader';

const getTeamInitials = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

function TeamMini({ name, logo }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="h-10 w-10 rounded-full border border-white/10 bg-white/5 object-cover p-1"
        />
      ) : (
        <span className="team-token h-10 w-10 text-xs">{getTeamInitials(name)}</span>
      )}
      <span className="truncate text-sm font-medium text-white">{name}</span>
    </div>
  );
}

export function RecentResultsSection({ matches = [] }) {
  const { t } = useI18n();
  const recentResults = matches
    .filter(
      (match) =>
        !match.isLive &&
        match.homeScore !== null &&
        match.homeScore !== undefined &&
        match.awayScore !== null &&
        match.awayScore !== undefined,
    )
    .slice(0, 6);

  return (
    <AnimatedSection className="space-y-4">
      <PageHeader
        eyebrow={t('home.recentResultsEyebrow')}
        title={t('home.recentResultsTitle')}
        description={t('home.recentResultsDescription')}
      />

      {recentResults.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentResults.map((match, index) => (
            <AnimatedSection as="article" key={match._id} delay={index * 70}>
              <div className="app-card football-card result-card h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-green-300">
                      {match.league}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-xs text-gray-400">
                      <Clock3 className="h-3.5 w-3.5 text-green-300" />
                      {match.date} {match.startTime}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                    <Trophy className="h-3.5 w-3.5" />
                    {match.status || t('statuses.completed')}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <TeamMini name={match.homeTeam} logo={match.homeLogo} />
                    <span className="heading-font text-3xl font-semibold text-white">
                      {match.homeScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <TeamMini name={match.awayTeam} logo={match.awayLogo} />
                    <span className="heading-font text-3xl font-semibold text-white">
                      {match.awayScore}
                    </span>
                  </div>
                </div>

                {match.venue ? (
                  <p className="mt-4 text-sm text-gray-400">{match.venue}</p>
                ) : null}
              </div>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('empty.noRecentResults')}
          description={t('empty.noRecentResultsDescription')}
        />
      )}
    </AnimatedSection>
  );
}
