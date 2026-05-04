import { listBlocksByUser } from '../models/Block.js';
import { findUserById } from '../models/User.js';
import { AppError } from './appError.js';
import { ROLES } from './constants.js';

export const listActiveBlocksByUser = async (userId) => {
  const blocks = await listBlocksByUser(userId);
  return blocks.filter((block) => block.status === 'active');
};

export const hasActionBlockRestriction = (user) =>
  Boolean(user && [ROLES.USER, ROLES.SELLER].includes(user.role));

export const assertNoActiveBlockRestriction = async (user) => {
  if (!hasActionBlockRestriction(user)) {
    return [];
  }

  const freshUser = await findUserById(user._id);
  const cooldownUntil = freshUser?.blockStats?.cooldownUntil || '';

  if (cooldownUntil && new Date(cooldownUntil) > new Date()) {
    throw new AppError('You are temporarily blocked for 24 hours after repeated violations', 403);
  }

  const activeBlocks = await listActiveBlocksByUser(user._id);

  if (activeBlocks.length) {
    throw new AppError(
      'You have active blocks and cannot use this action until the stadium owner removes them',
      403,
    );
  }

  return activeBlocks;
};
