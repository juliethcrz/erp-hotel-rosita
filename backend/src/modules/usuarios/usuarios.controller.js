import * as usuariosService from './usuarios.service.js';

export async function listar(req, res) {
  res.json(await usuariosService.listar());
}

export async function crear(req, res) {
  res.status(201).json(await usuariosService.crear(req.validated.body));
}

export async function actualizar(req, res) {
  const { id } = req.validated.params;
  res.json(await usuariosService.actualizar(id, req.validated.body, req.user.id));
}

export async function restablecerPassword(req, res) {
  await usuariosService.restablecerPassword(req.validated.params.id, req.validated.body.password);
  res.status(204).end();
}
