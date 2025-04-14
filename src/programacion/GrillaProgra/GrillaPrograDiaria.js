import React, { useState, useEffect, useCallback } from "react";
import "./GrillaPrograDiaria.scss";
import "./HeaderMenu.scss";
import axiosApi from "../../../axiosApi";
import GrillaPrograMenuDiaria from "./GrillaPrograMenu/GrillaPrograMenuDiaria";
import Filtro_TipoEmi from "./Filtro/Filtro_TipoEmi";
import ColumnasDiaria from "./columnas/ColumnasDiaria";
import GrillaCabecera from "./grillaCabecera/GrillaCabecera";
import Reference from "./reference/Reference";
import { getPreference, setPreference } from "../../contexts/context-functions";
import PopUpModules from "../../../pages/PopUpModules";
import useMenuSeniales from "../../hooks/useMenuSeniales";
import useInterval from "../../hooks/useInterval";
import Loader from "../../Loader/Loader";
import {
  useGrillaData,
  grillaDataTypes,
} from "../../contexts/grilla-data-context";
import uuid from "react-uuid";
import { useProgramacionState, actionTypes } from '../../contexts/ProgramacionContext';
import { getUserFromLS } from "../../../utils/userLoggedUtils";

const GrillaPrograDiaria = () => {
  const [state, dispatch] = useProgramacionState()
  const [fechaRef, setFechaRef] = useState();
  const [refresh, setRefresh] = useState(0);
  const grillaData = useGrillaData();
  const [filterVisible, setFilterVisible] = useState(false);

  const [referenciaVisible, setReferenciaVisible] = useState(false);
  const [datosCabecera, setDatosCabecera] = useState([]);

  const [grillaAuxiliar, setGrillaAuxiliar] = useState(<></>);

  const [senialesMenuVisible, setSenialesMenuVisible] = useState(true);

  const [topMenuConfig, toggleSenial] = useMenuSeniales();

  useInterval(() => {
    setRefresh(refresh + 1);
  }, 1800000);

  useEffect(() => {
    let mounted = true;
    let _fechaRef;
    const f = async () => {
      if (mounted) {
        _fechaRef = global.util.soloFechaJS(new Date());
        if (_fechaRef === undefined || _fechaRef === null || _fechaRef === "")
          _fechaRef = global.util.soloFechaJS(new Date());
      }
      setFechaRef(_fechaRef);
    };
    f();
    return () => {
      mounted = false;
    };
  }, []);

  const irAFechasAnteriores = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let newDate = new Date(fechaRef);
    newDate.setDate(newDate.getDate() - 1);
    setPreference({
      modulo: "Filtro_TipoEmi",
      opcion: "fechaRef",
      descrip: "",
      valor: global.util.fechaJS(newDate),
    });
    setFechaRef(global.util.fechaJS(newDate));
  };

  const irAFechasSiguientes = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let newDate = new Date(fechaRef);
    newDate.setDate(newDate.getDate() + 1);
    setPreference({
      modulo: "Filtro_TipoEmi",
      opcion: "fechaRef",
      descrip: "",
      valor: global.util.fechaJS(newDate),
    });
    setFechaRef(global.util.fechaJS(newDate));
  };

  const handleShowFilterClick = (e) => {
    setFilterVisible(() => !filterVisible);
  };

  const actualizarGrillaDesdeFiltroCBF = (pFechaRef) => {
    if (fechaRef !== pFechaRef) setFechaRef(pFechaRef);
  };

  const cabeceraCBF = (datos) => {
    setDatosCabecera((prev) => datos);
  };

  const handleReferencia = () => {
    setReferenciaVisible((prev) => !prev);
  };

  const handleMenuSenialesHide = () => {
    setSenialesMenuVisible(false);
  };

  const handleRefreshData = () => {
    setRefresh(refresh + 1);
  };

  useEffect(() => {
    if (grillaData.state.channelsGroups) {
      handleRefreshData();
    }
  }, [grillaData.state.channelsGroups]);

  useEffect(() => {
    if (grillaData.state.globalReloadData !== 0) {
      handleRefreshData();
    }
  }, [grillaData.state.globalReloadData]);

  const applyGroupsSelected = (topMenuGroups) => {
    //este dispatch guarda en la base de datos
    dispatch({ type: actionTypes.TOP_MENU_UPDATE_GROUPS, payload: topMenuGroups, usuarioRed: getUserFromLS().userEmail })
    //este dispatch se encarga de pedir los datos con los nuevos grupos seleccionados
    grillaData.dispatch({
      type: grillaDataTypes.SET_CHANNEL_GROUPS,
      payload: topMenuGroups,
    });
    setSenialesMenuVisible(false)
  }

  return (
    <div className="grilla-progra-tipo-emi__wrapper">
      <GrillaPrograMenuDiaria
        fechaRef={fechaRef}
        actualizarGrillaCBF={actualizarGrillaDesdeFiltroCBF}
        irAFechasAnteriores={irAFechasAnteriores}
        irAFechasSiguientes={irAFechasSiguientes}
        filterClickCBF={handleShowFilterClick.bind(this)}
        handleReferenceCBF={handleReferencia}
        handleRefreshData={handleRefreshData}
      />
      <div
        className="grilla-progra-tipo-emi__cabecera"
        onClick={() => {
          setSenialesMenuVisible((prev) => !prev);
        }}
      >
        <GrillaCabecera
          arrTitles={datosCabecera}
          columnType="diaria"
          handleMenuSenialesHide={handleMenuSenialesHide}
        />
      </div>
      <HeaderMenu
        visible={senialesMenuVisible}
        topMenuConfig={topMenuConfig}
        toggleSenial={toggleSenial}
        hideSenialesMenuCBF={handleMenuSenialesHide}
        grillaData={grillaData}
        groupsSelected={state.topMenuGroups}
        applyGroupsSelected={applyGroupsSelected}
        isLoading={state.loadingChannels}
      />
      <ColumnasDiaria
        refresh={refresh}
        fechaRef={fechaRef}
        cabeceraCBF={cabeceraCBF}
      />
      <div className="grilla-progra-tipo-emi__boton-menu">
        <Filtro_TipoEmi
          pFechaRef={fechaRef}
          visibility={filterVisible}
          actualizarGrillaCBF={actualizarGrillaDesdeFiltroCBF}
          hideCBF={() => setFilterVisible(() => false)}
        />
        <PopUpModules />
      </div>
      <div className="grilla-progra-tipo-emi__horas">
        <Horas />
      </div>
      <Reference pVisible={referenciaVisible} visibleCBF={handleReferencia} />
      {grillaAuxiliar}
    </div>
  );
};

