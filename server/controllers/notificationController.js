import { AppError } from '../utils/appError.js';
import {
  listNotificationsByUser,
  removeNotification,
  updateNotification,
} from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  const { unreadOnly = 'false', since = '' } = req.query;
  let notifications = await listNotificationsByUser(req.user._id);

  if (unreadOnly === 'true') {
    notifications = notifications.filter((notification) => !notification.isRead);
  }

  if (since) {
    const sinceTime = new Date(since);

    if (!Number.isNaN(sinceTime.getTime())) {
      notifications = notifications.filter((notification) => {
        const updatedAt = notification.updatedAt || notification.createdAt;
        return new Date(updatedAt) > sinceTime;
      });
    }
  }

  res.json({
    success: true,
    data: notifications.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
  });
};

export const markAllNotificationsRead = async (req, res) => {
  const notifications = await listNotificationsByUser(req.user._id);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);

  await Promise.all(
    unreadNotifications.map((notification) =>
      updateNotification(notification._id, {
        isRead: true,
      }),
    ),
  );

  res.json({
    success: true,
    data: {
      updated: unreadNotifications.length,
    },
  });
};

export const deleteNotificationById = async (req, res) => {
  const notifications = await listNotificationsByUser(req.user._id);
  const notification = notifications.find((item) => item._id === req.params.id);

  if (!notification) {
    throw new AppError('Resource not found', 404);
  }

  await removeNotification(notification._id);

  res.json({
    success: true,
    data: {
      deleted: true,
      id: notification._id,
    },
  });
};
