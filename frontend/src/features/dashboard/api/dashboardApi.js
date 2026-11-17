import { api } from '../../../lib/apiClient.js';

export const dashboardApi = {
  obtener: () => api.get('/dashboard'),
};
