// Ficha de las habitaciones: nombre, composición de camas, descripción y comodidades.
// Fuente: Ficha_Maestra_Habitaciones_Hotel_20.xlsx (versión 2).

export const CARACTERISTICAS = [
  { nombre: 'Vista a la calle', categoria: 'VISTA' },
  { nombre: 'Vista al patio interior', categoria: 'VISTA' },
  { nombre: 'Vista al jardín', categoria: 'VISTA' },
  { nombre: 'Vista a la montaña', categoria: 'VISTA' },
  { nombre: 'Baño privado', categoria: 'BANO' },
  { nombre: 'Ducha con agua caliente', categoria: 'BANO' },
  { nombre: 'Secador de cabello', categoria: 'BANO' },
  { nombre: 'Toallas y kit de aseo', categoria: 'BANO' },
  { nombre: 'Wi-Fi', categoria: 'TECNOLOGIA' },
  { nombre: 'TV por cable', categoria: 'TECNOLOGIA' },
  { nombre: 'Smart TV', categoria: 'TECNOLOGIA' },
  { nombre: 'Escritorio', categoria: 'MOBILIARIO' },
  { nombre: 'Clóset', categoria: 'MOBILIARIO' },
  { nombre: 'Mesa de noche', categoria: 'MOBILIARIO' },
  { nombre: 'Sillón de lectura', categoria: 'MOBILIARIO' },
  { nombre: 'Sofá', categoria: 'MOBILIARIO' },
  { nombre: 'Balcón', categoria: 'COMODIDAD' },
  { nombre: 'Cortinas blackout', categoria: 'COMODIDAD' },
  { nombre: 'Cobijas adicionales', categoria: 'COMODIDAD' },
  { nombre: 'Hervidor con café y aromáticas', categoria: 'COMODIDAD' },
  { nombre: 'Nevera pequeña', categoria: 'COMODIDAD' },
  { nombre: 'Caja fuerte', categoria: 'COMODIDAD' },
  { nombre: 'Cuna bajo solicitud', categoria: 'COMODIDAD' },
];

// Todas las habitaciones tienen estas comodidades.
export const CARACTERISTICAS_COMUNES = [
  'Baño privado',
  'Wi-Fi',
  'TV por cable',
  'Ducha con agua caliente',
  'Toallas y kit de aseo',
];

