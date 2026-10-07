import api, { unwrap } from './api';

export const userService = {
  profile: async () => unwrap(await api.get('/users/me')),
  updateProfile: async (payload) => unwrap(await api.put('/users/me', payload)),
};
