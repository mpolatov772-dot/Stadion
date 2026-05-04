import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'bookings';

export const listBookings = async () => getCollection(collectionName);

export const listBookingsByUser = async (userId) => {
  const bookings = await getCollection(collectionName);
  return bookings.filter((booking) => booking.userId === userId);
};

export const listBookingsByOwner = async (ownerId) => {
  const bookings = await getCollection(collectionName);
  return bookings.filter((booking) => booking.ownerId === ownerId);
};

export const findBookingById = async (id) => findById(collectionName, id);

export const createBooking = async (booking) =>
  insertOne(collectionName, {
    _id: booking._id || randomUUID(),
    ...booking,
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: booking.updatedAt || new Date().toISOString(),
  });

export const updateBooking = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
