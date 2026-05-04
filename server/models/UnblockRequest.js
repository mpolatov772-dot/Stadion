import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'unblockRequests';

export const listUnblockRequests = async () => getCollection(collectionName);

export const listUnblockRequestsByOwner = async (ownerId) => {
  const requests = await getCollection(collectionName);
  return requests.filter((request) => request.ownerId === ownerId);
};

export const listUnblockRequestsByUser = async (blockedUserId) => {
  const requests = await getCollection(collectionName);
  return requests.filter((request) => request.blockedUserId === blockedUserId);
};

export const findUnblockRequestById = async (id) => findById(collectionName, id);

export const createUnblockRequest = async (request) =>
  insertOne(collectionName, {
    _id: request._id || randomUUID(),
    ...request,
    status: request.status || 'pending',
    createdAt: request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || new Date().toISOString(),
  });

export const updateUnblockRequest = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
