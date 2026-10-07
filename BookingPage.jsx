import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarDays, Clock3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../hooks/useI18n';
import { bookingService } from '../services/bookingService';
import { stadiumService } from '../services/stadiumService';
import { getApiErrorMessage } from '../utils/apiError';
import {
  formatCurrency,
  formatScheduleDate,
  getTimePeriodLabelKey,
  getTodayDateInUzbekistan,
} from '../utils/formatters';
import { buildClickCheckoutUrl, isClickRedirectPaymentOption } from '../utils/click';
import { calculatePaymentBreakdown, PAYMENT_OPTIONS } from '../utils/payment';
import { paymentOptions } from '../utils/options';

const toMinutes = (value = '00:00') => {
  const [hours = 0, minutes = 0] = String(value).split(':').map(Number);
  return Number(hours || 0) * 60 + Number(minutes || 0);
};

export function BookingPage() {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [stadium, setStadium] = useState(null);
  const [date, setDate] = useState(getTodayDateInUzbekistan());
  const [timeSegments, setTimeSegments] = useState([]);
  const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTIONS.PREPAY_30);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setStadium(await stadiumService.details(stadiumId));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [stadiumId]);

  useEffect(() => {
    if (!stadium || !date) {
      return;
    }

    const loadAvailability = async () => {
      setSlotLoading(true);
      try {
        const response = await stadiumService.availability(stadiumId, date);
        setTimeSegments(response.slots);
        setSelectedStartTime('');
        setSelectedEndTime('');
      } catch (error) {
        toast.error(getApiErrorMessage(error, t, 'errors.loadAvailabilityFailed'));
      } finally {
        setSlotLoading(false);
      }
    };

    loadAvailability();
  }, [date, stadium, stadiumId, t]);

  const sortedSegments = useMemo(
    () => [...timeSegments].sort((left, right) => left.startTime.localeCompare(right.startTime)),
    [timeSegments],
  );
  const endOptions = useMemo(() => {
    if (!selectedStartTime) {
      return [];
    }

    const startIndex = sortedSegments.findIndex((segment) => segment.startTime === selectedStartTime);

    if (startIndex === -1 || !sortedSegments[startIndex]?.available) {
      return [];
    }

    const options = [];

    for (let index = startIndex; index < sortedSegments.length; index += 1) {
      const current = sortedSegments[index];

      if (!current.available) {
        break;
      }

      if (index > startIndex && sortedSegments[index - 1]?.endTime !== current.startTime) {
        break;
      }

      options.push(current.endTime);
    }

    return options;
  }, [selectedStartTime, sortedSegments]);
  const selectedStartSegment = useMemo(
    () => sortedSegments.find((segment) => segment.startTime === selectedStartTime) || null,
    [selectedStartTime, sortedSegments],
  );
  const selectedSlot =
    selectedStartTime && selectedEndTime
      ? {
          startTime: selectedStartTime,
          endTime: selectedEndTime,
        }
      : null;
  const selectedDurationHours = selectedSlot
    ? (toMinutes(selectedSlot.endTime) - toMinutes(selectedSlot.startTime)) / 60
    : 0;
  const selectedDurationLabel = Number.isInteger(selectedDurationHours)
    ? selectedDurationHours
    : selectedDurationHours.toFixed(1);
  const paymentBreakdown = calculatePaymentBreakdown(
    Number(stadium?.price || 0) * selectedDurationHours,
    paymentOption,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStartTime || !selectedEndTime) {
      toast.error(t('messages.selectValidSlot'));
      return;
    }

    setSubmitting(true);
    try {
      const createdBooking = await bookingService.create({
        stadiumId: stadium._id,
        date,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        paymentOption,
        notes,
      });

      if (isClickRedirectPaymentOption(paymentOption) && createdBooking?._id) {
        const clickUrl = buildClickCheckoutUrl({
          amount: paymentBreakdown.paidAmount,
          bookingId: createdBooking._id,
          stadiumId: stadium._id,
          paymentOption,
        });

        if (clickUrl) {
          toast.success(t('messages.bookingRequestCreated'));
          window.location.href = clickUrl;
          return;
        }
      }

      toast.success(
        isClickRedirectPaymentOption(paymentOption)
          ? t('messages.clickRedirectUnavailable')
          : t('messages.bookingRequestCreated'),
      );
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.bookingFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !stadium) {
    return <LoadingSpinner label={t('common.loadingData')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('bookingPage.eyebrow')}
        title={t('bookingPage.title', { name: stadium.name })}
        description={t('bookingPage.pendingNote')}
      />

      <div className="page-grid">
        <form onSubmit={handleSubmit} className="app-card space-y-6">
          <div>
            <label className="app-label">{t('labels.bookingDate')}</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-300" />
              <input
                type="date"
                className="app-input pl-11"
                value={date}
                min={getTodayDateInUzbekistan()}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="app-label">{t('bookingPage.startTimeLabel')}</label>
            <p className="mb-3 text-sm text-gray-400">{t('bookingPage.slotSelectionHint')}</p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {slotLoading ? (
                <LoadingSpinner label={t('bookingPage.availableTimes')} />
              ) : sortedSegments.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {sortedSegments.map((slot) => {
                    const isSelected = slot.startTime === selectedStartTime;

                    return (
                      <button
                        key={slot.id || `${slot.startTime}-${slot.endTime}`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedStartTime(slot.startTime);
                          setSelectedEndTime('');
                        }}
                        className={`rounded-xl border px-2 py-3 text-sm font-medium ${
                          isSelected
                            ? 'border-green-400 bg-green-500 text-black'
                            : slot.available
                              ? 'border-white/15 bg-white/5 text-white'
                              : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-gray-600 line-through'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t('bookingPage.noAvailableSlots')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="app-label">{t('bookingPage.endTimeLabel')}</label>
            <p className="mb-3 text-sm text-gray-400">{t('bookingPage.endSelectionHint')}</p>
            {selectedStartTime ? (
              endOptions.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {endOptions.map((value) => {
                    const isSelected = value === selectedEndTime;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedEndTime(value)}
                        className={`rounded-xl border px-2 py-3 text-sm font-medium ${
                          isSelected
                            ? 'border-green-400 bg-green-500 text-black'
                            : 'border-white/15 bg-white/5 text-white'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400">
                  {t('bookingPage.noEndTimeOptions')}
                </p>
              )
            ) : (
              <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400">
                {t('bookingPage.chooseStartFirst')}
              </p>
            )}
          </div>

          {selectedStartSegment ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-300">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-green-300">
                  <Clock3 className="h-4 w-4" />
                  {t('bookingPage.selectedSlotTitle')}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  {t(getTimePeriodLabelKey(selectedStartSegment.startTime))}
                </span>
              </div>
              <p className="mt-3 font-medium text-white">{formatScheduleDate(date)}</p>
              <p className="mt-1 text-gray-300">
                {selectedStartTime}
                {selectedEndTime ? ` - ${selectedEndTime}` : ''}
              </p>
            </div>
          ) : null}

          <div>
            <label className="app-label">{t('labels.paymentOption')}</label>
            <select
              className="app-input"
              value={paymentOption}
              onChange={(event) => setPaymentOption(event.target.value)}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)} - {t(option.descriptionKey)}
                </option>
              ))}
            </select>
            {isClickRedirectPaymentOption(paymentOption) ? (
              <p className="mt-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {t('bookingPage.clickRedirectHint')}
              </p>
            ) : null}
          </div>

          <div>
            <label className="app-label">{t('common.notes')}</label>
            <textarea
              className="app-input min-h-24"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t('placeholders.bookingNotes')}
            />
          </div>

          <button
            type="submit"
            className="app-button w-full"
            disabled={submitting || !selectedStartTime || !selectedEndTime}
          >
            {submitting ? t('bookingPage.confirmingBooking') : t('bookingPage.sendBookingRequest')}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="app-card">
            <p className="text-sm text-gray-400">{t('common.selectedVenue')}</p>
            <h3 className="mt-2 heading-font text-3xl font-semibold text-white">{stadium.name}</h3>
            <p className="mt-2 text-sm text-gray-400">{stadium.location.address}</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-gray-400">{t('labels.bookingTime')}</p>
              {selectedSlot ? (
                <>
                  <p className="mt-2 text-xs uppercase tracking-wide text-green-300">
                    {t(getTimePeriodLabelKey(selectedSlot.startTime))}
                  </p>
                  <p className="mt-1 font-medium text-white">
                    {formatScheduleDate(date)} • {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {t('bookingPage.selectedDuration', { hours: selectedDurationLabel })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-400">{t('bookingPage.selectTimeFirst')}</p>
              )}
            </div>
          </div>
          <div className="app-card space-y-3">
            <p className="text-sm text-gray-400">{t('common.paymentSummary')}</p>
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('common.totalPrice')}</span>
              <span>{formatCurrency(paymentBreakdown.totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('common.discount')}</span>
              <span>{formatCurrency(paymentBreakdown.discount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('common.paidNow')}</span>
              <span>{formatCurrency(paymentBreakdown.paidAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('common.remaining')}</span>
              <span>{formatCurrency(paymentBreakdown.remainingAmount)}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between font-medium text-white">
                <span>{t('common.finalTotal')}</span>
                <span>{formatCurrency(paymentBreakdown.discountedTotal)}</span>
              </div>
            </div>
          </div>
          <div className="app-card space-y-1 text-sm text-gray-400">
            <p>{stadium.owner?.fullName}</p>
            <p>{stadium.owner?.phone || t('common.noData')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
