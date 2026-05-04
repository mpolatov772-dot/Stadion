import { randomUUID } from 'crypto';

import { getCollection, findById, insertOne, updateOne } from './baseModel.js';

const collectionName = 'products';

export const listProducts = async () => getCollection(collectionName);

export const listProductsBySeller = async (sellerId) => {
  const products = await getCollection(collectionName);
  return products.filter((product) => product.sellerId === sellerId);
};

export const findProductById = async (id) => findById(collectionName, id);

export const createProduct = async (product) =>
  insertOne(collectionName, {
    _id: product._id || randomUUID(),
    viewsCount: Number(product.viewsCount || 0),
    ordersCount: Number(product.ordersCount || 0),
    orderedQuantity: Number(product.orderedQuantity || 0),
    ...product,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  });

export const updateProduct = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
