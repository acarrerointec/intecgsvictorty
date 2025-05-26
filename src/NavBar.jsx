import { FaSearch, FaHome, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const shouldLogout = window.confirm(
      '¿Estás seguro que deseas cerrar sesión?\n\n' +
      'Presiona "Aceptar" para cerrar sesión.\n' +
      'Presiona "Cancelar" para permanecer.'
    );

    if (shouldLogout) {
      setIsLoggingOut(true);
      
      // 1. Limpiar datos de autenticación
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('userSession');
      
      // 2. Opcional: Hacer llamada API para logout si es necesario
      // await api.logout();
      
      // 3. Redireccionar
      setTimeout(() => {
        navigate('/'); // Cambia la ruta según tu configuración
        setIsLoggingOut(false);
      }, 1000);
    }
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <a className="navbar-brand me-5" href="#" style={{ color: '#FFFFFF', fontWeight: '600' }}>
            NCS Lite WEB
          </a>
        </div>

        <div className="d-flex align-items-center ms-auto">
         

        

          <div className="dropdown">
           
              <li>
                <button
                  className="dropdown-item d-flex align-items-center btn-logout"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{ 
                    color: '#FFFFFF', 
                    backgroundColor: 'transparent',
                    cursor: isLoggingOut ? 'wait' : 'pointer'
                  }}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saliendo...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt className="me-2" />
                      Cerrar sesión
                    </>
                  )}
                </button>
              </li>
           
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 