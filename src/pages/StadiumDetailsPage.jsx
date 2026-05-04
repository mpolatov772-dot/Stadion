import { CalendarDays, Clock3, MapPin, ShieldCheck, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { BlockedRestrictionCard } from '../components/BlockedRestrictionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapSection } from '../components/MapSection';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { stadiumService } from '../services/stadiumService';
import { hasActiveBlockRestriction } from '../utils/blocking';
import { buildTelegramLink, buildStadiumTelegramText } from '../utils/telegram';
import { getCityLabelKey } from '../utils/display';
import { formatCurrency, getTimePeriodLabelKey } from '../utils/formatters';
import { stadiumPlaceholderImage } from '../utils/placeholders';
import { getWorkingHoursSummary } from '../utils/workingHours';

export function StadiumDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [stadium, setStadium] = useState(null);
  const isBlocked = hasActiveBlockRestriction(user);

  useEffect(() => {
    const loadStadium = async () => {
      setStadium(await stadiumService.details(id));
    };

    loadStadium();
  }, [id]);

  const workingHours = useMemo(
    () => (stadium ? getWorkingHoursSummary(stadium.workingHours, t) : []),
    [stadium, t],
  );

  if (!stadium) {
    return <LoadingSpinner label={t('buttons.viewStadium')} />;
  }

  const telegramUrl = buildTelegramLink(
    buildStadiumTelegramText({
      stadium,
      user,
    }),
    stadium.owner?.businessProfile?.telegram,
  );

  return (
    <div className="space-y-6">
      {isBlocked ? <BlockedRestrictionCard /> : null}

      <PageHeader
        eyebrow={t(getCityLabelKey(stadium.location.city))}
        title={stadium.name}
        description={stadium.description}
      />

      <section className="app-card overflow-hidden p-0">
        <img
          src={stadium.images?.[0] || stadiumPlaceholderImage}
          alt={stadium.name}
          className="h-[360px] w-full object-cover"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="app-card grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">{t('stadiumDetails.slotPrice')}</p>
              <p className="mt-2 heading-font text-3xl font-semibold text-green-300">
                {formatCurrency(stadium.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('stadiumDetails.owner')}</p>
              <p className="mt-2 text-lg font-medium text-white">{stadium.owner?.fullName}</p>
              <p className="mt-2 text-sm text-gray-400">{stadium.owner?.phone || t('common.noData')}</p>
              <p className="mt-1 text-sm text-gray-500">
                {stadium.owner?.businessProfile?.telegram || '@tohtasinov10'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4 text-green-300" />
              <span>{stadium.location.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <ShieldCheck className="h-4 w-4 text-green-300" />
              <span>{t('cards.workingHoursShort')}</span>
            </div>
          </div>

          <div className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('stadiumDetails.equipment')}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {stadium.equipment.map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-sm text-gray-300">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('stadiumDetails.bookingSupport')}</h3>
            <p className="mt-2 text-sm text-gray-400">
              {isBlocked
                ? t('blockedGate.description')
                : t('bookingPage.telegramHint', {
                    username: stadium.owner?.businessProfile?.telegram || '@tohtasinov10',
                  })}
            </p>
            {isBlocked ? (
              <Link to="/requests" className="app-button mt-4">
                {t('blockedGate.action')}
              </Link>
            ) : (
              <a href={telegramUrl} target="_blank" rel="noreferrer" className="app-button mt-4">
                <Send className="mr-2 h-4 w-4" />
                {t('buttons.sendToTelegram')}
              </a>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MapSection stadiums={[stadium]} />

          <div className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('stadiumDetails.workingHours')}</h3>
            <p className="mt-2 text-sm text-gray-400">{t('stadiumDetails.workingHoursHint')}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {workingHours.length ? (
                workingHours.map((item) => (
                  <div key={item.key} className="rounded-xl border border-white/10 px-4 py-3">
                    <p className="flex items-center gap-2 text-white">
                      <CalendarDays className="h-4 w-4 text-green-300" />
                      {item.label}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                      <Clock3 className="h-4 w-4 text-green-300" />
                      {t(getTimePeriodLabelKey(item.value.startTime))}: {item.value.startTime} - {item.value.endTime}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">{t('stadiumDetails.noWorkingHours')}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="app-card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-green-300">{t('bookingPage.eyebrow')}</p>
            <h3 className="mt-2 heading-font text-3xl font-semibold text-white">{t('stadiumDetails.bookingCardTitle')}</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">{t('stadiumDetails.bookingCardDescription')}</p>
          </div>
          <Link
            to={
              !isAuthenticated
                ? '/login'
                : isBlocked
                  ? '/requests'
                  : `/booking/${stadium._id}`
            }
            className="app-button football-button w-full md:w-auto"
          >
            {!isAuthenticated
              ? t('buttons.loginToBook')
              : isBlocked
                ? t('blockedGate.action')
                : t('buttons.bookNow')}
          </Link>
        </div>
      </section>
    </div>
  );
}
