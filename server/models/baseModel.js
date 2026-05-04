import { readDb, updateDb } from '../utils/fileDb.js';
import { createNotFoundError } from '../utils/appError.js';

export const getCollection = async (name) => {
  const db = await readDb();
  return db[name] || [];
};

export const findById = async (name, id) => {
  const collection = await getCollection(name);
  return collection.find((item) => item._id === id) || null;
};

export const insertOne = async (name, document) =>
  updateDb((db) => {
    db[name].push(document);
    return document;
  });

export const updateOne = async (name, id, updater) =>
  updateDb((db) => {
    const index = db[name].findIndex((item) => item._id === id);

    if (index === -1) {
      throw createNotFoundError();
    }

    const current = db[name][index];
    const nextDocument =
      typeof updater === 'function' ? updater(current) : { ...current, ...updater };

    db[name][index] = nextDocument;
    return nextDocument;
  });

export const removeOne = async (name, id) =>
  updateDb((db) => {
    const index = db[name].findIndex((item) => item._id === id);

    if (index === -1) {
      throw createNotFoundError();
    }

    const [removed] = db[name].splice(index, 1);
    return removed;
  });
