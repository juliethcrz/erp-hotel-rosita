import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as tarifasController from './tarifas.controller.js';
import {
  actualizarTemporadaSchema,
  actualizarTipoSchema,
  cotizarSchema,
  crearTemporadaSchema,
} from './tarifas.schemas.js';

export const tarifasRoutes = Router();

tarifasRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

tarifasRoutes.get('/tipos', tarifasController.listarTipos);
tarifasRoutes.get('/temporadas', tarifasController.listarTemporadas);
tarifasRoutes.get('/cotizar', validate({ query: cotizarSchema }), tarifasController.cotizar);

tarifasRoutes.patch(
  '/tipos/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: actualizarTipoSchema }),
  tarifasController.actualizarTipo,
);
tarifasRoutes.post(
  '/temporadas',
  authorize('ADMIN'),
  validate({ body: crearTemporadaSchema }),
  tarifasController.crearTemporada,
);
tarifasRoutes.patch(
  '/temporadas/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: actualizarTemporadaSchema }),
  tarifasController.actualizarTemporada,
);
tarifasRoutes.delete(
  '/temporadas/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  tarifasController.eliminarTemporada,
);
