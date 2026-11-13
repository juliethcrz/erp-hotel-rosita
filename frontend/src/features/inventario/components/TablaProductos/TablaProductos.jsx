import { History, Pencil, SlidersHorizontal } from 'lucide-react';
import { Boton, Insignia, Tabla } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import estilos from './TablaProductos.module.css';

export function TablaProductos({ productos, esAdmin, onAccion }) {
  const columnas = [
    { clave: 'codigo', titulo: 'Código' },
    {
      clave: 'nombre',
      titulo: 'Producto',
      render: (p) => (
        <span className={p.activo ? estilos.nombre : estilos.inactivo}>
          {p.nombre}
          {!p.activo && ' (inactivo)'}
        </span>
      ),
    },
    {
      clave: 'categoria',
      titulo: 'Categoría',
      render: (p) => <Insignia tono="marca">{p.categoria.nombre}</Insignia>,
    },
    {
      clave: 'precio',
      titulo: 'Precio',
      numero: true,
      render: (p) => formatearPesos(p.precioVenta),
    },
    { clave: 'costo', titulo: 'Costo', numero: true, render: (p) => formatearPesos(p.costo) },
    {
      clave: 'stock',
      titulo: 'Stock',
      numero: true,
      render: (p) => (
        <span className={estilos.stock}>
          <Insignia tono={p.stockBajo ? 'aviso' : 'exito'} punto>
            {p.stockActual}
          </Insignia>
          <small>mín. {p.stockMinimo}</small>
        </span>
      ),
    },
    {
      clave: 'acciones',
      titulo: '',
      acciones: true,
      render: (p) => (
        <>
          <Boton
            tamano="sm"
            icono={History}
            aria-label="Movimientos"
            onClick={() => onAccion('movimientos', p)}
          />
          {esAdmin && (
            <>
              <Boton
                tamano="sm"
                icono={SlidersHorizontal}
                aria-label="Ajustar stock"
                onClick={() => onAccion('ajuste', p)}
              />
              <Boton
                tamano="sm"
                icono={Pencil}
                aria-label="Editar"
                onClick={() => onAccion('producto', p)}
              />
            </>
          )}
        </>
      ),
    },
  ];

  return <Tabla columnas={columnas} filas={productos} vacio="No hay productos." />;
}
