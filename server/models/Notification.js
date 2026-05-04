import { randomUUID } from 'crypto';

import { getCollection, insertOne, removeOne, updateOne } from './baseModel.js';

const collectionName = 'notifications';

export const listNotifications = async () => getCollection(collectionName);

export const listNotificationsByUser = async (userId) => {
  const notifications = await getCollection(collectionName);
  return notifications.filter((notification) => notification.userId === userId);
};

export const createNotification = async (notification) =>
  insertOne(collectionName, {
    _id: notification._id || randomUUID(),
    isRead: false,
    createdAt: notification.createdAt || new Date().toISOString(),
    updatedAt: notification.updatedAt || new Date().toISOString(),
    ...notification,
  });

export const updateNotification = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));

export const removeNotification = async (id) => removeOne(collectionName, id);
