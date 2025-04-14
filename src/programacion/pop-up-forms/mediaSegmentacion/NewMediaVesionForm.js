import React, { useEffect, useState } from "react";
import "./MediaSegmentacion.scss";
import Row from "./Row";
import Bloques from "./Bloques";
import axiosApi from "../../../../axiosApi";
import useMessageBox from "../../../hooks/useMessageBox";
import Loader from "../../../Loader/Loader";
import {
  calcDuraTotalWithFrames,
} from "../../../../utils/durationHelper";
import uuid from "react-uuid";
import TimeInput from "./InputTime";

const NewMediaVesionForm = ({
  show,
  state,
  initialData,
  onClose,
  mediaOrigen = [],
  getMediaList,
}) => {
  const [showMessage, _hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [newVersionData, setNewVersionData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [duraTotal, setDuraTotal] = useState(0);
  const [emptyError, setEmptyError] = useState([]);
  const camposObligatorios = ["deta", "startTime"];
  
  const bloquesCBF = (bl) => {
    setHasChanges(true);
    setNewVersionData((prev) => {
      return { ...prev, bloques: bl.length, bloquesList: bl };
    });
  };

  useEffect(() => {
    if (mediaOrigen && mediaOrigen.length > 0) {
      setNewVersionData((prev) => {
        return { ...prev, mediaOri: mediaOrigen[0].mediaOri };
      });
    }
  }, [mediaOrigen]);

  const validarObligatorios = (media) => {
    let isComplete = true;
    const arrTemp = [...emptyError];
    camposObligatorios.forEach((key) => {
      const value = media[key];
      if (typeof value === "string") {
        if (!value.trim()) {
          const hasKeyPrev = arrTemp.filter((k) => k === key);
          if (hasKeyPrev.length == 0) arrTemp.push(key);
          return (isComplete = false);
        } else {
          const index = arrTemp.indexOf(key);
          if (index >= 0) arrTemp.splice(index, 1);
        }
      }
    });
    setEmptyError(arrTemp);
    return isComplete;
  };

  useEffect(() => {
    if (newVersionData) {
      const result = calcDuraTotalWithFrames(newVersionData.bloquesList);
      setDuraTotal(result);
    }
  }, [newVersionData]);

  const saveMediaHandler = async () => {
    const bloquesParsed = bloquesParser(newVersionData.bloquesList || []);
    const newMediaObj = {
      ...newVersionData,
      canal: show.canal,
      senial: show.senial,
      bloquesList: bloquesParsed,
      duraTime: duraTotal,
    };
    delete newMediaObj.dura;
    if (!validarObligatorios(newMediaObj)) {
      return console.error("Obligatorios", emptyError);
    }
    let m = messageTemplate;
    // se valida que al menos tenga cargado un bloque
    if (newMediaObj.bloquesList.length == 0) {
      m.title = "Media Segmentación";
      m.message = "Error: debe cargar al menos un bloque.";
      m.type = messageTypes.ERROR;
      m.okCBF = () => {};
      return showMessage(m);
    }
    setSavingMedia(true);
    let url = `newMediaSegmentacion`;
    const api = await axiosApi();
    const { data } = await api.put(url, newMediaObj);
    setSavingMedia(false);
    if (!data.message.success) {
      m.title = "Media Segmentación";
      m.message = "Error al intentar guadar los cambios";
      m.type = messageTypes.ERROR;
      m.okCBF = () => {};
      showMessage(m);
    } else {
      getMediaList();
      m.title = "Media Segmentación";
      m.message = "Los cambios se guardaron correctamente";
      m.type = messageTypes.INFO;
      m.okCBF = () => {
        resetStates();
        onClose();
      };
      showMessage(m);
    }
  };

  const nullToEmpty = (val) => {
    return val ? val : "";
  };

  const resetStates = () => {
    setHasChanges(false);
    setNewVersionData(initialData);
  };

  const handleCancelClick = () => {
    if (!hasChanges) return onClose();
    let m = messageTemplate;
    m.title = "Media Segmentación";
    m.message = (
      <>
        {`Los cambios efectuados se perderán`}
        <br />
        <strong>{`¿Está seguro que quiere cancelar la carga?`}</strong>
      </>
    );
    m.type = messageTypes.INFO;
    m.okCBF = () => {
      resetStates();
      onClose();
    };
    m.cancelCBF = () => {};
    return showMessage(m);
  };

  const bloquesParser = (bloques) => {
    const tempArr = [];
    bloques.forEach((bloque) => {
      const bloqueTemp = { ...bloque };
      bloqueTemp.media = newVersionData.media ? parseInt(newVersionData.media) : null;
      bloqueTemp.bloqueNro = parseInt(bloque.bloqueNro);
      bloqueTemp.dura = bloque.dura ? bloque.dura.toString() : null;
      bloqueTemp.startTime = bloque.startTime
        ? bloque.startTime.toString()
        : null;
      bloqueTemp.endTime = bloque.endTime ? bloque.endTime.toString() : null;
      tempArr.push(bloqueTemp);
    });
    return tempArr;
  };

  const handleChange = (key, value) => {
    setHasChanges(true);
    setNewVersionData({ ...newVersionData, [key]: value });
  };

  return (
    <div className="media-segmentacion__wrapper">
      <div className="media-segmentacion__form">
        <div className="media-segmentacion__form-body">
          <div className="media-segmentacion__form-columns">
            <div
              className="media-segmentacion__form-column"
              style={{ flex: 2 }}
            >
              <Row tag={"Canal"} data={`${show.canal} - ${show.senial}`} />
              <Row tag={"Usuario"} data={state.globalUser.name} />
              <Row
                tag={"Detalle"}
                data={
                  <>
                    <input
                      id="deta"
                      className="media-segmentacion__input-text"
                      value={newVersionData.deta}
                      onChange={(e) => handleChange("deta", e.target.value)}
                    />
                    {emptyError.includes("deta") && (
                      <div className="input-error">
                        Este campo es obligatorio
                      </div>
                    )}
                  </>
                }
              />
              <Row
                tag={"Observaciones"}
                data={
                  <input
                    id="obser"
                    className="media-segmentacion__input-text"
                    value={newVersionData.obser}
                    onChange={(e) => handleChange("obser", e.target.value)}
                  />
                }
              />
              <Row
                tag={"Box Number"}
                data={
                  <>
                    <input
                      id="boxNumber"
                      className="media-segmentacion__input-text"
                      value={newVersionData.boxNumber}
                      onChange={(e) =>
                        handleChange("boxNumber", e.target.value)
                      }
                      maxLength={50}
                    />
                    {emptyError.includes("boxNumber") && (
                      <div className="input-error">
                        Este campo es obligatorio
                      </div>
                    )}
                  </>
                }
              />
              <Row
                tag={"Frame Rate"}
                data={
                  <div className="input-radio-container">
                    <div>
                      <input
                        type="radio"
                        id="frameRate30"
                        name="frameRate30"
                        className="media-segmentacion__input-text"
                        checked={newVersionData.frameRate == 30}
                        onChange={() => handleChange("frameRate", 30)}
                      />
                      <label htmlFor="frameRate30">30</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="frameRate60"
                        name="frameRate60"
                        className="media-segmentacion__input-text"
                        checked={newVersionData.frameRate == 60}
                        onChange={() => handleChange("frameRate", 60)}
                      />
                      <label htmlFor="frameRate60">60</label>
                    </div>
                  </div>
                }
              />
              <Row
                tag={"DropFrame"}
                data={
                  <div className="input-radio-container">
                    <div>
                      <input
                        type="radio"
                        id="dropFrameSi"
                        name="dropFrameSi"
                        className="media-segmentacion__input-text"
                        checked={newVersionData.dropFrame == 1}
                        onChange={() => handleChange("dropFrame", 1)}
                      />
                      <label htmlFor="dropFrameSi">SI</label>
                    </div>
                    <div style={{ marginLeft: "4px" }}>
                      <input
                        type="radio"
                        id="dropFrameNo"
                        name="dropFrameNo"
                        className="media-segmentacion__input-text"
                        checked={newVersionData.dropFrame == 0}
                        onChange={() => handleChange("dropFrame", 0)}
                      />
                      <label htmlFor="dropFrameNo">NO</label>
                    </div>
                  </div>
                }
              />
              <Row
                tag={"Start Time"}
                data={
                  <>
                    <TimeInput
                      handleChange={(time) => handleChange("startTime", time)}
                      className="media-segmentacion__input-text"
                    />
                    {emptyError.includes("startTime") && (
                      <div className="input-error">
                        Este campo es obligatorio
                      </div>
                    )}
                  </>
                }
              />
              <Row
                tag={"Media origen"}
                data={
                  <select
                    disabled={!mediaOrigen.length}
                    onChange={(e) =>
                      handleChange("mediaOri", parseInt(e.target.value))
                    }
                    value={nullToEmpty(newVersionData.mediaOri)}
                  >
                    {!mediaOrigen ||
                      (!mediaOrigen.length > 0 && (
                        <option disabled selected>
                          No hay origenes disponibles
                        </option>
                      ))}
                    {mediaOrigen.map((option) => (
                      <option
                        key={uuid()}
                        value={option.mediaOri}
                        selected={newVersionData.mediaOri == option.mediaOri}
                      >
                        {option.sigla}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>
            <div
              className="media-segmentacion__form-column"
              style={{ flex: 3 }}
            >
              <div className="media-segmentacion-bloques__area">
                <Bloques
                  hasPermission={true}
                  pBloques={newVersionData.bloquesList}
                  onChangeCBF={bloquesCBF}
                  creationMode
                  duraTotal={duraTotal || 0}
                  show={show}
                />
              </div>
            </div>
          </div>
          <div className="media-segmentacion__row-filler"></div>
          <div className="media-segmentacion__row-buttons">
            <div>
              <button
                className="media-segmentacion__row-button shadow-left-down"
                disabled={!hasChanges || savingMedia}
                onClick={saveMediaHandler}
              >
                {savingMedia ? <Loader /> : "GUARDAR"}
              </button>
            </div>
            <div>
              <button
                className="media-segmentacion__row-button shadow-left-down"
                disabled={savingMedia}
                onClick={handleCancelClick}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMediaVesionForm;
