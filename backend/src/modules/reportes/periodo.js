const DESFASE_COLOMBIA = '-05:00';
const DIA_MS = 24 * 60 * 60 * 1000;

/** Días (AAAA-MM-DD) entre dos fechas, ambas incluidas. */
export function diasDelPeriodo(desde, hasta) {
  const dias = [];
  for (let t = Date.parse(desde); t <= Date.parse(hasta); t += DIA_MS) {
    dias.push(new Date(t).toISOString().slice(0, 10));
  }
  return dias;
}

/**
 * Instantes de inicio y fin del periodo en hora de Colombia, para filtrar
 * columnas con hora (creado_en, abierta_en): [desde 00:00, hasta + 1 día 00:00).
 */
export function instantesDelPeriodo(desde, hasta) {
  const siguiente = new Date(Date.parse(hasta) + DIA_MS).toISOString().slice(0, 10);
  return {
    gte: new Date(`${desde}T00:00:00${DESFASE_COLOMBIA}`),
    lt: new Date(`${siguiente}T00:00:00${DESFASE_COLOMBIA}`),
  };
}

/** Día en Colombia (AAAA-MM-DD) de un instante guardado en UTC. */
export function diaEnColombia(instante) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(instante);
}

/** Las columnas @db.Date se guardan a medianoche UTC. */
export function fechaDeColumna(texto) {
  return new Date(`${texto}T00:00:00Z`);
}
