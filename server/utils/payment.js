import { PAYMENT_OPTIONS } from './constants.js';

const roundMoney = (value) => Number(value.toFixed(2));

export const buildPaymentBreakdown = (baseAmount, paymentOption) => {
  const totalPrice = roundMoney(Number(baseAmount || 0));
  const discount =
    paymentOption === PAYMENT_OPTIONS.FULL_100 ? roundMoney(totalPrice * 0.1) : 0;
  const discountedTotal = roundMoney(totalPrice - discount);
  const paidAmount =
    paymentOption === PAYMENT_OPTIONS.FULL_100
      ? discountedTotal
      : paymentOption === PAYMENT_OPTIONS.OFFLINE
        ? 0
        : roundMoney(discountedTotal * 0.3);
  const remainingAmount = roundMoney(discountedTotal - paidAmount);

  return {
    totalPrice,
    discount,
    discountedTotal,
    paidAmount,
    remainingAmount,
    paymentOption,
  };
};
