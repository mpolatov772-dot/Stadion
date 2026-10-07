import api, { unwrap } from './api';

export const ownerService = {
  bookings: async () => unwrap(await api.get('/owner/bookings')),
  stats: async () => unwrap(await api.get('/owner/stats')),
  dashboard: async () => unwrap(await api.get('/owner/dashboard')),
};
