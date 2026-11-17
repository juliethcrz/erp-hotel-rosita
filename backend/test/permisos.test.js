import { after, before, describe, test } from 'node:test';
import { cerrarConexion, prepararBase, sesion } from './ayudantes.js';

describe('Permisos por rol', () => {
  let admin;
  let recepcion;
  let limpieza;

  before(async () => {
    await prepararBase();
    [admin, recepcion, limpieza] = await Promise.all(
      ['admin', 'recepcion', 'limpieza'].map(sesion),
    );
  });
  after(cerrarConexion);

  test('housekeeping no accede a reservas, caja ni tienda', async () => {
    await limpieza.get('/reservas').expect(403);
    await limpieza.get('/caja/actual').expect(403);
    await limpieza.post('/tienda/ventas').send({}).expect(403);
  });

  test('housekeeping sí ve su tablero de limpieza', async () => {
    await limpieza.get('/limpiezas').expect(200);
  });

  test('recepción no gestiona usuarios ni ve reportes', async () => {
    await recepcion.get('/usuarios').expect(403);
    await recepcion.get('/reportes/ingresos?desde=2026-11-01&hasta=2026-11-30').expect(403);
  });

  test('recepción no puede poner una habitación en mantenimiento', async () => {
    const { body } = await recepcion.get('/habitaciones').expect(200);
    await recepcion
      .patch(`/habitaciones/${body[0].id}/estado`)
      .send({ estado: 'EN_MANTENIMIENTO' })
      .expect(403);
  });

  test('el administrador accede a todo', async () => {
    await admin.get('/usuarios').expect(200);
    await admin.get('/reservas').expect(200);
    await admin.get('/reportes/caja?desde=2026-11-01&hasta=2026-11-30').expect(200);
  });
});
