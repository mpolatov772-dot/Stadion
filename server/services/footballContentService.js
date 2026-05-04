import { replaceNews } from '../models/News.js';

const UEFA_BASE_URL = 'https://www.uefa.com';
const UEFA_HOME_URL = `${UEFA_BASE_URL}/`;
const SPORTS_DB_EVENTS_URL = 'https://www.thesportsdb.com/api/v1/json/123/eventsday.php';
const SPORTS_DB_TABLE_URL = 'https://www.thesportsdb.com/api/v1/json/123/lookuptable.php';
const API_FOOTBALL_FIXTURES_URL = 'https://v3.football.api-sports.io/fixtures';
const API_FOOTBALL_STANDINGS_URL = 'https://v3.football.api-sports.io/standings';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const GUARDIAN_CONTENT_URL = 'https://content.guardianapis.com/search';

const MATCH_CACHE_TTL_MS = 5 * 60 * 1000;
const STANDINGS_CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_NEWS_ITEMS = 18;
const MAX_MATCH_ITEMS = 24;
const MAX_STANDINGS_ITEMS = 20;
const TASHKENT_TIMEZONE = 'Asia/Tashkent';

const newsCache = {
  dayKey: '',
  items: [],
  fetchedAt: '',
  source: 'fallback',
  fallbackUsed: true,
};

const matchCache = {
  cacheKey: '',
  items: [],
  fetchedAt: '',
  source: 'fallback',
};

const standingsCache = new Map();

const LEAGUE_CONFIG = {
  laliga: {
    id: 140,
    sportsDbId: 4335,
    label: 'La Liga',
  },
  premier: {
    id: 39,
    sportsDbId: 4328,
    label: 'Premier League',
  },
  bundesliga: {
    id: 78,
    sportsDbId: 4331,
    label: 'Bundesliga',
  },
  ligue1: {
    id: 61,
    sportsDbId: 4334,
    label: 'Ligue 1',
  },
  ucl: {
    id: 2,
    sportsDbId: 4480,
    label: 'UEFA Champions League',
  },
};

const buildPlaceholderImage = (accent) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#061017" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#bg)" />
      <circle cx="1020" cy="140" r="120" fill="rgba(255,255,255,0.08)" />
      <circle cx="1100" cy="270" r="46" fill="rgba(255,255,255,0.08)" />
      <circle cx="220" cy="560" r="150" fill="rgba(255,255,255,0.04)" />
      <path d="M0 620h1200" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
      <path d="M120 620c70-120 180-160 280-160s210 40 280 160" stroke="rgba(255,255,255,0.08)" stroke-width="4" fill="none" />
    </svg>
  `)}`;

const fallbackImages = [
  buildPlaceholderImage('#15803d'),
  buildPlaceholderImage('#1d4ed8'),
  buildPlaceholderImage('#9a3412'),
  buildPlaceholderImage('#0f766e'),
];

const builtInFallbackNews = [
  {
    _id: 'fallback-football-news-1',
    title: "Bugungi futbol sarlavhalari yangilanmoqda",
    description: "Tashqi manba vaqtincha javob bermadi. Futbol bo'limidagi asosiy xabarlar tez orada qayta yuklanadi.",
    image: fallbackImages[0],
    publishedAt: new Date().toISOString(),
    category: 'football',
    sourceName: 'Fallback',
    link: '',
  },
  {
    _id: 'fallback-football-news-2',
    title: "Chempionatlar bo'yicha so'nggi holatlar tayyorlanmoqda",
    description: "Server bugungi futbol yangiliklarini qayta yig'moqda. Sahifani yangilab yana tekshirishingiz mumkin.",
    image: fallbackImages[1],
    publishedAt: new Date().toISOString(),
    category: 'featured',
    sourceName: 'Fallback',
    link: '',
  },
  {
    _id: 'fallback-football-news-3',
    title: "Jonli futbol portali uchun zaxira yangiliklari ko'rsatilmoqda",
    description: "Yangiliklar API qayta ishga tushguncha futbol mavzusidagi zaxira matnlar chiqariladi.",
    image: fallbackImages[2],
    publishedAt: new Date().toISOString(),
    category: 'analysis',
    sourceName: 'Fallback',
    link: '',
  },
];

const builtInFallbackMatches = [
  {
    _id: 'match-fallback-1',
    league: 'Premyer liga',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    status: 'Boshlanmagan',
    startTime: '21:30',
    date: new Date().toISOString().slice(0, 10),
    homeScore: null,
    awayScore: null,
    venue: 'London',
    isLive: false,
    leagueLogo: '',
    homeLogo: '',
    awayLogo: '',
  },
  {
    _id: 'match-fallback-2',
    league: 'La Liga',
    homeTeam: 'Barcelona',
    awayTeam: 'Atletico',
    status: 'Boshlanmagan',
    startTime: '23:00',
    date: new Date().toISOString().slice(0, 10),
    homeScore: null,
    awayScore: null,
    venue: 'Barselona',
    isLive: false,
    leagueLogo: '',
    homeLogo: '',
    awayLogo: '',
  },
];

