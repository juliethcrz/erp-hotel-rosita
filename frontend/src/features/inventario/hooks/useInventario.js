import { useCallback, useEffect, useState } from 'react';
import { inventarioApi } from '../api/inventarioApi.js';

export function useInventario({ esAdmin }) {
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [error, setError] = useState(null);

  const recargar = useCallback(() => {
    inventarioApi.productos({ todos: esAdmin }).then(setProductos).catch(setError);
    inventarioApi.compras().then(setCompras).catch(setError);
  }, [esAdmin]);

  useEffect(() => {
    inventarioApi.productos({ todos: esAdmin }).then(setProductos).catch(setError);
    inventarioApi.compras().then(setCompras).catch(setError);
  }, [esAdmin]);

  return { productos, compras, error, recargar };
}
