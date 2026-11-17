import * as habitacionesService from './habitaciones.service.js';

export async function listar(req, res) {
  res.json(await habitacionesService.listar());
}

export async function disponibles(req, res) {
  res.json(await habitacionesService.disponibles(req.validated.query));
}

export async function crear(req, res) {
  res.status(201).json(await habitacionesService.crear(req.validated.body));
}

export async function actualizar(req, res) {
  res.json(await habitacionesService.actualizar(req.validated.params.id, req.validated.body));
}

export async function cambiarEstado(req, res) {
  const { id } = req.validated.params;
  res.json(await habitacionesService.cambiarEstado(id, req.validated.body.estado, req.user.rol));
}
