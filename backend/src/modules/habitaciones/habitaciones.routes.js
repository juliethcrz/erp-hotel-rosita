import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { subirImagenes } from '../../middlewares/subirImagenes.js';
import { fotoParamsSchema, idParamSchema } from '../../shared/schemas.js';
import * as fotosController from './fotos.controller.js';
import * as habitacionesController from './habitaciones.controller.js';
import {
  actualizarHabitacionSchema,
  cambiarEstadoSchema,
  crearHabitacionSchema,
  ordenFotosSchema,
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

// Fotos de la ficha: solo el administrador las gestiona.
habitacionesRoutes.post(
  '/:id/fotos',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  subirImagenes('fotos', 10),
  fotosController.subir,
);
habitacionesRoutes.patch(
  '/:id/fotos/orden',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: ordenFotosSchema }),
  fotosController.ordenar,
);
habitacionesRoutes.patch(
  '/:id/fotos/:fotoId/principal',
  authorize('ADMIN'),
  validate({ params: fotoParamsSchema }),
  fotosController.marcarPrincipal,
);
habitacionesRoutes.delete(
  '/:id/fotos/:fotoId',
  authorize('ADMIN'),
  validate({ params: fotoParamsSchema }),
  fotosController.eliminar,
);
