import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { AlertaError, Boton } from '../../../../components/ui/index.js';
import { cx } from '../../../../lib/clases.js';
import { useFotosHabitacion } from '../../hooks/useFotosHabitacion.js';
import estilos from './EditorFotos.module.css';

const MAXIMO_FOTOS = 12;

/** Gestión de fotos para el administrador: subir, ordenar, elegir la principal y borrar. */
export function EditorFotos({ habitacion, onCambio }) {
  const { fotos = [] } = habitacion;
  const { procesando, error, subir, marcarPrincipal, eliminar, mover } = useFotosHabitacion(
    habitacion.id,
    onCambio,
  );
  const [porBorrar, setPorBorrar] = useState(null);
  const selector = useRef(null);

  const alElegirArchivos = (evento) => {
    const archivos = [...evento.target.files];
    evento.target.value = '';
    if (archivos.length > 0) subir(archivos);
  };

  return (
    <section className={estilos.editor} aria-label="Fotos de la habitación">
      <header className={estilos.encabezado}>
        <h3>
          Fotos{' '}
          <span>
            {fotos.length}/{MAXIMO_FOTOS}
          </span>
        </h3>
        <Boton
          tamano="sm"
          icono={ImagePlus}
          disabled={procesando || fotos.length >= MAXIMO_FOTOS}
          onClick={() => selector.current.click()}
        >
          {procesando ? 'Guardando…' : 'Agregar fotos'}
        </Boton>
        <input
          ref={selector}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={alElegirArchivos}
        />
      </header>

      <AlertaError error={error} />

      {fotos.length === 0 ? (
        <p className={estilos.vacio}>
          Todavía no hay fotos. Sube imágenes JPG, PNG o WebP de máximo 5 MB.
        </p>
      ) : (
        <ul className={estilos.rejilla}>
          {fotos.map((foto, indice) => (
            <li key={foto.id} className={cx(estilos.foto, foto.esPrincipal && estilos.principal)}>
              <img src={foto.url} alt={`Foto ${indice + 1} de la habitación`} loading="lazy" />
              {foto.esPrincipal && <span className={estilos.etiqueta}>Principal</span>}

              <div className={estilos.acciones}>
                <button
                  type="button"
                  aria-label="Mover a la izquierda"
                  disabled={procesando || indice === 0}
                  onClick={() => mover(fotos, indice, -1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Usar como foto principal"
                  disabled={procesando || foto.esPrincipal}
                  onClick={() => marcarPrincipal(foto.id)}
                >
                  <Star size={16} fill={foto.esPrincipal ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  aria-label="Mover a la derecha"
                  disabled={procesando || indice === fotos.length - 1}
                  onClick={() => mover(fotos, indice, 1)}
                >
                  <ChevronRight size={16} />
                </button>
                {porBorrar === foto.id ? (
                  <button
                    type="button"
                    className={estilos.confirmar}
                    disabled={procesando}
                    onClick={() => eliminar(foto.id).then(() => setPorBorrar(null))}
                  >
                    ¿Borrar?
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Borrar foto"
                    disabled={procesando}
                    onClick={() => setPorBorrar(foto.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
