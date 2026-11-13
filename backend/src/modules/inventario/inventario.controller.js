import * as inventarioService from './inventario.service.js';

export async function listarProductos(req, res) {
  const incluirInactivos = req.query.todos === 'true' && req.user.rol === 'ADMIN';
  res.json(await inventarioService.listarProductos({ incluirInactivos }));
}

export async function listarCategorias(req, res) {
  res.json(await inventarioService.listarCategorias());
}

export async function crearProducto(req, res) {
  res.status(201).json(await inventarioService.crearProducto(req.validated.body, req.user.id));
}

export async function actualizarProducto(req, res) {
  const { id } = req.validated.params;
  res.json(await inventarioService.actualizarProducto(id, req.validated.body));
}

export async function ajustarStock(req, res) {
  const { id } = req.validated.params;
  res.json(await inventarioService.ajustarStock(id, req.validated.body, req.user.id));
}

export async function listarMovimientos(req, res) {
  res.json(await inventarioService.listarMovimientos(req.validated.params.id));
}

export async function listarProveedores(req, res) {
  res.json(await inventarioService.listarProveedores());
}

export async function crearProveedor(req, res) {
  res.status(201).json(await inventarioService.crearProveedor(req.validated.body));
}

export async function actualizarProveedor(req, res) {
  const { id } = req.validated.params;
  res.json(await inventarioService.actualizarProveedor(id, req.validated.body));
}

export async function listarCompras(req, res) {
  res.json(await inventarioService.listarCompras());
}

export async function registrarCompra(req, res) {
  res.status(201).json(await inventarioService.registrarCompra(req.validated.body, req.user.id));
}
