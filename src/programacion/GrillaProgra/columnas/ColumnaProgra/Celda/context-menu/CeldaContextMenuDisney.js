import React, { useState, useEffect, useRef } from "react";
import "./CeldaContextMenu.scss";
import icoMateriales from "../../../../../../../images/icons/materiales.png";
import icoRutina from "../../../../../../../images/icons/rutina.png";
import icoPromo from "../../../../../../../images/icons/promo.png";
import icoEmiRepor from "../../../../../../../images/icons/emi-repor.png";
import icoEmiSpots from "../../../../../../../images/icons/emi-spots.png";
import icoPlaylist from "../../../../../../../images/icons/play-circle.svg";
import icoGuias from "../../../../../../../images/icons/guias.png";
import addI from "../../../../../../../images/icons/add-i.png";
import info from "../../../../../../../images/icons/info.svg";
import intercambiar from "../../../../../../../images/icons/intercambio2.png";
import icoArtistica from "../../../../../../../images/icons/artistica.png";
import ListadoMateriales from "../../../../../pop-up-forms/listadoMateriales/ListadoMateriales";
import ListadoPromociones from "../../../../../pop-up-forms/promociones/ListadoPromociones";
import SpotsEmitidos from "../../../../../pop-up-forms/spots-emitidos/SpotsEmitidos";
import ListadoRutina from "../../../../../pop-up-forms/listadoRutina/ListadoRutina";
import ReporteEmision from "../../../../../pop-up-forms/reporte-emision/ReporteEmision";
import GuiasParticulares from "../../../../../pop-up-forms/guias/GuiasParticulares";
import ListadoArtistica from "../../../../../pop-up-forms/artistica/ListadoArtistica";
import ReporteArtistica from "../../../../../pop-up-forms/reporte-artistica/ReporteArtistica";
import ReporteAnticipado from "../../../../../pop-up-forms/reporteAnticipado/ReporteAnticipado";
import MediaSegmentacion from "../../../../../pop-up-forms/mediaSegmentacion/MediaSegmentacion";
import FichaCopiado from "../../../../../pop-up-forms/ficha-copiado/FichaCopiado";
import Segmentos from "../../../../../pop-up-forms/segmentos/Segmentos";
import Formato from "../../../../../pop-up-forms/formato/Formato";
import {
  actionTypes,
  useTracked,
} from "../../../../../../contexts/CeldaMenuContext";
import {
  useGlobalState,
  actionTypes as actionTypesGC,
  messageTypes,
} from "../../../../../../contexts/GlobalConstext";
import axiosApi from "../../../../../../../axiosApi";
import moment from "moment";
import Rushbet from "../../../../../pop-up-forms/Rushbet";
import ProgramChange from "../../../../../pop-up-forms/v2/ProgramChange";
import { FormatoDiscrepancia } from "../../../../../pop-up-forms/formato/FormatoDiscrepancia";
import {
  ContextMenuWrapper,
  ContextMenuItem,
  ContextMenuItemDescrip,
  ContextMenuSubmenuContainer,
  ContextMenuSubmenuDescrip,
  ContextMenuSubmenuOption,
  ContextMenuBody,
  ContextMenuProgra

} from "./styled";
import { Rutina } from "../../../../../../mediatracker/pages/scheduling/ContextMenu/Rutina/index";

