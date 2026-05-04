import { BarChart3, Goal, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Hero } from '../components/Hero';
import { contentService } from '../services/contentService';
import { stadiumService } from '../services/stadiumService';
import { formatCurrency } from '../utils/formatters';
import { stadiumPlaceholderImage } from '../utils/placeholders';

const fallbackNews = [
  {
    _id: 'news-1',
    title: "GoalX local derby night",
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    link: 'https://www.fifa.com/',
  },
  {
    _id: 'news-2',
    title: 'Transfer window goes electric',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
    link: 'https://www.uefa.com/',
  },
  {
    _id: 'news-3',
    title: 'Matchday visuals, rebuilt dark',
    image: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80',
    link: 'https://www.espn.com/soccer/',
  },
];

const fallbackStadiums = [
  {
    _id: 'stadium-1',
    name: 'Tashkent Night Arena',
    price: 420000,
    images: ['https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    _id: 'stadium-2',
    name: 'Samarkand Elite Dome',
    price: 360000,
    images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80'],
  },
  {
    _id: 'stadium-3',
    name: 'Fergana X Complex',
    price: 315000,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80'],
  },
];

const featureTiles = [
  { icon: Goal, label: 'Quick Booking' },
  { icon: BarChart3, label: 'Live Stats' },
  { icon: Newspaper, label: 'Match News' },
];

const sectionMotion = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

function Tile({ icon: Icon, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 22px 40px rgba(0, 0, 0, 0.28)' }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-[#111827] p-5 ring-1 ring-white/5 hover:ring-[#00C26F]"
    >
      <Icon className="h-6 w-6 text-[#C8FF00]" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-white">{label}</p>
    </motion.div>
  );
}

function NewsCard({ article }) {
  return (
    <motion.a
      href={article.link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02, boxShadow: '0 22px 40px rgba(0, 0, 0, 0.28)' }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 rounded-2xl bg-[#111827] p-3 ring-1 ring-white/5 hover:ring-[#00C26F]"
    >
      <img
        src={article.image || fallbackNews[0].image}
        alt={article.title}
        className="h-24 w-28 rounded-xl object-cover sm:h-28 sm:w-36"
      />
      <h3 className="heading-font text-2xl uppercase leading-none text-white sm:text-3xl">
        {article.title}
      </h3>
    </motion.a>
  );
}

function StadiumCard({ stadium }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02, boxShadow: '0 28px 56px rgba(0, 0, 0, 0.3)' }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl bg-[#111827] ring-1 ring-white/5 hover:ring-[#00C26F]"
    >
      <img
        src={stadium.images?.[0] || stadiumPlaceholderImage}
        alt={stadium.name}
        className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <h3 className="heading-font max-w-[70%] text-3xl uppercase leading-none text-white sm:text-4xl">
          {stadium.name}
        </h3>
        <span className="rounded-full bg-[#C8FF00] px-4 py-2 text-sm font-bold text-black">
          {formatCurrency(stadium.price || 300000)}
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4">
        <Link
          to={`/stadiums/${stadium._id}`}
          className="inline-flex rounded-full bg-[#00C26F] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black"
        >
          Band Qil
        </Link>
      </div>
    </motion.article>
  );
}

function NewsSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#111827] p-3 ring-1 ring-white/5 animate-pulse">
      <div className="h-24 w-28 rounded-xl bg-white/10 sm:h-28 sm:w-36" />
      <div className="h-8 w-40 rounded-full bg-white/10 sm:h-10 sm:w-56" />
    </div>
  );
}

function StadiumSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#111827] ring-1 ring-white/5 animate-pulse">
      <div className="h-[420px] w-full bg-white/10" />
    </div>
  );
}

export function HomePage() {
  const [stadiums, setStadiums] = useState(fallbackStadiums);
  const [news, setNews] = useState(fallbackNews);
  const [loading, setLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    setLoading(true);

    try {
      const [stadiumResult, newsResult] = await Promise.allSettled([
        stadiumService.list(),
        contentService.news({ limit: 3 }),
      ]);

      if (stadiumResult.status === 'fulfilled' && Array.isArray(stadiumResult.value) && stadiumResult.value.length) {
        setStadiums(stadiumResult.value.slice(0, 3));
      }

      if (newsResult.status === 'fulfilled' && Array.isArray(newsResult.value?.items) && newsResult.value.items.length) {
        setNews(
          newsResult.value.items.slice(0, 3).map((item, index) => ({
            _id: item._id || `news-${index}`,
            title: item.title || fallbackNews[index]?.title || 'GoalX story',
            image: item.image || fallbackNews[index]?.image || fallbackNews[0].image,
            link: item.link || fallbackNews[index]?.link || fallbackNews[0].link,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 pb-10"
    >
      <Hero />

      <motion.section {...sectionMotion} className="grid gap-4 sm:grid-cols-3">
        {featureTiles.map((tile) => (
          <Tile key={tile.label} icon={tile.icon} label={tile.label} />
        ))}
      </motion.section>

      <motion.section id="latest-news" {...sectionMotion} className="space-y-4">
        <h2 className="heading-font text-4xl uppercase text-white sm:text-5xl">Latest News</h2>
        <div className="grid gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <NewsSkeleton key={`news-skeleton-${index}`} />)
            : news.map((article) => <NewsCard key={article._id} article={article} />)}
        </div>
      </motion.section>

      <motion.section {...sectionMotion} className="space-y-4">
        <h2 className="heading-font text-4xl uppercase text-white sm:text-5xl">Featured Stadiums</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <StadiumSkeleton key={`stadium-skeleton-${index}`} />)
            : stadiums.map((stadium) => <StadiumCard key={stadium._id} stadium={stadium} />)}
        </div>
      </motion.section>
    </motion.div>
  );
}
