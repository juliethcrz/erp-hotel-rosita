import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as notificacionesController from './notificaciones.controller.js';

export const notificacionesRoutes = Router();

notificacionesRoutes.use(authenticate);

notificacionesRoutes.get('/', notificacionesController.listar);
notificacionesRoutes.post('/leer-todas', notificacionesController.marcarTodasLeidas);
notificacionesRoutes.post(
  '/:id/leer',
  validate({ params: idParamSchema }),
  notificacionesController.marcarLeida,
);
