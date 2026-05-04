import { ChevronDown, Search, Shield, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AnimatedSection } from '../components/AnimatedSection';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { contentService } from '../services/contentService';

const leagueTabs = [
  { key: 'laliga', label: 'La Liga' },
  { key: 'premier', label: 'Premier League' },
  { key: 'bundesliga', label: 'Bundesliga' },
  { key: 'ligue1', label: 'Ligue 1' },
  { key: 'ucl', label: 'UEFA Champions League' },
];

const STANDINGS_REFRESH_MS = 5 * 60 * 1000;

const formTone = {
  W: 'is-win',
  D: 'is-draw',
  L: 'is-loss',
};

export function LeagueStatisticsPage() {
  const [activeLeague, setActiveLeague] = useState('laliga');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [query, setQuery] = useState('');
  const [payload, setPayload] = useState({
    items: [],
    season: '',
    league: 'La Liga',
    fetchedAt: '',
    availableSeasons: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadStandings = async () => {
      const response = await contentService.standings({
        league: activeLeague,
        season: selectedSeason,
        limit: 20,
      });

      if (active) {
        setPayload(response);
        if (!selectedSeason && response.season) {
          setSelectedSeason(response.season);
        }
        setLoading(false);
      }
    };

    setLoading(true);
    loadStandings();
    const intervalId = window.setInterval(loadStandings, STANDINGS_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [activeLeague, selectedSeason]);

  const filteredTeams = useMemo(() => {
    return payload.items.filter((team) =>
      team.team.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [payload.items, query]);

  useEffect(() => {
    if (!filteredTeams.length) {
      setSelectedTeamName('');
      return;
    }

    const hasSelectedTeam = filteredTeams.some((team) => team.team === selectedTeamName);

    if (!hasSelectedTeam) {
      setSelectedTeamName(filteredTeams[0].team);
    }
  }, [filteredTeams, selectedTeamName]);

  const summaryCards = useMemo(() => {
    if (!payload.items.length) {
      return [];
    }

    const topTeam = payload.items[0];
    const bestAttack = [...payload.items].sort((a, b) => b.gf - a.gf)[0];
    const bestDefense = [...payload.items].sort((a, b) => a.ga - b.ga)[0];

    return [
      { label: 'Peshqadam', value: topTeam.points, hint: topTeam.team },
      { label: 'Eng ko‘p gol', value: bestAttack.gf, hint: bestAttack.team },
      { label: 'Eng kam gol yegan', value: bestDefense.ga, hint: bestDefense.team },
    ];
  }, [payload.items]);

  const selectedTeam = useMemo(
    () => filteredTeams.find((team) => team.team === selectedTeamName) || filteredTeams[0] || null,
    [filteredTeams, selectedTeamName],
  );

  const selectedTeamInsights = useMemo(() => {
    if (!selectedTeam) {
      return [];
    }

    const played = Number(selectedTeam.played || 0);
    const pointsPerMatch = played ? (Number(selectedTeam.points || 0) / played).toFixed(2) : '0.00';
    const winRate = played ? `${Math.round((Number(selectedTeam.wins || 0) / played) * 100)}%` : '0%';
    const goalAverage = played ? (Number(selectedTeam.gf || 0) / played).toFixed(2) : '0.00';

    return [
      {
        label: 'Ochko / o‘yin',
        value: pointsPerMatch,
        hint: 'Barqarorlik ko‘rsatkichi',
        icon: Trophy,
      },
      {
        label: 'G‘alaba foizi',
        value: winRate,
        hint: `${selectedTeam.wins} ta g‘alaba`,
        icon: TrendingUp,
      },
      {
        label: 'Gol / o‘yin',
        value: goalAverage,
        hint: `${selectedTeam.gf} ta gol urgan`,
        icon: Target,
      },
      {
        label: 'Himoya',
        value: `${selectedTeam.ga}`,
        hint: 'Yeb qo‘yilgan gollar',
        icon: Shield,
      },
    ];
  }, [selectedTeam]);

  return (
    <div className="space-y-6">
      <AnimatedSection className="statistics-hero">
        <div className="statistics-hero-glow statistics-hero-glow-left" />
        <div className="statistics-hero-glow statistics-hero-glow-right" />
        <div className="statistics-hero-gridline" />
        <div className="statistics-hero-grid">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-200">
              <Sparkles className="h-4 w-4" />
              Statistika markazi
            </div>
            <h1 className="heading-font text-4xl font-semibold text-white md:text-5xl">
              Jonli liga jadvali
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
              Jadval avtomatik yangilanadi va kunlik futbol oqimiga mos turadi.
            </p>
          </div>

          <div className="statistics-hero-side">
            <p className="text-xs uppercase tracking-[0.28em] text-green-200">Mavsum</p>
            <h2 className="mt-2 heading-font text-3xl font-semibold text-white">
              {payload.league} {payload.season}
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Qidiruv, forma va ochkolar doim yangilanib turadi.
            </p>
            <div className="statistics-hero-select mt-5">
              <span className="statistics-select-caption">Kerakli mavsumni tanlang</span>
              <label className="statistics-select-shell">
                <select
                  value={selectedSeason || payload.season}
                  onChange={(event) => setSelectedSeason(event.target.value)}
                  className="statistics-select"
                >
                  {(payload.availableSeasons || []).map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
                <ChevronDown className="statistics-select-icon h-4 w-4" />
              </label>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {summaryCards.length ? (
        <AnimatedSection className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
          ))}
        </AnimatedSection>
      ) : null}

      <AnimatedSection className="space-y-4">
        <PageHeader
          eyebrow="Liga filteri"
          title="Katta ligalar"
          description="Rasmga yaqin, aniq va doim yangilanadigan football jadval."
        />

        <div className="statistics-toolbar">
          <div className="statistics-tabs-shell">
            <div className="statistics-tabs" role="tablist" aria-label="League tabs">
              {leagueTabs.map((league) => (
                <button
                  key={league.key}
                  type="button"
                  role="tab"
                  aria-selected={league.key === activeLeague}
                  className={`statistics-tab ${league.key === activeLeague ? 'is-active' : ''}`}
                  onClick={() => setActiveLeague(league.key)}
                >
                  {league.label}
                </button>
              ))}
            </div>
          </div>

          <label className="statistics-search">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jamoani qidiring"
              className="bg-transparent outline-none"
            />
          </label>

          <div className="statistics-select-control">
            <span className="statistics-select-caption">Mavsum</span>
            <label className="statistics-select-shell">
              <select
                value={selectedSeason || payload.season}
                onChange={(event) => setSelectedSeason(event.target.value)}
                className="statistics-select"
              >
                {(payload.availableSeasons || []).map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="statistics-select-icon h-4 w-4" />
            </label>
          </div>
        </div>

        <div className="statistics-shell app-card football-card">
          {loading ? (
            <div className="statistics-loading">Jadval yuklanmoqda...</div>
          ) : !filteredTeams.length ? (
            <EmptyState title="Jamoa topilmadi" description="Boshqa nom bilan qidirib ko‘ring." />
          ) : (
            <>
              {selectedTeam ? (
                <section className="club-spotlight-card">
                  <div className="club-spotlight-head">
                    <div className="club-spotlight-title">
                      <span className="club-spotlight-kicker">Tanlangan klub</span>
                      <div className="club-spotlight-name-row">
                        {selectedTeam.teamLogo ? (
                          <img src={selectedTeam.teamLogo} alt={selectedTeam.team} className="h-12 w-12 object-contain" />
                        ) : null}
                        <div>
                          <h3 className="heading-font text-3xl font-semibold text-white">{selectedTeam.team}</h3>
                          <p className="text-sm text-gray-300">
                            {payload.league} • {payload.season} • {selectedTeam.rank}-o‘rin
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="club-spotlight-points">
                      <span>Ochko</span>
                      <strong>{selectedTeam.points}</strong>
                    </div>
                  </div>

                  <div className="club-spotlight-grid">
                    {selectedTeamInsights.map((item) => {
                      const Icon = item.icon;

                      return (
                        <article key={item.label} className="club-mini-stat">
                          <div className="club-mini-stat-icon">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                          <p>{item.hint}</p>
                        </article>
                      );
                    })}
                  </div>

                  <div className="club-spotlight-footer">
                    <div className="statistics-mobile-meta">
                      <span>MP: {selectedTeam.played}</span>
                      <span>W: {selectedTeam.wins}</span>
                      <span>D: {selectedTeam.draws}</span>
                      <span>L: {selectedTeam.losses}</span>
                      <span>GF: {selectedTeam.gf}</span>
                      <span>GA: {selectedTeam.ga}</span>
                      <span>GD: {selectedTeam.gd}</span>
                    </div>

                    <div className="standings-form">
                      {(selectedTeam.form || []).slice(-5).map((result, formIndex) => (
                        <span
                          key={`${selectedTeam.team}-spotlight-${formIndex}`}
                          className={`standings-form-badge ${formTone[result] || ''}`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <div className="statistics-table-toolbar">
                <div className="statistics-select-like">
                  <span>League</span>
                  <strong>{payload.league}</strong>
                </div>
                <div className="statistics-select-like">
                  <span>Season</span>
                  <strong>{payload.season}</strong>
                </div>
              </div>

              <div className="statistics-table-wrap">
                <table className="statistics-table screenshot-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Club</th>
                      <th>MP</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                      <th>Pts</th>
                      <th>Last 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team, index) => (
                      <tr
                        key={team.team}
                        className={`${index < 4 ? 'is-top-team' : ''} ${
                          selectedTeam?.team === team.team ? 'is-selected-team' : ''
                        }`}
                      >
                        <td>{team.rank || index + 1}</td>
                        <td>
                          <button
                            type="button"
                            className="statistics-team-button"
                            onClick={() => setSelectedTeamName(team.team)}
                          >
                            <div className="statistics-team-cell">
                              <span className={`statistics-rank-strip rank-${Math.min(index + 1, 6)}`} />
                              {team.teamLogo ? (
                                <img src={team.teamLogo} alt={team.team} className="h-7 w-7 object-contain" />
                              ) : null}
                              <span>{team.team}</span>
                            </div>
                          </button>
                        </td>
                        <td>{team.played}</td>
                        <td>{team.wins}</td>
                        <td>{team.draws}</td>
                        <td>{team.losses}</td>
                        <td>{team.gf}</td>
                        <td>{team.ga}</td>
                        <td>{team.gd}</td>
                        <td className="statistics-points">{team.points}</td>
                        <td>
                          <div className="standings-form">
                            {(team.form || []).slice(-5).map((result, formIndex) => (
                              <span
                                key={`${team.team}-${formIndex}`}
                                className={`standings-form-badge ${formTone[result] || ''}`}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="statistics-mobile-grid">
                {filteredTeams.map((team, index) => (
                  <button
                    key={team.team}
                    type="button"
                    onClick={() => setSelectedTeamName(team.team)}
                    className={`statistics-mobile-card statistics-mobile-button ${
                      index < 4 ? 'is-top-team' : ''
                    } ${selectedTeam?.team === team.team ? 'is-selected-team' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="statistics-team-cell">
                        <span className={`statistics-rank-strip rank-${Math.min(index + 1, 6)}`} />
                        {team.teamLogo ? (
                          <img src={team.teamLogo} alt={team.team} className="h-8 w-8 object-contain" />
                        ) : null}
                        <div>
                          <p className="heading-font text-xl font-semibold text-white">{team.team}</p>
                          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                            {payload.league}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Pts</p>
                        <p className="heading-font text-2xl font-semibold text-green-200">{team.points}</p>
                      </div>
                    </div>

                    <div className="statistics-mobile-meta">
                      <span>MP: {team.played}</span>
                      <span>W: {team.wins}</span>
                      <span>D: {team.draws}</span>
                      <span>L: {team.losses}</span>
                      <span>GF: {team.gf}</span>
                      <span>GA: {team.ga}</span>
                      <span>GD: {team.gd}</span>
                    </div>

                    <div className="standings-form mt-4">
                      {(team.form || []).slice(-5).map((result, formIndex) => (
                        <span
                          key={`${team.team}-mobile-${formIndex}`}
                          className={`standings-form-badge ${formTone[result] || ''}`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
