import { z } from 'zod';

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_TTL_HOURS: z.coerce.number().positive().default(8),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_BUCKET: z.string().default('habitaciones'),
});

const CLAVE_DE_EJEMPLO = 'cambia-esto-por-una-clave-larga-y-aleatoria-de-64-caracteres';

// En producción no se aceptan valores de ejemplo ni orígenes sin HTTPS.
const esquemaProduccion = esquema.superRefine((variables, contexto) => {
  if (variables.NODE_ENV !== 'production') return;
  if (variables.JWT_ACCESS_SECRET === CLAVE_DE_EJEMPLO || variables.JWT_ACCESS_SECRET.length < 40) {
    contexto.addIssue({
      code: 'custom',
      path: ['JWT_ACCESS_SECRET'],
      message: 'en producción debe ser una clave aleatoria propia de al menos 40 caracteres',
    });
  }
  if (!variables.CORS_ORIGIN.startsWith('https://')) {
    contexto.addIssue({
      code: 'custom',
      path: ['CORS_ORIGIN'],
      message: 'en producción debe ser la dirección pública con https://',
    });
  }
});

const resultado = esquemaProduccion.safeParse(process.env);

if (!resultado.success) {
  const detalle = resultado.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`Variables de entorno inválidas:\n${detalle}`);
  process.exit(1);
}

const variables = resultado.data;

export const env = {
  nodeEnv: variables.NODE_ENV,
  isProduction: variables.NODE_ENV === 'production',
  port: variables.PORT,
  databaseUrl: variables.DATABASE_URL,
  jwt: {
    accessSecret: variables.JWT_ACCESS_SECRET,
    accessExpiresIn: variables.JWT_ACCESS_EXPIRES_IN,
  },
  refreshTokenTtlHours: variables.REFRESH_TOKEN_TTL_HOURS,
  corsOrigin: variables.CORS_ORIGIN,
  supabase: {
    url: variables.SUPABASE_URL,
    serviceRoleKey: variables.SUPABASE_SERVICE_ROLE_KEY,
    bucket: variables.SUPABASE_BUCKET,
  },
};