const builtInFallbackStandings = {
  laliga: [
    { rank: 1, team: 'Barcelona', played: 32, wins: 27, draws: 1, losses: 4, gf: 85, ga: 30, gd: 55, points: 82, form: ['W', 'W', 'W', 'W', 'W'] },
    { rank: 2, team: 'Real Madrid', played: 32, wins: 23, draws: 4, losses: 5, gf: 67, ga: 30, gd: 37, points: 73, form: ['W', 'W', 'L', 'D', 'W'] },
    { rank: 3, team: 'Villarreal', played: 32, wins: 19, draws: 5, losses: 8, gf: 57, ga: 37, gd: 20, points: 62, form: ['D', 'W', 'L', 'W', 'D'] },
    { rank: 4, team: 'Atletico Madrid', played: 32, wins: 17, draws: 6, losses: 9, gf: 53, ga: 35, gd: 18, points: 57, form: ['W', 'L', 'L', 'L', 'L'] },
    { rank: 5, team: 'Real Betis', played: 32, wins: 12, draws: 13, losses: 7, gf: 48, ga: 40, gd: 8, points: 49, form: ['D', 'L', 'D', 'D', 'W'] },
    { rank: 6, team: 'Getafe', played: 32, wins: 13, draws: 5, losses: 14, gf: 28, ga: 32, gd: -4, points: 44, form: ['L', 'W', 'W', 'L', 'W'] },
  ],
  premier: [
    { rank: 1, team: 'Manchester City', played: 33, wins: 24, draws: 5, losses: 4, gf: 78, ga: 31, gd: 47, points: 77, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: 'Arsenal', played: 33, wins: 23, draws: 6, losses: 4, gf: 71, ga: 28, gd: 43, points: 75, form: ['W', 'D', 'W', 'W', 'W'] },
    { rank: 3, team: 'Liverpool', played: 33, wins: 22, draws: 7, losses: 4, gf: 74, ga: 36, gd: 38, points: 73, form: ['W', 'W', 'D', 'L', 'W'] },
    { rank: 4, team: 'Aston Villa', played: 33, wins: 19, draws: 7, losses: 7, gf: 63, ga: 42, gd: 21, points: 64, form: ['W', 'L', 'W', 'W', 'D'] },
    { rank: 5, team: 'Tottenham', played: 33, wins: 18, draws: 6, losses: 9, gf: 66, ga: 49, gd: 17, points: 60, form: ['L', 'W', 'W', 'L', 'W'] },
    { rank: 6, team: 'Newcastle United', played: 33, wins: 17, draws: 7, losses: 9, gf: 62, ga: 46, gd: 16, points: 58, form: ['W', 'W', 'L', 'D', 'W'] },
  ],
  bundesliga: [
    { rank: 1, team: 'Bayern Munich', played: 29, wins: 22, draws: 4, losses: 3, gf: 81, ga: 27, gd: 54, points: 70, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: 'Bayer Leverkusen', played: 29, wins: 20, draws: 6, losses: 3, gf: 67, ga: 29, gd: 38, points: 66, form: ['W', 'W', 'D', 'W', 'W'] },
    { rank: 3, team: 'Borussia Dortmund', played: 29, wins: 17, draws: 6, losses: 6, gf: 61, ga: 37, gd: 24, points: 57, form: ['W', 'D', 'W', 'L', 'W'] },
    { rank: 4, team: 'RB Leipzig', played: 29, wins: 16, draws: 7, losses: 6, gf: 58, ga: 35, gd: 23, points: 55, form: ['W', 'W', 'L', 'D', 'W'] },
    { rank: 5, team: 'Stuttgart', played: 29, wins: 15, draws: 6, losses: 8, gf: 55, ga: 41, gd: 14, points: 51, form: ['L', 'W', 'W', 'L', 'W'] },
    { rank: 6, team: 'Eintracht Frankfurt', played: 29, wins: 13, draws: 8, losses: 8, gf: 49, ga: 42, gd: 7, points: 47, form: ['D', 'W', 'L', 'W', 'D'] },
  ],
  ligue1: [
    { rank: 1, team: 'Paris Saint-Germain', played: 30, wins: 23, draws: 5, losses: 2, gf: 79, ga: 24, gd: 55, points: 74, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: 'Monaco', played: 30, wins: 18, draws: 7, losses: 5, gf: 59, ga: 33, gd: 26, points: 61, form: ['W', 'W', 'L', 'D', 'W'] },
    { rank: 3, team: 'Lille', played: 30, wins: 17, draws: 8, losses: 5, gf: 48, ga: 27, gd: 21, points: 59, form: ['W', 'D', 'W', 'W', 'L'] },
    { rank: 4, team: 'Marseille', played: 30, wins: 16, draws: 8, losses: 6, gf: 54, ga: 34, gd: 20, points: 56, form: ['W', 'L', 'W', 'W', 'D'] },
    { rank: 5, team: 'Nice', played: 30, wins: 15, draws: 7, losses: 8, gf: 41, ga: 29, gd: 12, points: 52, form: ['D', 'W', 'L', 'W', 'W'] },
    { rank: 6, team: 'Lyon', played: 30, wins: 14, draws: 6, losses: 10, gf: 47, ga: 39, gd: 8, points: 48, form: ['W', 'L', 'W', 'L', 'W'] },
  ],
  ucl: [
    { rank: 1, team: 'Real Madrid', played: 12, wins: 9, draws: 2, losses: 1, gf: 28, ga: 11, gd: 17, points: 29, form: ['W', 'W', 'D', 'W', 'W'] },
    { rank: 2, team: 'Manchester City', played: 12, wins: 8, draws: 3, losses: 1, gf: 26, ga: 12, gd: 14, points: 27, form: ['W', 'D', 'W', 'W', 'W'] },
    { rank: 3, team: 'Bayern Munich', played: 12, wins: 8, draws: 2, losses: 2, gf: 25, ga: 13, gd: 12, points: 26, form: ['W', 'W', 'L', 'W', 'D'] },
    { rank: 4, team: 'Barcelona', played: 12, wins: 7, draws: 3, losses: 2, gf: 24, ga: 14, gd: 10, points: 24, form: ['W', 'D', 'W', 'L', 'W'] },
    { rank: 5, team: 'Arsenal', played: 12, wins: 7, draws: 2, losses: 3, gf: 21, ga: 13, gd: 8, points: 23, form: ['L', 'W', 'W', 'W', 'D'] },
    { rank: 6, team: 'Inter', played: 12, wins: 6, draws: 3, losses: 3, gf: 20, ga: 14, gd: 6, points: 21, form: ['W', 'L', 'D', 'W', 'W'] },
  ],
};

