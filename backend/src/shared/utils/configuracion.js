import { prisma } from '../../config/database.js';

export async function obtenerConfiguracion(clave, valorPorDefecto) {
  const registro = await prisma.configuracion.findUnique({ where: { clave } });
  return registro?.valor ?? valorPorDefecto;
}
