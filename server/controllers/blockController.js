import {
  createBlock,
  findActiveBlock,
  findBlockById,
  listBlocks,
  listBlocksByOwner,
  listBlocksByUser,
  updateBlock,
} from '../models/Block.js';
import { findBookingById } from '../models/Booking.js';
import { findUserById, listUsers, updateUser } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { USER_BLOCK_COOLDOWN_HOURS, USER_BLOCK_STRIKE_LIMIT, ROLES } from '../utils/constants.js';
import { notifyUser } from '../utils/notifications.js';
import { buildUserLookup, serializeBlock } from '../utils/serializers.js';

const addCooldownHours = (hours) => {
  const target = new Date();
  target.setHours(target.getHours() + hours);
  return target.toISOString();
};

export const getOwnerBlocks = async (req, res) => {
  const blocks =
    req.user.role === ROLES.ADMIN ? await listBlocks() : await listBlocksByOwner(req.user._id);
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: blocks.map((block) => serializeBlock(block, userLookup)),
  });
};

export const getMyBlocks = async (req, res) => {
  const blocks = await listBlocksByUser(req.user._id);
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: blocks.map((block) => serializeBlock(block, userLookup)),
  });
};

export const createManualBlock = async (req, res) => {
  const { blockedUserId, reason = '', bookingId = null } = req.body || {};

  if (!blockedUserId) {
    throw new AppError('blockedUserId is required', 400);
  }

  if (!reason?.trim()) {
    throw new AppError('reason is required', 400);
  }

  if (bookingId) {
    const booking = await findBookingById(bookingId);
    if (!booking || (req.user.role !== ROLES.ADMIN && booking.ownerId !== req.user._id)) {
      throw new AppError('The booking is not available for this block action', 403);
    }
  }

  const existingBlock = await findActiveBlock(req.user._id, blockedUserId);

  if (existingBlock) {
    throw new AppError('This user is already blocked', 409);
  }

  const blockedUser = await findUserById(blockedUserId);

  if (!blockedUser) {
    throw new AppError('Resource not found', 404);
  }

  const block = await createBlock({
    ownerId: req.user._id,
    blockedUserId,
    bookingId,
    reason: reason.trim(),
  });

  const nextStrikeCount = Number(blockedUser.blockStats?.strikeCount || 0) + 1;
  const nextCooldownUntil =
    nextStrikeCount >= USER_BLOCK_STRIKE_LIMIT &&
    nextStrikeCount % USER_BLOCK_STRIKE_LIMIT === 0
      ? addCooldownHours(USER_BLOCK_COOLDOWN_HOURS)
      : blockedUser.blockStats?.cooldownUntil || '';

  await updateUser(blockedUserId, {
    blockStats: {
      strikeCount: nextStrikeCount,
      cooldownUntil: nextCooldownUntil,
    },
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  await notifyUser({
    userId: blockedUserId,
    type: 'blocked-user',
    title: 'Siz bloklandingiz',
    content: `${req.user.fullName} sizni vaqtincha blokladi. Sabab: ${reason.trim()}.`,
    link: '/requests',
    metadata: {
      blockId: block._id,
    },
  });

  if (nextCooldownUntil && new Date(nextCooldownUntil) > new Date()) {
    await notifyUser({
      userId: blockedUserId,
      type: 'blocked-user-cooldown',
      title: '24 soatlik cheklov yoqildi',
      content: `Siz ${USER_BLOCK_STRIKE_LIMIT} ta blokka yetganingiz uchun ${USER_BLOCK_COOLDOWN_HOURS} soatga vaqtincha cheklov oldingiz.`,
      link: '/requests',
      metadata: {
        cooldownUntil: nextCooldownUntil,
        strikeCount: nextStrikeCount,
      },
    });
  }

  res.status(201).json({
    success: true,
    data: serializeBlock(block, userLookup),
  });
};

export const updateOwnerBlockStatus = async (req, res) => {
  const block = await findBlockById(req.params.id);

  if (!block) {
    throw new AppError('Block not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && block.ownerId !== req.user._id) {
    throw new AppError('You can only manage your own blocks', 403);
  }

  const { status, liftReason = '' } = req.body || {};

  if (!['active', 'lifted'].includes(status)) {
    throw new AppError('Status must be active or lifted', 400);
  }

  if (status === 'lifted' && !liftReason?.trim()) {
    throw new AppError('liftReason is required', 400);
  }

  const updated = await updateBlock(block._id, {
    status,
    liftReason: status === 'lifted' ? liftReason.trim() : block.liftReason || '',
  });
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  if (status === 'lifted') {
    await notifyUser({
      userId: block.blockedUserId,
      type: 'unblocked-user',
      title: 'Blok bekor qilindi',
      content: `Stadion egasi siz uchun cheklovni olib tashladi. Sabab: ${liftReason.trim()}.`,
      link: '/dashboard',
      metadata: {
        blockId: block._id,
      },
    });
  }

  res.json({
    success: true,
    data: serializeBlock(updated, userLookup),
  });
};
