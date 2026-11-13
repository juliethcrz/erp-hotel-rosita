import { api } from '../../../lib/apiClient.js';

export const inventarioApi = {
  productos: ({ todos = false } = {}) =>
    api.get(`/inventario/productos${todos ? '?todos=true' : ''}`),
  categorias: () => api.get('/inventario/categorias'),
  crearProducto: (datos) => api.post('/inventario/productos', datos),
  actualizarProducto: (id, datos) => api.patch(`/inventario/productos/${id}`, datos),
  ajustar: (id, datos) => api.post(`/inventario/productos/${id}/ajuste`, datos),
  movimientos: (id) => api.get(`/inventario/productos/${id}/movimientos`),
  proveedores: () => api.get('/inventario/proveedores'),
  compras: () => api.get('/inventario/compras'),
  registrarCompra: (datos) => api.post('/inventario/compras', datos),
};
