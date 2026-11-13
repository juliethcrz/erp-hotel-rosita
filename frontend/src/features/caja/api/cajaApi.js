import { api } from '../../../lib/apiClient.js';

export const cajaApi = {
  actual: () => api.get('/caja/actual'),
  abrir: () => api.post('/caja/abrir'),
  cerrar: () => api.post('/caja/cerrar'),
  historial: () => api.get('/caja/historial'),
};
