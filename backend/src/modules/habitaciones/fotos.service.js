import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/database.js';
import { borrarArchivos, subirArchivo, urlPublica } from '../../config/storage.js';
import { AppError } from '../../shared/errors/AppError.js';

export const MAXIMO_FOTOS = 12;
const EXTENSION = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function conUrl(foto) {
  return { ...foto, url: urlPublica(foto.ruta) };
}

async function listar(habitacionId) {
  const fotos = await prisma.fotoHabitacion.findMany({
    where: { habitacionId },
    orderBy: { orden: 'asc' },
  });
  return fotos.map(conUrl);
}

async function buscarFoto(habitacionId, fotoId) {
  const foto = await prisma.fotoHabitacion.findFirst({ where: { id: fotoId, habitacionId } });
  if (!foto) {
    throw new AppError('La foto no existe', 404);
  }
  return foto;
}

/**
 * Guarda las imágenes en Storage y luego las registra. Si el registro falla,
 * se borran los archivos subidos para no dejar fotos huérfanas en el bucket.
 */
export async function subir(habitacionId, archivos = []) {
  if (archivos.length === 0) {
    throw new AppError('Selecciona al menos una foto');
  }

  const habitacion = await prisma.habitacion.findUnique({
    where: { id: habitacionId },
    include: { _count: { select: { fotos: true } } },
  });
  if (!habitacion) {
    throw new AppError('La habitación no existe', 404);
  }

  const actuales = habitacion._count.fotos;
  if (actuales + archivos.length > MAXIMO_FOTOS) {
    throw new AppError(
      `Cada habitación admite máximo ${MAXIMO_FOTOS} fotos; quedan ${MAXIMO_FOTOS - actuales} cupos`,
    );
  }

  const subidas = [];
  try {
    for (const archivo of archivos) {
      const ruta = `${habitacion.numero}/${randomUUID()}.${EXTENSION[archivo.mimetype]}`;
      await subirArchivo(ruta, archivo.buffer, archivo.mimetype);
      subidas.push(ruta);
    }

    const { _max } = await prisma.fotoHabitacion.aggregate({
      where: { habitacionId },
      _max: { orden: true },
    });
    const siguienteOrden = (_max.orden ?? -1) + 1;

    await prisma.fotoHabitacion.createMany({
      data: subidas.map((ruta, indice) => ({
        habitacionId,
        ruta,
        orden: siguienteOrden + indice,
        esPrincipal: actuales === 0 && indice === 0,
      })),
    });
  } catch (error) {
    if (subidas.length > 0) await borrarArchivos(subidas).catch(() => {});
    throw error;
  }

  return listar(habitacionId);
}

/** Recibe los ids en el orden deseado; deben ser exactamente las fotos de la habitación. */
export async function ordenar(habitacionId, ids) {
  const fotos = await prisma.fotoHabitacion.findMany({
    where: { habitacionId },
    select: { id: true },
  });
  const actuales = new Set(fotos.map((foto) => foto.id));
  const completos = ids.length === actuales.size && ids.every((id) => actuales.has(id));
  if (!completos) {
    throw new AppError('El orden debe incluir todas las fotos de la habitación, una sola vez');
  }

  await prisma.$transaction(
    ids.map((id, orden) => prisma.fotoHabitacion.update({ where: { id }, data: { orden } })),
  );
  return listar(habitacionId);
}

export async function marcarPrincipal(habitacionId, fotoId) {
  await buscarFoto(habitacionId, fotoId);

  await prisma.$transaction([
    prisma.fotoHabitacion.updateMany({ where: { habitacionId }, data: { esPrincipal: false } }),
    prisma.fotoHabitacion.update({ where: { id: fotoId }, data: { esPrincipal: true } }),
  ]);
  return listar(habitacionId);
}

/** Si se borra la principal, la siguiente en el orden toma su lugar. */
export async function eliminar(habitacionId, fotoId) {
  const foto = await buscarFoto(habitacionId, fotoId);

  await prisma.$transaction(async (tx) => {
    await tx.fotoHabitacion.delete({ where: { id: fotoId } });
    if (!foto.esPrincipal) return;

    const siguiente = await tx.fotoHabitacion.findFirst({
      where: { habitacionId },
      orderBy: { orden: 'asc' },
    });
    if (siguiente) {
      await tx.fotoHabitacion.update({ where: { id: siguiente.id }, data: { esPrincipal: true } });
    }
  });

  // El registro ya no existe; si Storage falla, el archivo queda suelto pero la ficha sigue bien.
  await borrarArchivos([foto.ruta]).catch((error) => console.error(error));
  return listar(habitacionId);
}
