import api, { unwrap } from './api';

export const bookingService = {
  create: async (payload) => unwrap(await api.post('/bookings', payload)),
  myBookings: async () => unwrap(await api.get('/bookings/me')),
  confirm: async (id) => unwrap(await api.put(`/bookings/${id}/confirm`)),
  reject: async (id) => unwrap(await api.put(`/bookings/${id}/reject`)),
  edit: async (id, payload) => unwrap(await api.put(`/bookings/${id}/edit`, payload)),
  cancel: async (id) => unwrap(await api.delete(`/bookings/${id}`)),
};
