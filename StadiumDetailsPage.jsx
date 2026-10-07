import { CalendarDays, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapSection } from '../components/MapSection';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { stadiumService } from '../services/stadiumService';
import { getApiErrorMessage } from '../utils/apiError';
import { getCityLabelKey } from '../utils/display';
import { formatCurrency, getTimePeriodLabelKey } from '../utils/formatters';
import { stadiumPlaceholderImage } from '../utils/placeholders';
import { getWorkingHoursSummary } from '../utils/workingHours';

export function StadiumDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [stadium, setStadium] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const loadStadium = async () => {
      setStadium(await stadiumService.details(id));
    };

    loadStadium();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyRating(null);
      return;
    }

    const loadMyRating = async () => {
      const response = await stadiumService.myRating(id);
      setMyRating(response.rating);
    };

    loadMyRating();
  }, [id, isAuthenticated]);

  const workingHours = useMemo(
    () => (stadium ? getWorkingHoursSummary(stadium.workingHours, t) : []),
    [stadium, t],
  );

  const handleRate = async (rating) => {
    setSubmittingRating(true);
    try {
      const response = await stadiumService.submitRating(id, rating);
      setMyRating(rating);
      setStadium((current) => ({
        ...current,
        ratingAverage: response.average,
        ratingCount: response.count,
      }));
      toast.success(t('messages.ratingSubmitted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.submitRatingFailed'));
    } finally {
      setSubmittingRating(false);
    }
  };

  if (!stadium) {
    return <LoadingSpinner label={t('buttons.viewStadium')} />;
  }

  const ratingAverage = Number(stadium.ratingAverage || 0);
  const ratingCount = Number(stadium.ratingCount || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t(getCityLabelKey(stadium.location.city))}
        title={stadium.name}
        description={stadium.description}
      />

      <section className="app-card overflow-hidden p-0">
        <img
          src={stadium.images?.[0] || stadiumPlaceholderImage}
          alt={stadium.name}
          className="h-56 w-full object-cover sm:h-[360px]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="app-card grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">{t('stadiumDetails.slotPrice')}</p>
              <p className="mt-2 heading-font text-3xl font-semibold text-green-300">
                {formatCurrency(stadium.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('stadiumDetails.rating')}</p>
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={ratingAverage} size={18} />
                <span className="text-sm text-gray-300">
                  {ratingCount ? `${ratingAverage.toFixed(1)} (${ratingCount})` : t('cards.noRatingsYet')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('stadiumDetails.owner')}</p>
              <p className="mt-2 text-lg font-medium text-white">{stadium.owner?.fullName}</p>
              <p className="mt-2 text-sm text-gray-400">{stadium.owner?.phone || t('common.noData')}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4 shrink-0 text-green-300" />
              <span className="min-w-0 break-words">{stadium.location.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 sm:col-span-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-green-300" />
              <span>{t('cards.workingHoursShort')}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('stadiumDetails.rateThisStadium')}</h3>
              <p className="mt-1 text-sm text-gray-400">{t('stadiumDetails.rateThisStadiumHint')}</p>
              <div className="mt-4">
                <StarRating value={myRating || 0} size={28} interactive disabled={submittingRating} onRate={handleRate} />
              </div>
            </div>
          ) : null}

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
        </div>

        <div className="space-y-6">
          <MapSection stadiums={[stadium]} searchable={false} />

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
            to={!isAuthenticated ? '/login' : `/booking/${stadium._id}`}
            className="app-button w-full md:w-auto"
          >
            {!isAuthenticated ? t('buttons.loginToBook') : t('buttons.bookNow')}
          </Link>
        </div>
      </section>
    </div>
  );
}
