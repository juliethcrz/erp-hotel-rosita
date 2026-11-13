import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as inventarioController from './inventario.controller.js';

export const inventarioRoutes = Router();

inventarioRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

inventarioRoutes.get('/productos', inventarioController.listarProductos);
