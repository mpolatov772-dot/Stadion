import { randomUUID } from 'crypto';

import { getCollection, insertOne } from './baseModel.js';

const collectionName = 'payments';

export const listPayments = async () => getCollection(collectionName);

export const listPaymentsByPayer = async (payerId) => {
  const payments = await getCollection(collectionName);
  return payments.filter((payment) => payment.payerId === payerId);
};

export const findPaymentByBookingId = async (bookingId) => {
  const payments = await getCollection(collectionName);
  return payments.find((payment) => payment.bookingId === bookingId) || null;
};

export const createPayment = async (payment) =>
  insertOne(collectionName, {
    _id: payment._id || randomUUID(),
    ...payment,
    createdAt: payment.createdAt || new Date().toISOString(),
    updatedAt: payment.updatedAt || new Date().toISOString(),
  });
