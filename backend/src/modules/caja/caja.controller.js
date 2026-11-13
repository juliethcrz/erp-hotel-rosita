import * as cajaService from './caja.service.js';

export async function actual(req, res) {
  res.json(await cajaService.actual());
}

export async function abrir(req, res) {
  res.status(201).json(await cajaService.abrir(req.user.id));
}

export async function cerrar(req, res) {
  res.json(await cajaService.cerrar(req.user.id));
}

export async function historial(req, res) {
  res.json(await cajaService.historial());
}
