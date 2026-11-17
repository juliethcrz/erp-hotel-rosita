import * as tiendaService from './tienda.service.js';

export async function venderDirecto(req, res) {
  res.status(201).json(await tiendaService.venderDirecto(req.validated.body, req.user.id));
}
