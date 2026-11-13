import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as limpiezasController from './limpiezas.controller.js';

const terminarSchema = z.object({
  observaciones: z.string().trim().max(500).optional(),
});

export const limpiezasRoutes = Router();

limpiezasRoutes.use(authenticate);

limpiezasRoutes.get('/', limpiezasController.listar);
limpiezasRoutes.post(
  '/:id/iniciar',
  authorize('HOUSEKEEPING', 'ADMIN'),
  validate({ params: idParamSchema }),
  limpiezasController.iniciar,
);
limpiezasRoutes.post(
  '/:id/terminar',
  authorize('HOUSEKEEPING', 'ADMIN'),
  validate({ params: idParamSchema, body: terminarSchema }),
  limpiezasController.terminar,
);
