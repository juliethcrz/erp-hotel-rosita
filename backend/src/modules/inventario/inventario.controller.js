import * as inventarioService from './inventario.service.js';

export async function listarProductos(req, res) {
  res.json(await inventarioService.listarProductos());
}
