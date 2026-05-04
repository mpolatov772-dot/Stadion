import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'blocks';

export const listBlocks = async () => getCollection(collectionName);

export const listBlocksByOwner = async (ownerId) => {
  const blocks = await getCollection(collectionName);
  return blocks.filter((block) => block.ownerId === ownerId);
};

export const listBlocksByUser = async (blockedUserId) => {
  const blocks = await getCollection(collectionName);
  return blocks.filter((block) => block.blockedUserId === blockedUserId);
};

export const findBlockById = async (id) => findById(collectionName, id);

export const findActiveBlock = async (ownerId, blockedUserId) => {
  const blocks = await getCollection(collectionName);
  return (
    blocks.find(
      (block) =>
        block.ownerId === ownerId &&
        block.blockedUserId === blockedUserId &&
        block.status === 'active',
    ) || null
  );
};

export const createBlock = async (block) =>
  insertOne(collectionName, {
    _id: block._id || randomUUID(),
    ...block,
    status: block.status || 'active',
    createdAt: block.createdAt || new Date().toISOString(),
    updatedAt: block.updatedAt || new Date().toISOString(),
  });

export const updateBlock = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
