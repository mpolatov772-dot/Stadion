import api, { unwrap } from './api';

export const dashboardService = {
  summary: async () => unwrap(await api.get('/dashboard/summary')),
};
