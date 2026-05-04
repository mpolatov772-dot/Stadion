import { CalendarDays, MapPin, ShieldCheck, Star, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Link } from 'react-router-dom';

import { useI18n } from '../hooks/useI18n';
import { getCityLabelKey } from '../utils/display';
import { formatCurrency } from '../utils/formatters';
import { stadiumPlaceholderImage } from '../utils/placeholders';

export function StadiumCard({ stadium }) {
  const { t } = useI18n();
  const rating = stadium.rating || 4.8;
  const availability = stadium.availability || 'Tonight';
  const surface = stadium.surfaceType || stadium.surface || 'Grass';

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.12} glareColor="#ffffff">
      <motion.article
        whileHover={{ y: -8 }}
        transition={{ duration: 0.25 }}
        className="group overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      >
        <div className="relative overflow-hidden">
          <img
            src={stadium.images?.[0] || stadium.image || stadiumPlaceholderImage}
            alt={stadium.name}
            className="h-56 w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-[#04060a]/10 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/12 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">
              {t(getCityLabelKey(stadium.location?.city || 'tashkent'))}
            </span>
            <span className="rounded-full border border-[#00FF87]/20 bg-[#00FF87]/12 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8cffc2]">
              {availability}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="heading-font text-3xl uppercase leading-none text-white">{stadium.name}</h3>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-[#00FF87]" />
                <span>{stadium.location?.address || 'Uzbekistan football district'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">From</p>
              <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(stadium.price || 350000)}</p>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-7 text-gray-400">
            {stadium.description || 'High-energy football venue with premium turf, night lighting, and fast booking flow.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[#8cffc2]">
                <Star className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">Rating</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">{rating}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[#8cffc2]">
                <Waves className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">Surface</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">{surface}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[#8cffc2]">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">Owner</span>
              </div>
              <p className="mt-2 truncate text-lg font-semibold text-white">
                {stadium.owner?.fullName || t('cards.ownerProfile')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-300">
              <ShieldCheck className="h-4 w-4 text-[#00FF87]" />
              Verified venue
            </div>
            <Link
              to={`/stadiums/${stadium._id}`}
              className="goalx-ripple inline-flex items-center rounded-full bg-[#00FF87] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(0,255,135,0.22)] hover:brightness-110"
            >
              Band Qilish
            </Link>
          </div>
        </div>
      </motion.article>
    </Tilt>
  );
}
