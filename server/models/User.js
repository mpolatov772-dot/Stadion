import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'users';

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const listUsers = async () => getCollection(collectionName);

export const findUserById = async (id) => findById(collectionName, id);

export const findUserByEmail = async (email) => {
  const users = await getCollection(collectionName);
  return users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
};

export const createUser = async (user) =>
  insertOne(collectionName, {
    _id: user._id || randomUUID(),
    ...user,
    businessProfile: user.businessProfile || {},
    blockStats: {
      strikeCount: 0,
      cooldownUntil: '',
      ...(user.blockStats || {}),
    },
    createdAt: user.createdAt || new Date().toISOString(),
  });

export const updateUser = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
