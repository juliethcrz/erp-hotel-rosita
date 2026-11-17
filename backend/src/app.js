import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { apiRoutes } from './routes.js';

// La interfaz compilada (npm run build) se sirve desde la misma dirección que la API.
const CARPETA_WEB = resolve(import.meta.dirname, '../../frontend/dist');

/** Política de contenido: solo recursos propios, más las fotos del almacenamiento. */
function politicaDeContenido() {
  const fotos = env.supabase.url ? [new URL(env.supabase.url).origin] : [];
  return {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', ...fotos],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    },
  };
}

export function createApp() {
  const app = express();

  // En la nube la app corre detrás del proxy del proveedor: así se lee la IP real
  // del cliente, que usan los límites de intentos.
  if (env.isProduction) app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: politicaDeContenido() }));
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1500,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: { message: 'Demasiadas solicitudes, intente de nuevo en unos minutos' } },
    }),
    apiRoutes,
  );

  if (env.isProduction && existsSync(CARPETA_WEB)) {
    app.use(express.static(CARPETA_WEB, { index: false, maxAge: '1y', immutable: true }));
    // Cualquier otra ruta GET fuera de /api la resuelve React Router.
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.set('Cache-Control', 'no-cache').sendFile(resolve(CARPETA_WEB, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