const CeldaContexDisney= ({ dataTable,show, x, y, offsetY ,isOpenLeftBar,onCloseMenuContext=()=>{} ,onSchedule = false}) => {
  const [state, dispatch] = useTracked();
  const [contentJSX, setContentJSX] = useState([]);
  const [items, setItems] = useState([]);
  const [showSubMenu, setShowSubMenu] = useState(null);
  const [{ permissions }, dispatchGC] = useGlobalState();
  const refWrapper = useRef();
  const momentTimeZone = require("moment-timezone");

  const generarPlaylistComponent = (title, subtitle, epi, progra_codi) => {
    return (
      <div>
        <p>
          <strong>{title}</strong>
        </p>
        <p>{subtitle}</p>
        <p>
          <strong>Episodio: </strong>
          {epi}
        </p>
        <p>
          <strong>Codigo de programa: </strong>
          {progra_codi}
        </p>
      </div>
    );
  };

  const menuWidth = 235;

  const handleGenerarPlaylist = async (epi, progra_codi) => {
    let url = `play-list-genera-epi`;
    const api = await axiosApi();
    const { data } = await api.post(url, { epi });

    const hasError = !data.message.success;
    if (hasError) {
      return dispatchGC({
        type: actionTypesGC.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }

    dispatchGC({
      type: actionTypesGC.globalMessage.SHOW_MESSAGE,
      payload: {
        title: "Generar PLaylist",
        message: generarPlaylistComponent(
          "",
          "Se genero correctamente la playlist.",
          epi,
          progra_codi
        ),
        okCBF: () => {},
        type: messageTypes.INFO,
      },
    });
  };

  const generarPlaylist = (epi, progra_codi) => {
    return dispatchGC({
      type: actionTypesGC.globalMessage.SHOW_MESSAGE,
      payload: {
        title: "Generar Playlist",
        message: generarPlaylistComponent(
          "Está seguro que quiere generar esta playlist?",
          "Entienda que los cambios efectuados NO pueden deshacerse una vez generados.",
          epi,
          progra_codi
        ),
        okCBF: () => handleGenerarPlaylist(epi, progra_codi),
        cancelCBF: () => {},
        type: messageTypes.ALERT,
      },
    });
  };

  const hasProgrammingInProgress = () => {
    const fechaInicio = moment(show.fechaIni);
    const fechaFin = moment(show.fechaFin);
    const fechaActual = momentTimeZone(new Date()).tz(
      "America/Argentina/Buenos_Aires"
    );
    return fechaActual.isBetween(fechaInicio, fechaFin, undefined, "[]");
  };

  useEffect(() => {
    const items = [];
    const todayTimeZone = momentTimeZone(new Date()).tz(
      "America/Argentina/Buenos_Aires"
    );
    const todayTimeZone2 = momentTimeZone(new Date()).tz(
      "America/Argentina/Buenos_Aires"
    );
    const reportDate = moment(show.fechaIni).isBefore(
      todayTimeZone.add(24, "hours").format()
    );

    items.push({
      text: "Reportes",
      method: () => {},
      available: reportDate,
      icon: icoEmiRepor,
      submenu: reportDate && [
        // {
        //     text: "Emisión",
        //     method: (e) => {
        //       e.stopPropagation();
        //       mostrarEmiRepor(show);
        //     },
        //     available:true,
        //   },
        {
          text: "Emisión-Coordinador",
          method: (e) => {
            e.stopPropagation();
            mostrarEmiCordinador(show);
          },
          available: permissions.includes("REM"),
        },
        {
          text: "Emisión-Operador",
          method: (e) => {
            e.stopPropagation();
            mostrarEmiOperador(show);
          },
          available: permissions.includes("REM"),
        },
        {
          text: "Anticipado",
          method: (e) => {
            e.stopPropagation();
            mostrarReporteAnticipado(show);
          },
          available: true,
        },
        {
          text: "Artística",
          method: (e) => {
            e.stopPropagation();
            mostrarReporteArtistica(show);
          },
          available: true,
        },
      ],
    });
    
    items.push({
      text: "Artística del Programa",
      method: () => mostrarArtistica(show),
      available: true,
      icon: icoArtistica,
    });
    
    items.push({
      text: "Guías y Condiciones",
      method: () => mostrarGuias(show),
      available: true,
      icon: icoGuias,
    });
    
    items.push({
      text: "Spots Emitidos",
      method: () => mostrarSpotsEmitidos(show),
      available: true,
      icon: icoEmiSpots,
    });
    
    items.push({
      text: "Rutina",
      method: () => mostrarRutina(show),
      available: true,
      icon: icoRutina,
    });
    
    items.push({
      text: "Formato",
      method: () => {},
      available: true,
      icon: info,
      submenu: [
        {
          text: "Ver formato",
          method: (e) => {
            e.stopPropagation();
            mostrarFormato(show);
          },
          // available: show.emi != 0,
          available: true,
        },
        {
          text: "Discrepancia",
          method: (e) => {
            e.stopPropagation();
            mostrarFormatoDiscrepancia(show);
          },
          available: show.emi == 0,
        },
      ],
    });
    
    items.push({
      text: "Segmentación",
      method: () => {},
      available: true,
      icon: icoEmiSpots,
      submenu: [
        {
          text: "Ficha manual",
          method: (e) => {
            e.stopPropagation();
            mostrarMediaSegmentacion(show);
          },
          available: true,
        },
        {
          text: "Versiones",
          method: (e) => {
            e.stopPropagation();
            mostrarSegmentos(show);
          },
          available: true,
        },
      ],
    });

    items.push({
      text: "Materiales",
      method: () => mostrarListadoMateriales(show),
      available: true,
      icon: icoMateriales,
    });

    items.push({
      text: "Promociones",
      method: () => mostrarListadoPromociones(show),
      available: true,
      icon: icoPromo,
    });
    const today = moment(new Date()).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    items.push({
      text: "Generar Playlist",
      method: () => generarPlaylist(show.epi, show.progra_codi),
      available:
        permissions.includes("GPL") &&
        moment(show.fechaIni).isSameOrAfter(today) &&
        show.esta_progra?.trim() == "6",
      icon: icoPlaylist,
    });

    items.push({
      text: "Rushbet",
      method: () => mostrarRushbet(show),
      available: true,
      icon: icoRutina,
    });

    const programChangeDate =
      moment(show.fechaIni).isAfter(todayTimeZone2.format()) ||
      hasProgrammingInProgress();
    items.push({
      text: "Program Change",
      method: () => mostrarProgramChange(show),
      available:
        permissions.includes("PRC") && show.es_norte && programChangeDate,
      // available: permissions.includes("PRC") && show.tiene_senial_u && show.senial === "U" && programChangeDate,
      icon: intercambiar,
    });

    items.push({
      text: "Copiar codigo",
      method: () => copyToClipboard(show.progra_codi),
      available: true,
      icon: addI,
    });
    setItems(() => items);
  }, [show, x, y, permissions]);

  const copyToClipboard = (progra_codi) => {
    const aux = document.createElement("input");
    aux.setAttribute("value", progra_codi);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
  };

  useEffect(() => {
    if (items.length > 0) {
      setContentJSX(
        items.map((x, i) => {
          return (
            <ContextMenuItem
              key={`menu-con-${i}`}
              // className="context-menu__item"
              onClick={x.available && !x.submenu ? x.method : null}
              onMouseEnter={
                x.submenu
                  ? () => setShowSubMenu(x.text)
                  : () => setShowSubMenu(null)
              }
              // onMouseLeave={x.submenu ? () => setShowSubMenu(null) : null}
            >
              <ContextMenuItemDescrip isDisabled={!x.available}>
                {x.text}
              </ContextMenuItemDescrip>
              {showSubMenu == x.text ? (
                <ContextMenuSubmenuContainer
                  isLeft={!checkRight()}
                  isRight={checkRight()}
                >
                  {x.submenu &&
                    x.submenu.map((op) => {
                      return (
                        <ContextMenuSubmenuOption
                          key={op.text}
                          onClick={op.available ? op.method : null}
                        >
                          <ContextMenuSubmenuDescrip isDisabled={!op.available}>
                            {op.text}
                          </ContextMenuSubmenuDescrip>
                        </ContextMenuSubmenuOption>
                      );
                    })}
                </ContextMenuSubmenuContainer>
              ) : null}
            </ContextMenuItem>
          );
        })
      );
    }
  }, [items, showSubMenu]);

  useEffect(() => {
    return () => onCloseMenuContext();
  }, []);

  const handleGrillaAuxiliarSalir = (delay) => {
    if (!delay) delay = 0;
    setTimeout(
      () =>
        dispatch({
          type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
          payload: null,
        }),
      delay
    );
  };

  const mostrarListadoMateriales = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ListadoMateriales
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarListadoPromociones = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ListadoPromociones show={show} salirCBF={handleGrillaAuxiliarSalir}  onMediaTraker/>
      ),
    });
  };

  // const mostrarRutina = (show) => {
  //   dispatch({
  //     type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
  //     payload: (
  //       <ListadoRutina show={show} salirCBF={handleGrillaAuxiliarSalir} onMediaTraker />
  //     ),
  //   });
  // };

  const mostrarRutina = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: <Rutina dataTable={dataTable} show={show} onCloseModal={handleGrillaAuxiliarSalir} />,
    });
  };

  const mostrarRushbet = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <Rushbet
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={true}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarSpotsEmitidos = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <SpotsEmitidos
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarEmiCordinador = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ReporteEmision
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("REMC")}
          rol={2}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarEmiOperador = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ReporteEmision
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("REMO")}
          rol={1}
          onMediaTraker
        />
      ),
    });
  };
  // const mostrarEmiRepor = (show) => {
  //   dispatch({
  //     type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
  //     payload: (
  //       <ReporteEmision
  //         initialShow={show}
  //         salirCBF={handleGrillaAuxiliarSalir}
  //         hasPermission={permissions.includes("REM")}
  //       />
  //     ),
  //   });
  // };
  const mostrarGuias = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <GuiasParticulares
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("GYC")}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarArtistica = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ListadoArtistica
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("AHO") && !!show.proce_artis}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarReporteArtistica = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ReporteArtistica
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("REA")}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarFichaCopiado = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <FichaCopiado
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("FNE")}
        />
      ),
    });
  };

  const mostrarMediaSegmentacion = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <MediaSegmentacion
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("MAM")}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarSegmentos = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <Segmentos
          show={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("SEG")}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarFormato = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <Formato
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission
          onMediaTraker
        />
      ),
    });
  };

  const mostrarFormatoDiscrepancia = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <FormatoDiscrepancia
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission
          onMediaTraker
        />
      ),
    });
  };

  const mostrarReporteAnticipado = (show) => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ReporteAnticipado
          initialShow={show}
          salirCBF={handleGrillaAuxiliarSalir}
          hasPermission={permissions.includes("RAN")}
          onMediaTraker
        />
      ),
    });
  };

  const mostrarProgramChange = () => {
    dispatch({
      type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET,
      payload: (
        <ProgramChange
          show={show}
          hasPermission={permissions.includes("PRC")}
          isOpen
          onClose={handleGrillaAuxiliarSalir}
        />
      ),
    });
  };

  const checkX = (x) => {
    const position = isOpenLeftBar ? x - 300 : x - 50;
    if (position > window.innerWidth - menuWidth) return position - menuWidth;
    return position;
  };

  const checkRight = () => {
    if (x > window.innerWidth - menuWidth) return true;
  };
  return (
    <ContextMenuWrapper
      ref={refWrapper}
      left={checkX(x) + "px"}
      top={y.toString() + "px"}
    >
      <ContextMenuBody
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        notPaddingTop={onSchedule}
      >
        {onSchedule && (
          <ContextMenuProgra>
            {`${show.canal} ${show.senial} #${show.epi}`}
            <br />
            {`${show.progra_codi}`}
          </ContextMenuProgra>
        )}
        {contentJSX}
      </ContextMenuBody>
    </ContextMenuWrapper>
  );
};

export default React.memo(CeldaContexDisney);
