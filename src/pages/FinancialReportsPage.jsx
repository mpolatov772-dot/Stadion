import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';

export function FinancialReportsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setSummary(await dashboardService.summary());
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return <LoadingSpinner label={t('reportsPage.title')} />;
  }

  if (!summary?.analytics) {
    return <EmptyState title={t('empty.noReport')} description={t('empty.noReportDescription')} />;
  }

  const isSeller = user.role === 'seller';
  const analytics = summary.analytics;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('reportsPage.eyebrow')}
        title={t('reportsPage.title')}
        description={t('reportsPage.description')}
      />

      <section className={`grid gap-4 ${isSeller ? 'xl:grid-cols-4' : 'xl:grid-cols-5'}`}>
        {isSeller ? (
          <>
            <StatCard label={t('reportsPage.totalProducts')} value={analytics.summary.totalProducts} />
            <StatCard label={t('reportsPage.orders')} value={analytics.summary.ordersCount} />
            <StatCard label={t('reportsPage.soldItems')} value={analytics.summary.soldItems} />
            <StatCard label={t('reportsPage.income')} value={formatCurrency(analytics.summary.income)} />
          </>
        ) : (
          <>
            <StatCard label={t('reportsPage.totalBookings')} value={analytics.summary.totalBookings} />
            <StatCard label={t('reportsPage.cancelledBookings')} value={analytics.summary.cancelledBookings} />
            <StatCard label={t('reportsPage.blockedUsers')} value={analytics.summary.blockedUsersCount} />
            <StatCard label={t('reportsPage.income')} value={formatCurrency(analytics.summary.income)} />
            <StatCard label={t('reportsPage.pendingRequests')} value={analytics.summary.pendingRequests} />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">
            {isSeller ? t('reportsPage.productPerformance') : t('reportsPage.bookingTrend')}
          </h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey={isSeller ? 'shortName' : 'month'} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                {isSeller ? (
                  <>
                    <Bar dataKey="views" name={t('reportsPage.views')} fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="orders" name={t('reportsPage.orders')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </>
                ) : (
                  <>
                    <Bar dataKey="bookings" name={t('reportsPage.totalBookings')} fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="cancelled" name={t('reportsPage.cancelledBookings')} fill="#ef4444" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" name={t('reportsPage.pendingRequests')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">
            {isSeller ? t('reportsPage.topProducts') : t('reportsPage.stadiumUsage')}
          </h3>
          <div className="mt-4 space-y-3">
            {isSeller ? (
              <>
                {analytics.summary.mostViewedProduct ? (
                  <div className="rounded-xl border border-white/10 px-4 py-3">
                    <p className="text-sm text-gray-400">{t('reportsPage.mostViewedProduct')}</p>
                    <p className="mt-2 font-medium text-white">{analytics.summary.mostViewedProduct.name}</p>
                  </div>
                ) : null}
                {analytics.summary.mostOrderedProduct ? (
                  <div className="rounded-xl border border-white/10 px-4 py-3">
                    <p className="text-sm text-gray-400">{t('reportsPage.mostOrderedProduct')}</p>
                    <p className="mt-2 font-medium text-white">{analytics.summary.mostOrderedProduct.name}</p>
                  </div>
                ) : null}
              </>
            ) : (
              analytics.stadiumUsage?.map((item) => (
                <div key={item.name} className="rounded-xl border border-white/10 px-4 py-3">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {t('reportsPage.totalBookings')}: {item.bookings}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
