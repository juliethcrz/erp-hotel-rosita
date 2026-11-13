import * as limpiezasService from './limpiezas.service.js';

export async function listar(req, res) {
  res.json(await limpiezasService.listar());
}

export async function iniciar(req, res) {
  res.json(await limpiezasService.iniciar(req.validated.params.id, req.user));
}

export async function terminar(req, res) {
  res.json(await limpiezasService.terminar(req.validated.params.id, req.validated.body, req.user));
}
