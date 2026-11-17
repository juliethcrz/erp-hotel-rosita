import { api } from '../../../lib/apiClient.js';

export const tiendaApi = {
  vender: (venta) => api.post('/tienda/ventas', venta),
  huespedesHospedados: () => api.get('/reservas?estado=EN_CURSO'),
  cargarAHabitacion: (reservaId, items) => api.post(`/reservas/${reservaId}/consumos`, { items }),
};
