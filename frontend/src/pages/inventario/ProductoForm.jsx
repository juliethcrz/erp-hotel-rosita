import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { MensajeError } from '../../components/MensajeError.jsx';

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
    api.get('/inventario/categorias').then(setCategorias).catch(setError);
  }, []);

  const actualizar = (evento) => {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    const { stockInicial, ...datos } = formulario;
    const numeros = {
      ...datos,
      categoriaId: Number(datos.categoriaId),
      precioVenta: Number(datos.precioVenta),
      costo: Number(datos.costo),
      stockMinimo: Number(datos.stockMinimo),
    };
    try {
      await onGuardar(esNuevo ? { ...numeros, stockInicial: Number(stockInicial) } : numeros);
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />

      <div className="fila-campos">
        <label className="campo">
          <span>Código *</span>
          <input name="codigo" value={formulario.codigo} onChange={actualizar} required />
        </label>
        <label className="campo">
          <span>Categoría *</span>
          <select name="categoriaId" value={formulario.categoriaId} onChange={actualizar} required>
            <option value="">Seleccione…</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="campo">
        <span>Nombre *</span>
        <input name="nombre" value={formulario.nombre} onChange={actualizar} required />
      </label>

      <div className="fila-campos">
        <label className="campo">
          <span>Precio de venta *</span>
          <input
            type="number"
            min={1}
            name="precioVenta"
            value={formulario.precioVenta}
            onChange={actualizar}
            required
          />
        </label>
        <label className="campo">
          <span>Costo *</span>
          <input
            type="number"
            min={0}
            name="costo"
            value={formulario.costo}
            onChange={actualizar}
            required
          />
        </label>
      </div>

      <div className="fila-campos">
        <label className="campo">
          <span>Stock mínimo *</span>
          <input
            type="number"
            min={0}
            name="stockMinimo"
            value={formulario.stockMinimo}
            onChange={actualizar}
            required
          />
        </label>
        {esNuevo && (
          <label className="campo">
            <span>Stock inicial</span>
            <input
              type="number"
              min={0}
              name="stockInicial"
              value={formulario.stockInicial}
              onChange={actualizar}
            />
          </label>
        )}
      </div>

      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
