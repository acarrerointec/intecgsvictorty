import React, { useState, useEffect, useMemo } from "react";
import "./ReporteEmision.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import ControlExtendido from "./ControlExtendido";
import ExporRepoEmi from "./export/ExporRepoEmi";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import { useProgramacion } from "../../../contexts/ProgramacionContext";
import {
  getDataGrillaPrograTipoEmi,
  getDataGrillaProgra,
} from "../../programacionHeavyLifting";
import {
  useGrillaData,
  grillaDataTypes,
} from "../../../contexts/grilla-data-context";
import ChannelCommands from "../channelCommands/ChannelCommands";
import useMessageBox from "../../../hooks/useMessageBox";
import Loader from "../../../Loader/Loader";

let reporte_emision = {
  epi: null,
  canal: null,
  duplicar: true,
  sendMail: false,
  repo_tec_id: null,
  texto: "",
  fecha_hora: null,
  tipo_repo: null,

  parent_epi: null,
  usuario_id: null,
  usuario_red: null,
  usuario_descrip: null,
};

 const ReporteEmision = ({ initialShow, salirCBF, hasPermission,rol,onMediaTraker=false}) => {
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [listaReporteEmision, setListaReporteEmision] = useState([]);
  const [reporteEmision, setReporteEmision] = useState(reporte_emision);
  const [reporteEmisionDetalle, setReporteEmisionDetalle] = useState([]);
  const [appendText, setAppendText] = useState("");
  const [exporRepoStatus, setExporRepoStatus] = useState(false);
  const [canalParent, setCanalParent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingIncidencia, setSendingIncidencia] = useState(false);
  const grillaData = useGrillaData();
  const { infoAdicionalConfig } = useProgramacion();
  const [show, setShow] = useState(initialShow);
  const [timeoutEpiError, setTimeoutEpiError] = useState(null);
  const [hasActiveTimeout, setHasActiveTimeout] = useState(false);
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  // const [valueSelectFormWindow,setValueSelectFormWindow] = useState(0)

  const onGetDataError = (msg) => {
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => {},
      type: messageTypes.ERROR,
    });
  };

  const expoRepoMemo = useMemo(()=>{
    return  (
      <ExporRepoEmi
      reporteEmision={reporteEmision}
          openStatus={exporRepoStatus}
          exitCBF={() => setExporRepoStatus((prev) => !prev)}
          rol={rol}
          show={show}
          hasPermission={hasPermission}
        />
    )
  },[listaReporteEmision, exporRepoStatus])

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const afnCanalParent = async () => {
        let url = `parent-chanel/${show.canal}`;
        const api = await axiosApi()
        const result = await api.get(url);
        const data = await result.data;

        if (data.message.success) setCanalParent(data.model.parent);
        else console.log("message 1", data.message);
      };

      const afn = async () => {
       let url = `reporte-emision-lista/${show.epi}/${rol}`;
      //  let url = `reporte-emision-lista/${show.epi}/${valueSelectFormWindow}`;
        const api = await axiosApi()
        const result = await api.get(url);
        const data = await result.data;
        // let repo = null;
        if (data.model) {
          //Cargo la lista con todos los reportes menos el último, que es un placeholder para el nuevo reporte a guardar.
          // let aux = data.model.slice(0, data.model.length - 1);
          let aux = data.model;
          //Cargo sólo los reportes que tengan texto para el preview.
          //Esto hay que modificarlo en caso de agregar las incidencias.
          // setListaReporteEmision(aux.filter(
          //   el => {
          //     if (el.texto) {
          //       return true;
          //     }
          //   }
          // ));
          const lista=data.model[data.model.length -1]
          setListaReporteEmision(aux);
          setReporteEmision((prev) => {
            return { ...prev, ...lista ,texto:""};
          });
        setLoadStatus(() => {
          return { completed: true };
        });
      };
    }
    const getReporteEmisionHead = async () => {
      let url = `reporte-emision-head/${show.epi}`;
       const api = await axiosApi()
       const result = await api.get(url);
       const data = await result.data;

        let repo = null;
         repo = data.model
         if (repo) {
           repo.map((el) => {
             el.defaultExtendido = "";
             if (el.incidencia_id === 1) {
               el.defaultExtendido = show.iniHHMM;
               if (el.valor_extendido === "") {
                 el.valor_extendido = show.iniHHMM;
               }
             } else if (el.incidencia_id === 2) {
               el.defaultExtendido = show.finHHMM;
               if (el.valor_extendido === "") {
                 el.valor_extendido = show.finHHMM;
               }
             }
           });
         }
      //  if (data.message !== null) {
      //    // console.log('message', data.message);
      //    repo.texto = "";
      //  }
      setReporteEmisionDetalle(repo);
       setLoadStatus(() => {
         return { completed: true };
       });
     }
      afn();
      getReporteEmisionHead()
      afnCanalParent();
    }
    return () => (mounted = false);
  }, [show.epi]);
