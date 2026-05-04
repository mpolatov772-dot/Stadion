import api, { unwrap } from './api';

export const bookingService = {
  create: async (payload) => unwrap(await api.post('/bookings', payload)),
  myBookings: async () => unwrap(await api.get('/bookings/me')),
  ownerBookings: async () => unwrap(await api.get('/bookings/owner')),
  updateStatus: async (id, payload) => unwrap(await api.patch(`/bookings/${id}/status`, payload)),
  markNoShow: async (id) => unwrap(await api.post(`/bookings/${id}/no-show`)),
};
