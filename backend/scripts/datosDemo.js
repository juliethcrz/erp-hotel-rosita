/**
 * Carga datos de demostración desde el 1 de octubre hasta hoy, más reservas
 * para los próximos días: clientes, reservas con sus cobros, consumos, ventas
 * de mostrador, compras al proveedor, turnos de caja y limpiezas.
 *
 * Los datos se escriben en orden cronológico respetando las mismas reglas del
 * sistema (tarifas por temporada, anticipo del 50 %, IVA incluido, caja del
 * día y stock). Usa una semilla fija: dos ejecuciones generan lo mismo.
 *
 * Requiere una base limpia: npm run db:reset, db:seed y fotos:importar.
 *   npm run db:demo -w backend
 */
import { prisma } from '../src/config/database.js';
import { aTextoFecha, hoyEnColombia } from '../src/shared/utils/fechas.js';

const INICIO = '2026-10-01';
const DIAS_FUTUROS = 17;
const HABITACION_EN_MANTENIMIENTO = '105';
const IVA = 0.19;
const DIA_MS = 24 * 60 * 60 * 1000;
const MINUTO_MS = 60 * 1000;
const APERTURA_CAJA = 7 * 60;
const CIERRE_CAJA = 21 * 60 + 30;

// ─── Azar reproducible ────────────────────────────────────────

