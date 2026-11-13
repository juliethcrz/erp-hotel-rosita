const NOMBRE_CAMA = {
  SENCILLA: ['cama sencilla', 'camas sencillas'],
  SEMIDOBLE: ['cama semidoble', 'camas semidobles'],
  DOBLE: ['cama doble', 'camas dobles'],
  QUEEN: ['cama queen', 'camas queen'],
  CAMAROTE: ['camarote', 'camarotes'],
};

export const CATEGORIAS_CARACTERISTICA = {
  VISTA: 'Vista',
  BANO: 'Baño',
  TECNOLOGIA: 'Tecnología',
  MOBILIARIO: 'Mobiliario',
  COMODIDAD: 'Comodidades',
};

/** "1 cama doble + 1 cama sencilla" a partir de las camas de la habitación. */
export function textoCamas(camas = []) {
  return camas
    .map(({ tipo, cantidad }) => `${cantidad} ${NOMBRE_CAMA[tipo][cantidad === 1 ? 0 : 1]}`)
    .join(' + ');
}

/** Agrupa las características por categoría, en el orden del catálogo. */
export function agruparCaracteristicas(caracteristicas = []) {
  return Object.entries(CATEGORIAS_CARACTERISTICA)
    .map(([categoria, titulo]) => ({
      categoria,
      titulo,
      items: caracteristicas.filter((c) => c.categoria === categoria),
    }))
    .filter((grupo) => grupo.items.length > 0);
}
