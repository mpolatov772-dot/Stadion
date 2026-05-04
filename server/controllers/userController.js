import { listBlocksByOwner, listBlocksByUser } from '../models/Block.js';
import { listBookingsByOwner } from '../models/Booking.js';
import { listUnblockRequestsByOwner } from '../models/UnblockRequest.js';
import { listUsers, sanitizeUser, updateUser } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/constants.js';

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: sanitizeUser(req.user),
  });
};

export const getOwnerUsers = async (req, res) => {
  if (![ROLES.STADIUM_OWNER, ROLES.ADMIN].includes(req.user.role)) {
    throw new AppError('You do not have access to this resource', 403);
  }

  const [users, bookings, blocks, requests] = await Promise.all([
    listUsers(),
    listBookingsByOwner(req.user._id),
    listBlocksByOwner(req.user._id),
    listUnblockRequestsByOwner(req.user._id),
  ]);

  const userMap = new Map();

  bookings.forEach((booking) => {
    const current = userMap.get(booking.userId) || {
      bookingCount: 0,
      history: [],
      lastBookingAt: null,
      isBlocked: false,
      pendingRequests: 0,
    };
    current.bookingCount += 1;
    current.history.push(booking);
    current.lastBookingAt = current.lastBookingAt
      ? new Date(current.lastBookingAt) > new Date(booking.createdAt)
        ? current.lastBookingAt
        : booking.createdAt
      : booking.createdAt;
    userMap.set(booking.userId, current);
  });

  blocks.forEach((block) => {
    const current = userMap.get(block.blockedUserId) || {
      bookingCount: 0,
      history: [],
      lastBookingAt: null,
      isBlocked: false,
      pendingRequests: 0,
    };
    const currentBlock = current.block;
    const shouldReplaceBlock =
      !currentBlock ||
      (currentBlock.status !== 'active' && block.status === 'active') ||
      new Date(block.updatedAt || block.createdAt || 0) >
        new Date(currentBlock.updatedAt || currentBlock.createdAt || 0);

    current.isBlocked = current.isBlocked || block.status === 'active';
    if (shouldReplaceBlock) {
      current.block = block;
    }
    userMap.set(block.blockedUserId, current);
  });

  requests.forEach((request) => {
    const current = userMap.get(request.blockedUserId) || {
      bookingCount: 0,
      history: [],
      lastBookingAt: null,
      isBlocked: false,
      pendingRequests: 0,
    };
    current.pendingRequests += request.status === 'pending' ? 1 : 0;
    current.requests = [...(current.requests || []), request];
    userMap.set(request.blockedUserId, current);
  });

  res.json({
    success: true,
    data: [...userMap.entries()]
      .map(([userId, meta]) => ({
        user: sanitizeUser(users.find((user) => user._id === userId)),
        ...meta,
      }))
      .filter((entry) => entry.user),
  });
};

export const updateProfile = async (req, res) => {
  const payload = req.body || {};

  const user = await updateUser(req.user._id, {
    fullName: payload.fullName?.trim() || req.user.fullName,
    phone: payload.phone?.trim() || req.user.phone,
    avatar: payload.avatar?.trim() || req.user.avatar,
    businessProfile: {
      ...(req.user.businessProfile || {}),
      businessName: payload.businessName?.trim() ?? req.user.businessProfile?.businessName ?? '',
      district: payload.district?.trim() ?? req.user.businessProfile?.district ?? '',
      telegram: payload.telegram?.trim() ?? req.user.businessProfile?.telegram ?? '',
      experience: payload.experience?.trim() ?? req.user.businessProfile?.experience ?? '',
      city: payload.businessCity?.trim() ?? req.user.businessProfile?.city ?? 'Tashkent',
      lat: Number(payload.businessLat ?? req.user.businessProfile?.lat ?? 41.3111),
      lng: Number(payload.businessLng ?? req.user.businessProfile?.lng ?? 69.2797),
    },
  });

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
};

export const updatePreferences = async (req, res) => {
  const preferences = req.body || {};

  const user = await updateUser(req.user._id, {
    preferences: {
      ...req.user.preferences,
      ...preferences,
    },
  });

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
};
