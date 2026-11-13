import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as reservasController from './reservas.controller.js';
import {
  cobroSchema,
  consumoSchema,
  crearReservaSchema,
  listarReservasSchema,
} from './reservas.schemas.js';

export const reservasRoutes = Router();

reservasRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

const conCobro = validate({ params: idParamSchema, body: cobroSchema });
const soloId = validate({ params: idParamSchema });

reservasRoutes.get('/', validate({ query: listarReservasSchema }), reservasController.listar);
reservasRoutes.get('/:id', soloId, reservasController.obtener);
reservasRoutes.post('/', validate({ body: crearReservaSchema }), reservasController.crear);
reservasRoutes.post('/:id/anticipo', conCobro, reservasController.registrarAnticipo);
reservasRoutes.post('/:id/checkin', conCobro, reservasController.checkin);
reservasRoutes.post(
  '/:id/consumos',
  validate({ params: idParamSchema, body: consumoSchema }),
  reservasController.registrarConsumo,
);
reservasRoutes.post('/:id/checkout', conCobro, reservasController.checkout);
reservasRoutes.post('/:id/cancelar', soloId, reservasController.cancelar);
reservasRoutes.post('/:id/no-show', soloId, reservasController.marcarNoShow);
