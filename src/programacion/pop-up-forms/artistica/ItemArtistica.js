import React, { useState, useEffect } from "react";
import TimeControl from "./TimeControl";
import imageCheckSi from "../../../../images/checkmark-si.png";
import imageCheckNo from "../../../../images/checkmark-no.png";
import axiosApi from "../../../../axiosApi";
import useMessageBox from "../../../hooks/useMessageBox";
import filePlus from "../../../../images/icons/plus.svg";
import trash from "../../../../images/icons/delete.png";

function ItemArtistica({
  item,
  hasPermission,
  addHandler,
  deleteItem,
  validate,
  updateItemData,
}) {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [localState, setLocalState] = useState(item);
  const [contentJSX, setContentJSX] = useState(null);

  const onDelete = () => {
    return showMessage({
      title: "Borrar ítem",
      message: "¿Está seguro que quiere borrar este ítem?",
      okCBF: () => deleteItem(localState.id_artis),
      cancelCBF: () => {},
      type: messageTypes.INFO,
    });
  };

  const saveData = async (hora, emitido) => {
    const api = await axiosApi();
    const result = await api.put("artistica-item", {
      ...localState,
      hora,
      emitido,
    });
    const data = await result.data;
    if (!data.message.success) {
      let m = messageTemplate;
      m.title = "SERVER ERROR";
      m.message = data.message.message;
      m.type = messageTypes.ERROR;
      m.okCBF = () => {};
      showMessage(m);
    } else {
      if (data.message.message !== "") {
        let m = messageTemplate;
        m.title = "AVISO";
        m.message = data.message.message;
        m.type = data.message.type;
        m.okCBF = () => {};
        showMessage(m);
      }
      updateItemData(data.model);
      if (data.model) {
        setLocalState((prev) => {
          return {
            ...prev,
            actua_hora_ncs: data.model.actua_hora_ncs,
            emitido: data.model.emitido,
          };
        });
      }
    }
  };

  const validateFn = (hora) => {
    const valid = validate(hora, item.spot);
    if (!valid) {
      let m = messageTemplate;
      m.title = "Error de horario";
      m.message = "Ya existe un spot para el horario ingresado.";
      m.type = messageTypes.ERROR;
      m.okCBF = () => {};
      showMessage(m);
      return;
    }
    return valid;
  };

  useEffect(() => {
    if (localState) {
      let imgEmitido = "";
      if (localState) {
        if (localState.emitido === 1)
          imgEmitido = <img alt="" src={imageCheckSi} title="Emitido" />;
        else if (localState.emitido === 0)
          imgEmitido = <img alt="" src={imageCheckNo} title="No Emitido" />;
        else imgEmitido = <></>;
      }

      setContentJSX(() => (
        <tr className="listing-window__row">
          {/* <td>{localState.orden}<wbr /></td> */}
          <td>
            {localState.canal}
            <wbr />
          </td>
          <td>
            {localState.posicion}
            <wbr />
          </td>
          <td>
            {localState.mate}
            <wbr />
          </td>
          <td>
            {localState.tipo}
            <wbr />
          </td>
          <td className="listing-window__cell__left">
            {localState.nombre}
            <wbr />
          </td>
          <td>
            {localState.cliente}
            <wbr />
          </td>
          <td className="obser">
            {localState.obser_spot}
            <wbr />
          </td>
          <td>
            {localState.ISCI}
            <wbr />
          </td>
          <td>
            {localState.duracion}
            <wbr />
          </td>
          <td className="listing-window__cell__center">
            {imgEmitido}
            <wbr />
          </td>
          <td>
            <TimeControl
              value={localState.hora}
              onChange={updateHora}
              hasPermission={hasPermission}
              validate={validateFn}
            />
          </td>
          <td>
            {localState.spot}
            <wbr />
          </td>
          <td>
            {global.util.fechaDMYHMS(localState.actua_hora_ncs)}
            <wbr />
          </td>
          <td>
            <img
              className={`action-button ${
                hasPermission ? "" : "button-disabled"
              }`}
              src={filePlus}
              alt=""
              onClick={() =>
                hasPermission && addHandler && addHandler(localState)
              }
            />
            {!localState.spot && (
              <img
                className={`action-button ${
                  hasPermission ? "" : "button-disabled"
                }`}
                src={trash}
                alt=""
                onClick={() => hasPermission && deleteItem && onDelete()}
              />
            )}
            <wbr />
          </td>
        </tr>
      ));
    }
  }, [localState.emitido, localState.actua_hora_ncs]);

  const updateHora = ({ hora, emitido }) => {
    setLocalState((prev) => {
      return {
        ...prev,
        hora,
        emitido,
      };
    });

    saveData(hora, emitido);
  };
  if (contentJSX) return contentJSX;
  return <></>;
}

export default ItemArtistica;