export const HABITACIONES = [
  {
    numero: '101',
    tipo: 'Individual',
    nombre: 'Sílfide',
    camas: [{ tipo: 'SENCILLA', cantidad: 1 }],
    caracteristicas: ['Vista a la calle', 'Clóset', 'Escritorio', 'Mesa de noche'],
    descripcion:
      'Habitación del primer piso con una cama sencilla, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche y televisor por cable. La ventana da a la calle principal.',
  },
  {
    numero: '102',
    tipo: 'Individual',
    nombre: 'Ninfa',
    camas: [{ tipo: 'SENCILLA', cantidad: 1 }],
    caracteristicas: ['Vista al patio interior', 'Clóset', 'Mesa de noche', 'Cobijas adicionales'],
    descripcion:
      'Ubicada en el primer piso, tiene una cama sencilla, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. La ventana da al patio interior. También cuenta con cobijas adicionales.',
  },
  {
    numero: '103',
    tipo: 'Individual',
    nombre: 'Cometa',
    camas: [{ tipo: 'SEMIDOBLE', cantidad: 1 }],
    caracteristicas: ['Vista al jardín', 'Clóset', 'Mesa de noche'],
    descripcion:
      'Dispone de una cama semidoble, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable; está en el primer piso. La ventana da al jardín.',
  },
  {
    numero: '104',
    tipo: 'Individual',
    nombre: 'Calíope',
    camas: [{ tipo: 'SEMIDOBLE', cantidad: 1 }],
    caracteristicas: [
      'Vista a la calle',
      'Clóset',
      'Escritorio',
      'Cortinas blackout',
      'Mesa de noche',
    ],
    descripcion:
      'Habitación del primer piso con una cama semidoble, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche y televisor por cable. La ventana da a la calle principal. También cuenta con cortinas blackout.',
  },
  {
    numero: '105',
    tipo: 'Individual',
    nombre: 'Estrella',
    camas: [{ tipo: 'SEMIDOBLE', cantidad: 1 }],
    caracteristicas: ['Vista al patio interior', 'Clóset', 'Mesa de noche'],
    descripcion:
      'Ubicada en el primer piso, tiene una cama semidoble, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. La ventana da al patio interior.',
  },
  {
    numero: '106',
    tipo: 'Individual',
    nombre: 'Solángel',
    camas: [{ tipo: 'DOBLE', cantidad: 1 }],
    caracteristicas: [
      'Vista a la montaña',
      'Clóset',
      'Mesa de noche',
      'Sillón de lectura',
      'Hervidor con café y aromáticas',
      'Cobijas adicionales',
    ],
    descripcion:
      'Dispone de una cama doble, baño privado con ducha de agua caliente, clóset, mesa de noche, sillón de lectura y televisor por cable; está en el primer piso. La ventana da hacia la montaña. También cuenta con hervidor de agua con café y cobijas adicionales.',
  },
  {
    numero: '107',
    tipo: 'Doble',
    nombre: 'Amazilia',
    camas: [{ tipo: 'DOBLE', cantidad: 1 }],
    caracteristicas: ['Vista a la calle', 'Clóset', 'Escritorio', 'Mesa de noche'],
    descripcion:
      'Habitación del primer piso con una cama doble, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche y televisor por cable. La ventana da a la calle principal.',
  },
  {
    numero: '108',
    tipo: 'Doble',
    nombre: 'Rubí',
    camas: [{ tipo: 'SENCILLA', cantidad: 2 }],
    caracteristicas: ['Vista al jardín', 'Clóset', 'Mesa de noche'],
    descripcion:
      'Ubicada en el primer piso, tiene dos camas sencillas, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. La ventana da al jardín.',
  },
  {
    numero: '109',
    tipo: 'Doble',
    nombre: 'Topacio',
    camas: [{ tipo: 'DOBLE', cantidad: 1 }],
    caracteristicas: [
      'Vista al patio interior',
      'Clóset',
      'Mesa de noche',
      'Escritorio',
      'Secador de cabello',
    ],
    descripcion:
      'Dispone de una cama doble, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche y televisor por cable; está en el primer piso. La ventana da al patio interior. También cuenta con secador de cabello.',
  },
  {
    numero: '110',
    tipo: 'Doble',
    nombre: 'Zafiro',
    camas: [{ tipo: 'QUEEN', cantidad: 1 }],
    caracteristicas: [
      'Vista a la montaña',
      'Clóset',
      'Mesa de noche',
      'Smart TV',
      'Hervidor con café y aromáticas',
      'Cobijas adicionales',
    ],
    descripcion:
      'Habitación del primer piso con una cama queen, baño privado con ducha de agua caliente, clóset, mesa de noche y Smart TV. La ventana da hacia la montaña. También cuenta con hervidor de agua con café y cobijas adicionales.',
  },
  {
    numero: '201',
    tipo: 'Doble',
    nombre: 'Coqueta',
    camas: [{ tipo: 'QUEEN', cantidad: 1 }],
    caracteristicas: [
      'Vista a la calle',
      'Clóset',
      'Mesa de noche',
      'Balcón',
      'Sillón de lectura',
      'Escritorio',
    ],
    descripcion:
      'Ubicada en el segundo piso, tiene una cama queen, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche, sillón de lectura y televisor por cable. Tiene balcón con vista a la calle principal.',
  },
  {
    numero: '202',
    tipo: 'Doble',
    nombre: 'Inca',
    camas: [{ tipo: 'SENCILLA', cantidad: 2 }],
    caracteristicas: ['Vista a la montaña', 'Clóset', 'Mesa de noche', 'Caja fuerte'],
    descripcion:
      'Dispone de dos camas sencillas, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable; está en el segundo piso. La ventana da hacia la montaña. También cuenta con caja fuerte.',
  },
  {
    numero: '203',
    tipo: 'Doble',
    nombre: 'Esmeralda',
    camas: [{ tipo: 'QUEEN', cantidad: 1 }],
    caracteristicas: [
      'Vista a la montaña',
      'Clóset',
      'Mesa de noche',
      'Balcón',
      'Smart TV',
      'Nevera pequeña',
      'Cortinas blackout',
    ],
    descripcion:
      'Habitación del segundo piso con una cama queen, baño privado con ducha de agua caliente, clóset, mesa de noche y Smart TV. Tiene balcón con vista a la montaña. También cuenta con nevera pequeña y cortinas blackout.',
  },
  {
    numero: '204',
    tipo: 'Doble',
    nombre: 'Emperatriz',
    camas: [{ tipo: 'DOBLE', cantidad: 1 }],
    caracteristicas: [
      'Vista a la calle',
      'Clóset',
      'Mesa de noche',
      'Sillón de lectura',
      'Escritorio',
      'Secador de cabello',
    ],
    descripcion:
      'Ubicada en el segundo piso, tiene una cama doble, baño privado con ducha de agua caliente, escritorio, clóset, mesa de noche, sillón de lectura y televisor por cable. La ventana da a la calle principal. También cuenta con secador de cabello.',
  },
  {
    numero: '205',
    tipo: 'Triple',
    nombre: 'Jacobino',
    camas: [{ tipo: 'SENCILLA', cantidad: 3 }],
    caracteristicas: ['Vista al patio interior', 'Clóset', 'Mesa de noche'],
    descripcion:
      'Dispone de tres camas sencillas, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable; está en el segundo piso. La ventana da al patio interior.',
  },
  {
    numero: '206',
    tipo: 'Triple',
    nombre: 'Copete',
    camas: [
      { tipo: 'DOBLE', cantidad: 1 },
      { tipo: 'SENCILLA', cantidad: 1 },
    ],
    caracteristicas: ['Vista a la montaña', 'Clóset', 'Mesa de noche', 'Cobijas adicionales'],
    descripcion:
      'Habitación del segundo piso con una cama doble y una cama sencilla, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. La ventana da hacia la montaña. También cuenta con cobijas adicionales.',
  },
  {
    numero: '207',
    tipo: 'Triple',
    nombre: 'Chivito',
    camas: [
      { tipo: 'QUEEN', cantidad: 1 },
      { tipo: 'SENCILLA', cantidad: 1 },
    ],
    caracteristicas: [
      'Vista a la montaña',
      'Clóset',
      'Mesa de noche',
      'Balcón',
      'Nevera pequeña',
      'Hervidor con café y aromáticas',
    ],
    descripcion:
      'Ubicada en el segundo piso, tiene una cama queen y una cama sencilla, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. Tiene balcón con vista a la montaña. También cuenta con nevera pequeña y hervidor de agua con café.',
  },
  {
    numero: '208',
    tipo: 'Cuádruple',
    nombre: 'Arlequín',
    camas: [{ tipo: 'DOBLE', cantidad: 2 }],
    caracteristicas: ['Vista a la calle', 'Clóset', 'Mesa de noche'],
    descripcion:
      'Dispone de dos camas dobles, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable; está en el segundo piso. La ventana da a la calle principal.',
  },
  {
    numero: '209',
    tipo: 'Cuádruple',
    nombre: 'Quinde',
    camas: [
      { tipo: 'DOBLE', cantidad: 1 },
      { tipo: 'CAMAROTE', cantidad: 1 },
    ],
    caracteristicas: [
      'Vista a la montaña',
      'Mesa de noche',
      'Nevera pequeña',
      'Cuna bajo solicitud',
      'Clóset',
    ],
    descripcion:
      'Habitación del segundo piso con una cama doble y un camarote, baño privado con ducha de agua caliente, clóset, mesa de noche y televisor por cable. La ventana da hacia la montaña. También cuenta con nevera pequeña. Se puede solicitar cuna para bebé.',
  },
  {
    numero: '210',
    tipo: 'Cuádruple',
    nombre: 'Tominejo',
    camas: [
      { tipo: 'QUEEN', cantidad: 1 },
      { tipo: 'SENCILLA', cantidad: 2 },
    ],
    caracteristicas: [
      'Vista a la montaña',
      'Clóset',
      'Mesa de noche',
      'Balcón',
      'Smart TV',
      'Caja fuerte',
      'Sofá',
    ],
    descripcion:
      'Ubicada en el segundo piso, tiene una cama queen y dos camas sencillas, baño privado con ducha de agua caliente, clóset, mesa de noche, sofá y Smart TV. Tiene balcón con vista a la montaña. También cuenta con caja fuerte.',
  },
];
