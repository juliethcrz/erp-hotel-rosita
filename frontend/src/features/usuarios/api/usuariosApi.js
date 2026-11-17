import { api } from '../../../lib/apiClient.js';

export const usuariosApi = {
  listar: () => api.get('/usuarios'),
  crear: (datos) => api.post('/usuarios', datos),
  actualizar: (id, datos) => api.patch(`/usuarios/${id}`, datos),
  restablecerPassword: (id, password) => api.patch(`/usuarios/${id}/password`, { password }),
};
