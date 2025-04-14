import { useRef, useState } from "react";
import "./NavBar.scss";
import imgEspnLogo from "../images/logo-ch-clear.png";
import imgHome from "../images/ico_home.png";
import imgMenu from "../images/ico_menu.png";
import { Link } from "react-router-dom";
import imgSearch from "../images/search-icon.png";
import logoDisney from "../images/logo-disney.png";
import { useHistory } from "react-router-dom";
import useMessageBox from "../hooks/useMessageBox";
import MenuOptions from "./MenuOptions";
import { useGlobalState } from "../contexts/GlobalConstext";
import { FaPowerOff } from "react-icons/fa";
import { createPortal } from "react-dom";
import ProgramChange from "../programacion/pop-up-forms/v2/ProgramChange";
import BatchVersionAssignment from "../programacion/pop-up-forms/v2/BatchVersionAssignment";
import ProgrammingCertification from "../programacion/pop-up-forms/v2/ProgrammingCertification";
import GeneratePlaylist from "../programacion/pop-up-forms/v2/GeneratePlaylist";
import Versions from "../programacion/pop-up-forms/v2/Versions";

function NavBar() {
  const [versionCode] = useState("1.0.0"); // Valor estático
  const [showMessage, messageTypes] = useMessageBox();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [menuPopUp, setMenuPopUp] = useState(null);
  const prograCodiRef = useRef(null);
  const history = useHistory();
  const [{ permissions }] = useGlobalState();
  const hasOpenSession = localStorage.getItem("token");

  const handleGrillaAuxiliarSalir = () => setMenuPopUp(null);

  const mostrarVersionadoMasivo = () => {
    setMenuPopUp(
      <BatchVersionAssignment
        show={null}
        isOpen
        onClose={handleGrillaAuxiliarSalir}
        hasPermission={permissions.includes("VEM")}
      />
    );
  };

  const mostrarCrtificacion = () => {
    setMenuPopUp(
      <ProgrammingCertification
        isOpen
        onClose={handleGrillaAuxiliarSalir}
        hasPermission={permissions.includes("CPR")}
      />
    );
  };

  const generarPlaylist = () => {
    setMenuPopUp(
      <GeneratePlaylist
        isOpen
        show={null}
        onClose={handleGrillaAuxiliarSalir}
        hasPermission={permissions.includes("GPL")}
      />
    );
  };

  const showProgramChange = () => {
    setMenuPopUp(
      <ProgramChange
        isOpen
        onClose={handleGrillaAuxiliarSalir}
      />
    );
  };

  const mostrarVersions = () => {
    setMenuPopUp(
      <Versions
        isOpen
        onClose={handleGrillaAuxiliarSalir}
        hasPermission={true}
      />
    );
  };

  const menuOptions = [
    {
      label: "Batch Version Assignment",
      handler: mostrarVersionadoMasivo,
      disabled: false,
    },
    {
      label: "Programming Certification",
      handler: mostrarCrtificacion,
      disabled: false,
    },
    {
      label: "Versions",
      handler: mostrarVersions,
      disabled: false,
    },
    { label: "Generate Playlist", handler: generarPlaylist, disabled: false },
    { label: "Programming Change", handler: showProgramChange, disabled: !permissions.includes("PRC") },
    {
      label: "Media Tracker",
      handler: redirectMediaTracker,
      disabled: !permissions.includes("MET"),
    },
  ];

  function handleSearchClick(e) {
    e.persist();
    history.push({
      pathname: "/ProgramasVigentes",
      state: {
        prograCodi: prograCodiRef.current.value,
      },
    });
  }

  function redirectMediaTracker(e) {
    e.persist();
    history.push({
      pathname: "/MediaTracker/Tasks"
    });
  }

  const handleKeyPress = (e) => {
    e.persist();
    if (e.which === 13) {
      handleSearchClick(e);
    }
  };

  const logoutFunc = async () => {
    return showMessage({
      title: "Cerrar sesión",
      message: "¿Está seguro que quiere cerrar sesión?",
      okCBF: () => {
        localStorage.clear();
        window.location.href = "https://login.myid.disney.com/logout";
      },
      cancelCBF: () => {},
      type: messageTypes.ALERT,
    });
  };

  return (
    <>
      {menuPopUp}
      <div className="nav-bar__wrapper">
        <div className="nav-bar__body">
          <div className="nav-bar__item" />
          <div className="nav-bar__item withLogo">
            <img alt="logo disney" src={logoDisney} height="60px" />
          </div>

          <div className="nav-bar__item">
            <input
              ref={prograCodiRef}
              id="progra_codi"
              type="text"
              alt="Código Programa"
              name="progra_codi"
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="nav-bar__item">
            <img
              className="nav-bar__item-img2"
              alt="Buscar"
              src={imgSearch}
              onClick={handleSearchClick}
            />
          </div>

          <div className="nav-bar__item">
            <div></div>
          </div>

          <div className="nav-bar__item">
            <Link to="/">
              <div className="nav-bar__place-holder">
                <img className="nav-bar__item-img" alt="" src={imgHome} />
              </div>
            </Link>
          </div>

          <div
            className="nav-bar__item"
            onClick={() => setMenuDisplay(!menuDisplay)}
          >
            <div className="nav-bar__place-holder">
              <img className="nav-bar__item-img" alt="" src={imgMenu} />
            </div>
            {menuDisplay && hasOpenSession && (
              <>
                {createPortal(
                  <MenuOptions
                    options={menuOptions}
                    onClose={() => setMenuDisplay(false)}
                  />,
                  document.body
                )}
              </>
            )}
          </div>

          <div
            className="nav-bar__item"
            onClick={hasOpenSession ? logoutFunc : () => {}}
          >
            <div className="nav-bar__place-holder">
              {hasOpenSession && (
                <FaPowerOff
                  style={{
                    color: "white",
                    height: "24px",
                    width: "24px",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>
          </div>

          <div className="nav-bar__item">
            <div className="nav-bar__item-logo">
              <img src={imgEspnLogo} alt="" />
              <p className="nav-bar__version-code">{versionCode}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;