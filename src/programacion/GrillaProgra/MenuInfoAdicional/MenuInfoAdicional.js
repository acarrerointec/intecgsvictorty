import React, { useState, useEffect } from 'react';
import './MenuInfoAdicional.scss';
import '../Filtro/opcionesTipoEmi/OpcionesTipoEmi.scss';
import { useProgramacionState, actionTypes } from '../../../contexts/ProgramacionContext';
import {useGrillaData, grillaDataTypes} from '../../../contexts/grilla-data-context'
import useMessageBox from '../../../hooks/useMessageBox';
import OpcionesTipoEmi from '../Filtro/opcionesTipoEmi/OpcionesTipoEmi';
import useIsMounted from '../../../hooks/useIsMounted';
import { getDataGrillaPrograTipoEmi, getDataGrillaProgra } from '../../programacionHeavyLifting';
import { getUserFromLS } from '../../../../utils/userLoggedUtils';
const iconosMasInfo = require.context('../../../../images/masInfo');

function MenuInfoAdicional() {
  const [firstRender, setFirstRender] = useState(true);
  const [state, dispatch] = useProgramacionState();
  const [contentJSX, setContentJSX] = useState(<></>);
  const isMounted = useIsMounted();
  const [opcionesTiposEmiVisible, setOpcionesTiposEmiVisible] = useState(false);
  const grillaData = useGrillaData();
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();

  const onGetDataError = msg=>{
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => { },
      type: messageTypes.ERROR,
    })
  }

  useEffect(() => {
    if(!firstRender){
      const {fechaRef, filtro, grillaType, cantColumnSemanal} = grillaData.state;
      grillaType === 'diaria' ? getDataDiaria(fechaRef) : getDataSemanal(fechaRef, filtro.canal, filtro.senial, cantColumnSemanal);
    }
  }, [state.infoAdicionalConfig.emitido, state.infoAdicionalConfig.pautado])


  useEffect(() => {
    window.addEventListener("click", handleOutsideClick)
    setFirstRender(false)
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [])

  const handleOutsideClick = (e) => {
    if(!e.target || !e.target.parentNode) return
    if (e.target.id + e.target.parentNode.id !== 'tipoEmision') {
      setOpcionesTiposEmiVisible(prev => false);
    }
  }

  const getDataDiaria = async (fechaRef) => {
    if (fechaRef !== null) {
      const data = await getDataGrillaPrograTipoEmi(fechaRef, onGetDataError,state.infoAdicionalConfig.emitido,state.infoAdicionalConfig.pautado, grillaData.state.channelsGroups );
      if(!isMounted) return;
      grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data, fechaRef,grillaType: 'diaria'}});
    }
  }

  const getDataSemanal = async (fechaRef, canal, senial, cantidadColumnas) => {
    const data = await getDataGrillaProgra(fechaRef, canal, senial, cantidadColumnas, onGetDataError,state.infoAdicionalConfig.emitido, state.infoAdicionalConfig.pautado);
    grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data, fechaRef, grillaType:'semanal'}});
  }

  useEffect(() => {
    let mounted = true;
    if (mounted)
      setJSX()
    return () => {
      mounted = false;
    }
  }, [state.infoAdicionalConfig, opcionesTiposEmiVisible])

  const clickMenuItem = (e) => {
    e.stopPropagation();
    let key = e.target.id + e.target.parentNode.id;
    switch (key) {
      case "superposicion":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_SUPERPOSICION });
        break;
      case "estadoMateriales":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_ESTADO_MATERIALES });
        break;
      case "estadoPrograma":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_ESTADO_PROGRAMA });
        break;
      case "tipoEmision":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_TIPO_EMISION });
        break;
      case "tieneGuias":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_TIENE_GUIAS });
        break;
      case "tieneRepoTecnico":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.TOGGLE_TIENE_REPO_TECNICO });
        break;
      case "emitido":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.PROGRAMAS_EMITIDOS });
        break;
      case "pautado":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.PROGRAMAS_PAUTADOS });
        break;
      case "segmentacion":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.SEGMENTACION });
        break;
      case "alternativo":
        dispatch({ usuarioRed: getUserFromLS().userEmail ,type: actionTypes.ALTERNATIVO });
        break;
      default:
        break;
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let key = e.target.id + e.target.parentNode.id;
    switch (key) {
      case "superposicion":
        //future action
        break;
      case "estadoMateriales":
        //future action
        break;
      case "estadoPrograma":
        //future action
        break;
      case "tipoEmision":
        setOpcionesTiposEmiVisible(true);
        break;
      case "tieneGuias":
        //future action
        break;
      case "tieneRepoTecnico":
        //future action
        break;
      default:
        break;
    }
  }

  const setJSX = () => {
    setContentJSX(
      <>
        <div className={`grilla-progra__info-adicional_superposicion ${state.infoAdicionalConfig?.superposicion ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="superposicion" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./superpos.png')} alt="" />
          <label>Superposicion</label>
        </div>
        <div className={`grilla-progra__info-adicional_estado-materiales ${state.infoAdicionalConfig.estadoMateriales ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="estadoMateriales" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./material_04.png')} alt="" />
          <label>Estado Materiales</label>
        </div>
        <div className={`grilla-progra__info-adicional_estado-programa ${state.infoAdicionalConfig.estadoPrograma ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="estadoPrograma" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./gauge-1.png')} alt="" />
          <label>Estado Programa</label>
        </div>
        <div className={`grilla-progra__info-adicional_tipo-emision ${state.infoAdicionalConfig.tipoEmision ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          title="Click secundario para más opciones"
          onContextMenu={handleContextMenu}
          id="tipoEmision" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./tipoEmi.png')} alt="" />
          <label>Tipo Emisión</label>
          <OpcionesTipoEmi visible={opcionesTiposEmiVisible} />
        </div>
        <div className={`grilla-progra__info-adicional_tiene-guias ${state.infoAdicionalConfig.tieneGuias ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="tieneGuias" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./guias.png')} alt="" />
          <label>Guías</label>
        </div>
        <div className={`grilla-progra__info-adicional_tiene-repo_tecnico ${state.infoAdicionalConfig.tieneRepoTecnico ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="tieneRepoTecnico" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./tieneRepoEmi.png')} alt="" />
          <label>Reporte Técnico</label>
        </div>
        <div className={`grilla-progra__info-adicional_emitido ${state.infoAdicionalConfig.emitido ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="emitido" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./prg-emitida.png')} alt="" />
          <label>Emitido</label>
        </div>
        <div className={`grilla-progra__info-adicional_pautado isDisabled ${state.infoAdicionalConfig.pautado ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="pautado" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./prg-pautada.png')} alt=""/>
          <label>Pautado</label>
        </div>
        <div className={`grilla-progra__info-adicional_segmentacion ${state.infoAdicionalConfig.segmentacion ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="segmentacion" onClickCapture={clickMenuItem} >
          <img src={iconosMasInfo('./construccion.png')} alt="" />
          <label>Segmentación</label>
        </div>
          <div className={`grilla-progra__info-adicional_alternativo ${state.infoAdicionalConfig.alternativo ? 'grilla-progra__info-adicional_cell__selected' : ''}`}
          id="alternativo" onClickCapture={clickMenuItem} >
          <div style={{width:"18px",height:"18px", backgroundColor:"purple",border: "2px solid black", marginRight:"2px"}}></div>
          <label>Alternativo</label>
        </div>
      </>)
  }

  return (
    <div className="menu-info-adicional__wrapper">
      {contentJSX}
    </div>
  )
}

export default MenuInfoAdicional;

