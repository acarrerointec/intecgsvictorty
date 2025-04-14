import React, { useState, useEffect } from "react";
import "./ReporteAnticipado.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import {
  useGlobalState,
  actionTypes,
  messageTypes,
} from "../../../contexts/GlobalConstext";
import Loader from "../../../Loader/Loader";
// RC Time Picker
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import moment from "moment";
//import ChannelCommands from '../channelCommands/ChannelCommands'

const reporteAnticipadoInitial = {
  anticipa_repor: "",
  anticipa_repor_historial: "",
  epi: "",
  hora: "",
  coordina: "",
  opera: "",
  moti: "",
  usua: "",
};

const mandatoryFields = ["anticipa_repor", "hora", "coordina", "opera", "moti"];

const ReporteAnticipado = ({ initialShow, salirCBF, hasPermission,onMediaTraker=false }) => {
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [reporteAnticipado, setReporteAnticipado] = useState(
    reporteAnticipadoInitial
  );
  const [sending, setSending] = useState(false);
  const [show, setShow] = useState(initialShow);
  //time picker
  const [dispatchTime, setDispatchTime] = useState(null);

  const handlePickerChange = (value) => {
    setDispatchTime(value);
    const formatValue = moment(value).format("HH:mm");
    handleInputChange(value != null ? formatValue : "", "hora");
  };
  //end time picker

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      getData();
    }
    return () => (mounted = false);
  }, [show.epi]);

  const getData = async () => {
    let url = `reporte-anticipado/${show.epi}`;
    const api = await axiosApi()
    const { data } = await api.get(url);

    const hasError = !data.message.success;
    if (hasError) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }

    setReporteAnticipado(() => {
      return {
        ...reporteAnticipadoInitial,
        anticipa_repor_historial: data.model.anticipa_repor || "",
        usua: state.globalUser.name,
        epi: show.epi,
      };
    });

    setLoadStatus(() => {
      return { completed: true };
    });
  };

  function row(tag, data, className = "") {
    return (
      <div className={`reporte-anticipado__row ${className}`}>
        <div className="reporte-anticipado__tag">{tag}</div>
        <div className="reporte-anticipado__data">{data}</div>
      </div>
    );
  }

  const validarObligatorios = () => {
    let hasError = false;
    mandatoryFields.map((key) => {
      if (reporteAnticipado[key] === "") {
        hasError = true;
      }
    });
    return hasError;
  };

  const handleInputChange = (data, id) => {
    setReporteAnticipado({ ...reporteAnticipado, [id]: data });
  };

  const handleSaveClick = async () => {
    if(!hasPermission) return;
    setSending(true);
    if (validarObligatorios()) {
      setSending(false);
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error de validación",
          message: "Todos los campos son obligatorios.",
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      })
    };
    let url = `reporte-anticipado`;
    const api = await axiosApi()
    const { data } = await api.post(url,reporteAnticipado);
    setSending(false);
    const hasError = !data.message.success;

    if (hasError) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }

    getData();
    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Reporte anticipado`,
        message: `Reporte creado correctamente`,
        okCBF: () => {},
        type: messageTypes.SUCCESS,
      },
    });
  };

  const formLayout = () => {
    return (
      <div className="reporte-anticipado__wrapper">
        <div className="reporte-anticipado__form">
          <div className="reporte-anticipado__form-body">
            {row(
              "Coordinador",
              <input
                maxLength="100"
                className="reporte-anticipado__input"
                value={reporteAnticipado.coordina || ""}
                onChange={(e) => handleInputChange(e.target.value, "coordina")}
              />
            )}
            {row(
              "Operador",
              <input
                maxLength="100"
                className="reporte-anticipado__input"
                value={reporteAnticipado.opera || ""}
                onChange={(e) => handleInputChange(e.target.value, "opera")}
              />
            )}
            {row(
              "Motivo",
              <input
                maxLength="100"
                className="reporte-anticipado__input"
                value={reporteAnticipado.moti || ""}
                onChange={(e) => handleInputChange(e.target.value, "moti")}
              />
            )}
            {row(
              "Hora aproximada",
              <TimePicker
                value={dispatchTime}
                onChange={handlePickerChange}
                showSecond={false}
                allowEmpty
              />
            )}
            {row(
              "Reporte",
              <div className="text-area-container">
                <textarea
                  disabled
                  className="reporte-anticipado__artis-repor"
                  value={reporteAnticipado.anticipa_repor_historial || ""}
                  onChange={() => {}}
                />
                <textarea
                  maxLength="3000"
                  className="reporte-anticipado__artis-repor"
                  value={reporteAnticipado.anticipa_repor}
                  onChange={(e) => {
                    handleInputChange(e.target.value, "anticipa_repor");
                  }}
                />
              </div>,
              "reporte-anticipado__row__expansive"
            )}
            <div className="reporte-anticipado__row-buttons">
              <div>
                <div
                  className={`button shadow-left-down ${
                    hasPermission ? "" : "disabled"
                  }`}
                  onClick={!sending ? handleSaveClick : () => {}}
                >
                  {sending ? <Loader /> : "GUARDAR"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FormWindow
      title="Reporte Anticipado"
      show={show}
      salirCBF={salirCBF}
      loadStatus={loadStatus}
      helpUrlJson={null}
      addStyle={{ maxHeight: "53.1rem" }}
      onMediaTraker={onMediaTraker}
    >
      {formLayout()}
    </FormWindow>
  );
};

export default ReporteAnticipado;