const getTashkentDateKey = () =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const getCurrentFootballSeason = () => {
  const now = new Date();
  const month = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TASHKENT_TIMEZONE,
      month: '2-digit',
    }).format(now),
  );
  const year = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TASHKENT_TIMEZONE,
      year: 'numeric',
    }).format(now),
  );
  const startYear = month >= 7 ? year : year - 1;

  return {
    apiFootballSeason: String(startYear),
    sportsDbSeason: `${startYear}-${startYear + 1}`,
    label: `${startYear}/${String(startYear + 1).slice(-2)}`,
  };
};

const getAvailableFootballSeasons = (count = 5) => {
  const current = getCurrentFootballSeason();
  const currentStartYear = Number(current.apiFootballSeason);

  return Array.from({ length: count }, (_, index) => {
    const startYear = currentStartYear - index;

    return {
      apiFootballSeason: String(startYear),
      sportsDbSeason: `${startYear}-${startYear + 1}`,
      label: `${startYear}/${String(startYear + 1).slice(-2)}`,
    };
  });
};

const resolveFootballSeason = (requestedSeason = '') => {
  const normalizedRequestedSeason = String(requestedSeason || '').trim();
  const availableSeasons = getAvailableFootballSeasons();

  if (!normalizedRequestedSeason) {
    return {
      selectedSeason: availableSeasons[0],
      availableSeasons,
    };
  }

  const matchedSeason =
    availableSeasons.find(
      (season) =>
        season.label === normalizedRequestedSeason ||
        season.apiFootballSeason === normalizedRequestedSeason ||
        season.sportsDbSeason === normalizedRequestedSeason,
    ) || availableSeasons[0];

  return {
    selectedSeason: matchedSeason,
    availableSeasons,
  };
};

