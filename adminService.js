import api, { unwrap } from './api';

export const adminService = {
  users: async () => unwrap(await api.get('/admin/users')),
  updateUser: async (id, payload) => unwrap(await api.put(`/admin/users/${id}`, payload)),
  bookings: async () => unwrap(await api.get('/admin/bookings')),
  getSettings: async () => unwrap(await api.get('/admin/settings')),
  updateSettings: async (payload) => unwrap(await api.put('/admin/settings', payload)),
};
