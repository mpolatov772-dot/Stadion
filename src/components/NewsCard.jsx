import { ArrowUpRight, Clock3, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useI18n } from '../hooks/useI18n';
import { formatDate } from '../utils/formatters';

const categoryStyles = {
  transfer: 'bg-sky-500/12 text-sky-200 border-sky-400/20',
  transfers: 'bg-sky-500/12 text-sky-200 border-sky-400/20',
  results: 'bg-amber-500/12 text-amber-200 border-amber-400/20',
  local: 'bg-emerald-500/12 text-emerald-200 border-emerald-400/20',
  international: 'bg-fuchsia-500/12 text-fuchsia-200 border-fuchsia-400/20',
  analysis: 'bg-violet-500/12 text-violet-200 border-violet-400/20',
};

const estimateReadTime = (article) => {
  const wordCount = `${article.title || ''} ${article.description || ''}`.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(wordCount / 45));
};

export function NewsCard({ article }) {
  const { t } = useI18n();
  const category = article.category || 'international';
  const readTime = estimateReadTime(article);
  const categoryClass = categoryStyles[category] || 'bg-white/8 text-white border-white/10';

  const handleShare = async () => {
    const url = article.link || window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.description, url });
        return;
      }

      await navigator.clipboard.writeText(url);
    } catch {
      return undefined;
    }

    return undefined;
  };

  return (
    <motion.article
      whileHover={{ y: -8, boxShadow: '0 24px 64px rgba(0, 0, 0, 0.32)' }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] backdrop-blur-2xl"
    >
      <div className="relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-60 w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030509] via-[#030509]/15 to-transparent" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${categoryClass}`}>
            {t(`newsCategories.${category}`)}
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/90 hover:border-[#00FF87]/30 hover:text-[#00FF87]"
            aria-label="share article"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-gray-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#00FF87]" />
            {readTime} min
          </span>
        </div>
        <h3 className="heading-font text-3xl uppercase leading-tight text-white">{article.title}</h3>
        <p className="line-clamp-3 text-sm leading-7 text-gray-400">{article.description}</p>
        {article.link ? (
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8cffc2] transition hover:text-white"
          >
            Read story
            <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}
