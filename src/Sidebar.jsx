import { 
    FaDatabase, 
    FaVideo, 
    FaUserCog, 
    FaPlug, 
    FaTools, 
    FaUserTie 
  } from "react-icons/fa";
  import ExecutiveDashboard from "./ExecutiveDashboard";
  import './ExecutiveDashboard.css';
  const Sidebar = () => {
    return (
      <div className="d-flex">
        {/* Sidebar - Manteniendo el diseño exacto de la imagen */}
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white" 
             style={{
               width: '160px',
               height: '100vh',
               backgroundColor: '#1A1A1A',
               borderRight: '1px solidrgb(238, 228, 228)'
             }}>
        
          
          <hr style={{ borderColor: '#2D2D2D', margin: '0.5rem 0' }} />
          
          
          <ul className="nav nav-pills flex-column mb-auto">
            {/* Sección Tasks */}
            <li className="mb-3">
              <span className="text-uppercase text-white" style={{
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                paddingLeft: '10px'
              }}>Tasks</span>
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaDatabase className="me-2" style={{ fontSize: '0.9rem' }} />
                    Ingest
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaVideo className="me-2" style={{ fontSize: '0.9rem' }} />
                    Recording
                  </a>
                </li>
              </ul>
            </li>

            {/* Sección Tasks */}
            <li className="mb-3">
              <span className="text-uppercase text-white" style={{
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                paddingLeft: '10px'
              }}>Graphic</span>
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaDatabase className="me-2" style={{ fontSize: '0.9rem' }} />
                    Program
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaVideo className="me-2" style={{ fontSize: '0.9rem' }} />
                   Publicidad
                  </a>
                </li>
              </ul>
            </li>
            
            {/* Sección Administrator */}
            <li className="mb-3">
              <span className="text-uppercase text-white" style={{
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                paddingLeft: '10px'
              }}>Administrator</span>
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaPlug className="me-2" style={{ fontSize: '0.9rem' }} />
                    Inputs
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaTools className="me-2" style={{ fontSize: '0.9rem' }} />
                    Equipment
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white d-flex align-items-center" 
                     style={{
                       fontSize: '0.85rem',
                       padding: '0.35rem 0.5rem',
                       borderRadius: '4px'
                     }}>
                    <FaUserTie className="me-2" style={{ fontSize: '0.9rem' }} />
                    Operator
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          
          {/* Footer del sidebar */}
          <div className="mt-auto pt-3 border-top" style={{ borderColor: '#2D2D2D' }}>
            <div className="d-flex align-items-center">
              <FaUserCog className="text-muted me-2" style={{ fontSize: '1.1rem' }} />
              <span className="text-white" style={{ fontSize: '0.85rem' }}>Admin User</span>
            </div>
          </div>
        </div>
  
        {/* Contenedor para el ExecutiveDashboard */}
        <div className="flex-grow-1" style={{ backgroundColor: '#1E1E1E', height: '100vh', overflowY: 'auto' }}>
          <ExecutiveDashboard />
        </div>
      </div>
    );
  };
  
  export default Sidebar;