import { getCollection } from './baseModel.js';
import { updateDb } from '../utils/fileDb.js';

const collectionName = 'news';

export const listNews = async () => getCollection(collectionName);

export const replaceNews = async (items = []) =>
  updateDb((db) => {
    db[collectionName] = Array.isArray(items) ? items : [];
    return db[collectionName];
  });
