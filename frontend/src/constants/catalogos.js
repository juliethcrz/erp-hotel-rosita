export const ROLES = {
  ADMIN: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  HOUSEKEEPING: 'Housekeeping',
};

export const TIPOS_DOCUMENTO = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PASAPORTE: 'Pasaporte',
};

export const ESTADOS_HABITACION = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  OCUPADA: 'Ocupada',
  EN_LIMPIEZA: 'En limpieza',
  EN_MANTENIMIENTO: 'En mantenimiento',
};

export const ESTADOS_RESERVA = {
  PENDIENTE: 'Pendiente de anticipo',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  NO_SHOW: 'No-show',
};

export const TIPOS_COBRO = {
  ANTICIPO: 'Anticipo',
  SALDO_CHECKIN: 'Saldo en el check-in',
  CONSUMOS_CHECKOUT: 'Consumos en el check-out',
  VENTA_DIRECTA: 'Venta en tienda',
};

export const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  BANCOLOMBIA: 'Bancolombia',
  TRANSFERENCIA: 'Transferencia',
};
