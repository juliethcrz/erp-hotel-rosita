import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { cerrarConexion, efectivo, prepararBase, sesion } from './ayudantes.js';

describe('Venta de mostrador', () => {
  let recepcion;
  let producto;

  before(async () => {
    await prepararBase();
    recepcion = await sesion('recepcion');
    const { body } = await recepcion.get('/inventario/productos').expect(200);
    producto = body.find((p) => p.stockActual >= 5 && p.stockActual <= 40);
  });
  after(cerrarConexion);

  const vender = (cantidad, pagos) =>
    recepcion.post('/tienda/ventas').send({
      items: [{ productoId: producto.id, cantidad }],
      pagos,
    });

  test('no se puede vender con la caja cerrada', async () => {
    await vender(1, efectivo(producto.precioVenta)).expect(409);
  });

  test('vende, descuenta el stock y descompone el IVA del total', async () => {
    await recepcion.post('/caja/abrir').expect(201);
    const total = producto.precioVenta * 2;

    const { body: venta } = await vender(2, efectivo(total)).expect(201);
    assert.equal(venta.total, total);
    assert.equal(venta.subtotal + venta.iva, total);
    assert.equal(venta.subtotal, Math.round(total / 1.19));

    const { body } = await recepcion.get('/inventario/productos').expect(200);
    assert.equal(body.find((p) => p.id === producto.id).stockActual, producto.stockActual - 2);
  });

  test('los pagos deben sumar exactamente el total', async () => {
    await vender(1, efectivo(producto.precioVenta + 500)).expect(400);
  });

  test('no vende más unidades de las que hay en stock', async () => {
    const restantes = producto.stockActual - 2;
    const cantidad = restantes + 1;
    const respuesta = await vender(cantidad, efectivo(producto.precioVenta * cantidad)).expect(409);
    assert.match(respuesta.body.error.message, /Solo quedan/);
  });

  test('rechaza datos inválidos antes de tocar la base', async () => {
    const respuesta = await recepcion
      .post('/tienda/ventas')
      .send({ items: [], pagos: [{ metodo: 'BITCOIN', monto: 1000 }] })
      .expect(400);
    assert.ok(respuesta.body.error.details.length > 0);
  });
});
