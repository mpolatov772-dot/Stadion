import api, { unwrap } from './api';

export const productService = {
  list: async (params = {}) => unwrap(await api.get('/products', { params })),
  details: async (id, params = {}) => unwrap(await api.get(`/products/${id}`, { params })),
  mine: async () => unwrap(await api.get('/products/mine/list')),
  create: async (payload) => unwrap(await api.post('/products', payload)),
  update: async (id, payload) => unwrap(await api.put(`/products/${id}`, payload)),
  checkout: async (payload) => unwrap(await api.post('/payments/product-checkout', payload)),
};
