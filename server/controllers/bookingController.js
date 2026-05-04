import { createBlock, findActiveBlock } from '../models/Block.js';
import {
  createBooking,
  findBookingById,
  listBookings,
  listBookingsByOwner,
  listBookingsByUser,
  updateBooking,
} from '../models/Booking.js';
import { findPaymentByBookingId, createPayment, listPayments } from '../models/Payment.js';
import { findStadiumById, listStadiums } from '../models/Stadium.js';
import { listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { assertNoActiveBlockRestriction } from '../utils/blocking.js';
import {
  BOOKING_STATUSES,
  PAYMENT_CONTEXTS,
  PAYMENT_OPTIONS,
  ROLES,
} from '../utils/constants.js';
import { notifyUser } from '../utils/notifications.js';
import { buildPaymentBreakdown } from '../utils/payment.js';
import {
  buildDateAvailability,
  getWeekdayKeyFromDate,
  isBlockingBookingStatus,
  isOverlapping,
  normalizeStadiumSchedule,
  toMinutes,
} from '../utils/schedule.js';
import { buildUserLookup, serializeBooking, serializeStadium } from '../utils/serializers.js';

const buildLookups = async () => {
  const [users, stadiums] = await Promise.all([listUsers(), listStadiums()]);
  return {
    userLookup: buildUserLookup(users),
    stadiumLookup: new Map(
      stadiums.map((stadium) => [
        stadium._id,
        serializeStadium(normalizeStadiumSchedule(stadium), buildUserLookup(users)),
      ]),
    ),
  };
};

export const createNewBooking = async (req, res) => {
  const { stadiumId, date, startTime, endTime, paymentOption, notes = '' } = req.body || {};

  if (!stadiumId || !date || !startTime || !endTime || !paymentOption) {
    throw new AppError('stadiumId, date, startTime, endTime, and paymentOption are required', 400);
  }

  if (!Object.values(PAYMENT_OPTIONS).includes(paymentOption)) {
    throw new AppError('Invalid payment option selected', 400);
  }

  await assertNoActiveBlockRestriction(req.user);

  const stadium = await findStadiumById(stadiumId);

  if (!stadium) {
    throw new AppError('Stadium not found', 404);
  }

  const activeBlock = await findActiveBlock(stadium.ownerId, req.user._id);

  if (activeBlock) {
    throw new AppError('You are blocked by this stadium owner and cannot place a booking', 403);
  }

  const normalizedStadium = normalizeStadiumSchedule(stadium);
  const bookings = await listBookings();
  const weekdayKey = getWeekdayKeyFromDate(date);
  const workingDay = weekdayKey ? normalizedStadium.workingHours?.[weekdayKey] : null;
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  if (!workingDay?.enabled) {
    throw new AppError('The stadium is closed on the selected day', 400);
  }

  if (startMinutes >= endMinutes) {
    throw new AppError('End time must be after start time', 400);
  }

  if (startMinutes % 60 !== 0 || endMinutes % 60 !== 0) {
    throw new AppError('Booking time must be selected in 1 hour steps', 400);
  }

  if (
    startMinutes < toMinutes(workingDay.startTime) ||
    endMinutes > toMinutes(workingDay.endTime)
  ) {
    throw new AppError('Selected time is outside the stadium working hours', 400);
  }

  const conflictingBooking = bookings.find(
    (booking) =>
      booking.stadiumId === stadiumId &&
      booking.date === date &&
      isBlockingBookingStatus(booking.status) &&
      isOverlapping(booking.startTime, booking.endTime, startTime, endTime),
  );

  if (conflictingBooking) {
    throw new AppError('This stadium is already booked for the selected time slot', 409);
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  const paymentBreakdown = buildPaymentBreakdown(Number(stadium.price || 0) * durationHours, paymentOption);
  const booking = await createBooking({
    stadiumId,
    ownerId: stadium.ownerId,
    userId: req.user._id,
    date,
    startTime,
    endTime,
    paymentOption,
    notes: notes.trim(),
    status: BOOKING_STATUSES.PENDING,
    ...paymentBreakdown,
  });

  const { userLookup, stadiumLookup } = await buildLookups();

  await notifyUser({
    userId: stadium.ownerId,
    type: 'booking-request',
    title: "Yangi bron so'rovi",
    content: `${req.user.fullName} ${stadium.name} uchun yangi bron so'rovi yubordi.`,
    link: '/dashboard',
    metadata: {
      bookingId: booking._id,
      stadiumId,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      booking: serializeBooking(booking, userLookup, stadiumLookup),
      payment: null,
    },
  });
};

export const getMyBookings = async (req, res) => {
  const bookings = await listBookingsByUser(req.user._id);
  const { userLookup, stadiumLookup } = await buildLookups();

  res.json({
    success: true,
    data: bookings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
  });
};

export const getOwnerBookings = async (req, res) => {
  const bookings =
    req.user.role === ROLES.ADMIN
      ? await listBookings()
      : await listBookingsByOwner(req.user._id);
  const { userLookup, stadiumLookup } = await buildLookups();

  res.json({
    success: true,
    data: bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((booking) => serializeBooking(booking, userLookup, stadiumLookup)),
  });
};

export const updateBookingStatus = async (req, res) => {
  const booking = await findBookingById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const { status } = req.body || {};

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  if (!Object.values(BOOKING_STATUSES).includes(status)) {
    throw new AppError('Invalid booking status', 400);
  }

  const isOwner = booking.ownerId === req.user._id;
  const isBooker = booking.userId === req.user._id;
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isBooker && !isAdmin) {
    throw new AppError('You do not have permission to update this booking', 403);
  }

  if (isBooker && status !== BOOKING_STATUSES.CANCELLED) {
    throw new AppError('Bookers can only cancel their own bookings', 403);
  }

  const updatedBooking = await updateBooking(booking._id, { status });
  let payment = null;

  if (status === BOOKING_STATUSES.CONFIRMED) {
    payment = await findPaymentByBookingId(booking._id);

    if (!payment) {
      payment = await createPayment({
        stadiumId: booking.stadiumId,
        bookingId: booking._id,
        productId: null,
        payerId: booking.userId,
        payeeId: booking.ownerId,
        contextType: PAYMENT_CONTEXTS.STADIUM,
        status: booking.paymentOption === PAYMENT_OPTIONS.OFFLINE ? 'offline_pending' : 'mock_paid',
        totalPrice: booking.totalPrice,
        discount: booking.discount,
        discountedTotal: booking.discountedTotal,
        paidAmount: booking.paidAmount,
        remainingAmount: booking.remainingAmount,
        paymentOption: booking.paymentOption,
      });
    }
  }

  const { userLookup, stadiumLookup } = await buildLookups();

  if (isOwner && !isBooker) {
    await notifyUser({
      userId: booking.userId,
      type: 'booking-status',
      title: 'Bron holati yangilandi',
      content: `${booking.stadiumId ? stadiumLookup.get(booking.stadiumId)?.name || 'Stadion' : 'Bron'} uchun holat yangilandi.`,
      link: '/dashboard',
      metadata: {
        bookingId: booking._id,
        status,
      },
    });
  }

  res.json({
    success: true,
    data: {
      booking: serializeBooking(updatedBooking, userLookup, stadiumLookup),
      payment,
    },
  });
};

export const markBookingAsNoShow = async (req, res) => {
  const booking = await findBookingById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && booking.ownerId !== req.user._id) {
    throw new AppError('Only the stadium owner can mark this booking as no-show', 403);
  }

  const updatedBooking = await updateBooking(booking._id, {
    status: BOOKING_STATUSES.NO_SHOW,
  });

  const existingBlock = await findActiveBlock(booking.ownerId, booking.userId);
  const block =
    existingBlock ||
    (await createBlock({
      ownerId: booking.ownerId,
      blockedUserId: booking.userId,
      bookingId: booking._id,
      reason: 'No-show booking',
    }));

  const { userLookup, stadiumLookup } = await buildLookups();

  await notifyUser({
    userId: booking.userId,
    type: 'blocked-user',
    title: 'Hisobingiz bloklandi',
    content: "Bronga kelmaganingiz sababli stadion egasi sizni vaqtincha blokladi.",
    link: '/requests',
    metadata: {
      bookingId: booking._id,
      blockId: block._id,
    },
  });

  res.json({
    success: true,
    data: {
      booking: serializeBooking(updatedBooking, userLookup, stadiumLookup),
      block,
    },
  });
};

export const getBookingFinanceSummary = async (_req, res) => {
  const payments = await listPayments();
  res.json({
    success: true,
    data: payments,
  });
};
