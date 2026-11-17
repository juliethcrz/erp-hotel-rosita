import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  cerrarConexion,
  crearCliente,
  efectivo,
  habitacion,
  hoy,
  prepararBase,
  sesion,
  sumarDias,
} from './ayudantes.js';

describe('Ciclo completo de una reserva', () => {
  let recepcion;
  let limpieza;
  let cliente;
  let individual;
  let reserva;

  before(async () => {
    await prepararBase();
    recepcion = await sesion('recepcion');
    limpieza = await sesion('limpieza');
    await recepcion.post('/caja/abrir').expect(201);
    cliente = await crearCliente(recepcion);
    individual = await habitacion('101');
  });
  after(cerrarConexion);

  test('crea la reserva con el valor que da el cotizador', async () => {
    const llegada = hoy();
    const salida = sumarDias(llegada, 2);
    const { body: cotizacion } = await recepcion
      .get(`/tarifas/cotizar?tipoId=${individual.tipoId}&llegada=${llegada}&salida=${salida}`)
      .expect(200);

    const { body } = await recepcion
      .post('/reservas')
      .send({
        titularId: cliente.id,
        fechaLlegada: llegada,
        fechaSalida: salida,
        habitaciones: [{ habitacionId: individual.id, huespedes: [cliente.id] }],
      })
      .expect(201);

    reserva = body;
    assert.equal(reserva.estado, 'PENDIENTE');
    assert.equal(reserva.resumen.totalEstadia, cotizacion.total);
    assert.equal(reserva.resumen.anticipoRequerido, Math.round(cotizacion.total / 2));
  });

  test('no permite reservar la misma habitación en fechas que se cruzan', async () => {
    await recepcion
      .post('/reservas')
      .send({
        titularId: cliente.id,
        fechaLlegada: sumarDias(hoy(), 1),
        fechaSalida: sumarDias(hoy(), 3),
        habitaciones: [{ habitacionId: individual.id }],
      })
      .expect(409);
  });

  test('el anticipo debe pagarse completo y confirma la reserva', async () => {
    const { anticipoRequerido } = reserva.resumen;
    await recepcion
      .post(`/reservas/${reserva.id}/anticipo`)
      .send({ pagos: efectivo(anticipoRequerido - 1000) })
      .expect(400);

    const { body } = await recepcion
      .post(`/reservas/${reserva.id}/anticipo`)
      .send({ pagos: efectivo(anticipoRequerido) })
      .expect(200);
    assert.equal(body.estado, 'CONFIRMADA');
    assert.equal(body.resumen.pagadoEstadia, anticipoRequerido);
  });

  test('el check-in cobra el saldo y ocupa la habitación', async () => {
    const { body: actual } = await recepcion.get(`/reservas/${reserva.id}`).expect(200);
    const { body } = await recepcion
      .post(`/reservas/${reserva.id}/checkin`)
      .send({ pagos: efectivo(actual.resumen.saldoEstadia) })
      .expect(200);

    assert.equal(body.estado, 'EN_CURSO');
    assert.equal(body.resumen.saldoEstadia, 0);
    assert.equal((await habitacion('101')).estado, 'OCUPADA');
  });

  test('los consumos se cargan a la cuenta y descuentan el stock', async () => {
    const { body: productos } = await recepcion.get('/inventario/productos').expect(200);
    const [primero, segundo] = productos;

    const { body } = await recepcion
      .post(`/reservas/${reserva.id}/consumos`)
      .send({
        items: [
          { productoId: primero.id, cantidad: 2 },
          { productoId: segundo.id, cantidad: 1 },
        ],
      })
      .expect(201);

    assert.equal(body.resumen.consumosPendientes, primero.precioVenta * 2 + segundo.precioVenta);
    const { body: despues } = await recepcion.get('/inventario/productos').expect(200);
    assert.equal(despues.find((p) => p.id === primero.id).stockActual, primero.stockActual - 2);
    reserva = body;
  });

  test('el check-out cobra los consumos y deja la habitación en limpieza', async () => {
    const { body } = await recepcion
      .post(`/reservas/${reserva.id}/checkout`)
      .send({ pagos: efectivo(reserva.resumen.consumosPendientes) })
      .expect(200);

    assert.equal(body.estado, 'FINALIZADA');
    assert.equal(body.resumen.consumosPendientes, 0);
    assert.equal((await habitacion('101')).estado, 'EN_LIMPIEZA');
  });

  test('housekeeping recibe la tarea y al terminarla la habitación queda disponible', async () => {
    const { body: tareas } = await limpieza.get('/limpiezas').expect(200);
    const tarea = tareas.find((t) => t.habitacion.numero === '101' && t.estado === 'PENDIENTE');
    assert.ok(tarea, 'debe existir la tarea de limpieza de la 101');

    await limpieza.post(`/limpiezas/${tarea.id}/iniciar`).expect(200);
    await limpieza.post(`/limpiezas/${tarea.id}/terminar`).send({}).expect(200);
    assert.equal((await habitacion('101')).estado, 'DISPONIBLE');
  });

  test('todo lo cobrado quedó registrado en la caja del día', async () => {
    const { body: reservaFinal } = await recepcion.get(`/reservas/${reserva.id}`).expect(200);
    const cobrado = reservaFinal.ventas.reduce((suma, venta) => suma + venta.total, 0);
    const { body: caja } = await recepcion.get('/caja/actual').expect(200);

    assert.equal(caja.resumen.ingresos, cobrado);
    assert.equal(caja.resumen.porMetodo.EFECTIVO, cobrado);
  });
});

describe('Cancelación con devolución del anticipo', () => {
  let recepcion;

  before(async () => {
    await prepararBase();
    recepcion = await sesion('recepcion');
    await recepcion.post('/caja/abrir').expect(201);
  });
  after(cerrarConexion);

  test('con más de 24 horas de anticipación devuelve el anticipo desde la caja', async () => {
    const cliente = await crearCliente(recepcion, '1052000222');
    const doble = await habitacion('107');
    const { body: reserva } = await recepcion
      .post('/reservas')
      .send({
        titularId: cliente.id,
        fechaLlegada: sumarDias(hoy(), 10),
        fechaSalida: sumarDias(hoy(), 12),
        habitaciones: [{ habitacionId: doble.id }],
      })
      .expect(201);
    await recepcion
      .post(`/reservas/${reserva.id}/anticipo`)
      .send({ pagos: efectivo(reserva.resumen.anticipoRequerido) })
      .expect(200);

    const { body } = await recepcion.post(`/reservas/${reserva.id}/cancelar`).expect(200);
    assert.equal(body.estado, 'CANCELADA');
    assert.equal(body.devolucion, reserva.resumen.anticipoRequerido);

    const { body: caja } = await recepcion.get('/caja/actual').expect(200);
    assert.equal(caja.resumen.neto, 0);
  });
});
