import { normalizeTelegramUsername } from './media';

const DEFAULT_TELEGRAM_USERNAME = 'tohtasinov10';

const formatPaymentOption = (paymentOption) =>
  ({
    PREPAY_30: '30% avans to‘lovi',
    FULL_100: "100% to'liq to'lov",
    OFFLINE: "Joyida yoki oflayn to'lov",
  }[paymentOption] || paymentOption);

export const buildTelegramLink = (text, username = DEFAULT_TELEGRAM_USERNAME) =>
  `https://t.me/${normalizeTelegramUsername(username) || DEFAULT_TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;

export const buildMarketTelegramText = ({
  product,
  quantity,
  paymentOption,
  notes,
  user,
  deliveryAddress,
}) =>
  [
    "Assalomu alaykum, mahsulot bo'yicha bog'lanmoqchiman.",
    `Mahsulot: ${product.name}`,
    `Soni: ${quantity}`,
    `To'lov turi: ${formatPaymentOption(paymentOption)}`,
    `Mijoz: ${user?.fullName || ''}`,
    `Telefon: ${user?.phone || "ko'rsatilmagan"}`,
    `Manzil: ${deliveryAddress || "ko'rsatilmagan"}`,
    `Izoh: ${notes || "yo'q"}`,
  ].join('\n');

export const buildStadiumTelegramText = ({
    stadium,
    date,
    slot,
    paymentOption,
    notes,
    user,
  }) =>
  [
    "Assalomu alaykum, stadion bo'yicha murojaat yubormoqchiman.",
    `Stadion: ${stadium.name}`,
    `Sana: ${date || "tanlanmagan"}`,
    `Vaqt: ${slot ? `${slot.startTime} - ${slot.endTime}` : "tanlanmagan"}`,
    `To'lov turi: ${paymentOption ? formatPaymentOption(paymentOption) : "tanlanmagan"}`,
    `Mijoz: ${user?.fullName || ''}`,
    `Telefon: ${user?.phone || "ko'rsatilmagan"}`,
    `Izoh: ${notes || "yo'q"}`,
  ].join('\n');
