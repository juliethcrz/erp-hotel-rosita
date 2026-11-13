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
 * en fotos_habitacion. Con --simular solo muestra lo que haría, sin cambiar nada.
 *
 *   npm run fotos:importar -w backend -- --simular
 *   npm run fotos:importar -w backend
 */
import { prisma } from '../src/config/database.js';
import { listarArchivos, moverArchivo } from '../src/config/storage.js';

const PATRON = /^(\d{3})([PSB])(\d*)\.(jpe?g|png|webp)$/i;
const ORDEN_TIPO = { P: 0, S: 1, B: 2 };
const simular = process.argv.includes('--simular');

function interpretar(nombre) {
  const coincidencia = nombre.match(PATRON);
  if (!coincidencia) return null;
  const [, numero, tipo, angulo] = coincidencia;
  return {
    nombre,
    numero,
    tipo: tipo.toUpperCase(),
    angulo: angulo === '' ? 0 : Number(angulo),
  };
}

function ordenar(a, b) {
  return ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] || a.angulo - b.angulo;
}

async function importarHabitacion(habitacion, fotos) {
  const existentes = await prisma.fotoHabitacion.findMany({
    where: { habitacionId: habitacion.id },
  });
  const yaTienePrincipal = existentes.some((foto) => foto.esPrincipal);
  const siguienteOrden = existentes.length
    ? Math.max(...existentes.map((foto) => foto.orden)) + 1
    : 0;

  const registros = fotos.sort(ordenar).map((foto, indice) => ({
    habitacionId: habitacion.id,
    ruta: `${habitacion.numero}/${foto.nombre}`,
    orden: siguienteOrden + indice,
    esPrincipal: !yaTienePrincipal && indice === 0,
    origen: foto.nombre,
  }));

  for (const registro of registros) {
    const marca = registro.esPrincipal ? '  ★ principal' : '';
    console.log(`  ${registro.origen.padEnd(14)} → ${registro.ruta}${marca}`);
  }
  if (simular) return registros.length;

  for (const registro of registros) {
    await moverArchivo(registro.origen, registro.ruta);
  }
  await prisma.fotoHabitacion.createMany({
    data: registros.map(({ origen: _origen, ...datos }) => datos),
  });
  return registros.length;
}

async function main() {
  const archivos = await listarArchivos();
  const fotos = archivos.map(interpretar);
  const ignorados = archivos.filter((_, indice) => !fotos[indice]);

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
