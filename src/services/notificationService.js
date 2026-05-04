import api, { unwrap } from './api';

export const notificationService = {
  list: async (params = {}) => unwrap(await api.get('/notifications', { params })),
  markAllRead: async () => unwrap(await api.post('/notifications/mark-all-read')),
  remove: async (id) => unwrap(await api.delete(`/notifications/${id}`)),
};
