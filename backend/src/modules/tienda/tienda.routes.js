import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import * as tiendaController from './tienda.controller.js';

const id = z.number().int().positive();

const ventaDirectaSchema = z.object({
  items: z
    .array(z.object({ productoId: id, cantidad: z.number().int().positive().max(50) }))
    .min(1, 'Agregue al menos un producto'),
  pagos: z
    .array(
      z.object({
        metodo: z.enum(['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA', 'TRANSFERENCIA']),
        monto: z.number().int().positive(),
      }),
    )
    .min(1),
  clienteId: id.optional().nullable(),
  compradorNombre: z.string().trim().max(100).optional().nullable(),
});

export const tiendaRoutes = Router();

tiendaRoutes.use(authenticate, authorize('ADMIN', 'RECEPCIONISTA'));

tiendaRoutes.post(
  '/ventas',
  validate({ body: ventaDirectaSchema }),
  tiendaController.venderDirecto,
);
