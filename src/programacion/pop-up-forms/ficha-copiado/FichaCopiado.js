import React, { useState, useEffect, useRef } from "react";
import "./FichaCopiado.scss";
import Duration from "./Duration";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import {
  useGlobalState,
  actionTypes,
  messageTypes,
} from "../../../contexts/GlobalConstext";
import Bloques from "./Bloques";
import Combo from "../../../combos/Combo";
import useMessageBox from "../../../hooks/useMessageBox";

let fichaCopiadoDefault = () => {
  return {
    id: null,
    depor: "",
    progra: "",
    show: 0,
    version: "",
    canal: "",
    senial: "",
    duracion: "",
    bloques: "",
    carpeta: "",
    grabacion: "",
    emision: "",
    comentarios: "",
    audio_ch1: "",
    audio_ch2: "",
    audio_ch3: "",
    audio_ch4: "",
    audio_ch5: "",
    audio_ch6: "",
    detalle: "",
    bloquesList: [],
  };
};

const FichaCopiado = ({ show, salirCBF, hasPermission }) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [fichaCopiado, setFichaCopiado] = useState(fichaCopiadoDefault());
  const [filtroVersion, setFiltroVersion] = useState(1);
  const [duracion, setDuracion] = useState("");
  const [sending, setSending] = useState(false);
  const [modified, setModified] = useState(false);
  const [mailSent, setMailSent] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const afn = async () => {
        let url = `ficha-copiado/${show.depor.toString().trim()}/${show.progra
          .toString()
          .trim()}/${show.show.toString().trim()}/${filtroVersion}`;
        const api = await axiosApi();
        const result = await api.get(url);
        const data = await result.data;

        if (nullToEmpty(data.message.message) !== "") {
          console.log("message", data.message);
        }
        setFichaCopiado((prev) => {
          return { ...prev, ...data.model, version: filtroVersion };
        });
        setDuracion(data.model.duracion);
        setLoadStatus(() => {
          return { completed: true };
        });
      };
      if (filtroVersion == "") {
        setFichaCopiado(() => {
          return { ...fichaCopiadoDefault(), version: filtroVersion };
        }); //última versión en la base de datos
        setLoadStatus(() => {
          return { completed: true };
        });
      } else {
        afn();
      }
    }
    return () => (mounted = false);
  }, [filtroVersion]);

  useEffect(() => {
    let dura = null;
    try {
      dura = global.util.timeToInt(duracion);
    } catch (ex) {
      dura = null;
      console.log("Error", ex);
    }
    if (dura === 0) {
      dura = null;
      setDuracion(null);
    }
    setFichaCopiado((prev) => {
      return { ...prev, duracion: dura };
    });
  }, [duracion]);

  function row(tag, data, className = "") {
    return (
      <div className={`ficha-copiado__row ${className}`}>
        <div className="ficha-copiado__tag">{tag}</div>
        <div className="ficha-copiado__data">{data}</div>
      </div>
    );
  }

  function validarObligatorios() {
    if (fichaCopiado.detalle) return fichaCopiado.detalle.trim() !== "";
    else return false;
  }

  const bloquesParser = (bloques) => {
    const tempArr = [];
    bloques.forEach((bloque) => {
      const bloqueTemp = { ...bloque };
      bloqueTemp.bloqueNro = parseInt(bloque.bloqueNro);
      bloqueTemp.tc_in = parseInt(bloque.tc_in);
      bloqueTemp.tc_out = parseInt(bloque.tc_out);
      tempArr.push(bloqueTemp);
    });
    return tempArr;
  };

  // Guardar cambios
  const handleSaveClick = (e) => {
    if (!sending) {
      if (!validarObligatorios()) {
        let m = messageTemplate;
        m.title = "ATENCION";
        m.message = "El campo Detalle es obligatorio.";
        m.type = messageTypes.ALERT;
        m.okCBF = () => focusTo(13, "fc-detalle");
        showMessage(m);
      } else {
        const afn = async () => {
          let url = `ficha-copiado`;
          const api = await axiosApi();
          const bloquesParsed = bloquesParser(fichaCopiado.bloquesList || []);
          const result = await api.put(url, {
            ...fichaCopiado,
            canal: show.canal,
            senial: show.senial,
            bloquesList: bloquesParsed,
          });
          const data = await result.data;
          if (!data.message.success) {
            setSending(false);
          } else {
            setFichaCopiado(data.model);

            let m = messageTemplate;
            m.title = "Ficha de NetOps";
            m.message = "Los cambios se guardaron correctamente";
            m.type = messageTypes.INFO;
            m.okCBF = () => {};
            showMessage(m);

            handleMailSent(false);
            handleModified(false);
            //handleIsCopy(false)
            setSending(false);
            //salirCBF(salirCBF);
          }
        };
        setSending(true);
        afn();
      }
    }
  };

  const handleSendMailClick = (e) => {
    if (!sending) {
      const afn = async () => {
        let url = `ficha-copiado-mail/${"M"}`;
        const api = await axiosApi();
        const result = await api.post(url, fichaCopiado);
        const data = await result.data;
        if (!data.message.success) {
          setSending(false);
        } else {
          dispatch({
            type: actionTypes.globalMessage.SHOW_MESSAGE,
            payload: {
              title: "Ficha de NetOps",
              message: "Los cambios se guardaron correctamente",
              okCBF: () => {}, //salirCBF
              type: messageTypes.INFO,
            },
          });
          handleMailSent(true);
          setSending(false);
        }
      };
      setSending(true);
      afn();
    }
  };

  const handleMakeCopyClick = (e) => {
    if (!sending) {
      setFichaCopiado((prev) => {
        return {
          ...prev,
          id: null,
          version: null,
          detalle: `${prev.detalle} [COPIA]`,
        };
      });
      handleModified(true);
      handleMailSent(true);
    }
  };

  const handleModified = (val) => {
    if (modified !== val) setModified(val);
  };

  const handleMailSent = (val) => {
    if (mailSent !== val) setMailSent(val);
  };

  const handlePrograChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, progra: e.target.value };
    });
  };

  const duracionBCF = (val) => {
    setDuracion(() => val);
  };

  const handleBloquesChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, bloques: e.target.value < 0 ? 0 : e.target.value };
    });
  };

  const handleCarpetaChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, carpeta: e.target.value };
    });
  };

  const handleGrabacionChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return {
        ...prev,
        grabacion: global.util.fechaJS(e.target.value + "T00:00:00"),
      };
    });
  };

  const handleEmisionChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return {
        ...prev,
        emision: global.util.fechaJS(e.target.value + "T00:00:00"),
      };
    });
  };

  const handleAudioCh1Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch1: e.target.value };
    });
  };

  const handleAudioCh2Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch2: e.target.value };
    });
  };

  const handleAudioCh3Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch3: e.target.value };
    });
  };

  const handleAudioCh4Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch4: e.target.value };
    });
  };

  const handleAudioCh5Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch5: e.target.value };
    });
  };

  const handleAudioCh6Change = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, audio_ch6: e.target.value };
    });
  };

  const handleDetalleChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, detalle: e.target.value };
    });
  };

  const handleComentariosChange = (e) => {
    e.persist();
    setFichaCopiado((prev) => {
      return { ...prev, comentarios: e.target.value };
    });
  };

  const handleVersionChange = (e) => {
    e.persist();
    setFiltroVersion(e.target.value);
    //setFichaCopiado(prev => { return { ...prev, comentarios: e.target.value } });
  };

  const bloquesCBF = (bl) => {
    handleModified(true);
    setFichaCopiado((prev) => {
      return { ...prev, bloques: bl.length };
    });
    setFichaCopiado((prev) => {
      return { ...prev, bloquesList: bl };
    });
  };

  const nullToEmpty = (val) => {
    return val ? val : "";
  };

  const focusTo = (which, id) => {
    if (which === 13) {
      let o = document.querySelector(`#${id}`);
      if (o) o.focus();
    }
  };

  const formLayout = () => {
    return (
      <div className="ficha-copiado__wrapper">
        <div className="ficha-copiado__form">
          <div className="ficha-copiado__form-body">
            <div className="ficha-copiado__form-columns">
              <div className="ficha-copiado__form-column">
                {row("Canal", `${show.canal} - ${show.senial}`)}
                {row("Usuario", state.globalUser.name)}

                {row(
                  "Versión",
                  <Combo
                    id="version"
                    comboNombre="fichaCopiadoVersion"
                    pValue={nullToEmpty(fichaCopiado.version)}
                    returnFn={handleVersionChange}
                    placeHolder="Seleccione..."
                    filterValArr={[
                      show.depor.toString().trim(),
                      show.progra.toString().trim(),
                      show.show.toString().trim(),
                    ]}
                  />
                )}

                {row(
                  "Detalle",
                  <input
                    disabled={!hasPermission}
                    id="fc-detalle"
                    onKeyPress={(e) => focusTo(e.which, "fc-programa")}
                    className="ficha-copiado__input-text"
                    value={nullToEmpty(fichaCopiado.detalle)}
                    onChange={handleDetalleChange}
                    onBlur={() => handleModified(true)}
                  />
                )}
                {/* {row("Programa", <input id="fc-programa" onKeyPress={(e) => focusTo(e.which, "fc-duracion")} className="ficha-copiado__input-text" value={nullToEmpty(fichaCopiado.progra)} onChange={handlePrograChange} onBlur={() => handleModified(true)} style={{ width: "6.5rem" }} maxLength="3" />)} */}
                {/* {row("Duración", <Duration id="fc-duracion" onKeyPress={(e) => focusTo(e.which, "fc-carpeta")} value={duracion} CBF={duracionBCF} />)}
                {row("Bloques", <input onKeyPress={(e) => focusTo(e.which, "fc-duracion")} className="ficha-copiado__input-text" type="number" readOnly={true} value={nullToEmpty(fichaCopiado.bloques)} min="0" onChange={handleBloquesChange} onBlur={() => handleModified(true)} style={{ width: "8rem" }} />)} */}

                {row(
                  "Programa",
                  <div className="ficha-copiado__group">
                    <input
                      disabled={!hasPermission}
                      id="fc-programa"
                      onKeyPress={(e) => focusTo(e.which, "fc-duracion")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.progra)}
                      onChange={handlePrograChange}
                      onBlur={() => handleModified(true)}
                      style={{ width: "6.5rem" }}
                      maxLength="3"
                    />
                    &nbsp;&nbsp;Duración:&nbsp;&nbsp;
                    <Duration
                      hasPermission={hasPermission}
                      id="fc-duracion"
                      onKeyPress={(e) => focusTo(e.which, "fc-carpeta")}
                      value={duracion}
                      CBF={duracionBCF}
                    />
                    &nbsp;&nbsp;Bloques:&nbsp;&nbsp;
                    <input
                      disabled={!hasPermission}
                      onKeyPress={(e) => focusTo(e.which, "fc-duracion")}
                      className="ficha-copiado__input-text"
                      type="text"
                      readOnly={true}
                      value={nullToEmpty(fichaCopiado.bloques)}
                      min="0"
                      onChange={handleBloquesChange}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3rem" }}
                    />
                  </div>
                )}
                {row(
                  "Carpeta",
                  <input
                    disabled={!hasPermission}
                    id="fc-carpeta"
                    onKeyPress={(e) => focusTo(e.which, "fc-grabacion")}
                    className="ficha-copiado__input-text"
                    value={nullToEmpty(fichaCopiado.carpeta)}
                    onChange={handleCarpetaChange}
                    onBlur={() => handleModified(true)}
                  />
                )}
                {row(
                  "Grabación",
                  <input
                    disabled={!hasPermission}
                    type="date"
                    id="fc-grabacion"
                    onKeyPress={(e) => focusTo(e.which, "fc-emision")}
                    className="ficha-copiado__input-text"
                    value={global.util.fechaHTML(
                      nullToEmpty(fichaCopiado.grabacion)
                    )}
                    onChange={handleGrabacionChange}
                    onBlur={() => handleModified(true)}
                  />
                )}
                {row(
                  "Emisión",
                  <input
                    disabled={!hasPermission}
                    type="date"
                    id="fc-emision"
                    onKeyPress={(e) => focusTo(e.which, "fc-audio1")}
                    className="ficha-copiado__input-text"
                    value={global.util.fechaHTML(
                      nullToEmpty(fichaCopiado.emision)
                    )}
                    onChange={handleEmisionChange}
                    onBlur={() => handleModified(true)}
                  />
                )}
                {row(
                  "Audio (canales)",
                  <div className="ficha-copiado__group">
                    1:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio1"
                      onKeyPress={(e) => focusTo(e.which, "fc-audio2")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch1)}
                      onChange={handleAudioCh1Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                    &nbsp;2:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio2"
                      onKeyPress={(e) => focusTo(e.which, "fc-audio3")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch2)}
                      onChange={handleAudioCh2Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                    &nbsp;3:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio3"
                      onKeyPress={(e) => focusTo(e.which, "fc-audio4")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch3)}
                      onChange={handleAudioCh3Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                    &nbsp;4:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio4"
                      onKeyPress={(e) => focusTo(e.which, "fc-observaciones")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch4)}
                      onChange={handleAudioCh4Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                    &nbsp;5:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio5"
                      onKeyPress={(e) => focusTo(e.which, "fc-observaciones")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch5)}
                      onChange={handleAudioCh5Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                    &nbsp;6:&nbsp;
                    <input
                      disabled={!hasPermission}
                      id="fc-audio6"
                      onKeyPress={(e) => focusTo(e.which, "fc-observaciones")}
                      className="ficha-copiado__input-text"
                      value={nullToEmpty(fichaCopiado.audio_ch6)}
                      onChange={handleAudioCh6Change}
                      onBlur={() => handleModified(true)}
                      style={{ width: "3.5rem" }}
                      maxLength="50"
                    />
                  </div>
                )}
                {/* <div className="ficha-copiado__form-columns"> */}
                {row(
                  "Observaciones",
                  <div className="ficha-copiado__form-textarea-space">
                    <textarea
                      disabled={!hasPermission}
                      maxLength="3000"
                      id="fc-observaciones"
                      className="ficha-copiado__textarea"
                      value={nullToEmpty(fichaCopiado.comentarios)}
                      onChange={handleComentariosChange}
                      onBlur={() => handleModified(true)}
                      title="Tecla TAB para ir a la lista de bloques"
                    />
                  </div>,
                  "ficha-copiado__row__expansive"
                )}
                {/*</div> */}
              </div>
              <div className="ficha-copiado__form-column">
                <div className="ficha-copiado-bloques__area">
                  <Bloques
                    hasPermission={hasPermission}
                    pBloques={fichaCopiado.bloquesList}
                    onChangeCBF={bloquesCBF}
                  />
                </div>
              </div>
            </div>
            <div className="ficha-copiado__row-filler"></div>
            <div className="ficha-copiado__row-buttons">
              <div>
                <button
                  className="ficha-copiado__row-button shadow-left-down"
                  disabled={!modified || !hasPermission}
                  onClick={hasPermission ? handleSaveClick : () => {}}
                >
                  GUARDAR
                </button>
              </div>
              <div>
                <button
                  className="ficha-copiado__row-button shadow-left-down"
                  disabled={mailSent}
                  onClick={handleSendMailClick}
                >
                  MAIL A TRAFICO
                </button>
              </div>
              <div>
                <button
                  className="ficha-copiado__row-button shadow-left-down"
                  disabled={fichaCopiado.id === null}
                  onClick={handleMakeCopyClick}
                >
                  GENERAR COPIA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FormWindow
        title="Ficha de NetOps"
        show={show}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        helpUrlJson="fichaNetOps"
        addStyle={{ maxHeight: "54.6rem" }}
      >
        {formLayout()}
      </FormWindow>
    </>
  );
};

export default FichaCopiado;
