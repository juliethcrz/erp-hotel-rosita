import { api } from '../../../lib/apiClient.js';

const consulta = ({ desde, hasta }) => `desde=${desde}&hasta=${hasta}`;

export const reportesApi = {
  consultar: (tipo, periodo) => api.get(`/reportes/${tipo}?${consulta(periodo)}`),
  exportar: (tipo, periodo, formato) =>
    api.descargar(`/reportes/${tipo}/exportar?${consulta(periodo)}&formato=${formato}`),
};