const stripHtml = (value = '') =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const replaceFootballTerms = (value = '') =>
  [
    [/UEFA Champions League/gi, 'UEFA Chempionlar ligasi'],
    [/Champions League/gi, 'Chempionlar ligasi'],
    [/UEFA Europa League/gi, 'UEFA Yevropa ligasi'],
    [/Europa League/gi, 'Yevropa ligasi'],
    [/UEFA Conference League/gi, 'UEFA Konferensiyalar ligasi'],
    [/Conference League/gi, 'Konferensiyalar ligasi'],
    [/\bPremier League\b/gi, 'Premyer liga'],
    [/\bLeague\b/gi, 'liga'],
    [/\bCup\b/gi, 'kubogi'],
    [/\bWomen\b/gi, 'Ayollar'],
    [/\bquarter-finals?\b/gi, 'chorak final'],
    [/\bsemi-finals?\b/gi, 'yarim final'],
    [/\bfinals?\b/gi, 'final'],
    [/build-up to/gi, 'oldidan'],
    [/deciders/gi, "hal qiluvchi o'yinlar"],
    [/set to conclude/gi, 'yakunlanadi'],
    [/confirmed/gi, 'tasdiqlandi'],
    [/line-up/gi, 'tarkib'],
    [/developing/gi, 'rivojlanmoqda'],
    [/youth competitions?/gi, 'yoshlar musobaqalari'],
    [/sustainable future/gi, 'barqaror kelajak'],
    [/net revenue/gi, 'sof daromad'],
    [/reinvest/gi, "qayta yo'naltiradi"],
    [/match finished/gi, "O'yin tugadi"],
    [/not started/gi, 'Boshlanmagan'],
    [/in progress/gi, 'Davom etmoqda'],
    [/\blive\b/gi, 'Jonli'],
    [/postponed/gi, 'Qoldirildi'],
    [/canceled/gi, 'Bekor qilindi'],
    [/cancelled/gi, 'Bekor qilindi'],
  ].reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), String(value || ''));

const normalizeText = (value = '') =>
  replaceFootballTerms(stripHtml(value))
    .replace(/\s+/g, ' ')
    .trim();

const isWomenFootballContent = (value = '') =>
  /women|women's|womans|female|ayollar/i.test(normalizeText(value));

const isWomenFootballLink = (value = '') =>
  /women|womenseuro|womenschampions/i.test(String(value || '').toLowerCase());

const normalizeKey = (value = '') =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/(^-|-$)/g, '');

const buildUzbekHeadline = (value = '', index = 0) => {
  const normalized = normalizeText(value);
  const lowered = normalized.toLowerCase();

  if (!normalized) {
    return `Futbol bo'yicha kunlik yangilik ${index + 1}`;
  }

  if (lowered.includes('chempionlar ligasi')) {
    return normalized.includes("muhim yangilik") ? normalized : `${normalized}`;
  }

  if (lowered.includes('transfer')) {
    return `Transfer bozori: ${normalized}`;
  }

  return normalized;
};

const buildUzbekDescription = (headline = '', description = '') => {
  const normalizedDescription = normalizeText(description);

  if (normalizedDescription) {
    return normalizedDescription;
  }

  const lowered = normalizeText(headline).toLowerCase();

  if (lowered.includes('transfer')) {
    return "Transfer bozori bo'yicha asosiy tafsilotlar, jamoalar qiziqishi va kutilayotgan qarorlar shu xabarda jamlandi.";
  }

  if (lowered.includes('jonli') || lowered.includes("o'yin")) {
    return "Bugungi futbol voqealari va uchrashuvlar bo'yicha muhim yangilik qisqacha Uzbekcha shaklda berildi.";
  }

  return "Futbol olamidagi eng muhim voqea va yangiliklar ushbu karta orqali qisqacha taqdim etildi.";
};

const categorizeNews = (value = '') => {
  const lowered = normalizeText(value).toLowerCase();

  if (lowered.includes('transfer')) return 'transfer';
  if (lowered.includes('tarkib') || lowered.includes('murabbiy')) return 'analysis';
  if (lowered.includes('jonli') || lowered.includes("o'yin") || lowered.includes('match')) return 'live';
  if (lowered.includes('chempionlar ligasi') || lowered.includes('premyer') || lowered.includes('liga')) {
    return 'featured';
  }

  return 'football';
};

