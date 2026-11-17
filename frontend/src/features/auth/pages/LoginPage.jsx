import { BedDouble, Hotel, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { AlertaError, Boton, Campo } from '../../../components/ui/index.js';
import { useAuth } from '../AuthContext.js';
import estilos from './LoginPage.module.css';

const VENTAJAS = [
  { icono: BedDouble, texto: 'Rack de habitaciones en tiempo real' },
  { icono: Sparkles, texto: 'Limpieza automática tras cada check-out' },
  { icono: ShieldCheck, texto: 'Acceso seguro según el rol de cada persona' },
];

export function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const actualizar = (evento) => {
    setCredenciales({ ...credenciales, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(credenciales.email, credenciales.password);
      navigate(location.state?.desde ?? '/', { replace: true });
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  };

  return (
    <div className={estilos.pantalla}>
      <aside className={estilos.marca}>
        <div className={estilos.logo}>
          <Hotel size={26} />
          <span>Hotel Rosita</span>
        </div>
        <div className={estilos.mensaje}>
          <h1>La gestión de tu hotel, en un solo lugar.</h1>
          <ul>
            {VENTAJAS.map(({ icono: Icono, texto }) => (
              <li key={texto}>
                <Icono size={18} aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <small>Chiscas, Boyacá</small>
      </aside>

      <main className={estilos.panel}>
        <form className={estilos.formulario} onSubmit={enviar}>
          <div>
            <h2>Iniciar sesión</h2>
            <p>Ingresa con tu correo y contraseña.</p>
          </div>

          <AlertaError error={error} />

          <Campo etiqueta="Correo electrónico">
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={credenciales.email}
              onChange={actualizar}
              required
            />
          </Campo>

          <Campo etiqueta="Contraseña">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={credenciales.password}
              onChange={actualizar}
              required
            />
          </Campo>

          <Boton type="submit" variante="primario" ancho disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </form>
      </main>
    </div>
  );
}
