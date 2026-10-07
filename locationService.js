import api, { unwrap } from './api';

export const locationService = {
  search: async (query, options = {}) =>
    unwrap(await api.get('/geo/search', { params: { q: query, ...options } })),
  reverse: async (lat, lng) => unwrap(await api.get('/geo/reverse', { params: { lat, lng } })),
  pitches: async ({ south, west, north, east }) =>
    unwrap(await api.get('/geo/pitches', { params: { south, west, north, east } })),
  boundary: async () => unwrap(await api.get('/geo/boundary')),
};
