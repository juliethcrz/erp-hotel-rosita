import { createClient } from '@supabase/supabase-js';
import { AppError } from '../shared/errors/AppError.js';
import { env } from './env.js';

const { url, serviceRoleKey, bucket } = env.supabase;

// Solo el backend habla con Supabase Storage: la clave de servicio nunca llega al navegador.
const cliente =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : null;

function almacen() {
  if (!cliente) {
    throw new AppError('El almacenamiento de fotos no está configurado', 503);
  }
  return cliente.storage.from(bucket);
}

export async function subirArchivo(ruta, contenido, tipo) {
  const { error } = await almacen().upload(ruta, contenido, { contentType: tipo, upsert: false });
  if (error) {
    throw new AppError(`No se pudo guardar la foto: ${error.message}`, 502);
  }
}

export async function borrarArchivos(rutas) {
  const { error } = await almacen().remove(rutas);
  if (error) {
    throw new AppError(`No se pudo borrar la foto: ${error.message}`, 502);
  }
}

/** Archivos sueltos de una carpeta del bucket (sin entrar a subcarpetas). */
async function listar(carpeta) {
  const { data, error } = await almacen().list(carpeta, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    throw new AppError(`No se pudo leer el almacenamiento: ${error.message}`, 502);
  }
  return data;
}

/** Archivos sueltos de una carpeta del bucket. Las carpetas vienen sin id. */
export async function listarArchivos(carpeta = '') {
  return (await listar(carpeta)).filter((e) => e.id !== null).map((e) => e.name);
}

export async function listarCarpetas(carpeta = '') {
  return (await listar(carpeta)).filter((e) => e.id === null).map((e) => e.name);
}

export async function moverArchivo(origen, destino) {
  const { error } = await almacen().move(origen, destino);
  if (error) {
    throw new AppError(`No se pudo mover ${origen}: ${error.message}`, 502);
  }
}

/** Dirección pública de un archivo; el bucket es público, así que no caduca. */
export function urlPublica(ruta) {
  return cliente ? almacen().getPublicUrl(ruta).data.publicUrl : null;
}
