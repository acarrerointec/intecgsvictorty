import React, { useState, useEffect } from 'react';
import './GuiasParticulares.scss';
import FormWindow from '../formWindow/FormWindow'
import axiosApi from '../../../../axiosApi';
import { useGlobalState, actionTypes, messageTypes } from '../../../contexts/GlobalConstext';
import { useProgramacion } from '../../../contexts/ProgramacionContext';
import Combo from '../../../combos/Combo';
import { getDataGrillaPrograTipoEmi, getDataGrillaProgra } from '../../programacionHeavyLifting';
import {useGrillaData, grillaDataTypes} from '../../../contexts/grilla-data-context'
import ChannelCommands from '../channelCommands/ChannelCommands'
import useMessageBox from '../../../hooks/useMessageBox';

let guias_particulares = {
  epi: null,
  canal: "",
  canal_paren: null,
  duplicar: true,
  logo: "",
  cuadrante:"",
  particulares: "",
  generales: "",
  usuario_red: null,
}

const GuiasParticulares = ({ initialShow, salirCBF, hasPermission , onMediaTraker = false }) => {
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [guiasParticulares, setGuiasParticulares] = useState(guias_particulares);
  const [show, setShow] = useState(initialShow);
  const [filterCanal] = useState([show?.canal?.toString().trim()]);
  const grillaData = useGrillaData();
  const {infoAdicionalConfig} = useProgramacion();
  const [sending, setSending] = useState(false);
  const [timeoutEpiError, setTimeoutEpiError] = useState(null)
  const [hasActiveTimeout, setHasActiveTimeout] = useState(false)
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();

  const onGetDataError = msg=>{
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => { },
      type: messageTypes.ERROR,
    })
  }

  const getDataEpi = async ()=> {
    const url = `guias-particulares/${show.epi}`;
    const api = await axiosApi()
    const {data} = await api.get(url);
    if(!data.message.success){
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => { },
        type: messageTypes.ERROR,
      })
    }
    const aux = data.model;
    aux.canal = aux.canal.trim()
    setGuiasParticulares(prev => { return { ...prev, ...aux, cuadrante: aux.cuadrante || "2" } })
    setLoadStatus(() => { return { completed: true } });
  }

  useEffect(() => {
    setHasActiveTimeout(true)
    return ()=> {
      hasActiveTimeout && clearTimeout(timeoutEpiError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[timeoutEpiError])

  useEffect(() => {
    getDataEpi()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show.epi])

  const handleLogoChange = e => {
    e.persist();
    setGuiasParticulares(prev => { return { ...prev, logo: e.target.value } });
  }

  const handleCuadranteChange = e => {
    e.persist();
    setGuiasParticulares(prev => { return { ...prev, cuadrante: e.target.value}})
  }

  const handleParticularesChange = e => {
    e.persist();
    setGuiasParticulares(prev => { return { ...prev, particulares: e.target.value } });
  }

  const handleDuplicateChange = e => {
    e.persist();
    setGuiasParticulares(prev => { return { ...prev, duplicar: e.target.checked } })
  }

  function row(tag, data, className = "") {
    return (
      <div className={`guias-particulares__row ${className}`}>
        <div className="guias-particulares__tag" style={tag ? null : {opacity: "0"}}>
          {tag}
        </div>
        <div className="guias-particulares__data">
          {data}
        </div>
      </div>
    )
  }

  function validarObligatorios() {
    if (guiasParticulares.logo)
      return true
    return false
  }

  function epiErrorHandler() {
    const timeoutId = setTimeout(salirCBF, 5000);
    setTimeoutEpiError(timeoutId)
  }

  const handleSaveClick = async e => {
    if (!sending) {
      setSending(true);
      if (!validarObligatorios()) {
        dispatch({
          type: actionTypes.globalMessage.SHOW_MESSAGE,
          payload: {
            title: "Error de validación",
            message: "El Logo es obligatorio.",
            okCBF: () => { },
            type: messageTypes.ERROR,
          }
        });
      } else {
        let url = `guias-particulares`;
        const api = await axiosApi()
        const result = await api.post(url, guiasParticulares);
        const data = await result.data;
        if (!data.message.success) {
          dispatch({
            type: actionTypes.globalMessage.SHOW_MESSAGE,
            payload: {
              title: "Error",
              message: data.message.message,
              okCBF: () => { },
              type: messageTypes.ERROR,
            }
          });
        }
        else {
          const fecha = grillaData.state.fechaRef
          const grillaType = grillaData.state.grillaType
          if(fecha){
            if(grillaType && grillaType === 'diaria'){
              const data = await getDataGrillaPrograTipoEmi(fecha, onGetDataError, infoAdicionalConfig.emitido, infoAdicionalConfig.pautado, grillaData.state.channelsGroups);
              grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data,grillaType: 'diaria'}});
            }
            if(grillaType && grillaType === 'semanal'){
              const {filtro, cantColumnSemanal} = grillaData.state
              const data = await getDataGrillaProgra(filtro.fechaRef, filtro.canal, filtro.senial, cantColumnSemanal, onGetDataError, infoAdicionalConfig.emitido, infoAdicionalConfig.pautado);
              grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data,grillaType: 'semanal'}});
            }
          }
          dispatch({
            type: actionTypes.globalMessage.SHOW_MESSAGE,
            payload: {
              title: "Guías Particulares",
              message: "Se han modificado las Guías Particulares.",
              okCBF: salirCBF,
              type: messageTypes.INFO,
            }
          });
        }
      }
      setSending(false);
    }
  }

  const formLayout = () => {
    return (
      <div className="guias-particulares__wrapper">
        <div className="guias-particulares__form">
          <div className="guias-particulares__form-body">
            {timeoutEpiError && (
              <div className="disabled-form-error">
                Error: espisodio no encontrado.
              </div>
            )}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                marginRight: "30px",
                marginTop: "90px",
              }}
            >
              <ChannelCommands
                show={show}
                setShow={setShow}
                epiErrorHandler={epiErrorHandler}
              />
            </div>
            {row("Canal", `${show.canal} - ${show.senial}`)}
            {row("Usuario", state.globalUser.name)}
            {row("Semilla (Logo)", <Combo id="logo" comboNombre="logo" pValue={guiasParticulares.logo} returnFn={handleLogoChange} placeHolder="Seleccione Canal..." filterValArr={filterCanal} />)}
            {row("Cuadrante", <Combo id="cuadrante" comboNombre="cuadrante" pValue={guiasParticulares.cuadrante} returnFn={handleCuadranteChange} placeHolder="Seleccione Cuadrante..." filterValArr={filterCanal} />)}
            {row("Generales",
              <textarea maxLength="3000" disabled={true} className="guias-particulares__generales" value={guiasParticulares.generales} />
              , "guias-particulares__row__expansive")}
            {row("Particulares",
              // <textarea maxLength="3000" className="guias-particulares__particulares" value={guiasParticulares.particulares ? guiasParticulares.particulares : ""} onChange={handleParticularesChange} />
              <textarea maxLength="3000" className="guias-particulares__particulares" value={guiasParticulares.particulares ? guiasParticulares.particulares : ""} onChange={handleParticularesChange} />
              , "guias-particulares__row__expansive")}
            {row(guiasParticulares.canal_paren ? `Duplicar para ${guiasParticulares.canal_paren}` : null, guiasParticulares.canal_paren ? <input type="checkbox" checked={guiasParticulares.duplicar} onChange={handleDuplicateChange} /> : <></>)}
            <div className="guias-particulares__row-filler">
            </div>
            <div className="guias-particulares__row-buttons">
              <div>
                <div className={`button shadow-left-down ${!hasPermission ? 'disabled' : ''}`}onClick={hasPermission ? handleSaveClick : ()=>{}}>GUARDAR</div>
              </div>
            </div>
          </div>
        </div>
      </div >
    )
  }

  return (
    <FormWindow title="Guías Particulares"
      show={show}
      salirCBF={salirCBF}
      loadStatus={loadStatus}
      helpUrlJson="guiasParticulares"
      addStyle={{ maxHeight: "60.5rem" }}
      onMediaTraker={onMediaTraker}
    >
      {formLayout()}
    </FormWindow>
  );
}

export default GuiasParticulares;

