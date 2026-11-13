import { api } from '../../../lib/apiClient.js';

export const limpiezasApi = {
  listar: () => api.get('/limpiezas'),
  iniciar: (id) => api.post(`/limpiezas/${id}/iniciar`),
  terminar: (id, observaciones) =>
    api.post(`/limpiezas/${id}/terminar`, { observaciones: observaciones || undefined }),
};
