import { BOOKING_STATUSES, WEEKDAY_KEYS } from './constants.js';

export { WEEKDAY_KEYS };

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '23:00';
const BOOKING_STEP_MINUTES = 60;

const DAY_INDEX_TO_KEY = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const toMinutes = (value = '00:00') => {
  const [hours, minutes] = String(value).split(':').map(Number);
  return Number(hours || 0) * 60 + Number(minutes || 0);
};

export const formatMinutes = (value = 0) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const isOverlapping = (firstStart, firstEnd, secondStart, secondEnd) =>
  toMinutes(firstStart) < toMinutes(secondEnd) && toMinutes(secondStart) < toMinutes(firstEnd);

export const isBlockingBookingStatus = (status) =>
  [
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.NO_SHOW,
  ].includes(status);

const deriveWorkingHoursFromAvailableSlots = (availableSlots = []) => {
  if (!availableSlots.length) {
    return null;
  }

  const rangesByDay = {};

  availableSlots.forEach((slot) => {
    const weekdayKey = getWeekdayKeyFromDate(slot.date);

    if (!weekdayKey) {
      return;
    }

    const current = rangesByDay[weekdayKey];

    if (!current) {
      rangesByDay[weekdayKey] = {
        enabled: true,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
      return;
    }

    if (toMinutes(slot.startTime) < toMinutes(current.startTime)) {
      current.startTime = slot.startTime;
    }

    if (toMinutes(slot.endTime) > toMinutes(current.endTime)) {
      current.endTime = slot.endTime;
    }
  });

  return WEEKDAY_KEYS.reduce((accumulator, weekdayKey) => {
    accumulator[weekdayKey] =
      rangesByDay[weekdayKey] || {
        enabled: false,
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
      };
    return accumulator;
  }, {});
};

export const normalizeStadiumSchedule = (stadium = {}) => {
  const workingHours =
    stadium.workingHours && Object.keys(stadium.workingHours).length
      ? stadium.workingHours
      : deriveWorkingHoursFromAvailableSlots(stadium.availableSlots);

  const normalizedWorkingHours = WEEKDAY_KEYS.reduce((accumulator, weekdayKey) => {
    const source = workingHours?.[weekdayKey] || {};
    accumulator[weekdayKey] = {
      enabled: Boolean(source.enabled),
      startTime: source.startTime || DEFAULT_START_TIME,
      endTime: source.endTime || DEFAULT_END_TIME,
    };
    return accumulator;
  }, {});

  return {
    ...stadium,
    workingHours: normalizedWorkingHours,
  };
};

export const getWeekdayKeyFromDate = (date) => {
  if (!date) {
    return null;
  }

  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  return DAY_INDEX_TO_KEY[dayIndex] || null;
};

export const generateSlotsForDate = (stadium, date) => {
  const normalizedStadium = normalizeStadiumSchedule(stadium);
  const weekdayKey = getWeekdayKeyFromDate(date);
  const hours = weekdayKey ? normalizedStadium.workingHours?.[weekdayKey] : null;

  if (!hours?.enabled) {
    return [];
  }

  const startMinutes = toMinutes(hours.startTime);
  const endMinutes = toMinutes(hours.endTime);

  const slots = [];
  let cursor = startMinutes;

  while (cursor + BOOKING_STEP_MINUTES <= endMinutes) {
    const slotStart = formatMinutes(cursor);
    const slotEnd = formatMinutes(cursor + BOOKING_STEP_MINUTES);

    slots.push({
      id: `${date}-${slotStart}-${slotEnd}`,
      date,
      startTime: slotStart,
      endTime: slotEnd,
    });

    cursor += BOOKING_STEP_MINUTES;
  }

  return slots;
};

export const buildDateAvailability = ({ stadium, date, bookings = [] }) => {
  const slots = generateSlotsForDate(stadium, date);

  return slots.map((slot) => {
    const conflictingBooking = bookings.find(
      (booking) =>
        booking.date === date &&
        booking.stadiumId === stadium._id &&
        isBlockingBookingStatus(booking.status) &&
        isOverlapping(booking.startTime, booking.endTime, slot.startTime, slot.endTime),
    );

    return {
      ...slot,
      available: !conflictingBooking,
      bookingId: conflictingBooking?._id || null,
      bookingStatus: conflictingBooking?.status || null,
    };
  });
};
