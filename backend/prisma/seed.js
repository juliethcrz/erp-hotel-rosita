import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database.js';

const TIPOS_HABITACION = [
  { nombre: 'Individual', capacidadMaxima: 1, tarifaBase: 45000, descripcion: 'Para una persona' },
  {
    nombre: 'Doble',
    capacidadMaxima: 2,
    tarifaBase: 80000,
    descripcion: 'Para dos personas, cama doble o dos camas sencillas',
  },
  { nombre: 'Triple', capacidadMaxima: 3, tarifaBase: 105000, descripcion: 'Para tres personas' },
  {
    nombre: 'Cuádruple',
    capacidadMaxima: 4,
    tarifaBase: 120000,
    descripcion: 'Familiar, para cuatro personas',
  },
];

const HABITACIONES = [
  ...['101', '102', '103', '104', '105', '106'].map((numero) => ({ numero, tipo: 'Individual' })),
  ...['107', '108', '109', '110', '201', '202', '203', '204'].map((numero) => ({
    numero,
    tipo: 'Doble',
  })),
  ...['205', '206', '207'].map((numero) => ({ numero, tipo: 'Triple' })),
  ...['208', '209', '210'].map((numero) => ({ numero, tipo: 'Cuádruple' })),
];

const INCREMENTO_TEMPORADA_ALTA = 0.3;

const TEMPORADAS = [
  { nombre: 'Fin de año 2026-2027', fechaInicio: '2026-12-15', fechaFin: '2027-01-15' },
  { nombre: 'Semana Santa 2027', fechaInicio: '2027-03-20', fechaFin: '2027-03-28' },
  { nombre: 'Mitad de año 2027', fechaInicio: '2027-06-15', fechaFin: '2027-07-15' },
  { nombre: 'Receso escolar octubre 2027', fechaInicio: '2027-10-09', fechaFin: '2027-10-18' },
];

const PRODUCTOS = [
  ['001', 'Agua 500 ml', 'Bebidas', 2000, 800, 24, 10],
  ['002', 'Agua 1,5 L', 'Bebidas', 3500, 1500, 12, 6],
  ['003', 'Gaseosa 250 ml', 'Bebidas', 4000, 1800, 18, 8],
  ['004', 'Jugo Hit', 'Bebidas', 4500, 2000, 15, 8],
  ['005', 'Cerveza', 'Bebidas', 7000, 3500, 24, 10],
  ['006', 'Pony Malta', 'Bebidas', 5000, 2500, 12, 6],
  ['007', 'Energizante Vive 100', 'Bebidas', 4000, 1800, 10, 6],
  ['008', 'Café instantáneo (sobre)', 'Bebidas', 1000, 300, 30, 15],
  ['009', 'Galletas', 'Snacks', 3000, 1200, 20, 8],
  ['010', 'Maní salado', 'Snacks', 3500, 1500, 15, 6],
  ['011', 'Chocolatina', 'Snacks', 3500, 1500, 15, 8],
  ['012', 'Papas fritas (paquete)', 'Snacks', 4000, 1800, 12, 6],
  ['013', 'Barra de cereal', 'Snacks', 4500, 2000, 10, 5],
  ['014', 'Champú (sobre)', 'Aseo personal', 4000, 1500, 20, 8],
  ['015', 'Jabón de manos', 'Aseo personal', 2500, 800, 20, 10],
  ['016', 'Cepillo de dientes desechable', 'Aseo personal', 4000, 1500, 15, 6],
  ['017', 'Crema dental mini', 'Aseo personal', 5000, 2000, 12, 5],
  ['018', 'Máquina de afeitar desechable', 'Aseo personal', 6000, 2500, 10, 4],
  ['019', 'Toallas higiénicas (paquete)', 'Aseo personal', 7000, 3000, 8, 4],
  ['020', 'Pañuelos faciales', 'Aseo personal', 3500, 1500, 10, 5],
  ['021', 'Pilas AA (par)', 'Varios', 6000, 2500, 10, 4],
  ['022', 'Cable USB-C', 'Varios', 12000, 5000, 5, 2],
  ['023', 'Adaptador universal', 'Varios', 10000, 4000, 5, 2],
  ['024', 'Condón (unidad)', 'Varios', 5000, 1500, 12, 5],
  ['025', 'Acetaminofén (2 tabletas)', 'Varios', 2000, 500, 20, 8],
  ['026', 'Pastillas de menta', 'Varios', 1500, 500, 15, 6],
];

