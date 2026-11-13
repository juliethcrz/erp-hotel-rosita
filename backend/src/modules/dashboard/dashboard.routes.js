import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import * as dashboardController from './dashboard.controller.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', authenticate, dashboardController.obtener);
