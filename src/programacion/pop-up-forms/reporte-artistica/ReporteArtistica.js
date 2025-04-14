import React, { useState, useEffect } from 'react';
import './ReporteArtistica.scss';
import FormWindow from '../formWindow/FormWindow'
import axiosApi from '../../../../axiosApi';
import { useGlobalState, actionTypes, messageTypes } from '../../../contexts/GlobalConstext';
import ChannelCommands from '../channelCommands/ChannelCommands'

let reporte_artistica = {
  epi: null,
  canal: "",
  artis_repor: "",
}

const ReporteArtistica = ({ initialShow, salirCBF, hasPermission ,onMediaTraker = false}) => {
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [reporteArtistica, setReporteArtistica] = useState(reporte_artistica);
  const [sending, setSending] = useState(false);
  const [show, setShow] = useState(initialShow);
  const [timeoutEpiError, setTimeoutEpiError] = useState(null)
  const [hasActiveTimeout, setHasActiveTimeout] = useState(false)

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const afn = async () => {
        let url = `reporte-artistica/${show.epi}`;
        const api = await axiosApi()
        const result = await api.get(url);
        const data = await result.data;

        if (data.message !== null) {
          console.log('message', data.message);
          //repo.texto = "";
        }
        setReporteArtistica(prev => { return { ...prev, ...data.model } })
        setLoadStatus(() => { return { completed: true } });

      }
      afn();
    }
    return () => mounted = false;
  }, [show.epi])

  useEffect(() => {
    setHasActiveTimeout(true)
    return ()=> {
      hasActiveTimeout && clearTimeout(timeoutEpiError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[timeoutEpiError])

  function epiErrorHandler() {
    const timeoutId = setTimeout(salirCBF, 5000);
    setTimeoutEpiError(timeoutId)
  }

  const handleArtisReporChange = e => {
    e.persist();
    setReporteArtistica(prev => { return { ...prev, artis_repor: e.target.value } });
  }

  function row(tag, data, className = "") {
    return (
      <div className={`reporte-artistica__row ${className}`}>
        <div className="reporte-artistica__tag">
          {tag}
        </div>
        <div className="reporte-artistica__data">
          {data}
        </div>
      </div>
    )
  }

  const validarObligatorios = () => reporteArtistica && reporteArtistica.artis_repor && reporteArtistica.artis_repor.trim() !== ""

  const handleSaveClick = e => {
    if (!sending) {
      if (!validarObligatorios()) {
        dispatch({
          type: actionTypes.globalMessage.SHOW_MESSAGE,
          payload: {
            title: "Error de validación",
            message: "El texto es obligatorio.",
            okCBF: () => { },
            type: messageTypes.ERROR,
          }
        });
      } else {
        const afn = async () => {
          let url = `reporte-artistica`;
          const api = await axiosApi()
          const result = await api.put(url, reporteArtistica);
          const data = await result.data;
          if (!data.message.success) {
            setSending(false);
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
            dispatch({
              type: actionTypes.globalMessage.SHOW_MESSAGE,
              payload: {
                title: "Reporte de Artística",
                message: "Se ha modificado el Reporte de Artística.",
                okCBF: salirCBF,
                type: messageTypes.INFO,
              }
            });
            setSending(false);
            //salirCBF(salirCBF);
          }
        }
        setSending(true);
        afn();
      }
    }
  }

  const formLayout = () => {
    return (
      <div className="reporte-artistica__wrapper">
        <div className="reporte-artistica__form">
          <div className="reporte-artistica__form-body">
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
            {row("Reporte",
              <textarea maxLength="3000" className="reporte-artistica__artis-repor" value={reporteArtistica.artis_repor ? reporteArtistica.artis_repor : ""} onChange={handleArtisReporChange} />
              , "reporte-artistica__row__expansive")}
            <div className="reporte-artistica__row-buttons">
              <div>
                <div
                  className={`button shadow-left-down ${
                    hasPermission ? "" : "disabled"
                  }`}
                  onClick={hasPermission ? handleSaveClick : () => {}}
                >
                  GUARDAR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    )
  }

  return (
    <FormWindow title="Reporte de Artística"
      show={show}
      salirCBF={salirCBF}
      loadStatus={loadStatus}
      helpUrlJson="reporteArtistica"
      addStyle={{ maxHeight: "53.1rem" }}
      onMediaTraker={onMediaTraker}
    >
      {formLayout()}
    </FormWindow>
  );
}

export default ReporteArtistica;

