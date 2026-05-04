import api, { unwrap } from './api';

export const contentService = {
  news: async (params = {}) => unwrap(await api.get('/football-news', { params })),
  matches: async (params = {}) => unwrap(await api.get('/football-news/matches', { params })),
  standings: async (params = {}) => unwrap(await api.get('/football-news/standings', { params })),
  feed: async (params = {}) => unwrap(await api.get('/feed', { params })),
  createFeedPost: async (payload) => unwrap(await api.post('/feed', payload)),
};