const dedupeNewsItems = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${normalizeKey(item.title)}::${item.link || ''}`;

    if (!item.title || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const sortNewsItems = (items = []) =>
  [...items].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

const buildNewsPayload = (items = [], meta = {}) => ({
  items,
  fetchedAt: meta.fetchedAt || new Date().toISOString(),
  source: meta.source || 'fallback',
  fallbackUsed: Boolean(meta.fallbackUsed),
  tickerItems: items.slice(0, 10).map((item) => ({
    _id: item._id,
    title: item.title,
    link: item.link,
  })),
});

const buildMatchesPayload = (items = [], meta = {}) => ({
  items,
  fetchedAt: meta.fetchedAt || new Date().toISOString(),
  source: meta.source || 'fallback',
});

const mapStoredFallbackNews = (items = []) =>
  items.map((item, index) => ({
    _id: item._id || `stored-fallback-${index}`,
    title: buildUzbekHeadline(item.title, index),
    description: buildUzbekDescription(item.title, item.description),
    image: item.image || fallbackImages[index % fallbackImages.length],
    publishedAt: item.publishedAt || new Date().toISOString(),
    category: item.category || categorizeNews(item.title),
    sourceName: item.sourceName || "Sayt zaxira manbasi",
    link: item.link || '',
  }));

const mapGuardianArticle = (item, index) => ({
  _id: item.id || `guardian-${index}`,
  title: buildUzbekHeadline(item.webTitle, index),
  description: buildUzbekDescription(item.webTitle, item.fields?.trailText),
  image: item.fields?.thumbnail || fallbackImages[index % fallbackImages.length],
  publishedAt: item.webPublicationDate || new Date().toISOString(),
  category: categorizeNews(item.webTitle),
  sourceName: 'The Guardian',
  link: item.webUrl || '',
});

const mapNewsApiArticle = (item, index) => ({
  _id: `news-api-${normalizeKey(item.title) || index}`,
  title: buildUzbekHeadline(item.title, index),
  description: buildUzbekDescription(item.title, item.description || item.content),
  image: item.urlToImage || fallbackImages[index % fallbackImages.length],
  publishedAt: item.publishedAt || new Date().toISOString(),
  category: categorizeNews(item.title),
  sourceName: item.source?.name || 'NewsAPI',
  link: item.url || '',
});

const mapUefaHeadline = (item, index) => ({
  _id: `uefa-${index}-${normalizeKey(item.title)}`,
  title: buildUzbekHeadline(item.title, index),
  description: buildUzbekDescription(item.title),
  image: fallbackImages[index % fallbackImages.length],
  publishedAt: new Date().toISOString(),
  category: categorizeNews(item.title),
  sourceName: 'UEFA',
  link: item.href.startsWith('http') ? item.href : `${UEFA_BASE_URL}${item.href}`,
});

const formatTashkentTime = (value) => {
  const date = new Date(value || Date.now());

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TASHKENT_TIMEZONE,
  });
};

const formatTashkentDate = (value) => {
  const date = new Date(value || Date.now());

  if (Number.isNaN(date.getTime())) {
    return getTashkentDateKey();
  }

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TASHKENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const mapApiFootballMatch = (event) => ({
  _id: String(event.fixture?.id || `${event.teams?.home?.name}-${event.teams?.away?.name}`),
  league: normalizeText(event.league?.name || 'Futbol'),
  homeTeam: event.teams?.home?.name || 'Uy jamoasi',
  awayTeam: event.teams?.away?.name || 'Mehmon jamoa',
  status: normalizeText(event.fixture?.status?.long || event.fixture?.status?.short || ''),
  startTime: formatTashkentTime(event.fixture?.date),
  date: formatTashkentDate(event.fixture?.date),
  homeScore: event.goals?.home ?? null,
  awayScore: event.goals?.away ?? null,
  venue: normalizeText(event.fixture?.venue?.name || event.fixture?.venue?.city || ''),
  isLive: ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(event.fixture?.status?.short),
  leagueLogo: event.league?.logo || '',
  homeLogo: event.teams?.home?.logo || '',
  awayLogo: event.teams?.away?.logo || '',
});

const mapSportsDbMatch = (event, date) => ({
  _id: event.idEvent,
  league: normalizeText(event.strLeague || 'Futbol'),
  homeTeam: event.strHomeTeam || 'Uy jamoasi',
  awayTeam: event.strAwayTeam || 'Mehmon jamoa',
  status: normalizeText(event.strStatus || event.strProgress || ''),
  startTime: formatTashkentTime(
    event.strTimestamp || `${event.dateEvent || date}T${event.strTime || event.strTimeLocal || '00:00:00'}Z`,
  ),
  date: formatTashkentDate(event.strTimestamp || `${event.dateEvent || date}T12:00:00Z`),
  homeScore: event.intHomeScore ?? null,
  awayScore: event.intAwayScore ?? null,
  venue: normalizeText(event.strVenue || ''),
  isLive: ['1H', '2H', 'HT', 'ET', 'LIVE'].includes(event.strStatus),
  leagueLogo: '',
  homeLogo: event.strHomeTeamBadge || '',
  awayLogo: event.strAwayTeamBadge || '',
});

const normalizeForm = (value = '') =>
  String(value || '')
    .replace(/[^WDL]/gi, '')
    .toUpperCase()
    .split('')
    .slice(-5);

const mapApiFootballStanding = (item) => ({
  rank: Number(item.rank) || 0,
  team: normalizeText(item.team?.name || ''),
  teamLogo: item.team?.logo || '',
  played: Number(item.all?.played) || 0,
  wins: Number(item.all?.win) || 0,
  draws: Number(item.all?.draw) || 0,
  losses: Number(item.all?.lose) || 0,
  gf: Number(item.all?.goals?.for) || 0,
  ga: Number(item.all?.goals?.against) || 0,
  gd: Number(item.goalsDiff) || 0,
  points: Number(item.points) || 0,
  form: normalizeForm(item.form),
});

const mapSportsDbStanding = (item, index) => ({
  rank: Number(item.intRank) || index + 1,
  team: normalizeText(item.strTeam || ''),
  teamLogo: item.strBadge || item.strTeamBadge || '',
  played: Number(item.intPlayed) || 0,
  wins: Number(item.intWin) || 0,
  draws: Number(item.intDraw) || 0,
  losses: Number(item.intLoss) || 0,
  gf: Number(item.intGoalsFor) || 0,
  ga: Number(item.intGoalsAgainst) || 0,
  gd: Number(item.intGoalDifference) || 0,
  points: Number(item.intPoints) || 0,
  form: normalizeForm(item.strForm),
});

const sortStandings = (items = []) =>
  [...items].sort((left, right) => {
    if (left.rank && right.rank && left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    if (left.points !== right.points) {
      return right.points - left.points;
    }

    return right.gd - left.gd;
  });

const buildStandingsPayload = (items = [], meta = {}) => ({
  items,
  fetchedAt: meta.fetchedAt || new Date().toISOString(),
  source: meta.source || 'fallback',
  season: meta.season || getCurrentFootballSeason().label,
  league: meta.league || 'La Liga',
  availableSeasons: meta.availableSeasons || getAvailableFootballSeasons().map((season) => season.label),
});

const sortMatches = (items = []) =>
  [...items].sort((left, right) => {
    const leftPriority = left.isLive ? 0 : left.homeScore !== null || left.awayScore !== null ? 1 : 2;
    const rightPriority = right.isLive ? 0 : right.homeScore !== null || right.awayScore !== null ? 1 : 2;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return `${left.date} ${left.startTime}`.localeCompare(`${right.date} ${right.startTime}`);
  });

const fetchGuardianFootballNews = async () => {
  if (!process.env.GUARDIAN_API_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    section: 'football',
    'page-size': '12',
    'order-by': 'newest',
    'show-fields': 'thumbnail,trailText',
    'api-key': process.env.GUARDIAN_API_KEY,
  });

  const response = await fetch(`${GUARDIAN_CONTENT_URL}?${params.toString()}`, {
    headers: { 'User-Agent': 'Goalix/1.0' },
  });

  if (!response.ok) {
    throw new Error('Guardian football news fetch failed');
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.response?.results) ? payload.response.results : [];

  return items.map(mapGuardianArticle);
};

const fetchNewsApiFootballNews = async () => {
  if (!process.env.NEWS_API_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    q: 'football OR soccer',
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: '12',
  });

  const response = await fetch(`${NEWS_API_URL}?${params.toString()}`, {
    headers: {
      'X-Api-Key': process.env.NEWS_API_KEY,
      'User-Agent': 'Goalix/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('NewsAPI football fetch failed');
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.articles) ? payload.articles : [];

  return items.map(mapNewsApiArticle);
};

const fetchUefaFootballNews = async () => {
  const response = await fetch(UEFA_HOME_URL, {
    headers: {
      'User-Agent': 'Goalix/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('UEFA football news fetch failed');
  }

  const html = await response.text();
  const anchors = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gims)];
  const usedTitles = new Set();

  return anchors
    .map(([, href, inner]) => ({
      href,
      title: stripHtml(inner),
    }))
    .filter((item) => {
      const normalizedTitle = normalizeText(item.title);
      const lowered = normalizedTitle.toLowerCase();

      if (!item.href || !normalizedTitle || normalizedTitle.length < 24 || normalizedTitle.length > 120) {
        return false;
      }

      if (
        lowered.includes('learn more') ||
        lowered.includes('skip to main content') ||
        lowered.includes('uefa.com works better') ||
        isWomenFootballContent(normalizedTitle) ||
        isWomenFootballLink(item.href)
      ) {
        return false;
      }

      if (usedTitles.has(normalizedTitle)) {
        return false;
      }

      usedTitles.add(normalizedTitle);
      return true;
    })
    .slice(0, 10)
    .map(mapUefaHeadline);
};

const fetchFromApiFootball = async (dateKey) => {
  if (!process.env.API_FOOTBALL_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    date: dateKey,
    timezone: 'Asia/Tashkent',
  });

  const response = await fetch(`${API_FOOTBALL_FIXTURES_URL}?${params.toString()}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY,
      'User-Agent': 'Goalix/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('API Football fixtures fetch failed');
  }

  const payload = await response.json();
  const fixtures = Array.isArray(payload?.response) ? payload.response : [];

  return fixtures
    .filter(
      (fixture) =>
        !isWomenFootballContent(
          `${fixture.league?.name || ''} ${fixture.teams?.home?.name || ''} ${fixture.teams?.away?.name || ''}`,
        ),
    )
    .map(mapApiFootballMatch);
};

