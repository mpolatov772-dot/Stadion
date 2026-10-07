import api, { unwrap } from './api';

export const stadiumService = {
  list: async (params = {}) => unwrap(await api.get('/stadiums', { params })),
  details: async (id) => unwrap(await api.get(`/stadiums/${id}`)),
  availability: async (id, date) => unwrap(await api.get(`/stadiums/${id}/availability`, { params: { date } })),
  mine: async () => unwrap(await api.get('/stadiums/mine/list')),
  create: async (payload) => unwrap(await api.post('/stadiums', payload)),
  update: async (id, payload) => unwrap(await api.put(`/stadiums/${id}`, payload)),
  myRating: async (id) => unwrap(await api.get(`/stadiums/${id}/rating/me`)),
  submitRating: async (id, rating) => unwrap(await api.put(`/stadiums/${id}/rating`, { rating })),
};
