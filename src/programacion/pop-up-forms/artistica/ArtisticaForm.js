import React, { useState, useEffect } from "react";
import "./ArtisticaForm.scss";
import axiosApi from "../../../../axiosApi";
import useMessageBox from "../../../hooks/useMessageBox";
import Loader from "../../../Loader/Loader";
import moment from "moment";

const ArtisticaForm = ({
  initialFormData,
  show,
  getData,
  backToListView,
  isDuplicated,
  validate,
}) => {
  const [loading, setLoading] = useState(false);
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const { canal, senial, progra_codi, epi } = show;
  const url = "artistica-programa-alta";
  const date = new Date();
  const timeHour = date.getHours().toString();
  const timeMinutes = date.getMinutes().toString();
  const [params, setParams] = useState({
    // se llenan por info existente
    canal,
    senial,
    epi,
    progra_codi,
    // se llenan con el form
    spot: "",
    feature: "",
    nombre: "",
    pob: "",
    cliente_razon: "",
    tipo_publi: "",
    hora: null,
    obser: "",
    // posible null
    fecha_hora: null,
    mate: "",
  });
  const camposObligatoriosIds = [
    "cliente_razon",
    "tipo_publi",
    "nombre",
    "cliente_razon",
  ];

  const [hasError, setHasError] = useState({});
  const [tiposPubli, setTiposPubli] = useState([
    { codi: "Cargando...", descrip: "Cargando..." },
  ]);

  const formValidations = () => {
    let _hasError = false;
    const errors = {};
    camposObligatoriosIds.forEach((id) => {
      if (!params[id]) {
        errors[id] = "Este campo es obligatorio.";
        _hasError = true;
      }
    });
    if (!validarHora(params.hora)) {
      errors.hora = `La hora debe estar comprendido entre las ${show.iniHHMM} y las ${show.finHHMM} `;
      _hasError = true;
    }
    setHasError({ ...hasError, ...errors });
    return _hasError;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (formValidations()) return;
    setLoading(true);
    const api = await axiosApi();
    const { data } = await api.put(url, params);
    const { model, message } = data;
    setLoading(false);
    if (!message.success) {
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }

    getData();
    backToListView();
    return showMessage({
      title: "Ítem de artística",
      message: "Se guardo el ítem de artística correctamente",
      okCBF: getData,
      type: messageTypes.INFO,
    });
  };

  const validarHora = (hora) => {
    if (!hora) return false;
    const { finHHMM, iniHHMM, fecha_hora_fin, fecha_hora_ini } = show;
    const startTime = moment(iniHHMM, "HH:mm");
    const endTime = moment(finHHMM, "HH:mm");
    const horaFormated = moment(hora, "HH:mm");
    const tieneDesfasaje = endTime.diff(startTime, "minutes") < 0;
    const ceroHoras = moment(["00", "00"], "HH:mm");

    if (!tieneDesfasaje) {
      return (
        endTime.diff(horaFormated, "minutes") >= 0 &&
        horaFormated.diff(startTime, "minutes") >= 0
      );
    } else {
      if (
        horaFormated.diff(ceroHoras, "minutes") >=
          startTime.diff(ceroHoras, "minutes") &&
        horaFormated.diff(ceroHoras, "minutes") < 1440
      ) {
        return true;
      } else {
        return endTime.diff(horaFormated, "minutes") >= 0;
      }
    }
  };

  const getValidData = async (id_artis) => {
    setLoading(true);
    const api = await axiosApi();
    const { data } = await api.get(`artistica-programa/${id_artis}`);
    const { model, message } = data;
    setLoading(false);
    const modelLength = model && model.length === 0;

    if (!message.success || modelLength) {
      return showMessage({
        title: "Error",
        message:
          model && model.length === 0
            ? "Ítem de artistica no encontrado"
            : data.message.message,
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }
    setParams({
      ...params,
      ...data.model[0],
      epi,
      obser: data.model[0].obser || "",
    });
  };

  const getTiposPubli = async () => {
    const api = await axiosApi();
    const { data } = await api.get(`combos/tipos_publi`);
    const { model, message } = data;

    if (!message.success) {
      return showMessage({
        title: "Error",
        message: "Error buscando los tipos de publicidad.",
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }
    setTiposPubli([
      { codi: "", descrip: "Seleccione un tipo...", seleccionado: false },
      ...model,
    ]);
  };

  const handleMateOnChange = (e) => {
    e.preventDefault();
    if (hasError["mate"]) {
      setHasError({
        ...hasError,
        mate: null,
        cliente_razon: null,
        nombre: null,
      });
    }
    handleSearchMate();
    setParams({
      ...params,
      cliente_razon: "",
      nombre: "",
      mate: e.target.value,
    });
  };

  useEffect(
    () => {
      getTiposPubli();
      if (initialFormData) {
        getValidData(initialFormData.id_artis);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialFormData]
  );

  const handleSearchMate = async () => {
    const api = await axiosApi();
    setLoading(true);
    const { data } = await api.get(`materiales-datos/${params.mate}`);
    setLoading(false);

    const { model, message } = data;
    if (!message.success) {
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }
    if (model.length === 0) {
      setHasError({
        ...hasError,
        mate: "El código no coincide con ningún material existente.",
      });
      setParams({ ...params, cliente_razon: "", nombre: "" });
      return;
    }
    setParams({
      ...params,
      cliente_razon: model[0].razon,
      nombre: model[0].nombre,
    });
  };

  const handleOnChangeInput = (paramId, value) => {
    if (paramId == "hora") {
      if (!validate(value)) {
        return setParams({ ...params, hora: "" })
      };
    }
    if (hasError[paramId]) {
      setHasError({ ...hasError, [paramId]: null });
    }
    if (paramId === "pob") {
      return setParams({ ...params, [paramId]: parseInt(value) });
    }
    setParams({ ...params, [paramId]: value });
  };

  return (
    <div className="content-layout">
      {loading && <div className="loading-disabled" />}
      <h2>Cargar nuevo ítem de artística</h2>
      <form onSubmit={onSubmitHandler}>
        <div className="form-item">
          <label htmlFor="spot">Spot: </label>
          <input
            type="text"
            id="spot"
            maxLength="10"
            value={params["spot"]}
            onChange={(e) => handleOnChangeInput("spot", e.target.value)}
            className={hasError["spot"] ? "withError" : ""}
            disabled
          />
          {hasError["spot"] && <span>{hasError["spot"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="feature">Feature: </label>
          <input
            type="text"
            id="feature"
            maxLength="10"
            value={params["feature"]}
            onChange={(e) => handleOnChangeInput("feature", e.target.value)}
            className={hasError["feature"] ? "withError" : ""}
            disabled
          />
          {hasError["feature"] && <span>{hasError["feature"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="pob">Pob: </label>
          <input
            type="text"
            id="pob"
            max="10"
            value={params["pob"]}
            onChange={(e) => {
              // validacion de campo solo numeros
              const newReg = new RegExp(/^([0-9])*$/);
              const value = e.target.value;
              if (value.length < 11 && newReg.test(value)) {
                handleOnChangeInput("pob", value);
              }
            }}
            className={hasError["pob"] ? "withError" : ""}
            disabled
          />
          {hasError["pob"] && <span>{hasError["pob"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="tipo_publi">Tipo: </label>
          <select
            disabled={tiposPubli.length === 1 || isDuplicated}
            className={hasError["tipo_publi"] ? "withError" : ""}
            id="tipo_publi"
            value={params["tipo_publi"]}
            onChange={(e) => handleOnChangeInput("tipo_publi", e.target.value)}
          >
            {tiposPubli.map((tipo) => {
              return (
                <option value={tipo.codi} key={tipo.codi}>
                  {tipo.descrip}
                </option>
              );
            })}
          </select>
          {hasError["tipo_publi"] && <span>{hasError["tipo_publi"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="feature">Hora: </label>
          <input
            type="time"
            id="hora"
            value={params["hora"]}
            onChange={(e) => handleOnChangeInput("hora", e.target.value)}
            className={hasError["hora"] ? "withError" : ""}
            step="2"
          />
          {hasError["hora"] && <span>{hasError["hora"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="mate">Cod. Material: </label>
          <input
            type="number"
            id="mate"
            value={params["mate"]}
            onChange={(e) => handleOnChangeInput("mate", e.target.value)}
            className={`with-button ${hasError["mate"] ? "withError" : ""}`}
          />
          <input
            type="button"
            className="input-button"
            value={"Buscar"}
            onClick={handleMateOnChange}
          />
          {hasError["mate"] && <span>{hasError["mate"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="nombre">Nombre Material: </label>
          <input
            type="text"
            id="nombre"
            maxLength="100"
            onChange={(e) => handleOnChangeInput("nombre", e.target.value)}
            value={params.nombre}
            className={hasError["nombre"] ? "withError" : ""}
          />
          {hasError["nombre"] && <span>{hasError["nombre"]}</span>}
        </div>
        <div className="form-item">
          <label htmlFor="cliente_razon">Cliente: </label>
          <input
            type="text"
            id="cliente_razon"
            maxLength="100"
            onChange={(e) =>
              handleOnChangeInput("cliente_razon", e.target.value)
            }
            value={params.cliente_razon}
            className={hasError["cliente_razon"] ? "withError" : ""}
          />
          {hasError["cliente_razon"] && (
            <span>{hasError["cliente_razon"]}</span>
          )}
        </div>
        <div className="form-item">
          <label htmlFor="obser">Observaciones: </label>
          <textarea
            id="obser"
            row="5"
            maxLength="100"
            onChange={(e) => handleOnChangeInput("obser", e.target.value)}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="button-submit">
            {loading ? <Loader /> : "GUARDAR"}
          </button>
          <button
            onClick={backToListView}
            className="button-submit"
            style={{ marginLeft: "16px" }}
          >
            {loading ? <Loader /> : "CANCELAR"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtisticaForm;