export default GrillaPrograDiaria;

function Horas() {
  var horas = [];
  for (let h = 0; h < 24; h++) {
    horas.push(
      <div key={h} className="grilla-progra-tipo-emi__horas-item">
        <div className="grilla-progra-tipo-emi__horas-texto">
          {h.toString().padStart(2, "0")}
        </div>
        <div className="grilla-progra-tipo-emi__horas-linea"></div>
      </div>
    );
  }
  return <>{horas}</>;
}

//---------------------------------------------------------------------------------------------------

const HeaderMenu = ({
  visible,
  topMenuConfig,
  toggleSenial,
  hideSenialesMenuCBF,
  groupsSelected,
  applyGroupsSelected,
  isLoading
}) => {
  const [contentJSX, setContentJSX] = useState();
  const [channels, setChannels] = useState();
  const [channelsJSX, setChannelsJSX] = useState();
  const [loading, setLoading] = useState(0);
  // cofig para top menu op groups
  const [topMenuGroups, setTopMenuGroups] = useState([])
  // fn para actualizar los grupos 
  const updateGroupsSelected = (groupId) => {
    const isActiveGroup = topMenuGroups.some((group) => group == groupId);
    const selectedGroupIds = isActiveGroup
      ? topMenuGroups.filter((group) => group != groupId)
      : [...topMenuGroups, groupId];
    setTopMenuGroups(selectedGroupIds)
  }

  useEffect(()=>{
    if(!isLoading){
      setTopMenuGroups(groupsSelected || [])
    }
  },[isLoading, groupsSelected])

  const getChannelData = async () => {
    const api = await axiosApi();
    const { data } = await api.get("Programacion/gruposCanales");
    if (data.message.success) {
      setChannels(data.model ? data.model : []);
    }
  };

  useEffect(() => {
    if(!topMenuConfig) return
    setContentJSX(
      topMenuConfig.map((el, ix) => {
        return (
          <div
            key={ix}
            className={`header-menu__item ${
              el.estado === "true" ? "header-menu__item__active" : ""
            }`}
            onClick={() => handleClick(el)}
          >
            <div>{el.senial}</div>
            <div>
              <div>&nbsp;</div>
            </div>
          </div>
        );
      })
    );
  }, [topMenuConfig]);

  useEffect(() => {
    getChannelData();
  }, []);

  useEffect(() => {
    if (channels) {
      setChannelsJSX(
        channels.map((channelGroup) => {
          return (
            <div
              key={uuid()}
              className={`header-menu__item ${
                topMenuGroups.some((group) => group == channelGroup.canal_grupo)
                  ? "header-menu__item__active"
                  : ""
              }`}
              onClick={() => updateGroupsSelected(channelGroup.canal_grupo)}
            >
              <div>{channelGroup.descrip}</div>
              <div>
                <div>&nbsp;</div>
              </div>
            </div>
          );
        })
      );
    }
  }, [channels, topMenuGroups, groupsSelected]);

  useEffect(() => {
    setLoading((prev) => ++prev);
  }, [contentJSX]);

  const handleClick = (data) => {
    toggleSenial({
      senial: data.senial,
      estado: data.estado === "true" ? "false" : "true",
    }, getUserFromLS().userEmail);
  };

  if (loading < 3) return <></>;
  return (
    <div
      className={`header-menu__outside ${
        visible === true ? "header-menu__outside__visible" : ""
      }`}
    >
      <div
        className={`header-menu__wrapper ${
          visible === true ? "header-menu__wrapper__visible" : ""
        }`}
      >
        <div
          className="header-menu__body1"
          onClick={(e) => {
            hideSenialesMenuCBF(e);
          }}
        >
          <div
            className="header-menu__body2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="header-menu__label">
              <div className="header-menu__descrip">SEÑALES VISIBLES:</div>
            </div>
            <div className="header-menu__options">{contentJSX}</div>
          </div>
          <div
            className="header-menu__body2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="header-menu__label2">
              <div className="header-menu__descrip">GRUPOS:</div>
            </div>
            <div className="header-menu__options2">{channelsJSX}</div>
          </div>
          <div className={`header-menu__button${isLoading ? ' disabled' : ''}`} onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              if(!isLoading){
                applyGroupsSelected(topMenuGroups);
              }
            }}
          >
            {isLoading ? <Loader/> : 'Aplicar selección'}
          </div>
        </div>
      </div>
    </div>
  );
};
