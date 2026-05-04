import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'stadiums';

export const listStadiums = async () => getCollection(collectionName);

export const listStadiumsByOwner = async (ownerId) => {
  const stadiums = await getCollection(collectionName);
  return stadiums.filter((stadium) => stadium.ownerId === ownerId);
};

export const findStadiumById = async (id) => findById(collectionName, id);

export const createStadium = async (stadium) =>
  insertOne(collectionName, {
    _id: stadium._id || randomUUID(),
    ...stadium,
    createdAt: stadium.createdAt || new Date().toISOString(),
    updatedAt: stadium.updatedAt || new Date().toISOString(),
  });

export const updateStadium = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
