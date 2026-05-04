import { useEffect, useRef } from 'react';

import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

const POLL_INTERVAL_MS = 45000;
const MAX_SAVED_IDS = 60;

const getStorageKeys = (userId) => ({
  lastSync: `stadion:last-notification-sync:${userId}`,
  shownIds: `stadion:shown-notifications:${userId}`,
});

const readShownIds = (key) => {
  try {
    const rawValue = window.localStorage.getItem(key);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeShownIds = (key, ids) => {
  window.localStorage.setItem(key, JSON.stringify(ids.slice(-MAX_SAVED_IDS)));
};

async function showBrowserNotification(notification) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: notification.content,
    tag: notification._id,
    data: {
      link: notification.link || '/notifications',
    },
  };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);

    if (registration?.showNotification) {
      await registration.showNotification(notification.title, options);
      return;
    }
  }

  const browserNotification = new Notification(notification.title, options);
  browserNotification.onclick = () => {
    window.focus();
    window.location.href = notification.link || '/notifications';
  };
}

export function NotificationBridge() {
  const { isAuthenticated, user } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?._id || user?.preferences?.notifications === false) {
      initializedRef.current = false;
      return undefined;
    }

    const keys = getStorageKeys(user._id);
    let cancelled = false;

    const ensureCapabilities = async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/notification-sw.js').catch(() => null);
      }

      if ('Notification' in window && window.isSecureContext && Notification.permission === 'default') {
        await Notification.requestPermission().catch(() => null);
      }
    };

    const syncNotifications = async ({ silent = false } = {}) => {
      const lastSync = window.localStorage.getItem(keys.lastSync);

      if (!initializedRef.current && !lastSync) {
        const existingNotifications = await notificationService.list({ unreadOnly: true });
        const newestTimestamp = existingNotifications[0]?.updatedAt || existingNotifications[0]?.createdAt;

        if (newestTimestamp) {
          window.localStorage.setItem(keys.lastSync, newestTimestamp);
        }

        writeShownIds(
          keys.shownIds,
          existingNotifications.map((item) => item._id),
        );
        initializedRef.current = true;
        return;
      }

      const freshNotifications = await notificationService.list({
        unreadOnly: true,
        since: lastSync || undefined,
      });

      if (!freshNotifications.length) {
        initializedRef.current = true;
        return;
      }

      const newestTimestamp = freshNotifications[0]?.updatedAt || freshNotifications[0]?.createdAt;
      if (newestTimestamp) {
        window.localStorage.setItem(keys.lastSync, newestTimestamp);
      }

      const shownIds = readShownIds(keys.shownIds);
      const shownIdSet = new Set(shownIds);
      const unseenNotifications = [...freshNotifications]
        .reverse()
        .filter((item) => !shownIdSet.has(item._id));

      if (unseenNotifications.length) {
        writeShownIds(keys.shownIds, [...shownIds, ...unseenNotifications.map((item) => item._id)]);
        window.dispatchEvent(new Event('notifications-updated'));
      }

      const shouldShowSystemNotifications =
        !silent &&
        (document.hidden || !document.hasFocus());

      if (shouldShowSystemNotifications) {
        for (const item of unseenNotifications) {
          if (cancelled) {
            return;
          }

          await showBrowserNotification(item);
        }
      }

      initializedRef.current = true;
    };

    ensureCapabilities().then(() => syncNotifications({ silent: true })).catch(() => null);

    const intervalId = window.setInterval(() => {
      syncNotifications().catch(() => null);
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncNotifications({ silent: true }).catch(() => null);
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user?._id, user?.preferences?.notifications]);

  return null;
}
