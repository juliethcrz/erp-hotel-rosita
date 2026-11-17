import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import request from 'supertest';
import { app, CLAVE, cerrarConexion, prepararBase } from './ayudantes.js';

describe('Autenticación', () => {
  before(prepararBase);
  after(cerrarConexion);

  test('inicia sesión con credenciales válidas y deja la cookie de renovación', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hotelrosita.co', password: CLAVE })
      .expect(200);

    assert.ok(respuesta.body.accessToken);
    assert.equal(respuesta.body.usuario.rol, 'ADMIN');
    assert.equal(respuesta.body.usuario.passwordHash, undefined);
    assert.match(respuesta.headers['set-cookie'].join(';'), /HttpOnly/i);
  });

  test('rechaza credenciales inválidas con el mismo mensaje, exista o no el correo', async () => {
    const claveMala = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hotelrosita.co', password: 'otra-clave' })
      .expect(401);
    const correoInexistente = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@hotelrosita.co', password: 'otra-clave' })
      .expect(401);

    assert.equal(claveMala.body.error.message, correoInexistente.body.error.message);
  });

  test('renueva la sesión y detecta la reutilización de un token ya usado', async () => {
    const cookie = (respuesta) => respuesta.headers['set-cookie'][0].split(';')[0];
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recepcion@hotelrosita.co', password: CLAVE })
      .expect(200);
    const original = cookie(login);

    const renovada = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', original)
      .expect(200);
    assert.ok(renovada.body.accessToken);

    // Volver a usar el token original se trata como robo: se cierran todas las sesiones.
    await request(app).post('/api/auth/refresh').set('Cookie', original).expect(401);
    await request(app).post('/api/auth/refresh').set('Cookie', cookie(renovada)).expect(401);
  });

  test('las rutas protegidas exigen token', async () => {
    await request(app).get('/api/habitaciones').expect(401);
    await request(app)
      .get('/api/habitaciones')
      .set('Authorization', 'Bearer token-falso')
      .expect(401);
  });
});
