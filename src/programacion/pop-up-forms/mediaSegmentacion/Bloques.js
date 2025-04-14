import React, { useState, useEffect } from "react";
import imageDelete from "../../../../images/icons/delete-i.png";
import imageAdd from "../../../../images/icons/add-i.png";
import editOk from "../../../../images/checkmark-si.png";
import editNo from "../../../../images/checkmark-no.png";
import imageEdit from "../../../../images/icons/edit-i.png";
import useMessageBox from "../../../hooks/useMessageBox";
import {
  validarHorarioConFrames,
  completarHorarioConCeros,
  sumarHorariosConFrames,
} from "../../../../utils/durationHelper";
import TimeInput from "./InputTime";

const Bloques = ({
  pBloques,
  onChangeCBF,
  hasPermission,
  creationMode,
  duraTotal,
  show,
}) => {
  const defaultBloque = {
    index: null,
    id: null,
    bloqueNro: null,
    startTime: "",
    endTime: "",
    duraTime: "",
    descrip: "",
    houseId: show
      ? `${show.depor ? show.depor.trim() : ""}${
          show.progra ? show.progra.trim() : ""
        } ${show.show}`
      : "",
  };
  const [showMessage, _hideMessage, messageTemplate, messageTypes] =
    useMessageBox();

  const [bloque, setBloque] = useState(defaultBloque);
  const [resetTimeInput, setResetTimeInput] = useState(0);
  const [bloques, setBloques] = useState([]);
  const [bloquesJSX, setBloquesJSX] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const editionMode = selectedIndex != null;

  useEffect(() => {
    setBloques(() => pBloques || []);
  }, [pBloques]);

  const handleEdit = (index) => {
    if (!hasPermission) return;
    setBloque(() => bloques[index]);
    setSelectedIndex(index);
  };

  const handleDelete = (index) => {
    if (!hasPermission) return;
    setBloques((prev) => {
      if (!prev) return;
      let aux = [...prev];
      aux.splice(index, 1);
      onChangeCBF(aux);
      return aux;
    });
  };

  function validateBloque(bloque, bloques) {
    let objRes = { valid: true, message: "" };
    if (bloque.bloqueNro == null || bloque.bloqueNro === "")
      objRes = { valid: false, message: "Falta el Número de Bloque." }; // Número de bloque nulo o vacío
    if (bloque.duraTime == null || bloque.duraTime === "")
      objRes = { valid: false, message: "Falta la duración." }; // Duración nulo o vacío
    if (bloque.startTime == null || bloque.startTime === "")
      // start time nulo o vacio
      objRes = { valid: false, message: "Falta el TC IN." };
    // reviso si ya existe un bloque con ese nro si no es edicion
    if (!editionMode) {
      bloques.forEach((bl) => {
        if (bl.bloqueNro == bloque.bloqueNro) {
          objRes = {
            valid: false,
            message: "Ya existe un bloque con el Numero ingresado.",
          };
        }
      });
    }
    return objRes;
  }

  const cancelEdition = () => {
    setBloque(defaultBloque);
    setSelectedIndex(null);
    setResetTimeInput((prev) => prev + 1)
  };

  useEffect(() => {
    if (
      validarHorarioConFrames(bloque.duraTime) &&
      validarHorarioConFrames(bloque.startTime)
    ) {
      handleChange(
        "endTime",
        sumarHorariosConFrames(bloque.duraTime, bloque.startTime)
      );
    }
  }, [bloque.duraTime, bloque.startTime]);

  const handleAdd = (e) => {
    if (!hasPermission) return;
    let v = validateBloque(bloque, bloques);
    if (v.valid) {
      if (selectedIndex !== null) {
        setBloques((prev) => {
          prev.splice(selectedIndex, 1, { ...bloque });
          onChangeCBF(prev);
          return prev;
        });
        setSelectedIndex(null);
      } else {
        let auxBloque = { ...bloque };
        setBloques((prev) => {
          onChangeCBF([...prev, auxBloque]);
          return [...prev, auxBloque];
        });
      }
      // Reset bloque
      setBloque(() => defaultBloque);
      setResetTimeInput((prev) => prev + 1)
    } else {
      let m = messageTemplate;
      m.title = "ATENCION";
      m.message = v.message;
      m.type = messageTypes.ALERT;
      m.okCBF = () => {};
      showMessage(m);
    }
  };

  useEffect(() => {
    updateGrid();
  }, [bloques]);

  useEffect(() => {
    updateGrid();
  }, [selectedIndex]);

  const updateGrid = () => {
    const b = bloques
      .sort((a, b) => {
        if (a.bloqueNro == b.bloqueNro) return 0;
        else if (a.bloqueNro < b.bloqueNro) return -1;
        else return 1;
      })
      .map((el, i) => {
        return (
          <tr
            key={i}
            style={selectedIndex === i ? { backgroundColor: "#999" } : null}
          >
            <td>{el.bloqueNro} </td>
            <td>{el.descrip}</td>
            <td>{el.startTime}</td>
            <td>{el.endTime}</td>
            <td>{el.duraTime}</td>
            <td>{el.houseId}</td>
            {creationMode && (
              <>
                <td>
                  <img
                    src={imageEdit}
                    alt=""
                    className="media-segmentacion-bloques__grid-icon button"
                    onClick={() => handleEdit(i)}
                  />
                </td>
                <td>
                  <img
                    src={imageDelete}
                    alt=""
                    className="media-segmentacion-bloques__grid-icon button"
                    onClick={() => handleDelete(i)}
                  />
                </td>
              </>
            )}
          </tr>
        );
      });

    setBloquesJSX(() => b);
  };

  const handleChange = (key, value) => {
    setBloque((prev) => {
      return { ...prev, [key]: value };
    });
  };

  return (
    <div className="media-segmentacion-bloques__wrapper">
      <div className="media-segmentacion-bloques__title">
        Bloques del programa
      </div>
      <div>
        <table className="media-segmentacion-bloques__table">
          <thead>
            <tr>
              <th># </th>
              <th>Bloque</th>
              <th>TC IN</th>
              <th>TC OUT</th>
              <th>Duración</th>
              <th>House ID</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>{bloquesJSX}</tbody>
          <tfoot style={{ visibility: creationMode ? "visible" : "hidden" }}>
            <tr>
              <td>
                <input
                  disabled={!hasPermission}
                  type="number"
                  id="fcb-bloque_nro"
                  value={bloque.bloqueNro == null ? "" : bloque.bloqueNro}
                  onChange={(e) => handleChange("bloqueNro", e.target.value)}
                  className="media-segmentacion-bloques__grid-input"
                  min="1"
                />
              </td>
              <td>
                <input
                  disabled={!hasPermission}
                  id="descrip"
                  value={bloque.descrip}
                  onChange={(e) => handleChange("descrip", e.target.value)}
                  className="media-segmentacion-bloques__grid-input"
                  type="text"
                />
              </td>
              <td>
                <TimeInput
                  key={resetTimeInput + "startTime"}
                  handleChange={(time) => handleChange("startTime", time)}
                  className="media-segmentacion-bloques__grid-input"
                  initialValue={bloque.startTime}
                />
              </td>
              <td>
                <input
                  disabled
                  id="fcb-endTime"
                  key={bloques.endTime + "endTime"}
                  value={!bloque.endTime ? "" : bloque.endTime}
                  className="media-segmentacion-bloques__grid-input"
                  placeholder="HH:MM:SS;FF"
                />
              </td>
              <td>
                <TimeInput
                  key={resetTimeInput + "duraTime"}
                  handleChange={(time) => handleChange("duraTime", time)}
                  className="media-segmentacion-bloques__grid-input"
                  initialValue={bloque.duraTime}
                />
              </td>
              <td>
                <input
                  disabled={!hasPermission}
                  id="houseId"
                  value={bloque.houseId}
                  onChange={(e) => handleChange("houseId", e.target.value)}
                  className="media-segmentacion-bloques__grid-input"
                  type="text"
                />
              </td>
              {editionMode ? (
                <td colSpan="2">
                  <img
                    src={editOk}
                    alt=""
                    className="media-segmentacion-bloques__grid-icon button"
                    onClick={handleAdd}
                  />
                  <img
                    src={editNo}
                    alt=""
                    className="media-segmentacion-bloques__grid-icon button"
                    onClick={cancelEdition}
                  />
                </td>
              ) : (
                <>
                  <td colSpan="2">
                    <img
                      src={imageAdd}
                      alt=""
                      className="media-segmentacion-bloques__grid-icon button"
                      onClick={handleAdd}
                    />
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
        <div className="table-total">Duración total: {duraTotal || 0}</div>
      </div>
    </div>
  );
};

export default Bloques;
