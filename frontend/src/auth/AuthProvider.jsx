import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, onSesionExpirada, renovarSesion, setAccessToken } from '../api/client.js';
import { AuthContext } from './AuthContext.js';

const MINUTOS_INACTIVIDAD = 15;
const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const limpiarSesion = useCallback(() => {
    setAccessToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    let vigente = true;
    onSesionExpirada(limpiarSesion);

    renovarSesion().then((sesion) => {
      if (!vigente) return;
      setUsuario(sesion?.usuario ?? null);
      setCargando(false);
    });

    return () => {
      vigente = false;
    };
  }, [limpiarSesion]);

  const login = useCallback(async (email, password) => {
    const sesion = await api.post('/auth/login', { email, password });
    setAccessToken(sesion.accessToken);
    setUsuario(sesion.usuario);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    limpiarSesion();
  }, [limpiarSesion]);

  useEffect(() => {
    if (!usuario) return undefined;

    let temporizador;
    const reiniciar = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(logout, MINUTOS_INACTIVIDAD * 60 * 1000);
    };

    reiniciar();
    EVENTOS_ACTIVIDAD.forEach((evento) => window.addEventListener(evento, reiniciar));

    return () => {
      clearTimeout(temporizador);
      EVENTOS_ACTIVIDAD.forEach((evento) => window.removeEventListener(evento, reiniciar));
    };
  }, [usuario, logout]);

  const valor = useMemo(
    () => ({ usuario, cargando, login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext value={valor}>{children}</AuthContext>;
}
