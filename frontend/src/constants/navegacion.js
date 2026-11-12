import { BedDouble, LayoutDashboard, UserCog, Users } from 'lucide-react';

export const MENU = [
  { ruta: '/', etiqueta: 'Inicio', icono: LayoutDashboard },
  { ruta: '/habitaciones', etiqueta: 'Habitaciones', icono: BedDouble },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: UserCog, roles: ['ADMIN'] },
];
