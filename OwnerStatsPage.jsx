import { CalendarCheck, CircleDollarSign, Clock3, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingStatusDoughnut, buildStatusData, IncomeTrendChart, STATUS_COLORS } from '../components/OwnerStatsCharts';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useI18n } from '../hooks/useI18n';
import { ownerService } from '../services/ownerService';
import { getBookingStatusLabelKey } from '../utils/display';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OwnerStatsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(await ownerService.stats());
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statusData = useMemo(() => buildStatusData(stats, t), [stats, t]);

  if (loading) {
    return <LoadingSpinner label={t('reportsPage.title')} />;
  }

  if (!stats) {
    return <EmptyState title={t('empty.noReport')} description={t('empty.noReportDescription')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('reportsPage.eyebrow')}
        title={t('reportsPage.title')}
        description={t('reportsPage.description')}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('reportsPage.totalBookings')} value={stats.totalBookings} icon={CalendarCheck} tone="blue" />
        <StatCard label={t('reportsPage.confirmedBookings')} value={stats.confirmedCount} icon={CalendarCheck} tone="green" />
        <StatCard label={t('reportsPage.pendingRequests')} value={stats.pendingCount} icon={Clock3} tone="amber" />
        <StatCard label={t('reportsPage.income')} value={formatCurrency(stats.totalIncome)} icon={Wallet} tone="green" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('reportsPage.expenses')} value={formatCurrency(stats.totalExpenses)} icon={CircleDollarSign} tone="red" />
        <StatCard label={t('reportsPage.netProfit')} value={formatCurrency(stats.netProfit)} icon={TrendingUp} tone="green" />
        <StatCard label={t('reportsPage.netLoss')} value={formatCurrency(stats.netLoss)} icon={TrendingDown} tone="red" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('reportsPage.statusBreakdown')}</h3>
          <p className="mt-1 text-sm text-gray-400">{t('reportsPage.statusBreakdownHint')}</p>
          <div className="mt-6">
            <BookingStatusDoughnut statusData={statusData} total={stats.totalBookings} t={t} />
          </div>
        </div>

        <div className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('reportsPage.bookingTrend')}</h3>
          <p className="mt-1 text-sm text-gray-400">{t('reportsPage.bookingTrendHint')}</p>
          <div className="mt-6">
            <IncomeTrendChart data={stats.monthlyIncome || []} t={t} />
          </div>
        </div>
      </section>

      <section className="app-card">
        <h3 className="heading-font text-2xl font-semibold text-white">{t('reportsPage.bookingHistory')}</h3>
        <div className="mt-4 space-y-3">
          {stats.bookingHistory?.length ? (
            stats.bookingHistory.map((booking) => (
              <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {booking.stadium?.name} • {booking.user?.fullName}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {formatDate(booking.date)} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[booking.status] }} />
                    <div>
                      <p className="text-green-300">{formatCurrency(booking.paidAmount)}</p>
                      <p className="mt-1 text-gray-400">{t(getBookingStatusLabelKey(booking.status))}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title={t('empty.noOwnerBookings')} description={t('empty.noOwnerBookingsDescription')} />
          )}
        </div>
      </section>
    </div>
  );
}
