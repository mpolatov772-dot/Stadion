import { createNotification } from '../models/Notification.js';

export const notifyUser = async ({
  userId,
  type,
  title,
  content,
  link = '',
  metadata = {},
}) =>
  createNotification({
    userId,
    type,
    title,
    content,
    link,
    metadata,
  });

export const notifyUsers = async (userIds = [], payload) =>
  Promise.all(
    [...new Set(userIds.filter(Boolean))].map((userId) =>
      notifyUser({
        ...payload,
        userId,
      }),
    ),
  );
