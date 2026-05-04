import { CalendarDays, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { useI18n } from '../hooks/useI18n';
import { stadiumService } from '../services/stadiumService';
import { getCityLabelKey } from '../utils/display';
import {
  formatCurrency,
  formatScheduleDate,
  getTimePeriodLabelKey,
  getTodayDateInUzbekistan,
} from '../utils/formatters';

export function DailyMatchesPanel({ stadiums = [] }) {
  const { t } = useI18n();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadMatches = async () => {
      if (!stadiums.length) {
        if (active) {
          setMatches([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const date = getTodayDateInUzbekistan();
      const results = await Promise.allSettled(
        stadiums.slice(0, 6).map(async (stadium) => {
          const response = await stadiumService.availability(stadium._id, date);
          const availableSlots = (response.slots || []).filter((slot) => slot.available);

          return {
            stadium,
            date,
            slots: availableSlots.slice(0, 4),
            totalAvailable: availableSlots.length,
          };
        }),
      );

      if (!active) {
        return;
      }

      setMatches(
        results
          .filter((result) => result.status === 'fulfilled' && result.value.totalAvailable > 0)
          .map((result) => result.value)
          .sort((left, right) => right.totalAvailable - left.totalAvailable),
      );
      setLoading(false);
    };

    loadMatches();

    return () => {
      active = false;
    };
  }, [stadiums]);

  if (loading) {
    return <LoadingSpinner label={t('home.dailyMatchesTitle')} />;
  }

  if (!matches.length) {
    return (
      <EmptyState
        title={t('empty.noDailyMatches')}
        description={t('empty.noDailyMatchesDescription')}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {matches.map(({ stadium, date, slots, totalAvailable }) => (
        <article key={`${stadium._id}-${date}`} className="app-card football-card space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="app-badge">{t(getCityLabelKey(stadium.location.city))}</p>
              <div className="min-w-0">
                <h3 className="heading-font text-2xl font-semibold text-white">{stadium.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-400">{stadium.description}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-green-300">
                {t('home.dailyMatchesPrice')}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(stadium.price)}</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-300" />
              <span>{formatScheduleDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-300" />
              <span>{stadium.owner?.fullName || t('cards.ownerProfile')}</span>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-300" />
              <span>{stadium.location.address}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{t('home.dailyMatchesAvailable')}</p>
              <p className="text-xs text-green-300">
                {t('home.dailyMatchesCount', { count: totalAvailable })}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <span
                  key={slot.id}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-sm text-green-200"
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {t(getTimePeriodLabelKey(slot.startTime))}: {slot.startTime} - {slot.endTime}
                </span>
              ))}
              {totalAvailable > slots.length ? (
                <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 text-sm text-gray-300">
                  {t('home.dailyMatchesMore', { count: totalAvailable - slots.length })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={`/stadiums/${stadium._id}`} className="app-button">
              {t('buttons.viewStadium')}
            </Link>
            <Link to={`/booking/${stadium._id}`} className="app-button-secondary">
              {t('buttons.bookNow')}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
