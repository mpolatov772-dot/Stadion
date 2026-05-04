import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../hooks/useI18n';
import { notificationService } from '../services/notificationService';
import { formatDateTime } from '../utils/formatters';

export function NotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.list();
        setNotifications(data.map((item) => ({ ...item, isRead: true })));
        await notificationService.markAllRead();
        window.dispatchEvent(new Event('notifications-updated'));
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleDelete = async (notificationId) => {
    setDeletingId(notificationId);
    try {
      await notificationService.remove(notificationId);
      setNotifications((current) => current.filter((item) => item._id !== notificationId));
      window.dispatchEvent(new Event('notifications-updated'));
      toast.success(t('messages.notificationDeleted'));
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return <LoadingSpinner label={t('nav.notifications')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('notificationsPage.eyebrow')}
        title={t('notificationsPage.title')}
        description={t('notificationsPage.description')}
      />

      {notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`app-card transition ${notification.isRead ? 'opacity-80' : 'ring-1 ring-green-500/20'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-green-300">
                    {notification.isRead ? t('common.status') : t('common.unread')}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{notification.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{notification.content}</p>
                  {notification.link ? (
                    <Link to={notification.link} className="mt-3 inline-flex text-sm text-green-300 underline-offset-2 hover:underline">
                      {t('common.details')}
                    </Link>
                  ) : null}
                  {notification.isRead ? (
                    <button
                      type="button"
                      className="app-button-secondary mt-3"
                      disabled={deletingId === notification._id}
                      onClick={() => handleDelete(notification._id)}
                    >
                      {deletingId === notification._id ? `${t('common.loadingData')}` : t('buttons.deleteNotification')}
                    </button>
                  ) : null}
                </div>
                <span className="text-xs text-gray-500">{formatDateTime(notification.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('notificationsPage.emptyTitle')}
          description={t('notificationsPage.emptyDescription')}
        />
      )}
    </div>
  );
}
