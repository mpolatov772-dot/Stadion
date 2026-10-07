export const formatCurrency = (value) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatCompactCurrency = (value) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('uz-UZ', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export const getTodayDateInUzbekistan = () =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getHourFromTime = (value = '00:00') => Number(String(value).split(':')[0] || 0);

export const getTimePeriodLabelKey = (value = '00:00') => {
  const hour = getHourFromTime(value);

  if (hour < 12) {
    return 'timePeriods.morning';
  }

  if (hour < 18) {
    return 'timePeriods.day';
  }

  return 'timePeriods.evening';
};

export const formatScheduleDate = (date) =>
  new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
