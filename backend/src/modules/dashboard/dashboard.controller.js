import * as dashboardService from './dashboard.service.js';

export async function obtener(req, res) {
  res.json(await dashboardService.obtener(req.user.rol));
}
