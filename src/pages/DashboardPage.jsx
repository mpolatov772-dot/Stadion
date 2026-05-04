import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { FeedCard } from '../components/FeedCard';
import { FeedComposer } from '../components/FeedComposer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { AnimatedSection } from '../components/AnimatedSection';
import { ProductForm } from '../components/ProductForm';
import { StadiumForm } from '../components/StadiumForm';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bookingService } from '../services/bookingService';
import { contentService } from '../services/contentService';
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { stadiumService } from '../services/stadiumService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import {
  getBookingStatusLabelKey,
  getDashboardStatLabelKey,
  getGenericStatusLabelKey,
  getProductCategoryLabelKey,
  getRoleLabelKey,
} from '../utils/display';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const getResolvedLabel = (t, label) => {
  const translationKey = getDashboardStatLabelKey(label);
  const translated = t(translationKey);
  return translated === translationKey ? label : translated;
};

function ChartShell({ title, children }) {
  return (
    <div className="app-card">
      <h3 className="heading-font text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-6 h-80">{children}</div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStadium, setEditingStadium] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [busy, setBusy] = useState({
    stadium: false,
    product: false,
    feed: false,
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [blockingUserId, setBlockingUserId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, feedData] = await Promise.all([
        dashboardService.summary(),
        contentService.feed(),
      ]);
      setSummary(summaryData);
      setFeed(feedData.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFeedSubmit = async (payload) => {
    setBusy((current) => ({ ...current, feed: true }));
    try {
      await contentService.createFeedPost(payload);
      toast.success(t('messages.feedPublished'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.publishFeedFailed'));
    } finally {
      setBusy((current) => ({ ...current, feed: false }));
    }
  };

  const handleStadiumSubmit = async (payload) => {
    setBusy((current) => ({ ...current, stadium: true }));
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
      setBusy((current) => ({ ...current, stadium: false }));
    }
  };

  const handleProductSubmit = async (payload) => {
    setBusy((current) => ({ ...current, product: true }));
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, payload);
        toast.success(t('messages.productUpdated'));
      } else {
        await productService.create(payload);
        toast.success(t('messages.productCreated'));
      }
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.saveProductFailed'));
    } finally {
      setBusy((current) => ({ ...current, product: false }));
    }
  };

  const handleOwnerBookingAction = async (bookingId, action) => {
    try {
      if (action === 'no_show') {
        await bookingService.markNoShow(bookingId);
      } else {
        await bookingService.updateStatus(bookingId, { status: action });
      }
      toast.success(t('messages.bookingUpdated'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateBookingFailed'));
    }
  };

  const handleCreateBlock = async (blockedUserId) => {
    const reason = window.prompt(t('placeholders.blockReason'), '');

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      toast.error(t('errors.blockReasonRequired'));
      return;
    }

    setBlockingUserId(blockedUserId);
    try {
      await userService.createBlock({
        blockedUserId,
        reason: reason.trim(),
      });
      toast.success(t('messages.blockCreated'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.sendRequestFailed'));
    } finally {
      setBlockingUserId('');
    }
  };

  const stats = useMemo(() => summary?.stats || [], [summary?.stats]);
  const filteredMembers = useMemo(
    () =>
      (summary?.availableMembers || []).filter((item) => {
        const query = memberSearch.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          item.user?.fullName?.toLowerCase().includes(query) ||
          t(getRoleLabelKey(item.user?.role)).toLowerCase().includes(query)
        );
      }),
    [memberSearch, summary?.availableMembers, t],
  );

  if (loading || !summary) {
    return <LoadingSpinner label={t('common.loadingData')} />;
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <PageHeader
          eyebrow={t('dashboard.eyebrow', { role: t(getRoleLabelKey(user.role)) })}
          title={t('dashboard.title', { name: user.fullName })}
          description={t('dashboard.description')}
        />
      </AnimatedSection>

      <AnimatedSection
        as="section"
        className={`grid gap-4 ${stats.length > 3 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
        delay={80}
      >
        {stats.map((stat, index) => (
          <AnimatedSection as="div" key={stat.label} delay={index * 70}>
            <StatCard
              label={getResolvedLabel(t, stat.label)}
              value={typeof stat.value === 'number' && String(stat.label).toLowerCase().includes('revenue')
                ? formatCurrency(stat.value)
                : stat.value}
            />
          </AnimatedSection>
        ))}
      </AnimatedSection>

      {user.role === 'user' ? (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="app-card">
              <div className="flex items-center justify-between gap-4">
                <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.myBookings')}</h3>
                <Link to="/stadiums" className="app-button-secondary">{t('buttons.exploreStadiums')}</Link>
              </div>
              <div className="mt-4 space-y-3">
                {summary.myBookings?.length ? (
                  summary.myBookings.map((booking) => (
                    <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-white">{booking.stadium?.name}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {booking.date} • {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-green-300">{t(getBookingStatusLabelKey(booking.status))}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t('empty.noBookingsYet')} description={t('empty.noBookingsYetDescription')} />
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="app-card">
                <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.myOrders')}</h3>
                <div className="mt-4 space-y-3">
                  {summary.myOrders?.length ? (
                    summary.myOrders.map((order) => (
                      <div key={order._id} className="rounded-xl border border-white/10 px-4 py-3">
                        <p className="font-medium text-white">{order.product?.name}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {order.quantity} dona • {formatCurrency(order.discountedTotal)}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title={t('ordersPage.emptyTitle')} description={t('ordersPage.emptyDescription')} />
                  )}
                </div>
              </div>

              <div className="app-card">
                <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.recentNotifications')}</h3>
                <div className="mt-4 space-y-3">
                  {summary.notifications?.length ? (
                    summary.notifications.map((item) => (
                      <div key={item._id} className="rounded-xl border border-white/10 px-4 py-3">
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-400">{item.content}</p>
                        <p className="mt-2 text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title={t('notificationsPage.emptyTitle')} description={t('notificationsPage.emptyDescription')} />
                  )}
                </div>
              </div>

              {summary.activeBlocks?.length ? (
                <div className="app-card">
                  <h3 className="heading-font text-2xl font-semibold text-white">{t('requestsPage.blockedOnlyTitle')}</h3>
                  <div className="mt-4 space-y-3">
                    {summary.activeBlocks.map((block) => (
                      <div key={block._id} className="rounded-xl border border-white/10 px-4 py-3">
                        <p className="font-medium text-white">{t('statuses.active')}</p>
                        <p className="mt-1 text-sm text-gray-400">{block.reason}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/requests" className="app-button mt-4">{t('buttons.sendUnblockRequest')}</Link>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {user.role === 'seller' ? (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ProductForm
              initialValues={editingProduct}
              onSubmit={handleProductSubmit}
              busy={busy.product}
              submitLabel={editingProduct ? t('buttons.updateProduct') : t('buttons.addProduct')}
              onCancelEdit={editingProduct ? () => setEditingProduct(null) : undefined}
            />

            <div className="space-y-6">
              <ChartShell title={t('dashboard.sections.sellerAnalytics')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.analytics?.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="shortName" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name={t('reportsPage.views')} fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="orders" name={t('reportsPage.orders')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>

              <FeedComposer busy={busy.feed} onSubmit={handleFeedSubmit} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.myProducts')}</h3>
              <div className="mt-4 space-y-3">
                {summary.myProducts?.length ? (
                  summary.myProducts.map((product) => (
                    <div key={product._id} className="rounded-xl border border-white/10 px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {t(getProductCategoryLabelKey(product.category))} • {t('cards.inStock', { count: product.stock })}
                          </p>
                        </div>
                        <button type="button" className="app-button-secondary" onClick={() => setEditingProduct(product)}>
                          {t('common.edit')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t('empty.noSellerProducts')} description={t('empty.noSellerProductsDescription')} />
                )}
              </div>
            </div>

            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.sellerOrders')}</h3>
              <div className="mt-4 space-y-3">
                {summary.myOrders?.length ? (
                  summary.myOrders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-white/10 px-4 py-3">
                      <p className="font-medium text-white">{order.product?.name}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {order.quantity} dona • {formatCurrency(order.discountedTotal)}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t('common.noData')} description={t('market.flowDescription')} />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <PageHeader
              eyebrow={t('dashboard.recentFeedEyebrow')}
              title={t('dashboard.recentFeedTitle')}
              description={t('dashboard.recentFeedDescription')}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {feed.map((item) => (
                <FeedCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {user.role === 'stadiumOwner' ? (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <StadiumForm
              initialValues={editingStadium}
              onSubmit={handleStadiumSubmit}
              busy={busy.stadium}
              submitLabel={editingStadium ? t('buttons.updateStadium') : t('buttons.createStadium')}
              onCancelEdit={editingStadium ? () => setEditingStadium(null) : undefined}
            />

            <div className="space-y-6">
              <ChartShell title={t('dashboard.sections.ownerAnalytics')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.analytics?.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" name={t('reportsPage.bookingCount')} fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="cancelled" name={t('dashboard.stats.Cancelled bookings')} fill="#ef4444" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" name={t('statuses.pending')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>

              <FeedComposer busy={busy.feed} onSubmit={handleFeedSubmit} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
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

            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.recentNotifications')}</h3>
              <div className="mt-4 space-y-3">
                {summary.notifications?.length ? (
                  summary.notifications.map((item) => (
                    <div key={item._id} className="rounded-xl border border-white/10 px-4 py-3">
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-400">{item.content}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t('notificationsPage.emptyTitle')} description={t('notificationsPage.emptyDescription')} />
                )}
              </div>
            </div>

            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('reportsPage.stadiumUsage')}</h3>
              <div className="mt-4 space-y-3">
                {summary.analytics?.summary?.popularTimeSlots?.length ? (
                  summary.analytics.summary.popularTimeSlots.map((item) => (
                    <div key={item.slot} className="rounded-xl border border-white/10 px-4 py-3">
                      <p className="font-medium text-white">{item.slot}</p>
                      <p className="mt-1 text-sm text-gray-400">{t('reportsPage.slotBookings', { count: item.count })}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState title={t('common.noData')} description={t('reportsPage.bookingTrend')} />
                )}
              </div>
            </div>
          </section>

          <section className="app-card">
            <div className="flex items-center justify-between gap-4">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.bookingRequests')}</h3>
            </div>
            <div className="mt-4 space-y-3">
              {summary.ownerBookings?.length ? (
                summary.ownerBookings.map((booking) => (
                  <div key={booking._id} className="rounded-xl border border-white/10 px-4 py-3">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {booking.user?.fullName} • {booking.stadium?.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {booking.date} • {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="mt-1 text-sm text-green-300">
                          {t(getBookingStatusLabelKey(booking.status))}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'pending' ? (
                          <>
                            <button type="button" className="app-button" onClick={() => handleOwnerBookingAction(booking._id, 'confirmed')}>
                              {t('buttons.approveBooking')}
                            </button>
                            <button type="button" className="app-button-secondary" onClick={() => handleOwnerBookingAction(booking._id, 'rejected')}>
                              {t('buttons.rejectBooking')}
                            </button>
                          </>
                        ) : null}
                        {booking.status === 'confirmed' ? (
                          <>
                            <button type="button" className="app-button-secondary" onClick={() => handleOwnerBookingAction(booking._id, 'completed')}>
                              {t('buttons.markCompleted')}
                            </button>
                            <button type="button" className="app-button-secondary" onClick={() => handleOwnerBookingAction(booking._id, 'no_show')}>
                              {t('buttons.markNoShowBlock')}
                            </button>
                          </>
                        ) : null}
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
            <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.ownerUsers')}</h3>
            <div className="mt-4 space-y-3">
              {summary.ownerUsers?.length ? (
                summary.ownerUsers.map((item) => (
                  <div key={item.user._id} className="rounded-xl border border-white/10 px-4 py-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="font-medium text-white">{item.user.fullName}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {item.bookingCount} ta bron • {item.lastBooking ? formatDate(item.lastBooking.createdAt) : t('common.noData')}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.block ? t('statuses.active') : t('statuses.lifted')} • {item.requests?.length || 0} ta so'rov
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title={t('common.noData')} description={t('empty.noOwnerBookingsDescription')} />
              )}
            </div>
          </section>

          <section className="app-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="heading-font text-2xl font-semibold text-white">{t('dashboard.sections.allMembers')}</h3>
                <p className="mt-1 text-sm text-gray-400">{t('dashboard.sections.allMembersDescription')}</p>
              </div>
              <input
                className="app-input md:w-80"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder={t('placeholders.searchMembers')}
              />
            </div>
            <div className="mt-4 space-y-3">
              {filteredMembers.length ? (
                filteredMembers.map((item) => (
                  <div key={item.user._id} className="rounded-xl border border-white/10 px-4 py-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="font-medium text-white">{item.user.fullName}</p>
                        <p className="mt-1 text-sm text-gray-400">{t(getRoleLabelKey(item.user.role))}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.user.phone || t('common.noData')}</p>
                      </div>
                      {item.block?.status === 'active' ? (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                          {t('statuses.active')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="app-button-secondary"
                          onClick={() => handleCreateBlock(item.user._id)}
                          disabled={blockingUserId === item.user._id}
                        >
                          {blockingUserId === item.user._id ? t('common.loadingData') : t('buttons.blockUser')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title={t('common.noData')} description={t('empty.noUsersFound')} />
              )}
            </div>
          </section>
        </div>
      ) : null}

      {user.role === 'admin' ? (
        <section className="space-y-4">
          <PageHeader
            eyebrow={t('dashboard.adminFeedEyebrow')}
            title={t('dashboard.adminFeedTitle')}
            description={t('dashboard.adminFeedDescription')}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {summary.recentFeed?.map((item) => (
              <FeedCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
