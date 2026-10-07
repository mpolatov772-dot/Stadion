import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { AnimatedSection } from '../components/AnimatedSection';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { StadiumForm } from '../components/StadiumForm';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bookingService } from '../services/bookingService';
import { ownerService } from '../services/ownerService';
import { stadiumService } from '../services/stadiumService';
import { getApiErrorMessage } from '../utils/apiError';
import { getBookingStatusLabelKey, getDashboardStatLabelKey, getRoleLabelKey } from '../utils/display';
import { formatCurrency } from '../utils/formatters';

function UserDashboard() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      setBookings(await bookingService.myBookings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId);
      toast.success(t('messages.bookingUpdated'));
      await loadBookings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateBookingFailed'));
    } finally {
      setCancellingId('');
    }
  };

  if (loading) {
    return <LoadingSpinner label={t('common.loadingData')} />;
  }

  return (
    <div className="app-card">
      <div className="flex items-center justify-between gap-4">
        <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.myBookings')}</h3>
        <Link to="/" className="app-button-secondary">{t('buttons.exploreStadiums')}</Link>
      </div>
      <div className="mt-4 space-y-3">
        {bookings.length ? (
          bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-white">{booking.stadium?.name}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {booking.date} • {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="mt-1 text-sm text-green-300">{t(getBookingStatusLabelKey(booking.status))}</p>
                </div>
                {['pending', 'confirmed'].includes(booking.status) ? (
                  <button
                    type="button"
                    className="app-button-secondary"
                    disabled={cancellingId === booking._id}
                    onClick={() => handleCancel(booking._id)}
                  >
                    {cancellingId === booking._id ? t('common.loadingData') : t('buttons.cancelBooking')}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState title={t('empty.noBookingsYet')} description={t('empty.noBookingsYetDescription')} />
        )}
      </div>
    </div>
  );
}

function OwnerDashboard() {
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStadium, setEditingStadium] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actingBookingId, setActingBookingId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      setSummary(await ownerService.dashboard());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStadiumSubmit = async (payload) => {
    setBusy(true);
    try {
      if (editingStadium) {
        await stadiumService.update(editingStadium._id, payload);
        toast.success(t('messages.stadiumUpdated'));
      } else {
        await stadiumService.create(payload);
        toast.success(t('messages.stadiumCreated'));
      }
      setEditingStadium(null);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.saveStadiumFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    setActingBookingId(bookingId);
    try {
      if (action === 'confirm') {
        await bookingService.confirm(bookingId);
      } else if (action === 'reject') {
        await bookingService.reject(bookingId);
      } else if (action === 'cancel') {
        await bookingService.cancel(bookingId);
      }
      toast.success(t('messages.bookingUpdated'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateBookingFailed'));
    } finally {
      setActingBookingId('');
    }
  };

  if (loading || !summary) {
    return <LoadingSpinner label={t('common.loadingData')} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        {summary.stats.map((stat) => {
          const translationKey = getDashboardStatLabelKey(stat.label);
          const translated = t(translationKey);

          return (
            <StatCard
              key={stat.label}
              label={translated === translationKey ? stat.label : translated}
              value={stat.value}
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <StadiumForm
          initialValues={editingStadium}
          onSubmit={handleStadiumSubmit}
          busy={busy}
          submitLabel={editingStadium ? t('buttons.updateStadium') : t('buttons.createStadium')}
          onCancelEdit={editingStadium ? () => setEditingStadium(null) : undefined}
        />

        <div className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.myStadiums')}</h3>
          <div className="mt-4 space-y-3">
            {summary.myStadiums?.length ? (
              summary.myStadiums.map((stadium) => (
                <div key={stadium._id} className="rounded-xl border border-white/10 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{stadium.name}</p>
                      <p className="mt-1 text-sm text-gray-400">{stadium.location.address}</p>
                    </div>
                    <button type="button" className="app-button-secondary" onClick={() => setEditingStadium(stadium)}>
                      {t('common.edit')}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t('empty.noOwnerStadiums')} description={t('empty.noOwnerStadiumsDescription')} />
            )}
          </div>
        </div>
      </section>

      <section className="app-card">
        <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.bookingRequests')}</h3>
        <div className="mt-4 space-y-3">
          {summary.pendingBookings?.length ? (
            summary.pendingBookings.map((booking) => (
              <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {booking.user?.fullName} • {booking.stadium?.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {booking.date} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="app-button"
                      disabled={actingBookingId === booking._id}
                      onClick={() => handleBookingAction(booking._id, 'confirm')}
                    >
                      {t('buttons.approveBooking')}
                    </button>
                    <button
                      type="button"
                      className="app-button-secondary"
                      disabled={actingBookingId === booking._id}
                      onClick={() => handleBookingAction(booking._id, 'reject')}
                    >
                      {t('buttons.rejectBooking')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title={t('empty.noOwnerBookings')} description={t('empty.noOwnerBookingsDescription')} />
          )}
        </div>
      </section>

      <section className="app-card">
        <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.recentBookings')}</h3>
        <div className="mt-4 space-y-3">
          {summary.recentBookings?.length ? (
            summary.recentBookings.map((booking) => (
              <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {booking.user?.fullName} • {booking.stadium?.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {booking.date} • {booking.startTime} - {booking.endTime}
                    </p>
                    <p className="mt-1 text-sm text-green-300">{t(getBookingStatusLabelKey(booking.status))}</p>
                    <p className="mt-1 text-sm text-gray-500">{formatCurrency(booking.paidAmount)}</p>
                  </div>
                  {booking.status === 'confirmed' ? (
                    <button
                      type="button"
                      className="app-button-secondary"
                      disabled={actingBookingId === booking._id}
                      onClick={() => handleBookingAction(booking._id, 'cancel')}
                    >
                      {t('common.delete')}
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <EmptyState title={t('common.noData')} description={t('empty.noOwnerBookingsDescription')} />
          )}
        </div>
      </section>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <PageHeader
          eyebrow={t('dashboard.eyebrow', { role: t(getRoleLabelKey(user.role)) })}
          title={t('dashboard.title', { name: user.fullName })}
          description={t('dashboard.description')}
        />
      </AnimatedSection>

      {user.role === 'user' ? <UserDashboard /> : null}
      {['stadiumOwner', 'admin'].includes(user.role) ? <OwnerDashboard /> : null}
    </div>
  );
}