function crearAzar(semilla) {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const azar = crearAzar(2026);
const entero = (min, max) => min + Math.floor(azar() * (max - min + 1));
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const probable = (probabilidad) => azar() < probabilidad;
function ponderado(opciones) {
  const tirada = azar() * opciones.reduce((suma, [, peso]) => suma + peso, 0);
  let acumulado = 0;
  for (const [valor, peso] of opciones) {
    acumulado += peso;
    if (tirada < acumulado) return valor;
  }
  return opciones.at(-1)[0];
}

// ─── Fechas ───────────────────────────────────────────────────

const sumarDias = (texto, dias) =>
  new Date(Date.parse(texto) + dias * DIA_MS).toISOString().slice(0, 10);
const fechaColumna = (texto) => new Date(`${texto}T00:00:00Z`);
const instante = (dia, minutos) =>
  new Date(Date.parse(`${dia}T00:00:00-05:00`) + minutos * MINUTO_MS);
const esFinDeSemana = (dia) => [5, 6].includes(new Date(`${dia}T12:00:00Z`).getUTCDay());
const esLunes = (dia) => new Date(`${dia}T12:00:00Z`).getUTCDay() === 1;

// ─── Catálogos para inventar personas ─────────────────────────

const NOMBRES = [
  'María Fernanda',
  'Juan Carlos',
  'Luisa',
  'Andrés Felipe',
  'Diana Marcela',
  'Carlos Arturo',
  'Paola Andrea',
  'Jorge Eliécer',
  'Natalia',
  'Camilo',
  'Sandra Milena',
  'Óscar Iván',
  'Laura Valentina',
  'Fabián',
  'Gloria Inés',
  'Santiago',
  'Yeimy',
  'Hernán',
  'Claudia Patricia',
  'Sebastián',
  'Martha Lucía',
  'Wilson',
  'Catalina',
  'Édgar',
  'Lina María',
  'Mauricio',
  'Ana Milena',
  'Julián David',
  'Rosa Elena',
  'Fredy',
];
const APELLIDOS = [
  'Gómez',
  'Rodríguez',
  'Martínez',
  'Pérez',
  'Suárez',
  'Castañeda',
  'Rincón',
  'Moreno',
  'Barrera',
  'Niño',
  'Cárdenas',
  'Pinzón',
  'Becerra',
  'Sanabria',
  'Fonseca',
  'Rojas',
  'Vargas',
  'Lozano',
  'Cruz',
  'Ávila',
  'Torres',
  'Hernández',
  'Patiño',
  'Quintero',
  'Mendoza',
  'Salamanca',
];
const COMPRADORES = ['Don Ramiro', 'Señora Estela', 'Profe Gilberto', 'Doña Carmen', 'Wilmer'];
const sinTildes = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const METODO_MOSTRADOR = [
  ['EFECTIVO', 60],
  ['NEQUI', 25],
  ['DAVIPLATA', 10],
  ['BANCOLOMBIA', 5],
];
const METODO_HOSPEDAJE = [
  ['EFECTIVO', 30],
  ['NEQUI', 30],
  ['BANCOLOMBIA', 20],
  ['DAVIPLATA', 10],
  ['TRANSFERENCIA', 10],
];
const METODO_ANTICIPO = [
  ['NEQUI', 40],
  ['BANCOLOMBIA', 30],
  ['TRANSFERENCIA', 20],
  ['DAVIPLATA', 10],
];

function repartirPago(total, metodos) {
  const principal = ponderado(metodos);
  if (total < 60000 || !probable(0.15)) return [{ metodo: principal, monto: total }];
  const otro = ponderado(metodos.filter(([metodo]) => metodo !== principal));
  const parte = Math.round((total * entero(30, 70)) / 100 / 1000) * 1000;
  return [
    { metodo: principal, monto: total - parte },
    { metodo: otro, monto: parte },
  ];
}

// ─── Programa ─────────────────────────────────────────────────

async function main() {
  if ((await prisma.reserva.count()) > 0 || (await prisma.caja.count()) > 0) {
    throw new Error(
      'La base ya tiene reservas o turnos de caja. Reiníciala antes de cargar la demostración:\n' +
        '  npm.cmd run db:reset -w backend\n  npm.cmd run db:seed -w backend',
    );
  }

  const hoy = aTextoFecha(hoyEnColombia());
  const ahora = new Date();
  const fin = sumarDias(hoy, DIAS_FUTUROS);
  const minutoActual = Math.floor((ahora - instante(hoy, 0)) / MINUTO_MS);

  const [admin, recepcion, limpieza] = await Promise.all(
    ['admin', 'recepcion', 'limpieza'].map((usuario) =>
      prisma.usuario.findUniqueOrThrow({ where: { email: `${usuario}@hotelrosita.co` } }),
    ),
  );
  const habitaciones = await prisma.habitacion.findMany({
    where: { activa: true },
    include: { tipo: true },
    orderBy: { numero: 'asc' },
  });
  const productos = await prisma.producto.findMany({ where: { activo: true } });
  const proveedor = await prisma.proveedor.findFirstOrThrow();
  const temporadas = await prisma.temporada.findMany({
    where: { activa: true },
    include: { tarifas: true },
  });

  const tarifaDeNoche = (tipo, dia) => {
    const fecha = fechaColumna(dia);
    const temporada = temporadas.find((t) => t.fechaInicio <= fecha && fecha <= t.fechaFin);
    const especial = temporada?.tarifas.find((t) => t.tipoHabitacionId === tipo.id);
    return especial?.tarifa ?? tipo.tarifaBase;
  };

  // El inventario inicial del seed queda fechado al comienzo del periodo.
  await prisma.movimientoInventario.updateMany({
    where: { motivo: 'AJUSTE', observacion: 'Inventario inicial' },
    data: { creadoEn: instante(INICIO, 6 * 60) },
  });
  const stock = new Map(productos.map((p) => [p.id, p.stockActual]));

  // Clientes
  const documentos = new Set();
  const datosClientes = Array.from({ length: 48 }, () => {
    const nombres = elegir(NOMBRES);
    const apellidos = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
    let documento;
    do documento = String(entero(10_000_000, 1_199_999_999));
    while (documentos.has(documento));
    documentos.add(documento);
    const usuarioCorreo = sinTildes(`${nombres.split(' ')[0]}.${apellidos.split(' ')[0]}`)
      .toLowerCase()
      .replace(/[^a-z.]/g, '');
    return {
      nombres,
      apellidos,
      tipoDocumento: probable(0.95) ? 'CC' : 'CE',
      numeroDocumento: documento,
      telefono: `3${entero(10, 23)}${entero(1_000_000, 9_999_999)}`,
      email: probable(0.7) ? `${usuarioCorreo}${entero(1, 99)}@correo.com` : null,
      creadoEn: instante(INICIO, 8 * 60),
    };
  });
  await prisma.cliente.createMany({ data: datosClientes });
  const clientes = await prisma.cliente.findMany();

  // Turnos de caja: uno por día, el de hoy queda abierto.
  const cajaDelDia = new Map();
  for (let dia = INICIO; dia <= hoy; dia = sumarDias(dia, 1)) {
    const esHoy = dia === hoy;
    const caja = await prisma.caja.create({
      data: {
        montoBase: 100000,
        estado: esHoy ? 'ABIERTA' : 'CERRADA',
        abiertaPorId: recepcion.id,
        abiertaEn: instante(
          dia,
          esHoy ? Math.min(APERTURA_CAJA, minutoActual - 30) : APERTURA_CAJA,
        ),
        cerradaPorId: esHoy ? null : recepcion.id,
        cerradaEn: esHoy ? null : instante(dia, CIERRE_CAJA),
      },
    });
    cajaDelDia.set(dia, caja.id);
  }
  const limiteDelDia = (dia) => (dia === hoy ? minutoActual - 5 : CIERRE_CAJA - 10);
  const momento = (dia, desde, hasta) => {
    const tope = Math.min(hasta, limiteDelDia(dia));
    return tope < desde ? null : instante(dia, entero(desde, tope));
  };

  // ── Plan de estadías: cada habitación se recorre en el tiempo ──
  const codigos = new Set();
  const nuevoCodigo = () => {
    let codigo;
    do
      codigo = `RS-${Math.floor(azar() * 0xffffff)
        .toString(16)
        .toUpperCase()
        .padStart(6, '0')}`;
    while (codigos.has(codigo));
    codigos.add(codigo);
    return codigo;
  };
  const yaSalieronHoy = minutoActual > 12 * 60;

  const estadias = [];
  for (const habitacion of habitaciones) {
    let cursor = sumarDias(INICIO, -entero(0, 1));
    while (cursor < fin) {
      const futuro = cursor > sumarDias(hoy, 3);
      const espera = futuro
        ? ponderado([
            [1, 2],
            [2, 3],
            [4, 3],
            [6, 2],
          ])
        : ponderado([
            [0, 30],
            [1, 30],
            [2, 20],
            [3, 12],
            [5, 8],
          ]);
      let llegada = sumarDias(cursor, espera);
      if (!esFinDeSemana(llegada) && probable(0.25)) llegada = sumarDias(llegada, 1);
      const noches = ponderado([
        [1, 30],
        [2, 35],
        [3, 20],
        [4, 10],
        [5, 5],
      ]);
      const salida = sumarDias(llegada, noches);
      cursor = salida;
      if (llegada < INICIO || llegada > fin) continue;

      const enCursoHoy = llegada < hoy && hoy < salida;
      if (habitacion.numero === HABITACION_EN_MANTENIMIENTO && llegada <= hoy && hoy <= salida) {
        continue;
      }

      let estado;
      if (salida < hoy) {
        estado = ponderado([
          ['FINALIZADA', 90],
          ['CANCELADA', 6],
          ['NO_SHOW', 4],
        ]);
      } else if (salida === hoy) {
        estado = yaSalieronHoy && probable(0.75) ? 'FINALIZADA' : 'EN_CURSO';
      } else if (enCursoHoy) {
        estado = 'EN_CURSO';
      } else if (llegada === hoy) {
        estado = probable(0.8) ? 'CONFIRMADA' : 'PENDIENTE';
      } else {
        estado = ponderado([
          ['CONFIRMADA', 62],
          ['PENDIENTE', 30],
          ['CANCELADA', 8],
        ]);
      }

      const anticipacion =
        llegada >= hoy
          ? entero(1, 14)
          : ponderado([
              [0, 25],
              [2, 25],
              [7, 30],
              [14, 20],
            ]);
      let reservadaEl = sumarDias(llegada, -anticipacion);
      if (reservadaEl < INICIO) reservadaEl = INICIO;
      if (reservadaEl > hoy) reservadaEl = hoy;
      if (reservadaEl === hoy && minutoActual < 8 * 60 + 30) reservadaEl = sumarDias(hoy, -1);

      const tarifas = [];
      for (let dia = llegada; dia < salida; dia = sumarDias(dia, 1)) {
        tarifas.push(tarifaDeNoche(habitacion.tipo, dia));
      }
      const subtotal = tarifas.reduce((suma, tarifa) => suma + tarifa, 0);
      const descuentoPorcentaje = probable(0.08) ? 10 : 0;
      const totalEstadia = subtotal - Math.round((subtotal * descuentoPorcentaje) / 100);
      const pagaAnticipo = estado !== 'PENDIENTE' && reservadaEl !== llegada;

      estadias.push({
        habitacion,
        titular: elegir(clientes),
        codigo: nuevoCodigo(),
        llegada,
        salida,
        noches,
        estado,
        reservadaEl,
        subtotal,
        descuentoPorcentaje,
        totalEstadia,
        anticipo: pagaAnticipo ? Math.round(totalEstadia * 0.5) : 0,
        consumos: [],
      });
    }
  }

  // ── Línea de tiempo de operaciones ──
  const operaciones = [];
  const agendar = (tiempo, ejecutar) => tiempo && operaciones.push({ tiempo, ejecutar });

  for (const estadia of estadias) {
    const { llegada, salida, estado } = estadia;
    const seAloja = ['FINALIZADA', 'EN_CURSO'].includes(estado);
    const sinReservaPrevia = estadia.reservadaEl === llegada;

    // Quien llega sin reserva se registra y hace check-in en el mismo momento.
    if (sinReservaPrevia && seAloja) {
      agendar(momento(llegada, 14 * 60 + 30, 16 * 60 + 45), async (tiempo) => {
        await crearReserva(estadia, new Date(tiempo.getTime() - 10 * MINUTO_MS));
        await hacerCheckin(estadia, tiempo);
      });
    } else {
      agendar(momento(estadia.reservadaEl, 8 * 60, 19 * 60), (t) => crearReserva(estadia, t));
      if (seAloja) {
        agendar(momento(llegada, 14 * 60 + 30, 16 * 60 + 45), (t) => hacerCheckin(estadia, t));
      }
    }
    if (seAloja) {
      for (let dia = llegada; dia < salida && dia <= hoy; dia = sumarDias(dia, 1)) {
        if (probable(0.5)) {
          agendar(momento(dia, 17 * 60, 21 * 60), (t) => cargarConsumo(estadia, t));
        }
      }
    }
    if (estado === 'FINALIZADA') {
      agendar(momento(salida, 9 * 60 + 30, 11 * 60 + 45), (t) => hacerCheckout(estadia, t));
    }
    if (estado === 'CANCELADA' && estadia.anticipo) {
      const diasAntes = Math.max(1, entero(1, 6));
      let dia = sumarDias(llegada, -diasAntes);
      if (dia < estadia.reservadaEl) dia = estadia.reservadaEl;
      if (dia > hoy) dia = hoy;
      const devolver = diasAntes >= 2 && dia > estadia.reservadaEl && probable(0.6);
      if (devolver) agendar(momento(dia, 9 * 60, 18 * 60), (t) => cancelar(estadia, t));
    }
  }

  for (let dia = INICIO; dia <= hoy; dia = sumarDias(dia, 1)) {
    const ventasDelDia = esFinDeSemana(dia) ? entero(3, 6) : entero(1, 4);
    for (let i = 0; i < ventasDelDia; i += 1) {
      agendar(momento(dia, 8 * 60, 21 * 60), (tiempo) => venderEnMostrador(tiempo));
    }
    if (esLunes(dia) || dia === INICIO) {
      agendar(momento(dia, 7 * 60 + 15, 9 * 60), (tiempo) => comprarAlProveedor(tiempo));
    }
  }

  // ── Escritores ──
  const lineasDeProductos = (cantidadLineas) => {
    const elegidos = new Map();
    for (let i = 0; i < cantidadLineas; i += 1) {
      const producto = elegir(productos);
      const cantidad = Math.min(
        entero(1, 2),
        stock.get(producto.id) - (elegidos.get(producto.id) ?? 0),
      );
      if (cantidad > 0) elegidos.set(producto.id, (elegidos.get(producto.id) ?? 0) + cantidad);
    }
    return [...elegidos].map(([id, cantidad]) => ({
      producto: productos.find((p) => p.id === id),
      cantidad,
    }));
  };

  const salidaDeStock = (productoId, cantidad) => {
    const resultante = stock.get(productoId) - cantidad;
    stock.set(productoId, resultante);
    return resultante;
  };

  async function crearVenta({
    tipo,
    tiempo,
    estadia,
    compradorNombre,
    detalles,
    descuento = 0,
    metodos,
    movimientos,
  }) {
    const dia = aTextoFecha(new Date(tiempo.getTime() - 5 * 60 * MINUTO_MS));
    const total = detalles.reduce((suma, d) => suma + d.cantidad * d.precioUnitario, 0) - descuento;
    const subtotal = Math.round(total / (1 + IVA));
    const pagos = repartirPago(total, metodos);
    const cajaId = cajaDelDia.get(dia);

    return prisma.venta
      .create({
        data: {
          tipo,
          reservaId: estadia?.id ?? null,
          clienteId: estadia?.titular.id ?? null,
          compradorNombre: compradorNombre ?? null,
          cajaId,
          subtotal,
          iva: total - subtotal,
          descuento,
          total,
          creadoPorId: recepcion.id,
          creadoEn: tiempo,
          detalles: {
            create: detalles.map((d) => ({ ...d, total: d.cantidad * d.precioUnitario })),
          },
          pagos: { create: pagos },
          movimientosInventario: movimientos ? { create: movimientos } : undefined,
        },
        include: { pagos: true },
      })
      .then(async (venta) => {
        await prisma.cajaMovimiento.createMany({
          data: venta.pagos.map((pago) => ({
            cajaId,
            tipo: 'INGRESO',
            metodo: pago.metodo,
            monto: pago.monto,
            descripcion: compradorNombre
              ? `Comprobante ${venta.id} · ${compradorNombre}`
              : `Comprobante ${venta.id}`,
            ventaId: venta.id,
            usuarioId: recepcion.id,
            creadoEn: tiempo,
          })),
        });
        return venta;
      });
  }

  async function crearReserva(estadia, tiempo) {
    const reserva = await prisma.reserva.create({
      data: {
        codigo: estadia.codigo,
        titularId: estadia.titular.id,
        fechaLlegada: fechaColumna(estadia.llegada),
        fechaSalida: fechaColumna(estadia.salida),
        estado: estadia.estado,
        descuentoPorcentaje: estadia.descuentoPorcentaje,
        creadoPorId: recepcion.id,
        creadoEn: tiempo,
        habitaciones: {
          create: {
            habitacionId: estadia.habitacion.id,
            tarifaNoche: Math.round(estadia.subtotal / estadia.noches),
            noches: estadia.noches,
            subtotal: estadia.subtotal,
          },
        },
        huespedes: {
          create: { clienteId: estadia.titular.id, habitacionId: estadia.habitacion.id },
        },
      },
    });
    estadia.id = reserva.id;

    if (estadia.anticipo) {
      estadia.ventaAnticipo = await crearVenta({
        tipo: 'ANTICIPO',
        tiempo: new Date(tiempo.getTime() + 3 * MINUTO_MS),
        estadia,
        detalles: [
          {
            tipo: 'HABITACION',
            descripcion: `Anticipo del 50 % de la reserva ${estadia.codigo}`,
            cantidad: 1,
            precioUnitario: estadia.anticipo,
          },
        ],
        metodos: METODO_ANTICIPO,
      });
    }
  }

  async function hacerCheckin(estadia, tiempo) {
    if (!estadia.id) return;
    const saldo = estadia.totalEstadia - estadia.anticipo;
    if (saldo > 0) {
      await crearVenta({
        tipo: 'SALDO_CHECKIN',
        tiempo,
        estadia,
        detalles: [
          {
            tipo: 'HABITACION',
            descripcion: `Saldo de la estadía, reserva ${estadia.codigo}`,
            cantidad: 1,
            precioUnitario: saldo,
          },
        ],
        metodos: METODO_HOSPEDAJE,
      });
    }
    await prisma.reserva.update({ where: { id: estadia.id }, data: { checkinEn: tiempo } });
  }

  async function cargarConsumo(estadia, tiempo) {
    if (!estadia.id) return;
    for (const { producto, cantidad } of lineasDeProductos(entero(1, 2))) {
      const consumo = await prisma.consumoHabitacion.create({
        data: {
          reservaId: estadia.id,
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precioVenta,
          registradoPorId: recepcion.id,
          creadoEn: tiempo,
          movimientos: {
            create: {
              productoId: producto.id,
              motivo: 'CONSUMO_HABITACION',
              cantidad: -cantidad,
              stockResultante: salidaDeStock(producto.id, cantidad),
              observacion: `Cargado a la reserva ${estadia.codigo}`,
              usuarioId: recepcion.id,
              creadoEn: tiempo,
            },
          },
        },
      });
      estadia.consumos.push({ ...consumo, producto });
    }
  }

  async function hacerCheckout(estadia, tiempo) {
    if (!estadia.id) return;
    if (estadia.consumos.length > 0) {
      const venta = await crearVenta({
        tipo: 'CONSUMOS_CHECKOUT',
        tiempo,
        estadia,
        detalles: estadia.consumos.map((consumo) => ({
          tipo: 'PRODUCTO',
          productoId: consumo.productoId,
          descripcion: consumo.producto.nombre,
          cantidad: consumo.cantidad,
          precioUnitario: consumo.precioUnitario,
        })),
        metodos: METODO_HOSPEDAJE,
      });
      await prisma.consumoHabitacion.updateMany({
        where: { id: { in: estadia.consumos.map((c) => c.id) } },
        data: { pagado: true, ventaId: venta.id },
      });
    }
    await prisma.reserva.update({ where: { id: estadia.id }, data: { checkoutEn: tiempo } });

    const esHoy = estadia.salida === hoy;
    const iniciada = new Date(tiempo.getTime() + entero(15, 60) * MINUTO_MS);
    const terminada = new Date(iniciada.getTime() + entero(35, 80) * MINUTO_MS);
    // Parte de las salidas de hoy queda en el tablero de housekeeping.
    const lista = !esHoy || (terminada < ahora && probable(0.25));
    const enProceso = !lista && iniciada < ahora && probable(0.5);

    await prisma.limpieza.create({
      data: {
        habitacionId: estadia.habitacion.id,
        reservaId: estadia.id,
        estado: lista ? 'TERMINADA' : enProceso ? 'EN_PROCESO' : 'PENDIENTE',
        responsableId: lista || enProceso ? limpieza.id : null,
        creadaEn: tiempo,
        iniciadaEn: lista || enProceso ? iniciada : null,
        terminadaEn: lista ? terminada : null,
      },
    });
    if (!lista) {
      estadia.limpiezaPendiente = true;
      await prisma.notificacion.create({
        data: {
          rolDestino: 'HOUSEKEEPING',
          titulo: `Habitación ${estadia.habitacion.numero} pendiente de limpieza`,
          mensaje: `El huésped de la reserva ${estadia.codigo} hizo check-out.`,
          habitacionId: estadia.habitacion.id,
          creadaEn: tiempo,
        },
      });
    }
  }

  /** Cancelación con más de 24 horas de anticipación: se devuelve el anticipo. */
  async function cancelar(estadia, tiempo) {
    if (!estadia.ventaAnticipo) return;
    const dia = aTextoFecha(new Date(tiempo.getTime() - 5 * 60 * MINUTO_MS));
    await prisma.venta.update({
      where: { id: estadia.ventaAnticipo.id },
      data: { estado: 'ANULADA' },
    });
    await prisma.cajaMovimiento.createMany({
      data: estadia.ventaAnticipo.pagos.map((pago) => ({
        cajaId: cajaDelDia.get(dia),
        tipo: 'EGRESO',
        metodo: pago.metodo,
        monto: pago.monto,
        descripcion: `Devolución del anticipo, reserva ${estadia.codigo}`,
        ventaId: estadia.ventaAnticipo.id,
        usuarioId: recepcion.id,
        creadoEn: tiempo,
      })),
    });
  }

  async function venderEnMostrador(tiempo) {
    const lineas = lineasDeProductos(entero(1, 3));
    if (lineas.length === 0) return;
    await crearVenta({
      tipo: 'VENTA_DIRECTA',
      tiempo,
      compradorNombre: probable(0.25) ? elegir(COMPRADORES) : null,
      detalles: lineas.map(({ producto, cantidad }) => ({
        tipo: 'PRODUCTO',
        productoId: producto.id,
        descripcion: producto.nombre,
        cantidad,
        precioUnitario: producto.precioVenta,
      })),
      metodos: METODO_MOSTRADOR,
      movimientos: lineas.map(({ producto, cantidad }) => ({
        productoId: producto.id,
        motivo: 'VENTA',
        cantidad: -cantidad,
        stockResultante: salidaDeStock(producto.id, cantidad),
        usuarioId: recepcion.id,
        creadoEn: tiempo,
      })),
    });
  }

  /** Cada lunes se repone lo que está por debajo del doble del mínimo. */
  async function comprarAlProveedor(tiempo) {
    const reponer = productos
      .filter((p) => stock.get(p.id) < p.stockMinimo * 2)
      .map((p) => ({ producto: p, cantidad: p.stockMinimo * 3 - stock.get(p.id) }));
    if (reponer.length === 0) return;

    await prisma.compra.create({
      data: {
        proveedorId: proveedor.id,
        estado: 'CONFIRMADA',
        total: reponer.reduce((suma, r) => suma + r.cantidad * r.producto.costo, 0),
        creadoPorId: admin.id,
        creadoEn: tiempo,
        confirmadaEn: tiempo,
        detalles: {
          create: reponer.map((r) => ({
            productoId: r.producto.id,
            cantidad: r.cantidad,
            costoUnitario: r.producto.costo,
          })),
        },
        movimientos: {
          create: reponer.map((r) => {
            stock.set(r.producto.id, stock.get(r.producto.id) + r.cantidad);
            return {
              productoId: r.producto.id,
              motivo: 'COMPRA',
              cantidad: r.cantidad,
              stockResultante: stock.get(r.producto.id),
              usuarioId: admin.id,
              creadoEn: tiempo,
            };
          }),
        },
      },
    });
  }

  // ── Ejecución en orden cronológico ──
  operaciones.sort((a, b) => a.tiempo - b.tiempo);
  console.log(`Escribiendo ${operaciones.length} operaciones de ${estadias.length} estadías…`);
  for (const [indice, operacion] of operaciones.entries()) {
    await operacion.ejecutar(operacion.tiempo);
    if ((indice + 1) % 250 === 0) console.log(`  ${indice + 1} / ${operaciones.length}`);
  }

  // Estado final de inventario y habitaciones
  for (const [id, cantidad] of stock) {
    await prisma.producto.update({ where: { id }, data: { stockActual: cantidad } });
  }
  const ocupadas = estadias
    .filter((e) => e.estado === 'EN_CURSO' && e.id)
    .map((e) => e.habitacion.id);
  const enLimpieza = estadias.filter((e) => e.limpiezaPendiente).map((e) => e.habitacion.id);
  await prisma.habitacion.updateMany({ data: { estado: 'DISPONIBLE' } });
  await prisma.habitacion.updateMany({
    where: { id: { in: ocupadas } },
    data: { estado: 'OCUPADA' },
  });
  await prisma.habitacion.updateMany({
    where: { id: { in: enLimpieza.filter((id) => !ocupadas.includes(id)) } },
    data: { estado: 'EN_LIMPIEZA' },
  });
  await prisma.habitacion.updateMany({
    where: { numero: HABITACION_EN_MANTENIMIENTO },
    data: { estado: 'EN_MANTENIMIENTO' },
  });

  const resumen = estadias.reduce((total, e) => {
    if (e.id) total[e.estado] = (total[e.estado] ?? 0) + 1;
    return total;
  }, {});
  console.log('\nDatos de demostración cargados.');
  console.log(`  Clientes: ${clientes.length} · Turnos de caja: ${cajaDelDia.size}`);
  console.log(
    `  Reservas: ${Object.entries(resumen)
      .map(([estado, n]) => `${estado} ${n}`)
      .join(' · ')}`,
  );
  console.log(`  Ventas: ${await prisma.venta.count()} · Compras: ${await prisma.compra.count()}`);
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
