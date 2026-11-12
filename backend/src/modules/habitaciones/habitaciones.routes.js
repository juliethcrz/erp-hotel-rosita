import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as habitacionesController from './habitaciones.controller.js';
import {
  actualizarHabitacionSchema,
  cambiarEstadoSchema,
  crearHabitacionSchema,
  rangoFechasSchema,
} from './habitaciones.schemas.js';

export const habitacionesRoutes = Router();

habitacionesRoutes.use(authenticate);

habitacionesRoutes.get('/', habitacionesController.listar);
habitacionesRoutes.get(
  '/disponibles',
  authorize('ADMIN', 'RECEPCIONISTA'),
  validate({ query: rangoFechasSchema }),
  habitacionesController.disponibles,
);
habitacionesRoutes.post(
  '/',
  authorize('ADMIN'),
  validate({ body: crearHabitacionSchema }),
  habitacionesController.crear,
);
habitacionesRoutes.patch(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: actualizarHabitacionSchema }),
  habitacionesController.actualizar,
);
habitacionesRoutes.patch(
  '/:id/estado',
  validate({ params: idParamSchema, body: cambiarEstadoSchema }),
  habitacionesController.cambiarEstado,
);
