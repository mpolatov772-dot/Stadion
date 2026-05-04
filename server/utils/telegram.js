import { TELEGRAM_USERNAME } from './constants.js';

const normalizeTelegramUsername = (value = '') =>
  String(value || '')
    .trim()
    .replace(/^@+/, '');

export const buildTelegramLink = (message, username = TELEGRAM_USERNAME) =>
  `https://t.me/${normalizeTelegramUsername(username) || TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

export const formatPaymentOptionForTelegram = (paymentOption) =>
  ({
    PREPAY_30: '30% avans',
    FULL_100: "100% to'lov",
    OFFLINE: "Naqd yoki joyida to'lov",
  }[paymentOption] || paymentOption);

export const buildMarketTelegramMessage = ({
  product,
  customer,
  quantity,
  paymentOption,
  notes,
  orderId,
  deliveryAddress,
}) =>
  [
    "Assalomu alaykum, do'kon buyurtmasi bo'yicha murojaat yuboryapman.",
    `Buyurtma raqami: ${orderId}`,
    `Mahsulot: ${product.name}`,
    `Soni: ${quantity}`,
    `To'lov turi: ${formatPaymentOptionForTelegram(paymentOption)}`,
    `Xaridor: ${customer.fullName}`,
    `Telefon: ${customer.phone || "ko'rsatilmagan"}`,
    `Email: ${customer.email}`,
    `Manzil: ${deliveryAddress || "ko'rsatilmagan"}`,
    `Izoh: ${notes || "yo'q"}`,
  ].join('\n');

export const buildStadiumTelegramMessage = ({
  stadium,
  customer,
  date,
  startTime,
  endTime,
  paymentOption,
  notes,
}) =>
  [
    "Assalomu alaykum, stadion bo'yicha so'rov yuborildi.",
    `Stadion: ${stadium.name}`,
    `Sana: ${date}`,
    `Vaqt: ${startTime} - ${endTime}`,
    `To'lov turi: ${formatPaymentOptionForTelegram(paymentOption)}`,
    `Mijoz: ${customer.fullName}`,
    `Telefon: ${customer.phone || "ko'rsatilmagan"}`,
    `Email: ${customer.email}`,
    `Izoh: ${notes || "yo'q"}`,
  ].join('\n');
