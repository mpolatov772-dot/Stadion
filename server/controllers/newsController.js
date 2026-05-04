import { listNews } from '../models/News.js';
import {
  getFootballMatchesFeed,
  getFootballNewsFeed,
  getLeagueStandingsFeed,
} from '../services/footballContentService.js';

const clampLimit = (value, fallback) => {
  const normalized = Number.parseInt(value, 10);

  if (!Number.isFinite(normalized)) {
    return fallback;
  }

  return Math.max(1, Math.min(normalized, 24));
};

export const getNews = async (req, res) => {
  const news = await listNews();
  const fallbackNews = [...news].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const payload = await getFootballNewsFeed({
    limit: clampLimit(req.query.limit, 12),
    fallbackNews,
  });

  res.json({
    success: true,
    data: payload,
  });
};

export const getFootballMatches = async (req, res) => {
  const payload = await getFootballMatchesFeed({
    limit: clampLimit(req.query.limit, 20),
  });

  res.json({
    success: true,
    data: payload,
  });
};

export const getLeagueStandings = async (req, res) => {
  const payload = await getLeagueStandingsFeed({
    league: String(req.query.league || 'laliga').toLowerCase(),
    limit: clampLimit(req.query.limit, 20),
    season: String(req.query.season || '').trim(),
  });

  res.json({
    success: true,
    data: payload,
  });
};
