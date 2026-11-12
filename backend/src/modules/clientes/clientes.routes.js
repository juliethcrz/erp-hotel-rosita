import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as clientesController from './clientes.controller.js';
import {
  actualizarClienteSchema,
  buscarClientesSchema,
  crearClienteSchema,
} from './clientes.schemas.js';

export const clientesRoutes = Router();

clientesRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

clientesRoutes.get('/', validate({ query: buscarClientesSchema }), clientesController.buscar);
clientesRoutes.get('/:id', validate({ params: idParamSchema }), clientesController.obtener);
clientesRoutes.post('/', validate({ body: crearClienteSchema }), clientesController.crear);
clientesRoutes.patch(
  '/:id',
  validate({ params: idParamSchema, body: actualizarClienteSchema }),
  clientesController.actualizar,
);
