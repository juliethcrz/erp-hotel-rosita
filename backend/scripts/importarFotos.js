/**
 * Importa las fotos que se subieron directamente al bucket con la convención
 * <número><tipo><ángulo>.<extensión>, por ejemplo 101P.jpg, 101P1.png, 101B.png, 102S.jpg.
 *
 *   P = habitación (P sin número es la foto principal)
 *   B = baño
 *   S = solar o espacio exterior
 *   el número final es otro ángulo de la misma toma
 *
 * Cada foto se mueve a la carpeta de su habitación (101/101P.jpg) y se registra
 * en fotos_habitacion. Las que ya están en su carpeta (por ejemplo, después de
 * reiniciar la base) solo se registran. Con --simular solo muestra lo que haría.
 *
 *   npm run fotos:importar -w backend -- --simular
 *   npm run fotos:importar -w backend
 */
import { prisma } from '../src/config/database.js';
import { listarArchivos, listarCarpetas, moverArchivo } from '../src/config/storage.js';

const PATRON = /^(\d{3})([PSB])(\d*)\.(jpe?g|png|webp)$/i;
const ORDEN_TIPO = { P: 0, S: 1, B: 2 };
const simular = process.argv.includes('--simular');

function interpretar(nombre, carpeta = '') {
  const coincidencia = nombre.match(PATRON);
  if (!coincidencia) return null;
  const [, numero, tipo, angulo] = coincidencia;
  if (carpeta && carpeta !== numero) return null;
  return {
    nombre,
    origen: carpeta ? `${carpeta}/${nombre}` : nombre,
    numero,
    tipo: tipo.toUpperCase(),
    angulo: angulo === '' ? 0 : Number(angulo),
  };
}

function ordenar(a, b) {
  return ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] || a.angulo - b.angulo;
}

async function importarHabitacion(habitacion, lista) {
  let fotos = lista;
  const existentes = await prisma.fotoHabitacion.findMany({
    where: { habitacionId: habitacion.id },
  });
  const registradas = new Set(existentes.map((foto) => foto.ruta));
  fotos = fotos.filter((foto) => !registradas.has(`${habitacion.numero}/${foto.nombre}`));
  if (fotos.length === 0) {
    console.log('  (ya estaban registradas)');
    return 0;
  }
  const yaTienePrincipal = existentes.some((foto) => foto.esPrincipal);
  const siguienteOrden = existentes.length
    ? Math.max(...existentes.map((foto) => foto.orden)) + 1
    : 0;

  const registros = fotos.sort(ordenar).map((foto, indice) => ({
    habitacionId: habitacion.id,
    ruta: `${habitacion.numero}/${foto.nombre}`,
    orden: siguienteOrden + indice,
    esPrincipal: !yaTienePrincipal && indice === 0,
    origen: foto.origen,
  }));

  for (const registro of registros) {
    const marca = registro.esPrincipal ? '  ★ principal' : '';
    console.log(`  ${registro.origen.padEnd(14)} → ${registro.ruta}${marca}`);
  }
  if (simular) return registros.length;

  for (const registro of registros) {
    if (registro.origen !== registro.ruta) await moverArchivo(registro.origen, registro.ruta);
  }
  await prisma.fotoHabitacion.createMany({
    data: registros.map(({ origen: _origen, ...datos }) => datos),
  });
  return registros.length;
}

async function main() {
  const sueltos = await listarArchivos();
  const carpetas = (await listarCarpetas()).filter((nombre) => /^\d{3}$/.test(nombre));
  const enCarpetas = await Promise.all(
    carpetas.map(async (carpeta) =>
      (await listarArchivos(carpeta)).map((nombre) => ({ nombre, carpeta })),
    ),
  );
  const archivos = [...sueltos.map((nombre) => ({ nombre, carpeta: '' })), ...enCarpetas.flat()];
  const fotos = archivos.map(({ nombre, carpeta }) => interpretar(nombre, carpeta));
  const ignorados = archivos
    .filter((archivo, indice) => !fotos[indice] && archivo.nombre !== '.emptyFolderPlaceholder')
    .map(({ nombre, carpeta }) => (carpeta ? `${carpeta}/${nombre}` : nombre));

  const porHabitacion = new Map();
  for (const foto of fotos.filter(Boolean)) {
    porHabitacion.set(foto.numero, [...(porHabitacion.get(foto.numero) ?? []), foto]);
  }

  const habitaciones = await prisma.habitacion.findMany({
    where: { numero: { in: [...porHabitacion.keys()] } },
  });
  const habitacionPorNumero = new Map(habitaciones.map((h) => [h.numero, h]));

  console.log(simular ? 'Simulación: no se cambia nada.\n' : 'Importando fotos…\n');
  let total = 0;
  for (const [numero, lista] of [...porHabitacion].sort()) {
    const habitacion = habitacionPorNumero.get(numero);
    if (!habitacion) {
      console.log(`Habitación ${numero}: no existe, se omiten ${lista.length} fotos`);
      continue;
    }
    console.log(`Habitación ${numero}`);
    total += await importarHabitacion(habitacion, lista);
  }

  console.log(`\n${total} fotos ${simular ? 'por importar' : 'importadas'}.`);
  if (ignorados.length > 0) {
    console.log(`No siguen la convención y se dejaron como están: ${ignorados.join(', ')}`);
  }
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
