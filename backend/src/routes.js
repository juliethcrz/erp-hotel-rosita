import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes.js';
import { cajaRoutes } from './modules/caja/caja.routes.js';
import { clientesRoutes } from './modules/clientes/clientes.routes.js';
import { habitacionesRoutes } from './modules/habitaciones/habitaciones.routes.js';
import { inventarioRoutes } from './modules/inventario/inventario.routes.js';
import { limpiezasRoutes } from './modules/limpiezas/limpiezas.routes.js';
import { notificacionesRoutes } from './modules/notificaciones/notificaciones.routes.js';
import { reservasRoutes } from './modules/reservas/reservas.routes.js';
import { tarifasRoutes } from './modules/tarifas/tarifas.routes.js';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/usuarios', usuariosRoutes);
apiRoutes.use('/clientes', clientesRoutes);
apiRoutes.use('/habitaciones', habitacionesRoutes);
apiRoutes.use('/tarifas', tarifasRoutes);
apiRoutes.use('/caja', cajaRoutes);
apiRoutes.use('/inventario', inventarioRoutes);
apiRoutes.use('/reservas', reservasRoutes);
apiRoutes.use('/limpiezas', limpiezasRoutes);
apiRoutes.use('/notificaciones', notificacionesRoutes);
