import api, { unwrap } from './api';

export const reportService = {
  ownerReport: async (params = {}) => unwrap(await api.get('/reports/owner', { params })),
};