// }, [show.epi,valueSelectFormWindow]);

  useEffect(() => {
    setHasActiveTimeout(true);
    return () => {
      hasActiveTimeout && clearTimeout(timeoutEpiError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutEpiError]);

  function epiErrorHandler() {
    const timeoutId = setTimeout(salirCBF, 5000);
    setTimeoutEpiError(timeoutId);
  }

  useEffect(() => {
    if (listaReporteEmision.length > 0) {
      let texto = "";
      listaReporteEmision.map((el, ix) => {
        //texto = `Usuario: ${el.usuario_red ? el.usuario_red : "<HISTO>"}\nFecha-Hora: ${el.fecha_hora ? el.fecha_hora : "<HISTO>"}\n${el.texto}\n${ix > 0 ? "-".repeat(40) : ""}\n${texto}`
        if (!el.fecha_hora && el.tipo_repo === 2) texto += "Logo: " + el.texto;
        else
          texto = `Usuario: ${el.usuario_red ? el.usuario_red : "<HISTO>"}\n${
            el.fecha_hora
              ? "Fecha-Hora:" + global.util.fechaDMYHMS(el.fecha_hora)
              : ""
          }\n${el.texto}\n${ix > 0 ? "-".repeat(40) : ""}\n${texto}`;
      });
      setAppendText(texto);
    }
  }, [listaReporteEmision]);

  const handleRepoTextChange = (e) => {
    e.persist();
    setReporteEmision((prev) => {
      return { ...prev, texto: e.target.value };
    });
  };

  const handleSendMailChange = (e) => {
    e.persist();
    setReporteEmision((prev) => {
      return { ...prev, sendMail: e.target.checked };
    });
  };

  const handleDuplicateChange = (e) => {
    e.persist();
    setReporteEmision((prev) => {
      return { ...prev, duplicar: e.target.checked };
    });
  };

  function row(tag, data, className = "") {
    return (
      <div className={`reporte-emision__row ${className}`}>
        <div className="reporte-emision__tag">{tag}</div>
        <div className="reporte-emision__data">{data}</div>
      </div>
    );
  }

  function validarObligatorios() {
    return reporteEmisionDetalle.every(
      (el) =>
        (el.obligatorio && el.valor !== null && el.valor !== "") ||
        !el.obligatorio
    );
  }

  const handleSaveClickHead = (e) => {
    if (sendingIncidencia) return;
    if (!validarObligatorios())
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error de validación",
          message: "Los datos marcados en color rojo son obligatorios.",
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    const afn = async () => {
      setSendingIncidencia(true);
      let url = `reporte-emision-head`;
      const api = await axiosApi()
      const result = await api.post(url, 
        reporteEmisionDetalle
      );
      const data = await result.data;
      if (!data.message.success) {
        data.message?.message && onGetDataError(data.message.message);
      } else {
        const fecha = grillaData.state.fechaRef;
        const grillaType = grillaData.state.grillaType;
        if (fecha) {
          if (grillaType && grillaType === "diaria") {
            const data = await getDataGrillaPrograTipoEmi(
              fecha,
              onGetDataError,
              infoAdicionalConfig.emitido,
              infoAdicionalConfig.pautado,
              grillaData.state.channelsGroups
            );
            grillaData.dispatch({
              type: grillaDataTypes.SET_GRILLA_DATA,
              payload: { data, grillaType: "diaria" },
            });
          }
          if (grillaType && grillaType === "semanal") {
            const { filtro, cantColumnSemanal } = grillaData.state;
            const data = await getDataGrillaProgra(
              filtro.fechaRef,
              filtro.canal,
              filtro.senial,
              cantColumnSemanal,
              onGetDataError,
              infoAdicionalConfig.emitido,
              infoAdicionalConfig.pautado
            );
            grillaData.dispatch({
              type: grillaDataTypes.SET_GRILLA_DATA,
              payload: { data, grillaType: "semanal" },
            });
          }
        }
        dispatch({
          type: actionTypes.globalMessage.SHOW_MESSAGE,
          payload: {
            title: "Reporte de Emisión",
            message: "Se ha agregado la incidencia.",
            okCBF: ()=>{},
            type: messageTypes.INFO,
          },
        });
        setSendingIncidencia(false);
        //salirCBF(salirCBF);
      }
    };
    setSendingIncidencia(true);
    afn();
  };

  const handleSaveClick = (e) => {
    if (sending) return;
    const afn = async () => {
      setSending(true);
      let url = `reporte-emision`;
      const api = await axiosApi()
      const result = await api.post(url, {
        ...reporteEmision,
        tipo_repo: rol,
        canal: show.canal,
      });
      const data = await result.data;
      if (!data.message.success) {
        setSending(false);
        data.message?.message && onGetDataError(data.message.message);
      } else {
        // const fecha = grillaData.state.fechaRef;
        // const grillaType = grillaData.state.grillaType;
        // if (fecha) {
        //   if (grillaType && grillaType === "diaria") {
        //     const data = await getDataGrillaPrograTipoEmi(
        //       fecha,
        //       onGetDataError,
        //       infoAdicionalConfig.emitido,
        //       infoAdicionalConfig.pautado,
        //       grillaData.state.channelsGroups
        //     );
        //     grillaData.dispatch({
        //       type: grillaDataTypes.SET_GRILLA_DATA,
        //       payload: { data, grillaType: "diaria" },
        //     });
        //   }
        //   if (grillaType && grillaType === "semanal") {
        //     const { filtro, cantColumnSemanal } = grillaData.state;
        //     const data = await getDataGrillaProgra(
        //       filtro.fechaRef,
        //       filtro.canal,
        //       filtro.senial,
        //       cantColumnSemanal,
        //       onGetDataError,
        //       infoAdicionalConfig.emitido,
        //       infoAdicionalConfig.pautado
        //     );
        //     grillaData.dispatch({
        //       type: grillaDataTypes.SET_GRILLA_DATA,
        //       payload: { data, grillaType: "semanal" },
        //     });
        //   }
        // }
        dispatch({
          type: actionTypes.globalMessage.SHOW_MESSAGE,
          payload: {
            title: "Reporte de Emisión",
            message: "Se ha agregado el reporte.",
            okCBF: () => {},
            type: messageTypes.INFO,
          },
        });
        setSending(false);
        setReporteEmision((prev) => {
          return { ...prev, texto: "" };
        });
        setSending(false);
        //salirCBF(salirCBF);
      }
    };
    setSending(true);
    afn();
  };

  const handleRepoInciChange = (opcion) => {
    let aux = reporteEmisionDetalle.map((el) => {
      if (el.incidencia_id === opcion.incidencia_id) el = opcion;
      return el;
    });
    setReporteEmisionDetalle(aux);
  };

  const formLayout = () => {
    return (
      <div className="reporte-emision__wrapper" key={show.epi}>
        <div className="reporte-emision__form">
          <div className="reporte-emision__form-body">
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
                marginTop: "86px",
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
            {row(
              "Incidencias",
              <ReporteEmisionIncidencias
                detalle={reporteEmisionDetalle}
                onChangeCBF={handleRepoInciChange}
              />
            )}
             <div className="reporte-emision__row-buttons">
              <div>
                <div
                  className={`button shadow-left-down ${
                    (!hasPermission || sendingIncidencia) ? "disabled" : ""
                  }`}
                  onClick={hasPermission ? handleSaveClickHead : () => {}}
                >
                  {sendingIncidencia ? <Loader/> : "GUARDAR"}
                </div>
              </div>
            </div>
            {row(
              "Emisión",
              <div className="reporte-emision__form-textarea-space">
                <textarea
                  maxLength="3000"
                  className="reporte-emision__textarea"
                  value={reporteEmision.texto}
                  onChange={handleRepoTextChange}
                />
              </div>,
              "reporte-emision__row__expansive"
            )}
            {row(
              "Email",
              <input
                type="checkbox"
                checked={reporteEmision.sendMail}
                onChange={handleSendMailChange}
              />
            )}
            {reporteEmision.parent_epi
              ? row(
                  `Duplicar para ${canalParent}`,
                  <input
                    type="checkbox"
                    checked={reporteEmision.duplicar}
                    onChange={handleDuplicateChange}
                  />
                )
              : null}
            <div className="reporte-emision__row-filler"></div>
            <div className="reporte-emision__row-buttons">
              <div>
                <div
                  className={`button shadow-left-down ${
                    !hasPermission ? "disabled" : ""
                  }`}
                  onClick={hasPermission ? handleSaveClick : () => {}}
                >
                  {sending ? <Loader/> : "GUARDAR"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {expoRepoMemo}
      </div>
    );
  };

  return (
    <>
      <FormWindow
        title={`Reporte de Emisión - ${rol == 1 ? "Operador" : "Coordinador"}`}
        show={show}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        helpUrlJson="reporteEmision"
        addStyle={{ maxHeight: "80rem" }}
        onMediaTraker={onMediaTraker}
      >
        {formLayout()}
      </FormWindow>
    </>
  );
};

export default ReporteEmision;

/* =========================================================================================== */
/* ======== OPCIONES ========================================================================= */
/* =========================================================================================== */
const ReporteEmisionIncidencias = ({ detalle, onChangeCBF }) => {
  const [opciones, setOpciones] = useState(detalle);
  useEffect(() => {
    setOpciones(
      detalle
    );
  }, [detalle]);

  return (
    <div className="reporte-emision__detalle">
      {opciones.map((e, i) => {
        return (
          <ControlExtendido
            key={`repo-emi-inci-${i}`}
            pOpcion={e}
            onChangeCBF={onChangeCBF}
          />
        );
      })}
    </div>
  );
};
