import bcrypt from 'bcryptjs';

import { createUser, findUserByEmail, sanitizeUser } from '../models/User.js';
import { listBlocksByUser } from '../models/Block.js';
import { listNotificationsByUser } from '../models/Notification.js';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/tokens.js';
import {
  assertRequired,
  assertSignupRole,
  isValidEmail,
} from '../utils/validation.js';

const enrichUser = async (user) => {
  const [blocks, notifications] = await Promise.all([
    listBlocksByUser(user._id),
    listNotificationsByUser(user._id),
  ]);
  const cooldownUntil = user.blockStats?.cooldownUntil || '';
  const hasCooldown = cooldownUntil && new Date(cooldownUntil) > new Date();

  return {
    ...sanitizeUser(user),
    meta: {
      activeBlocksCount: blocks.filter((block) => block.status === 'active').length,
      unreadNotificationsCount: notifications.filter((notification) => !notification.isRead).length,
      strikeCount: Number(user.blockStats?.strikeCount || 0),
      cooldownUntil,
      hasCooldown,
    },
  };
};

const buildAuthPayload = async (user) => ({
  token: signToken(user),
  user: await enrichUser(user),
});

export const register = async (req, res) => {
  const payload = req.body || {};

  assertRequired(['fullName', 'email', 'password', 'role'], payload);
  assertSignupRole(payload.role);

  if (!isValidEmail(payload.email)) {
    throw new AppError('Please enter a valid email address', 400);
  }

  if (String(payload.password).length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  const existingUser = await findUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await createUser({
    fullName: payload.fullName.trim(),
    email: payload.email.toLowerCase().trim(),
    phone: payload.phone?.trim() || '',
    avatar: payload.avatar?.trim() || '',
    role: payload.role,
    businessProfile: {
      businessName: payload.businessName?.trim() || '',
      district: payload.district?.trim() || '',
      telegram: payload.telegram?.trim() || '',
      experience: payload.experience?.trim() || '',
      city: payload.businessCity?.trim() || 'Tashkent',
      lat: Number(payload.businessLat) || 41.3111,
      lng: Number(payload.businessLng) || 69.2797,
    },
    passwordHash: await bcrypt.hash(payload.password, 10),
    preferences: {
      notifications: true,
      weeklyDigest: true,
      compactCards: false,
      proFeaturesPreview: false,
    },
  });

  res.status(201).json({
    success: true,
    data: await buildAuthPayload(user),
  });
};

export const login = async (req, res) => {
  const payload = req.body || {};

  assertRequired(['email', 'password'], payload);

  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({
    success: true,
    data: await buildAuthPayload(user),
  });
};

export const me = async (req, res) => {
  res.json({
    success: true,
    data: await enrichUser(req.user),
  });
};
