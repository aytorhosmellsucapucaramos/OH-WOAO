import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Componente que resetea el scroll al inicio cuando cambia la ruta
 * Debe ser usado dentro de un Router
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantáneo al top cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