const CONFIGURACION = {
  hotel_nombre: 'Hotel y Restaurante Rosita',
  hotel_nit: '',
  hotel_direccion: 'Chiscas, Boyacá',
  hotel_telefono: '',
  hotel_email: '',
  hora_checkin: '14:00',
  hora_checkout: '12:00',
  no_show_horas: '2',
  iva_porcentaje: '19',
  caja_monto_base: '100000',
};

async function sembrarUsuarios() {
  const password = process.env.SEED_PASSWORD;
  if (!password) {
    throw new Error('Falta SEED_PASSWORD en el archivo .env');
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const usuarios = [
    { nombre: 'Administrador', apellido: 'Rosita', email: 'admin@hotelrosita.co', rol: 'ADMIN' },
    {
      nombre: 'Recepción',
      apellido: 'Rosita',
      email: 'recepcion@hotelrosita.co',
      rol: 'RECEPCIONISTA',
    },
    {
      nombre: 'Housekeeping',
      apellido: 'Rosita',
      email: 'limpieza@hotelrosita.co',
      rol: 'HOUSEKEEPING',
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: { ...usuario, passwordHash },
    });
  }

  return prisma.usuario.findUniqueOrThrow({ where: { email: 'admin@hotelrosita.co' } });
}

async function sembrarHabitaciones() {
  for (const tipo of TIPOS_HABITACION) {
    await prisma.tipoHabitacion.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    });
  }

  const tipos = await prisma.tipoHabitacion.findMany();
  const idPorNombre = Object.fromEntries(tipos.map((tipo) => [tipo.nombre, tipo.id]));

  for (const { numero, tipo } of HABITACIONES) {
    await prisma.habitacion.upsert({
      where: { numero },
      update: {},
      create: { numero, piso: Number(numero[0]), tipoId: idPorNombre[tipo] },
    });
  }

  for (const temporada of TEMPORADAS) {
    const existente = await prisma.temporada.findFirst({ where: { nombre: temporada.nombre } });
    if (existente) continue;

    await prisma.temporada.create({
      data: {
        nombre: temporada.nombre,
        fechaInicio: new Date(temporada.fechaInicio),
        fechaFin: new Date(temporada.fechaFin),
        tarifas: {
          create: tipos.map((tipo) => ({
            tipoHabitacionId: tipo.id,
            tarifa: Math.round((tipo.tarifaBase * (1 + INCREMENTO_TEMPORADA_ALTA)) / 1000) * 1000,
          })),
        },
      },
    });
  }
}

async function sembrarTienda(admin) {
  const categorias = [...new Set(PRODUCTOS.map(([, , categoria]) => categoria))];
  for (const nombre of categorias) {
    await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  const idCategoria = Object.fromEntries(
    (await prisma.categoria.findMany()).map((categoria) => [categoria.nombre, categoria.id]),
  );

  const proveedor = await prisma.proveedor.findFirst();
  if (!proveedor) {
    await prisma.proveedor.create({ data: { nombre: 'Distribuidora principal' } });
  }

  for (const [codigo, nombre, categoria, precioVenta, costo, stock, stockMinimo] of PRODUCTOS) {
    const existente = await prisma.producto.findUnique({ where: { codigo } });
    if (existente) continue;

    await prisma.producto.create({
      data: {
        codigo,
        nombre,
        categoriaId: idCategoria[categoria],
        precioVenta,
        costo,
        stockActual: stock,
        stockMinimo,
        movimientos: {
          create: {
            motivo: 'AJUSTE',
            cantidad: stock,
            stockResultante: stock,
            observacion: 'Inventario inicial',
            usuarioId: admin.id,
          },
        },
      },
    });
  }
}

async function sembrarConfiguracion() {
  for (const [clave, valor] of Object.entries(CONFIGURACION)) {
    await prisma.configuracion.upsert({ where: { clave }, update: {}, create: { clave, valor } });
  }
}

async function main() {
  const admin = await sembrarUsuarios();
  await sembrarHabitaciones();
  await sembrarTienda(admin);
  await sembrarConfiguracion();
  console.log('Datos iniciales cargados');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
