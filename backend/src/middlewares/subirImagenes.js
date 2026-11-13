import multer from 'multer';
import { AppError } from '../shared/errors/AppError.js';

export const TAMANO_MAXIMO_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Recibe imágenes enviadas como multipart/form-data. Los archivos quedan en memoria
 * (req.files) solo mientras se reenvían al almacenamiento.
 */
export function subirImagenes(campo, maximo) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024, files: maximo },
    fileFilter: (_req, archivo, aceptar) => {
      if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) return aceptar(null, true);
      aceptar(new AppError('Solo se permiten imágenes JPG, PNG o WebP'));
    },
  }).array(campo, maximo);
}
