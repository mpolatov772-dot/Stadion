import api, { unwrap } from './api';

export const authService = {
  login: async (payload) => unwrap(await api.post('/auth/login', payload)),
  register: async (payload) => unwrap(await api.post('/auth/register', payload)),
  me: async () => unwrap(await api.get('/auth/me')),
};
