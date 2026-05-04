import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';

import { BlockedRestrictionCard } from '../components/BlockedRestrictionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiError';
import { hasActiveBlockRestriction } from '../utils/blocking';
import { getProductCategoryLabelKey } from '../utils/display';
import { formatCurrency } from '../utils/formatters';
import { calculatePaymentBreakdown, PAYMENT_OPTIONS } from '../utils/payment';
import { paymentOptions } from '../utils/options';
import { productPlaceholderImage } from '../utils/placeholders';

export function ProductDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTIONS.PREPAY_30);
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const isBlocked = hasActiveBlockRestriction(user);

  useEffect(() => {
    const loadProduct = async () => {
      setProduct(await productService.details(id));
    };

    loadProduct();
  }, [id]);

  const breakdown = useMemo(
    () => calculatePaymentBreakdown((product?.price || 0) * Number(quantity || 1), paymentOption),
    [paymentOption, product?.price, quantity],
  );

  const handleBuy = async () => {
    if (isBlocked) {
      toast.error(t('errors.activeBlockActionRestricted'));
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error(t('errors.deliveryAddressRequired'));
      return;
    }

    if (paymentOption !== PAYMENT_OPTIONS.OFFLINE && !paymentConfirmed) {
      toast.error(t('errors.paymentConfirmationRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await orderService.createMarketOrder({
        productId: product._id,
        quantity: Number(quantity),
        paymentOption,
        notes,
        deliveryAddress,
      });
      setTelegramUrl(response.telegramUrl);
      toast.success(t('messages.orderCreated'));
      setProduct(await productService.details(id, { trackView: false }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.orderFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return <LoadingSpinner label={t('buttons.viewProduct')} />;
  }

  return (
    <div className="space-y-6">
      {isBlocked ? <BlockedRestrictionCard /> : null}

      <PageHeader
        eyebrow={t(getProductCategoryLabelKey(product.category))}
        title={product.name}
        description={product.description}
      />

      <div className="page-grid">
        <div className="space-y-6">
          <section className="app-card overflow-hidden p-0">
            <img
              src={product.images?.[0] || productPlaceholderImage}
              alt={product.name}
              className="h-[420px] w-full object-cover"
            />
          </section>
          <section className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('labels.specifications')}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.specs.map((spec) => (
                <span key={spec} className="rounded-full border border-white/10 px-3 py-1 text-sm text-gray-300">
                  {spec}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="app-card">
            <p className="text-sm text-gray-400">{t('roles.seller')}</p>
            <h3 className="mt-2 text-xl font-medium text-white">{product.seller?.fullName}</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-400">
              <p>{product.seller?.phone || t('common.noData')}</p>
              <p>{product.seller?.businessProfile?.telegram || '@tohtasinov10'}</p>
              <p>{product.seller?.businessProfile?.district || t('common.noData')}</p>
            </div>
            <p className="mt-2 text-sm text-gray-400">{t('cards.inStock', { count: product.stock })}</p>
            <p className="mt-4 heading-font text-3xl font-semibold text-green-300">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="app-card space-y-4">
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-4">
              {[
                t('market.stepProduct'),
                t('market.stepAddress'),
                t('market.stepPayment'),
                t('market.stepConfirm'),
              ].map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 px-3 py-2 text-center text-sm text-gray-300">
                  <span className="mr-2 text-green-300">{index + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
            <div>
              <label className="app-label">{t('labels.quantity')}</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                className="app-input"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">{t('market.quantityHint')}</p>
            </div>
            <div>
              <label className="app-label">{t('labels.deliveryAddress')}</label>
              <textarea
                className="app-input min-h-24"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder={t('placeholders.deliveryAddress')}
              />
            </div>
            <div>
              <label className="app-label">{t('labels.paymentOption')}</label>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${
                      paymentOption === option.value
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{t(option.labelKey)}</p>
                      <p className="text-sm text-gray-400">{t(option.descriptionKey)}</p>
                    </div>
                    <input
                      type="radio"
                      checked={paymentOption === option.value}
                      onChange={() => {
                        setPaymentOption(option.value);
                        if (option.value === PAYMENT_OPTIONS.OFFLINE) {
                          setPaymentConfirmed(false);
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
            {paymentOption !== PAYMENT_OPTIONS.OFFLINE ? (
              <label className="flex items-start gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(event) => setPaymentConfirmed(event.target.checked)}
                />
                <span>{t('market.paymentConfirmedNote')}</span>
              </label>
            ) : null}
            <div>
              <label className="app-label">{t('common.notes')}</label>
              <textarea
                className="app-input min-h-24"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('placeholders.orderNotes')}
              />
            </div>
            <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span>{t('common.totalPrice')}</span>
                <span>{formatCurrency(breakdown.totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('common.discount')}</span>
                <span>{formatCurrency(breakdown.discount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('common.paidNow')}</span>
                <span>{formatCurrency(breakdown.paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('common.remaining')}</span>
                <span>{formatCurrency(breakdown.remainingAmount)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-gray-200">
              <p className="font-medium text-white">{t('market.flowTitle')}</p>
              <p className="mt-2 text-gray-300">
                {t('market.telegramHint', {
                  username: product.seller?.businessProfile?.telegram || '@tohtasinov10',
                })}
              </p>
            </div>

            {isAuthenticated ? (
              isBlocked ? (
                <Link to="/requests" className="app-button w-full">
                  {t('blockedGate.action')}
                </Link>
              ) : (
              <button type="button" className="app-button football-button w-full" onClick={handleBuy} disabled={submitting}>
                {submitting ? t('buttons.confirmOrder') + '...' : t('buttons.confirmOrder')}
              </button>
              )
            ) : (
              <Link to="/login" className="app-button w-full">
                {t('buttons.loginToBuy')}
              </Link>
            )}

            {telegramUrl ? (
              <a href={telegramUrl} target="_blank" rel="noreferrer" className="app-button-secondary w-full">
                <Send className="mr-2 h-4 w-4" />
                {t('buttons.openTelegram')}
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
