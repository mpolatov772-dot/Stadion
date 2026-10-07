import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { StarRating } from './StarRating';
import { useI18n } from '../hooks/useI18n';
import { getCityLabelKey } from '../utils/display';
import { formatCurrency } from '../utils/formatters';
import { stadiumPlaceholderImage } from '../utils/placeholders';

export function StadiumCard({ stadium }) {
  const { t } = useI18n();
  const ratingAverage = Number(stadium.ratingAverage || 0);
  const ratingCount = Number(stadium.ratingCount || 0);

  return (
    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="relative overflow-hidden">
        <img
          src={stadium.images?.[0] || stadium.image || stadiumPlaceholderImage}
          alt={stadium.name}
          className="h-44 w-full object-cover sm:h-56"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-[#04060a]/10 to-transparent" />
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <span className="rounded-full border border-white/12 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
            {t(getCityLabelKey(stadium.location?.city || 'Tashkent'))}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <h3 className="heading-font truncate text-2xl uppercase leading-tight text-white sm:text-3xl">
              {stadium.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4 shrink-0 text-[#00FF87]" />
              <span className="truncate">{stadium.location?.address || t('common.noData')}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{t('cards.perSlot')}</p>
            <p className="mt-1 whitespace-nowrap text-xl font-bold text-white sm:text-2xl">
              {formatCurrency(stadium.price || 0)}
            </p>
          </div>
        </div>

        {stadium.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-gray-400">{stadium.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StarRating value={ratingAverage} size={16} />
            <span className="text-sm text-gray-300">
              {ratingCount ? ratingAverage.toFixed(1) : t('cards.noRatingsYet')}
              {ratingCount ? <span className="ml-1 text-gray-500">({ratingCount})</span> : null}
            </span>
          </div>
          <p className="truncate text-sm text-gray-400">
            {stadium.owner?.fullName || t('cards.ownerProfile')}
          </p>
        </div>

        <Link
          to={`/stadiums/${stadium._id}`}
          className="flex items-center justify-center rounded-full bg-[#00FF87] px-5 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(0,255,135,0.22)]"
        >
          {t('buttons.viewStadium')}
        </Link>
      </div>
    </article>
  );
}
