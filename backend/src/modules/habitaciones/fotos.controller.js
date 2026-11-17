import * as fotosService from './fotos.service.js';

export async function subir(req, res) {
  res.status(201).json(await fotosService.subir(req.validated.params.id, req.files));
}

export async function ordenar(req, res) {
  res.json(await fotosService.ordenar(req.validated.params.id, req.validated.body.ids));
}

export async function marcarPrincipal(req, res) {
  const { id, fotoId } = req.validated.params;
  res.json(await fotosService.marcarPrincipal(id, fotoId));
}

export async function eliminar(req, res) {
  const { id, fotoId } = req.validated.params;
  res.json(await fotosService.eliminar(id, fotoId));
}
