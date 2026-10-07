const replaceTemplateTokens = (template, values) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`:${key}`, encodeURIComponent(String(value ?? ''))),
    template,
  );

export const buildClickCheckoutUrl = ({
  amount,
  bookingId,
  stadiumId,
  paymentOption,
}) => {
  const normalizedAmount = Number(amount || 0);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return '';
  }

  const template = import.meta.env.VITE_CLICK_PAYMENT_URL_TEMPLATE;

  if (template) {
    return replaceTemplateTokens(template, {
      amount: normalizedAmount,
      bookingId,
      stadiumId,
      paymentOption,
      returnUrl: `${window.location.origin}/dashboard`,
    });
  }

  const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID;
  const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID;

  if (!serviceId || !merchantId) {
    return '';
  }

  const params = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount: String(normalizedAmount),
    transaction_param: bookingId,
    return_url: `${window.location.origin}/dashboard`,
  });

  return `https://my.click.uz/services/pay?${params.toString()}`;
};

export const isClickRedirectPaymentOption = (paymentOption) =>
  paymentOption === 'PREPAY_30' || paymentOption === 'FULL_100';
