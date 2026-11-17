import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import * as reportesController from './reportes.controller.js';
import {
  exportarQuerySchema,
  rangoReporteSchema,
  reporteParamsSchema,
} from './reportes.schemas.js';

export const reportesRoutes = Router();

reportesRoutes.use(authenticate, authorize('ADMIN'));

reportesRoutes.get(
  '/:tipo',
  validate({ params: reporteParamsSchema, query: rangoReporteSchema }),
  reportesController.consultar,
);
reportesRoutes.get(
  '/:tipo/exportar',
  validate({ params: reporteParamsSchema, query: exportarQuerySchema }),
  reportesController.exportar,
);
