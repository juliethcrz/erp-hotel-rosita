import * as clientesService from './clientes.service.js';

export async function buscar(req, res) {
  res.json(await clientesService.buscar(req.validated.query));
}

export async function obtener(req, res) {
  res.json(await clientesService.obtener(req.validated.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await clientesService.crear(req.validated.body));
}

export async function actualizar(req, res) {
  res.json(await clientesService.actualizar(req.validated.params.id, req.validated.body));
}
