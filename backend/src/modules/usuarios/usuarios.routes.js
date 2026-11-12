import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/schemas.js';
import * as usuariosController from './usuarios.controller.js';
import {
  actualizarUsuarioSchema,
  crearUsuarioSchema,
  restablecerPasswordSchema,
} from './usuarios.schemas.js';

export const usuariosRoutes = Router();

usuariosRoutes.use(authenticate, authorize('ADMIN'));

usuariosRoutes.get('/', usuariosController.listar);
usuariosRoutes.post('/', validate({ body: crearUsuarioSchema }), usuariosController.crear);
usuariosRoutes.patch(
  '/:id',
  validate({ params: idParamSchema, body: actualizarUsuarioSchema }),
  usuariosController.actualizar,
);
usuariosRoutes.patch(
  '/:id/password',
  validate({ params: idParamSchema, body: restablecerPasswordSchema }),
  usuariosController.restablecerPassword,
);
