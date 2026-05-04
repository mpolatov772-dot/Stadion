export const PAYMENT_OPTIONS = {
  PREPAY_30: 'PREPAY_30',
  FULL_100: 'FULL_100',
  OFFLINE: 'OFFLINE',
};

export const calculatePaymentBreakdown = (baseAmount, paymentOption) => {
  const totalPrice = Number(baseAmount || 0);
  const discount = paymentOption === PAYMENT_OPTIONS.FULL_100 ? totalPrice * 0.1 : 0;
  const discountedTotal = totalPrice - discount;
  const paidAmount =
    paymentOption === PAYMENT_OPTIONS.FULL_100
      ? discountedTotal
      : paymentOption === PAYMENT_OPTIONS.OFFLINE
        ? 0
        : discountedTotal * 0.3;
  const remainingAmount = discountedTotal - paidAmount;

  return {
    totalPrice,
    discount,
    discountedTotal,
    paidAmount,
    remainingAmount,
  };
};
