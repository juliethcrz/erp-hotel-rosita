import { api } from '../../../lib/apiClient.js';

export const habitacionesApi = {
  listar: () => api.get('/habitaciones'),
  disponibles: (llegada, salida) =>
    api.get(`/habitaciones/disponibles?llegada=${llegada}&salida=${salida}`),
  cambiarEstado: (id, estado) => api.patch(`/habitaciones/${id}/estado`, { estado }),
  subirFotos: (id, archivos) => {
    const formulario = new FormData();
    archivos.forEach((archivo) => formulario.append('fotos', archivo));
    return api.post(`/habitaciones/${id}/fotos`, formulario);
  },
  ordenarFotos: (id, ids) => api.patch(`/habitaciones/${id}/fotos/orden`, { ids }),
  marcarPrincipal: (id, fotoId) => api.patch(`/habitaciones/${id}/fotos/${fotoId}/principal`),
  eliminarFoto: (id, fotoId) => api.delete(`/habitaciones/${id}/fotos/${fotoId}`),
};
