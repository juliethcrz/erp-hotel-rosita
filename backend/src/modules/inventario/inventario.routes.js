import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as inventarioController from './inventario.controller.js';
import {
  actualizarProductoSchema,
  ajusteSchema,
  compraSchema,
  crearProductoSchema,
  proveedorSchema,
} from './inventario.schemas.js';

export const inventarioRoutes = Router();

inventarioRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

const soloAdmin = authorize('ADMIN');

inventarioRoutes.get('/productos', inventarioController.listarProductos);
inventarioRoutes.get('/categorias', inventarioController.listarCategorias);
inventarioRoutes.post(
  '/productos',
  soloAdmin,
  validate({ body: crearProductoSchema }),
  inventarioController.crearProducto,
);
inventarioRoutes.patch(
  '/productos/:id',
  soloAdmin,
  validate({ params: idParamSchema, body: actualizarProductoSchema }),
  inventarioController.actualizarProducto,
);
inventarioRoutes.post(
  '/productos/:id/ajuste',
  soloAdmin,
  validate({ params: idParamSchema, body: ajusteSchema }),
  inventarioController.ajustarStock,
);
inventarioRoutes.get(
  '/productos/:id/movimientos',
  validate({ params: idParamSchema }),
  inventarioController.listarMovimientos,
);

inventarioRoutes.get('/proveedores', inventarioController.listarProveedores);
inventarioRoutes.post(
  '/proveedores',
  soloAdmin,
  validate({ body: proveedorSchema }),
  inventarioController.crearProveedor,
);
inventarioRoutes.patch(
  '/proveedores/:id',
  soloAdmin,
  validate({ params: idParamSchema, body: proveedorSchema.partial() }),
  inventarioController.actualizarProveedor,
);

inventarioRoutes.get('/compras', inventarioController.listarCompras);
inventarioRoutes.post(
  '/compras',
  validate({ body: compraSchema }),
  inventarioController.registrarCompra,
);
