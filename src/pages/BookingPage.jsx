import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarDays, CheckCircle2, Clock3, Send, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bookingService } from '../services/bookingService';
import { stadiumService } from '../services/stadiumService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import { getBlockReasonTranslationKey } from '../utils/display';
import {
  formatCurrency,
  formatScheduleDate,
  getTimePeriodLabelKey,
  getTodayDateInUzbekistan,
} from '../utils/formatters';
import { buildClickCheckoutUrl, isClickRedirectPaymentOption } from '../utils/click';
import { calculatePaymentBreakdown, PAYMENT_OPTIONS } from '../utils/payment';
import { paymentOptions } from '../utils/options';
import { buildTelegramLink, buildStadiumTelegramText } from '../utils/telegram';

const toMinutes = (value = '00:00') => {
  const [hours = 0, minutes = 0] = String(value).split(':').map(Number);
  return Number(hours || 0) * 60 + Number(minutes || 0);
};

export function BookingPage() {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [stadium, setStadium] = useState(null);
  const [date, setDate] = useState(getTodayDateInUzbekistan());
  const [timeSegments, setTimeSegments] = useState([]);
  const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTIONS.PREPAY_30);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [blocked, setBlocked] = useState(null);
  const [blockMessage, setBlockMessage] = useState('');
  const [sendingBlockMessage, setSendingBlockMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [stadiumData, blocks] = await Promise.all([
          stadiumService.details(stadiumId),
          userService.myBlocks(),
        ]);

        setStadium(stadiumData);
        setBlocked(
          blocks.find(
            (block) => block.ownerId === stadiumData.ownerId && block.status === 'active',
          ) || null,
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [stadiumId]);

  useEffect(() => {
    if (!stadium || blocked || !date) {
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
  }, [blocked, date, stadium, stadiumId, t]);

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
  const blockedReasonKey = blocked ? getBlockReasonTranslationKey(blocked.reason) : null;
  const telegramUrl = stadium
    ? buildTelegramLink(
        buildStadiumTelegramText({
          stadium,
          date,
          slot: selectedSlot,
          paymentOption,
          notes,
          user,
        }),
        stadium.owner?.businessProfile?.telegram,
      )
    : '#';

  const handleBlockedMessageSubmit = async (event) => {
    event.preventDefault();

    if (!blocked?._id || !blockMessage.trim()) {
      toast.error(t('messages.selectBlockAndMessage'));
      return;
    }

    setSendingBlockMessage(true);
    try {
      await userService.createUnblockRequest({
        blockId: blocked._id,
        message: blockMessage,
      });
      toast.success(t('messages.requestSent'));
      setBlockMessage('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.sendRequestFailed'));
    } finally {
      setSendingBlockMessage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStartTime || !selectedEndTime) {
      toast.error(t('messages.selectValidSlot'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await bookingService.create({
        stadiumId: stadium._id,
        date,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        paymentOption,
        notes,
      });
      const createdBooking = response?.booking;

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

  if (blocked) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={t('bookingPage.blockedEyebrow')}
          title={t('bookingPage.blockedTitle')}
          description={t('bookingPage.blockedDescription')}
        />
        <div className="app-card space-y-6">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-red-200">{t('statuses.active')}</p>
            <h2 className="mt-3 heading-font text-4xl font-semibold text-white">{t('bookingPage.blockedTitle')}</h2>
            <p className="mt-4 text-base text-gray-200">
              {t('common.reason')}: {blockedReasonKey ? t(blockedReasonKey) : blocked.reason}
            </p>
          </div>

          <form onSubmit={handleBlockedMessageSubmit} className="space-y-4">
            <div>
              <label className="app-label">{t('labels.apologyMessage')}</label>
              <textarea
                className="app-input min-h-32"
                value={blockMessage}
                onChange={(event) => setBlockMessage(event.target.value)}
                placeholder={t('placeholders.apologyMessage')}
              />
            </div>
            <button type="submit" className="app-button w-full" disabled={sendingBlockMessage}>
              {sendingBlockMessage ? t('buttons.submitRequest') + '...' : t('buttons.submitRequest')}
            </button>
          </form>

          <Link to="/requests" className="app-button-secondary w-full text-center">
            {t('buttons.sendUnblockRequest')}
          </Link>
        </div>
      </div>
    );
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
            <p className="mb-3 text-sm text-gray-400">{t('bookingPage.manualTimeSelection')}</p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('bookingPage.slotAvailable')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-200/80">
                  <XCircle className="h-4 w-4" />
                  {t('bookingPage.slotUnavailable')}
                </span>
                <span className="text-xs text-gray-400">{t('bookingPage.slotSelectionHint')}</span>
              </div>

              {slotLoading ? (
                <div className="mt-4">
                  <LoadingSpinner label={t('bookingPage.availableTimes')} />
                </div>
              ) : sortedSegments.length ? (
                <select
                  className="app-input mt-4"
                  value={selectedStartTime}
                  onChange={(event) => {
                    setSelectedStartTime(event.target.value);
                    setSelectedEndTime('');
                  }}
                >
                  <option value="">{t('bookingPage.chooseStartTime')}</option>
                  {sortedSegments.map((slot) => (
                    <option
                      key={slot.id || `${slot.startTime}-${slot.endTime}`}
                      value={slot.startTime}
                      disabled={!slot.available}
                    >
                      {slot.startTime} - {slot.endTime} • {t(getTimePeriodLabelKey(slot.startTime))}{' '}
                      {slot.available ? `(${t('bookingPage.slotAvailableShort')})` : `(${t('bookingPage.slotUnavailableShort')})`}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-4 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400">
                  {t('bookingPage.noAvailableSlots')}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="app-label">{t('bookingPage.endTimeLabel')}</label>
            <p className="mb-3 text-sm text-gray-400">{t('bookingPage.endSelectionHint')}</p>
            {selectedStartTime ? (
              endOptions.length ? (
                <select
                  className="app-input"
                  value={selectedEndTime}
                  onChange={(event) => setSelectedEndTime(event.target.value)}
                >
                  <option value="">{t('bookingPage.chooseEndTime')}</option>
                  {endOptions.map((value) => (
                    <option key={value} value={value}>
                      {value} • {t('bookingPage.finishAt')} {value}
                    </option>
                  ))}
                </select>
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
            className="app-button football-button w-full"
            disabled={submitting || !selectedStartTime || !selectedEndTime}
          >
            {submitting ? t('buttons.confirmingBooking') : t('buttons.sendBookingRequest')}
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
          <div className="app-card">
            <div className="space-y-1 text-sm text-gray-400">
              <p>{stadium.owner?.fullName}</p>
              <p>{stadium.owner?.phone || t('common.noData')}</p>
              <p>
                {t('bookingPage.telegramHint', {
                  username: stadium.owner?.businessProfile?.telegram || '@tohtasinov10',
                })}
              </p>
            </div>
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="app-button mt-4 w-full">
              <Send className="mr-2 h-4 w-4" />
              {t('buttons.sendToTelegram')}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
