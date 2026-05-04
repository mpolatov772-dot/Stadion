import api, { unwrap } from './api';

export const userService = {
  profile: async () => unwrap(await api.get('/users/me')),
  ownerUsers: async () => unwrap(await api.get('/users/owner/users')),
  updateProfile: async (payload) => unwrap(await api.put('/users/me', payload)),
  updatePreferences: async (payload) => unwrap(await api.put('/users/me/preferences', payload)),
  myPayments: async () => unwrap(await api.get('/payments/me')),
  myBlocks: async () => unwrap(await api.get('/blocks/me')),
  ownerBlocks: async () => unwrap(await api.get('/blocks/owner')),
  createBlock: async (payload) => unwrap(await api.post('/blocks', payload)),
  updateBlock: async (id, payload) => unwrap(await api.patch(`/blocks/${id}`, payload)),
  inboxRequests: async () => unwrap(await api.get('/unblock-requests/inbox')),
  outboxRequests: async () => unwrap(await api.get('/unblock-requests/outbox')),
  activeRequestableBlocks: async () => unwrap(await api.get('/unblock-requests/active-blocks')),
  createUnblockRequest: async (payload) => unwrap(await api.post('/unblock-requests', payload)),
  decideRequest: async (id, payload) => unwrap(await api.patch(`/unblock-requests/${id}`, payload)),
};
