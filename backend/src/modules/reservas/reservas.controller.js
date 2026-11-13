import * as reservasService from './reservas.service.js';

export async function listar(req, res) {
  res.json(await reservasService.listar(req.validated.query));
}

export async function obtener(req, res) {
  res.json(await reservasService.obtener(req.validated.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await reservasService.crear(req.validated.body, req.user.id));
}

export async function registrarAnticipo(req, res) {
  const { id } = req.validated.params;
  res.json(await reservasService.registrarAnticipo(id, req.validated.body.pagos, req.user.id));
}

export async function checkin(req, res) {
  const { id } = req.validated.params;
  res.json(await reservasService.checkin(id, req.validated.body.pagos, req.user.id));
}

export async function registrarConsumo(req, res) {
  const { id } = req.validated.params;
  res.status(201).json(await reservasService.registrarConsumo(id, req.validated.body, req.user.id));
}

export async function checkout(req, res) {
  const { id } = req.validated.params;
  res.json(await reservasService.checkout(id, req.validated.body.pagos, req.user.id));
}

export async function cancelar(req, res) {
  res.json(await reservasService.cancelar(req.validated.params.id, req.user.id));
}

export async function marcarNoShow(req, res) {
  res.json(await reservasService.marcarNoShow(req.validated.params.id));
}
