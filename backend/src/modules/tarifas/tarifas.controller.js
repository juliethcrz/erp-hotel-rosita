import * as tarifasService from './tarifas.service.js';

export async function listarTipos(req, res) {
  res.json(await tarifasService.listarTipos());
}

export async function actualizarTipo(req, res) {
  res.json(await tarifasService.actualizarTipo(req.validated.params.id, req.validated.body));
}

export async function listarTemporadas(req, res) {
  res.json(await tarifasService.listarTemporadas());
}

export async function crearTemporada(req, res) {
  res.status(201).json(await tarifasService.crearTemporada(req.validated.body));
}

export async function actualizarTemporada(req, res) {
  const { id } = req.validated.params;
  res.json(await tarifasService.actualizarTemporada(id, req.validated.body));
}

export async function eliminarTemporada(req, res) {
  await tarifasService.eliminarTemporada(req.validated.params.id);
  res.status(204).end();
}

export async function cotizar(req, res) {
  const { tipoId, llegada, salida } = req.validated.query;
  res.json(await tarifasService.calcularEstadia(tipoId, llegada, salida));
}
