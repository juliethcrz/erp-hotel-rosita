import { api } from '../../../lib/apiClient.js';

export const clientesApi = {
  buscar: (texto) => api.get(`/clientes${texto ? `?buscar=${encodeURIComponent(texto)}` : ''}`),
  crear: (datos) => api.post('/clientes', datos),
  actualizar: (id, datos) => api.patch(`/clientes/${id}`, datos),
};
