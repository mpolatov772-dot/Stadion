import { CalendarCheck, Clock3, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingStatusDoughnut, buildStatusData, IncomeTrendChart, STATUS_COLORS } from '../components/OwnerStatsCharts';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useI18n } from '../hooks/useI18n';
import { adminService } from '../services/adminService';
import { ownerService } from '../services/ownerService';
import { getApiErrorMessage } from '../utils/apiError';
import { getBookingStatusLabelKey, getRoleLabelKey } from '../utils/display';
import { formatCurrency, formatDate } from '../utils/formatters';

const TABS = ['stats', 'users', 'bookings', 'settings'];

function UserGroup({ title, members, onRoleChange, onToggleActive, t, emptyDescriptionKey }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">{title}</h4>
      <div className="mt-3 space-y-3">
        {members.length ? (
          members.map((member) => (
            <div key={member._id} className="rounded-xl border border-white/10 px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{member.fullName}</p>
                  <p className="mt-1 truncate text-sm text-gray-400">{member.email}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    className="app-input sm:w-auto"
                    value={member.role}
                    onChange={(event) => onRoleChange(member._id, event.target.value)}
                  >
                    <option value="user">{t(getRoleLabelKey('user'))}</option>
                    <option value="stadiumOwner">{t(getRoleLabelKey('stadiumOwner'))}</option>
                    <option value="admin">{t(getRoleLabelKey('admin'))}</option>
                  </select>
                  <button
                    type="button"
                    className={member.isActive ? 'app-button-secondary' : 'app-button'}
                    onClick={() => onToggleActive(member)}
                  >
                    {member.isActive ? t('adminPage.deactivate') : t('adminPage.activate')}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title={t('common.noData')} description={t(emptyDescriptionKey)} />
        )}
      </div>
    </div>
  );
}

export function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, bookingsData, settingsData, statsData] = await Promise.all([
        adminService.users(),
        adminService.bookings(),
        adminService.getSettings(),
        ownerService.stats(),
      ]);
      setUsers(usersData);
      setBookings(bookingsData);
      setSettings(settingsData);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusData = useMemo(() => buildStatusData(stats, t), [stats, t]);
  const stadiumOwners = useMemo(() => users.filter((member) => member.role === 'stadiumOwner'), [users]);
  const regularUsers = useMemo(() => users.filter((member) => member.role === 'user'), [users]);
  const admins = useMemo(() => users.filter((member) => member.role === 'admin'), [users]);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminService.updateUser(userId, { role });
      toast.success(t('messages.userUpdated'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateUserFailed'));
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await adminService.updateUser(member._id, { isActive: !member.isActive });
      toast.success(t('messages.userUpdated'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateUserFailed'));
    }
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      toast.success(t('messages.settingsUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateSettingsFailed'));
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label={t('common.loadingData')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('adminPage.eyebrow')}
        title={t('adminPage.title')}
        description={t('adminPage.description')}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === item ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-300'
            }`}
          >
            {t(`adminPage.tabs.${item}`)}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t('reportsPage.totalBookings')} value={stats.totalBookings} icon={CalendarCheck} tone="blue" />
            <StatCard label={t('reportsPage.confirmedBookings')} value={stats.confirmedCount} icon={CalendarCheck} tone="green" />
            <StatCard label={t('reportsPage.pendingRequests')} value={stats.pendingCount} icon={Clock3} tone="amber" />
            <StatCard label={t('reportsPage.income')} value={formatCurrency(stats.totalIncome)} icon={Wallet} tone="green" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('reportsPage.statusBreakdown')}</h3>
              <p className="mt-1 text-sm text-gray-400">{t('adminPage.statsHint')}</p>
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
        </div>
      ) : null}

      {tab === 'users' ? (
        <section className="app-card space-y-6">
          <UserGroup
            title={t('adminPage.stadiumOwners')}
            members={stadiumOwners}
            onRoleChange={handleRoleChange}
            onToggleActive={handleToggleActive}
            t={t}
            emptyDescriptionKey="empty.noUsersFound"
          />
          <UserGroup
            title={t('adminPage.regularUsers')}
            members={regularUsers}
            onRoleChange={handleRoleChange}
            onToggleActive={handleToggleActive}
            t={t}
            emptyDescriptionKey="empty.noUsersFound"
          />
          {admins.length ? (
            <UserGroup
              title={t('adminPage.admins')}
              members={admins}
              onRoleChange={handleRoleChange}
              onToggleActive={handleToggleActive}
              t={t}
              emptyDescriptionKey="empty.noUsersFound"
            />
          ) : null}
        </section>
      ) : null}

      {tab === 'bookings' ? (
        <section className="app-card">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('adminPage.tabs.bookings')}</h3>
          <div className="mt-4 space-y-3">
            {bookings.length ? (
              bookings.map((booking) => (
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
              <EmptyState title={t('common.noData')} description={t('empty.noOwnerBookingsDescription')} />
            )}
          </div>
        </section>
      ) : null}

      {tab === 'settings' && settings ? (
        <form onSubmit={handleSettingsSubmit} className="app-card space-y-4">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('adminPage.tabs.settings')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="app-label">{t('adminPage.siteName')}</label>
              <input
                className="app-input"
                value={settings.siteName}
                onChange={(event) => setSettings((current) => ({ ...current, siteName: event.target.value }))}
              />
            </div>
            <div>
              <label className="app-label">{t('adminPage.currency')}</label>
              <input
                className="app-input"
                value={settings.currency}
                onChange={(event) => setSettings((current) => ({ ...current, currency: event.target.value }))}
              />
            </div>
            <div>
              <label className="app-label">{t('adminPage.supportPhone')}</label>
              <input
                className="app-input"
                value={settings.supportPhone}
                onChange={(event) => setSettings((current) => ({ ...current, supportPhone: event.target.value }))}
              />
            </div>
            <div>
              <label className="app-label">{t('adminPage.supportEmail')}</label>
              <input
                className="app-input"
                value={settings.supportEmail}
                onChange={(event) => setSettings((current) => ({ ...current, supportEmail: event.target.value }))}
              />
            </div>
            <div>
              <label className="app-label">{t('adminPage.minBookingNoticeHours')}</label>
              <input
                type="number"
                min="0"
                className="app-input"
                value={settings.minBookingNoticeHours}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, minBookingNoticeHours: Number(event.target.value) }))
                }
              />
            </div>
          </div>
          <button type="submit" className="app-button" disabled={savingSettings}>
            {savingSettings ? t('common.loadingData') : t('common.save')}
          </button>
        </form>
      ) : null}
    </div>
  );
}
