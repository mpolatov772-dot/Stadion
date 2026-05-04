import { listUsers } from '../models/User.js';
import {
  createStadium,
  findStadiumById,
  listStadiums,
  listStadiumsByOwner,
  updateStadium,
} from '../models/Stadium.js';
import { createFeedEntry } from '../models/Feed.js';
import { AppError } from '../utils/appError.js';
import {
  assertPositiveNumber,
  assertRequired,
  assertUzbekistanLocation,
  normalizeUzbekistanLocation,
  normalizeList,
} from '../utils/validation.js';
import { ROLES } from '../utils/constants.js';
import { buildDateAvailability, normalizeStadiumSchedule, WEEKDAY_KEYS } from '../utils/schedule.js';
import { buildUserLookup, serializeStadium } from '../utils/serializers.js';

const mapStadiumPayload = (payload) => {
  const normalizedLocation = normalizeUzbekistanLocation(payload.location);

  return {
    name: payload.name.trim(),
    description: payload.description.trim(),
    images: normalizeList(payload.images),
    location: normalizedLocation,
    price: assertPositiveNumber(payload.price, 'Price'),
    operationalCost: assertPositiveNumber(payload.operationalCost || 0, 'Operational cost'),
    equipment: normalizeList(payload.equipment),
    availableSlots: [],
    workingHours: WEEKDAY_KEYS.reduce((accumulator, weekdayKey) => {
      const source = payload.workingHours?.[weekdayKey] || {};
      accumulator[weekdayKey] = {
        enabled: Boolean(source.enabled),
        startTime: source.startTime || '09:00',
        endTime: source.endTime || '23:00',
      };
      return accumulator;
    }, {}),
  };
};

const validateStadiumPayload = (payload) => {
  assertRequired(['name', 'description', 'price'], payload);

  if (!payload.location?.city) {
    throw new AppError('Location with city and coordinates is required', 400);
  }

  const workingHours = payload.workingHours || {};
  const hasAtLeastOneWorkingDay = Object.values(workingHours).some((day) => day?.enabled);

  if (!hasAtLeastOneWorkingDay) {
    throw new AppError('At least one working day is required', 400);
  }

  Object.values(workingHours).forEach((day) => {
    if (!day?.enabled) {
      return;
    }

    if (!day.startTime || !day.endTime) {
      throw new AppError('Each working day must include startTime and endTime', 400);
    }

    if (day.startTime >= day.endTime) {
      throw new AppError('Each working day must have an end time after the start time', 400);
    }
  });

  assertUzbekistanLocation(payload.location);
};

export const getStadiums = async (req, res) => {
  const { search = '', city = '', ownerId = '' } = req.query;
  const stadiums = await listStadiums();
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  const filtered = stadiums.filter((stadium) => {
    const matchesSearch =
      !search ||
      stadium.name.toLowerCase().includes(String(search).toLowerCase()) ||
      stadium.description.toLowerCase().includes(String(search).toLowerCase());
    const matchesCity = !city || stadium.location.city === city;
    const matchesOwner = !ownerId || stadium.ownerId === ownerId;
    return matchesSearch && matchesCity && matchesOwner;
  });

  res.json({
    success: true,
    data: filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((stadium) => serializeStadium(normalizeStadiumSchedule(stadium), userLookup)),
  });
};

export const getMyStadiums = async (req, res) => {
  const users = await listUsers();
  const userLookup = buildUserLookup(users);
  const stadiums =
    req.user.role === ROLES.ADMIN
      ? await listStadiums()
      : await listStadiumsByOwner(req.user._id);

  res.json({
    success: true,
    data: stadiums.map((stadium) => serializeStadium(normalizeStadiumSchedule(stadium), userLookup)),
  });
};

export const getStadiumById = async (req, res) => {
  const stadium = await findStadiumById(req.params.id);

  if (!stadium) {
    throw new AppError('Stadium not found', 404);
  }

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: serializeStadium(normalizeStadiumSchedule(stadium), userLookup),
  });
};

export const createNewStadium = async (req, res) => {
  validateStadiumPayload(req.body);

  const stadium = await createStadium({
    ownerId: req.user._id,
    ...mapStadiumPayload(req.body),
  });

  await createFeedEntry({
    authorId: req.user._id,
    authorRole: req.user.role,
    type: 'stadium-update',
    title: "Yangi stadion qo'shildi",
    content: `${stadium.name} endi bron uchun ochiq.`,
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.status(201).json({
    success: true,
    data: serializeStadium(normalizeStadiumSchedule(stadium), userLookup),
  });
};

export const updateExistingStadium = async (req, res) => {
  const stadium = await findStadiumById(req.params.id);

  if (!stadium) {
    throw new AppError('Stadium not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && stadium.ownerId !== req.user._id) {
    throw new AppError('You can only update your own stadiums', 403);
  }

  validateStadiumPayload(req.body);

  const updated = await updateStadium(stadium._id, mapStadiumPayload(req.body));

  await createFeedEntry({
    authorId: req.user._id,
    authorRole: req.user.role,
    type: 'stadium-update',
    title: "Stadion ma'lumotlari yangilandi",
    content: `${updated.name} bo'yicha ma'lumotlar stadion egasi tomonidan yangilandi.`,
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: serializeStadium(normalizeStadiumSchedule(updated), userLookup),
  });
};

export const getStadiumAvailability = async (req, res) => {
  const stadium = await findStadiumById(req.params.id);

  if (!stadium) {
    throw new AppError('Stadium not found', 404);
  }

  const date = req.query.date;

  if (!date) {
    throw new AppError('date is required', 400);
  }

  const { listBookings } = await import('../models/Booking.js');
  const bookings = await listBookings();
  const normalizedStadium = normalizeStadiumSchedule(stadium);

  res.json({
    success: true,
    data: {
      stadium: normalizedStadium,
      date,
      slots: buildDateAvailability({
        stadium: normalizedStadium,
        date,
        bookings,
      }),
    },
  });
};
