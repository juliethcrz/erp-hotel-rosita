import { DOCUMENTOS } from './documentos.js';
import { generarExcel } from './exportadores/excel.js';
import { generarPdf } from './exportadores/pdf.js';
import * as reportesService from './reportes.service.js';

const EXPORTADORES = {
  pdf: { generar: generarPdf, tipo: 'application/pdf' },
  xlsx: {
    generar: generarExcel,
    tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
};

export async function consultar(req, res) {
  const { tipo } = req.validated.params;
  res.json(await reportesService[tipo](req.validated.query));
}

export async function exportar(req, res) {
  const { tipo } = req.validated.params;
  const { desde, hasta, formato } = req.validated.query;

  const reporte = await reportesService[tipo]({ desde, hasta });
  const exportador = EXPORTADORES[formato];
  const archivo = await exportador.generar(DOCUMENTOS[tipo](reporte));

  res
    .type(exportador.tipo)
    .attachment(`reporte-${tipo}-${desde}-a-${hasta}.${formato}`)
    .send(archivo);
}
