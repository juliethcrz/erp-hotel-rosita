import { api } from '../../../lib/apiClient.js';

export const notificacionesApi = {
  listar: () => api.get('/notificaciones'),
  marcarLeida: (id) => api.post(`/notificaciones/${id}/leer`),
  marcarTodas: () => api.post('/notificaciones/leer-todas'),
};
