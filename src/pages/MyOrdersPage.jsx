import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { orderService } from '../services/orderService';
import { getGenericStatusLabelKey, getProductCategoryLabelKey } from '../utils/display';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { buildMarketTelegramText, buildTelegramLink } from '../utils/telegram';

export function MyOrdersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        setOrders(await orderService.myOrders());
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner label={t('ordersPage.title')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('ordersPage.eyebrow')}
        title={t('ordersPage.title')}
        description={t('ordersPage.description')}
      />

      {orders.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {orders.map((order) => {
            const telegramUrl = buildTelegramLink(
              buildMarketTelegramText({
                product: order.product,
                quantity: order.quantity,
                paymentOption: order.paymentOption,
                notes: order.notes,
                user,
                deliveryAddress: order.deliveryAddress,
              }),
              order.seller?.businessProfile?.telegram,
            );

            return (
              <article key={order._id} className="app-card space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-green-300">
                      {t(getProductCategoryLabelKey(order.product?.category || 'Accessories'))}
                    </p>
                    <h3 className="mt-2 heading-font text-2xl font-semibold text-white">
                      {order.product?.name || t('common.noData')}
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                    {t(getGenericStatusLabelKey(order.status))}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>{t('labels.quantity')}</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('common.finalTotal')}</span>
                    <span>{formatCurrency(order.discountedTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('common.paidNow')}</span>
                    <span>{formatCurrency(order.paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('ordersPage.seller')}</span>
                    <span>{order.seller?.fullName || t('common.noData')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>{t('ordersPage.deliveryAddress')}</span>
                    <span className="text-right">{order.deliveryAddress || t('common.noData')}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>

                <a href={telegramUrl} target="_blank" rel="noreferrer" className="app-button-secondary w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {t('buttons.openTelegram')}
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t('ordersPage.emptyTitle')} description={t('ordersPage.emptyDescription')} />
      )}
    </div>
  );
}
