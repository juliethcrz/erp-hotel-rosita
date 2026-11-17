import * as notificacionesService from './notificaciones.service.js';

export async function listar(req, res) {
  res.json(await notificacionesService.listar(req.user.rol));
}

export async function marcarLeida(req, res) {
  await notificacionesService.marcarLeida(req.validated.params.id, req.user);
  res.status(204).end();
}

export async function marcarTodasLeidas(req, res) {
  await notificacionesService.marcarTodasLeidas(req.user);
  res.status(204).end();
}
