import { randomUUID } from 'crypto';

import { findById, getCollection, insertOne } from './baseModel.js';

const collectionName = 'orders';

export const listOrders = async () => getCollection(collectionName);

export const listOrdersByUser = async (userId) => {
  const orders = await getCollection(collectionName);
  return orders.filter((order) => order.userId === userId);
};

export const listOrdersBySeller = async (sellerId) => {
  const orders = await getCollection(collectionName);
  return orders.filter((order) => order.sellerId === sellerId);
};

export const findOrderById = async (id) => findById(collectionName, id);

export const createOrder = async (order) =>
  insertOne(collectionName, {
    _id: order._id || randomUUID(),
    status: order.status || 'pending',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    ...order,
  });
