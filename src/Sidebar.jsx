import { 
    FaDatabase, 
    FaVideo, 
    FaUserCog, 
    FaPlug, 
    FaTools, 
    FaUserTie, 
    FaChevronLeft, 
    FaChevronRight 
} from "react-icons/fa";
import { useState } from "react";
import ExecutiveDashboard from "./ExecutiveDashboard";
import './ExecutiveDashboard.css';
import IngestDashboard from "./IngestDashboard";


const Sidebar = () => {
  const [activeComponent, setActiveComponent] = useState("ExecutiveDashboard");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Estado para mostrar/ocultar el Sidebar

  return (
    <div className="d-flex">
      {/* Botón para mostrar/ocultar el Sidebar */}
      <button 
        onClick={() => setIsSidebarVisible(!isSidebarVisible)} 
        className="btn btn-dark position-absolute" 
        style={{
          top: '5%', // Cambiado para posicionarlo más abajo (en el centro vertical)
          transform: 'translateY(2%)', // Centrado verticalmente
          left: isSidebarVisible ? '160px' : '20px',
          zIndex: 10000,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isSidebarVisible ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white" 
             style={{
               width: '160px',
               height: '100vh',
               backgroundColor: '#1A1A1A',
               borderRight: '1px solid rgb(238, 228, 228)'
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
                  <a 
                    href="#" 
                    className="nav-link text-white d-flex align-items-center" 
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px'
                    }}
                    onClick={() => setActiveComponent("IngestDashboard")}
                  >
                    <FaDatabase className="me-2" style={{ fontSize: '0.9rem' }} />
                    Ingest
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    href="#" 
                    className="nav-link text-white d-flex align-items-center" 
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    <FaVideo className="me-2" style={{ fontSize: '0.9rem' }} />
                    Recording
                  </a>
                </li>
              </ul>
            </li>

            {/* Sección Graphic */}
            <li className="mb-3">
              <span className="text-uppercase text-white" style={{
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                paddingLeft: '10px'
              }}>Graphic</span>
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center ${activeComponent === "ExecutiveDashboard" ? "active" : "text-white"}`} 
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: activeComponent === "ExecutiveDashboard" ? '#343a40' : 'transparent',
                      boxShadow: activeComponent === "ExecutiveDashboard" ? '0px 4px 6px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    onClick={() => setActiveComponent("ExecutiveDashboard")}
                  >
                    <FaDatabase className="me-2" style={{ fontSize: '0.9rem' }} />
                    Program
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    href="#" 
                    className={`nav-link d-flex align-items-center ${activeComponent === "IngestDashboard" ? "active" : "text-white"}`} 
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: activeComponent === "IngestDashboard" ? '#343a40' : 'transparent',
                      boxShadow: activeComponent === "IngestDashboard" ? '0px 4px 6px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    onClick={() => setActiveComponent("IngestDashboard")}
                  >
                    <FaVideo className="me-2" style={{ fontSize: '0.9rem' }} />
                    Ingest
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
                <a 
                  href="#" 
                  className="nav-link text-white d-flex align-items-center" 
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <FaPlug className="me-2" style={{ fontSize: '0.9rem' }} />
                  Inputs
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="#" 
                  className="nav-link text-white d-flex align-items-center" 
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <FaTools className="me-2" style={{ fontSize: '0.9rem' }} />
                  Equipment
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="#" 
                  className="nav-link text-white d-flex align-items-center" 
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
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
      )}

      {/* Contenedor para los componentes dinámicos */}
      <div className="flex-grow-1" style={{ backgroundColor: '#1E1E1E', height: '100vh', overflowY: 'auto' }}>
        {activeComponent === "ExecutiveDashboard" && <ExecutiveDashboard />}
        {activeComponent === "IngestDashboard" && <IngestDashboard />}
      
      </div>
    </div>
  );
};

export default Sidebar;