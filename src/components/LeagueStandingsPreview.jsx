import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { AnimatedSection } from './AnimatedSection';
import { EmptyState } from './EmptyState';
import { contentService } from '../services/contentService';

const PREVIEW_REFRESH_MS = 5 * 60 * 1000;

const formTone = {
  W: 'is-win',
  D: 'is-draw',
  L: 'is-loss',
};

export function LeagueStandingsPreview({ league = 'laliga' }) {
  const [payload, setPayload] = useState({
    items: [],
    league: 'La Liga',
    season: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadStandings = async () => {
      try {
        const response = await contentService.standings({ league, limit: 5 });

        if (active) {
          setPayload(response);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStandings();
    const intervalId = window.setInterval(loadStandings, PREVIEW_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [league]);

  if (!loading && !payload.items.length) {
    return <EmptyState title="Jadval topilmadi" description="Statistika tez orada yangilanadi." />;
  }

  return (
    <AnimatedSection className="standings-preview app-card football-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-green-200">Doimiy statistika</p>
          <h3 className="mt-2 heading-font text-3xl font-semibold text-white">{payload.league}</h3>
          <p className="mt-2 text-sm text-gray-400">{payload.season}</p>
        </div>
        <Link to="/statistics" className="app-button-secondary">
          To‘liq jadval
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {payload.items.map((team) => (
          <div key={team.team} className="standings-preview-row">
            <div className="standings-preview-main">
              <span className="standings-preview-rank">{team.rank}</span>
              {team.teamLogo ? (
                <img src={team.teamLogo} alt={team.team} className="h-8 w-8 object-contain" />
              ) : null}
              <span className="heading-font text-lg font-semibold text-white">{team.team}</span>
            </div>
            <div className="standings-preview-side">
              <span className="text-sm text-gray-400">{team.played} MP</span>
              <span className="heading-font text-2xl font-semibold text-white">{team.points}</span>
              <div className="standings-form">
                {(team.form || []).slice(-3).map((result, index) => (
                  <span key={`${team.team}-preview-${index}`} className={`standings-form-badge ${formTone[result] || ''}`}>
                    {result}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
