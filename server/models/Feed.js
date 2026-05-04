import { randomUUID } from 'crypto';

import { getCollection, insertOne } from './baseModel.js';

const collectionName = 'feed';

export const listFeed = async () => getCollection(collectionName);

export const createFeedEntry = async (entry) =>
  insertOne(collectionName, {
    _id: entry._id || randomUUID(),
    ...entry,
    createdAt: entry.createdAt || new Date().toISOString(),
  });
