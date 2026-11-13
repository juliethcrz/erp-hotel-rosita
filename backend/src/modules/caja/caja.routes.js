import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as cajaController from './caja.controller.js';

export const cajaRoutes = Router();

cajaRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

cajaRoutes.get('/actual', cajaController.actual);
cajaRoutes.post('/abrir', cajaController.abrir);
cajaRoutes.post('/cerrar', cajaController.cerrar);
cajaRoutes.get('/historial', authorize('ADMIN'), cajaController.historial);
