import { api } from '../../../lib/apiClient.js';

export const reservasApi = {
  listar: ({ estado, buscar } = {}) => {
    const parametros = new URLSearchParams();
    if (estado) parametros.set('estado', estado);
    if (buscar) parametros.set('buscar', buscar);
    return api.get(`/reservas?${parametros}`);
  },
  obtener: (id) => api.get(`/reservas/${id}`),
  crear: (datos) => api.post('/reservas', datos),
  ejecutar: (id, accion, cuerpo = {}) => api.post(`/reservas/${id}/${accion}`, cuerpo),
  habitacionesDisponibles: (llegada, salida) =>
    api.get(`/habitaciones/disponibles?llegada=${llegada}&salida=${salida}`),
  cotizar: (tipoId, llegada, salida) =>
    api.get(`/tarifas/cotizar?tipoId=${tipoId}&llegada=${llegada}&salida=${salida}`),
};
