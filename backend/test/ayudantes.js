import { execSync } from 'node:child_process';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';

export const app = createApp();
export const CLAVE = process.env.SEED_PASSWORD;

/**
 * Deja la base de pruebas igual que después del seed. Solo corre sobre una base
 * cuyo nombre termine en _test, para no borrar nunca datos reales por error.
 */
export async function prepararBase() {
  const nombreBase = new URL(process.env.DATABASE_URL).pathname.slice(1);
  if (!nombreBase.endsWith('_test')) {
    throw new Error(`Las pruebas solo corren sobre una base *_test (se recibió "${nombreBase}")`);
  }

  const tablas = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const lista = tablas.map(({ tablename }) => `"${tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE ${lista} RESTART IDENTITY CASCADE`);

  execSync('node prisma/seed.js', { env: process.env, stdio: 'ignore' });
}

export async function cerrarConexion() {
  await prisma.$disconnect();
}

/** Inicia sesión y devuelve un cliente HTTP que ya envía el token. */
export async function sesion(usuario) {
  const respuesta = await request(app)
    .post('/api/auth/login')
    .send({ email: `${usuario}@hotelrosita.co`, password: CLAVE })
    .expect(200);
  const token = respuesta.body.accessToken;

  const conToken = (metodo) => (ruta) =>
    request(app)[metodo](`/api${ruta}`).set('Authorization', `Bearer ${token}`);
  return {
    get: conToken('get'),
    post: conToken('post'),
    patch: conToken('patch'),
    delete: conToken('delete'),
  };
}

export function hoy() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
}

export function sumarDias(fecha, dias) {
  const resultado = new Date(`${fecha}T12:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

export const efectivo = (monto) => [{ metodo: 'EFECTIVO', monto }];

export async function crearCliente(api, documento = '1052000111') {
  const { body } = await api
    .post('/clientes')
    .send({
      nombres: 'Laura Valentina',
      apellidos: 'Cruz Ávila',
      tipoDocumento: 'CC',
      numeroDocumento: documento,
      telefono: '3101234567',
    })
    .expect(201);
  return body;
}

export async function habitacion(numero) {
  return prisma.habitacion.findUniqueOrThrow({ where: { numero }, include: { tipo: true } });
}
