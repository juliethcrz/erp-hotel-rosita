import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { cerrarConexion, efectivo, hoy, prepararBase, sesion } from './ayudantes.js';

describe('Reportes', () => {
  let admin;
  let periodo;
  const ventas = [];

  before(async () => {
    await prepararBase();
    admin = await sesion('admin');
    await admin.post('/caja/abrir').expect(201);
    const { body: productos } = await admin.get('/inventario/productos').expect(200);
    for (const producto of productos.slice(0, 3)) {
      const { body } = await admin
        .post('/tienda/ventas')
        .send({
          items: [{ productoId: producto.id, cantidad: 1 }],
          pagos: efectivo(producto.precioVenta),
        })
        .expect(201);
      ventas.push(body);
    }
    periodo = `desde=${hoy()}&hasta=${hoy()}`;
  });
  after(cerrarConexion);

  test('el reporte de ingresos suma exactamente las ventas del periodo', async () => {
    const { body } = await admin.get(`/reportes/ingresos?${periodo}`).expect(200);
    const esperado = ventas.reduce((suma, venta) => suma + venta.total, 0);

    assert.equal(body.totales.total, esperado);
    assert.equal(body.totales.ventas, ventas.length);
    assert.equal(body.porLinea.TIENDA, esperado);
    assert.equal(body.porMetodo.EFECTIVO, esperado);
  });

  test('el reporte de caja cuadra con el de ingresos', async () => {
    const { body: caja } = await admin.get(`/reportes/caja?${periodo}`).expect(200);
    const { body: ingresos } = await admin.get(`/reportes/ingresos?${periodo}`).expect(200);
    assert.equal(caja.totales.ingresos, ingresos.totales.total);
  });

  test('exporta el reporte como PDF y como Excel', async () => {
    const pdf = await admin
      .get(`/reportes/ingresos/exportar?${periodo}&formato=pdf`)
      .buffer(true)
      .parse((respuesta, listo) => {
        const partes = [];
        respuesta.on('data', (parte) => partes.push(parte));
        respuesta.on('end', () => listo(null, Buffer.concat(partes)));
      })
      .expect(200)
      .expect('Content-Type', /application\/pdf/);
    assert.equal(pdf.body.subarray(0, 4).toString(), '%PDF');

    const excel = await admin
      .get(`/reportes/ocupacion/exportar?${periodo}&formato=xlsx`)
      .expect(200)
      .expect('Content-Type', /spreadsheetml/);
    assert.match(excel.headers['content-disposition'], /reporte-ocupacion/);
  });

  test('valida que el periodo tenga sentido', async () => {
    await admin.get('/reportes/ingresos?desde=2026-11-10&hasta=2026-11-01').expect(400);
    await admin.get('/reportes/inventario?desde=2026-11-01&hasta=2026-11-10').expect(400);
  });
});
