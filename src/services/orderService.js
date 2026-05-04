import api, { unwrap } from './api';

export const orderService = {
  createMarketOrder: async (payload) => unwrap(await api.post('/orders/market', payload)),
  myOrders: async () => unwrap(await api.get('/orders/me')),
  sellerOrders: async () => unwrap(await api.get('/orders/seller')),
};