const fetchFromSportsDb = async (dateKey) => {
  const response = await fetch(`${SPORTS_DB_EVENTS_URL}?d=${dateKey}&s=Soccer`, {
    headers: { 'User-Agent': 'Goalix/1.0' },
  });

  if (!response.ok) {
    throw new Error('TheSportsDB fixtures fetch failed');
  }

  const payload = await response.json();
  const events = Array.isArray(payload?.events) ? payload.events : [];

  return events
    .filter(
      (event) =>
        !isWomenFootballContent(
          `${event.strLeague || ''} ${event.strHomeTeam || ''} ${event.strAwayTeam || ''}`,
        ),
    )
    .map((event) => mapSportsDbMatch(event, dateKey));
};

const fetchStandingsFromApiFootball = async (leagueKey, season) => {
  const leagueConfig = LEAGUE_CONFIG[leagueKey];

  if (!process.env.API_FOOTBALL_KEY || !leagueConfig) {
    return [];
  }

  const params = new URLSearchParams({
    league: String(leagueConfig.id),
    season: season.apiFootballSeason,
  });

  const response = await fetch(`${API_FOOTBALL_STANDINGS_URL}?${params.toString()}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY,
      'User-Agent': 'Goalix/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('API Football standings fetch failed');
  }

  const payload = await response.json();
  const table = payload?.response?.[0]?.league?.standings?.[0];

  if (!Array.isArray(table)) {
    return [];
  }

  return table
    .filter((item) => !isWomenFootballContent(item.team?.name || ''))
    .map(mapApiFootballStanding);
};

const fetchStandingsFromSportsDb = async (leagueKey, season) => {
  const leagueConfig = LEAGUE_CONFIG[leagueKey];

  if (!leagueConfig?.sportsDbId) {
    return [];
  }

  const params = new URLSearchParams({
    l: String(leagueConfig.sportsDbId),
    s: season.sportsDbSeason,
  });

  const response = await fetch(`${SPORTS_DB_TABLE_URL}?${params.toString()}`, {
    headers: { 'User-Agent': 'Goalix/1.0' },
  });

  if (!response.ok) {
    throw new Error('TheSportsDB standings fetch failed');
  }

  const payload = await response.json();
  const table = Array.isArray(payload?.table) ? payload.table : [];

  return table
    .filter((item) => !isWomenFootballContent(item.strTeam || ''))
    .map(mapSportsDbStanding);
};

const buildFallbackNews = (fallbackNews = []) => {
  const storedFallback = mapStoredFallbackNews(fallbackNews).filter(
    (item) =>
      !isWomenFootballContent(item.title) &&
      !isWomenFootballContent(item.description) &&
      !isWomenFootballLink(item.link),
  );
  const combined = storedFallback.length ? storedFallback : builtInFallbackNews;

  return dedupeNewsItems(sortNewsItems(combined)).slice(0, MAX_NEWS_ITEMS);
};

export const getFootballNewsFeed = async ({ limit = MAX_NEWS_ITEMS, fallbackNews = [] } = {}) => {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || MAX_NEWS_ITEMS, MAX_NEWS_ITEMS));
  const dayKey = getTashkentDateKey();

  if (newsCache.dayKey === dayKey && newsCache.items.length) {
    return buildNewsPayload(newsCache.items.slice(0, normalizedLimit), newsCache);
  }

  const fallbackItems = buildFallbackNews(fallbackNews);
  const providers = [
    { source: 'guardian', fetcher: fetchGuardianFootballNews },
    { source: 'newsapi', fetcher: fetchNewsApiFootballNews },
    { source: 'uefa', fetcher: fetchUefaFootballNews },
  ];

  for (const provider of providers) {
    try {
      const items = dedupeNewsItems(
        sortNewsItems(await provider.fetcher()).filter(
          (item) =>
            !isWomenFootballContent(item.title) &&
            !isWomenFootballContent(item.description) &&
            !isWomenFootballLink(item.link),
        ),
      ).slice(0, MAX_NEWS_ITEMS);

      if (items.length) {
        const nextCache = {
          dayKey,
          items,
          fetchedAt: new Date().toISOString(),
          source: provider.source,
          fallbackUsed: false,
        };

        newsCache.dayKey = nextCache.dayKey;
        newsCache.items = nextCache.items;
        newsCache.fetchedAt = nextCache.fetchedAt;
        newsCache.source = nextCache.source;
        newsCache.fallbackUsed = nextCache.fallbackUsed;

        await replaceNews(items).catch(() => null);

        return buildNewsPayload(items.slice(0, normalizedLimit), nextCache);
      }
    } catch {
      // Keyinroq zaxira manbaga o'tish uchun xatoni jim qoldiramiz.
    }
  }

  const fallbackCache = {
    dayKey,
    items: fallbackItems,
    fetchedAt: new Date().toISOString(),
    source: 'fallback',
    fallbackUsed: true,
  };

  newsCache.dayKey = fallbackCache.dayKey;
  newsCache.items = fallbackCache.items;
  newsCache.fetchedAt = fallbackCache.fetchedAt;
  newsCache.source = fallbackCache.source;
  newsCache.fallbackUsed = fallbackCache.fallbackUsed;

  return buildNewsPayload(fallbackItems.slice(0, normalizedLimit), fallbackCache);
};

export const getFootballMatchesFeed = async ({ limit = MAX_MATCH_ITEMS } = {}) => {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || MAX_MATCH_ITEMS, MAX_MATCH_ITEMS));
  const dateKey = getTashkentDateKey();
  const cacheKey = `${dateKey}:${Math.floor(Date.now() / MATCH_CACHE_TTL_MS)}`;

  if (matchCache.cacheKey === cacheKey && matchCache.items.length) {
    return buildMatchesPayload(matchCache.items.slice(0, normalizedLimit), matchCache);
  }

  const providers = [
    { source: 'api-football', fetcher: () => fetchFromApiFootball(dateKey) },
    { source: 'thesportsdb', fetcher: () => fetchFromSportsDb(dateKey) },
  ];

  for (const provider of providers) {
    try {
      const items = sortMatches(await provider.fetcher()).slice(0, MAX_MATCH_ITEMS);

      if (items.length) {
        matchCache.cacheKey = cacheKey;
        matchCache.items = items;
        matchCache.fetchedAt = new Date().toISOString();
        matchCache.source = provider.source;

        return buildMatchesPayload(items.slice(0, normalizedLimit), matchCache);
      }
    } catch {
      // Jonli sport manbasi ishlamasa, keyingi manbani sinab ko'ramiz.
    }
  }

  const fallbackMatches = builtInFallbackMatches.slice(0, normalizedLimit);

  matchCache.cacheKey = cacheKey;
  matchCache.items = fallbackMatches;
  matchCache.fetchedAt = new Date().toISOString();
  matchCache.source = 'fallback';

  return buildMatchesPayload(fallbackMatches, matchCache);
};

export const getLeagueStandingsFeed = async ({
  league = 'laliga',
  limit = MAX_STANDINGS_ITEMS,
  season: requestedSeason = '',
} = {}) => {
  const normalizedLeague = LEAGUE_CONFIG[league] ? league : 'laliga';
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || MAX_STANDINGS_ITEMS, MAX_STANDINGS_ITEMS));
  const { selectedSeason, availableSeasons } = resolveFootballSeason(requestedSeason);
  const cacheKey = `${normalizedLeague}:${selectedSeason.label}:${Math.floor(Date.now() / STANDINGS_CACHE_TTL_MS)}`;
  const cacheMapKey = `${normalizedLeague}:${selectedSeason.label}`;
  const cached = standingsCache.get(cacheMapKey);

  if (cached?.cacheKey === cacheKey && cached.items.length) {
    return buildStandingsPayload(cached.items.slice(0, normalizedLimit), cached);
  }

  const providers = [
    { source: 'api-football', fetcher: () => fetchStandingsFromApiFootball(normalizedLeague, selectedSeason) },
    { source: 'thesportsdb', fetcher: () => fetchStandingsFromSportsDb(normalizedLeague, selectedSeason) },
  ];

  for (const provider of providers) {
    try {
      const items = sortStandings(await provider.fetcher()).slice(0, MAX_STANDINGS_ITEMS);

      if (items.length) {
        const payload = {
          cacheKey,
          items,
          fetchedAt: new Date().toISOString(),
          source: provider.source,
          season: selectedSeason.label,
          league: LEAGUE_CONFIG[normalizedLeague].label,
          availableSeasons: availableSeasons.map((item) => item.label),
        };

        standingsCache.set(cacheMapKey, payload);
        return buildStandingsPayload(items.slice(0, normalizedLimit), payload);
      }
    } catch {
      // Agar asosiy manba ishlamasa, keyingi manbani sinab ko'ramiz.
    }
  }

  const fallbackPayload = {
    cacheKey,
    items: builtInFallbackStandings[normalizedLeague] || builtInFallbackStandings.laliga,
    fetchedAt: new Date().toISOString(),
    source: 'fallback',
    season: selectedSeason.label,
    league: LEAGUE_CONFIG[normalizedLeague].label,
    availableSeasons: availableSeasons.map((item) => item.label),
  };

  standingsCache.set(cacheMapKey, fallbackPayload);

  return buildStandingsPayload(fallbackPayload.items.slice(0, normalizedLimit), fallbackPayload);
};
