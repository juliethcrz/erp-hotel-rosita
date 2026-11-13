import { api } from '../../../lib/apiClient.js';

export const habitacionesApi = {
  listar: () => api.get('/habitaciones'),
  disponibles: (llegada, salida) =>
    api.get(`/habitaciones/disponibles?llegada=${llegada}&salida=${salida}`),
  cambiarEstado: (id, estado) => api.patch(`/habitaciones/${id}/estado`, { estado }),
};
