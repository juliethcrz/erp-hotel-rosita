import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

apiRoutes.use('/auth', authRoutes);
