import { FaSearch, FaHome } from "react-icons/fa";


const NavBar = () => {
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="container-fluid px-4">
 
        <div className="d-flex align-items-center">
          <a className="navbar-brand me-5" href="#" style={{ color: '#FFFFFF', fontWeight: '600' }}>
            NCS Lite WEB
          </a>
        </div>

        {/* Menú central - Eliminado ya que no hay elementos en tu versión */}

        {/* Elementos derecha */}
        <div className="d-flex align-items-center ms-auto"> {/* ms-auto para alinear a la derecha */}
          {/* Barra de búsqueda */}
          <div className="input-group me-3" style={{ width: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              style={{ 
                backgroundColor: '#2D2D2D', 
                border: 'none', 
                color: '#FFFFFF',
                fontSize: '0.875rem'
              }}
            />
            <button 
              className="btn" 
              type="button"
              style={{ 
                backgroundColor: '#2D2D2D', 
                border: 'none',
                color: '#A0A0A0'
              }}
            >
              <FaSearch />
            </button>
          </div>

          {/* Home - Movido aquí desde notificaciones */}
          <div className="mx-8">
            <a className="nav-link active d-flex flex-column align-items-center" href="#" style={{ color: '#FFFFFF' }}>
              <FaHome className="mb-1" />
              <span style={{ fontSize: '0.8rem' }}></span>
            </a>
          </div>

          {/* Notificaciones */}
          <div className="position-relative me-3">
       
          </div>

          {/* Usuario */}
          <div className="dropdown">
            <button
              className="btn dropdown-toggle d-flex align-items-center"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ 
                color: '#FFFFFF',
                border: 'none',
                backgroundColor: 'transparent'
              }}
            >
          
              <span>Admin</span>
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton"
              style={{ 
                backgroundColor: '#2D2D2D',
                border: '1px solid #3D3D3D'
              }}
            >
            </ul>
          </div>
        </div>
      </div>
    </nav>
  
    </>
  );
};

export default NavBar;