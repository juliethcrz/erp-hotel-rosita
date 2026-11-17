import { useEffect, useState } from 'react';
import {
  AlertaError,
  Boton,
  Campo,
  FilaCampos,
  PieFormulario,
} from '../../../../components/ui/index.js';
import { inventarioApi } from '../../api/inventarioApi.js';
import estilos from './ProductoForm.module.css';

const NUMERICOS = ['categoriaId', 'precioVenta', 'costo', 'stockMinimo', 'stockInicial'];

export function ProductoForm({ producto, onGuardar, onCancelar }) {
  const esNuevo = !producto;
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({
    codigo: producto?.codigo ?? '',
    nombre: producto?.nombre ?? '',
    categoriaId: producto?.categoriaId ?? '',
    precioVenta: producto?.precioVenta ?? '',
    costo: producto?.costo ?? '',
    stockMinimo: producto?.stockMinimo ?? 0,
    stockInicial: 0,
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    inventarioApi.categorias().then(setCategorias).catch(setError);
  }, []);

  const actualizar = (evento) => {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    const datos = Object.fromEntries(
      Object.entries(formulario)
        .filter(([campo]) => esNuevo || campo !== 'stockInicial')
        .map(([campo, valor]) => [campo, NUMERICOS.includes(campo) ? Number(valor) : valor]),
    );
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      <FilaCampos>
        <Campo etiqueta="Código *">
          <input name="codigo" value={formulario.codigo} onChange={actualizar} required />
        </Campo>
        <Campo etiqueta="Categoría *">
          <select name="categoriaId" value={formulario.categoriaId} onChange={actualizar} required>
            <option value="">Selecciona…</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </FilaCampos>

      <Campo etiqueta="Nombre *">
        <input name="nombre" value={formulario.nombre} onChange={actualizar} required />
      </Campo>

      <FilaCampos>
        <Campo etiqueta="Precio de venta *">
          <input
            type="number"
            min={1}
            name="precioVenta"
            value={formulario.precioVenta}
            onChange={actualizar}
            required
          />
        </Campo>
        <Campo etiqueta="Costo *">
          <input
            type="number"
            min={0}
            name="costo"
            value={formulario.costo}
            onChange={actualizar}
            required
          />
        </Campo>
      </FilaCampos>

      <FilaCampos>
        <Campo etiqueta="Stock mínimo *" ayuda="Al llegar a este número se avisa al administrador.">
          <input
            type="number"
            min={0}
            name="stockMinimo"
            value={formulario.stockMinimo}
            onChange={actualizar}
            required
          />
        </Campo>
        {esNuevo && (
          <Campo etiqueta="Stock inicial">
            <input
              type="number"
              min={0}
              name="stockInicial"
              value={formulario.stockInicial}
              onChange={actualizar}
            />
          </Campo>
        )}
      </FilaCampos>

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Boton>
      </PieFormulario>
    </form>
  );
}
