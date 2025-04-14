import React, { useState, useEffect } from "react";
import "./GrillaPrograMenu.scss";
import FlechaNav from "../../../flecha-nav/FlechaNav";
import MenuInfoAdicional from "../MenuInfoAdicional/MenuInfoAdicional";
import refreshImg from "../../../../images/refresh.png";
import imgEnter from "../../../../images/enter.png";
import { useProgramacionState } from "../../../contexts/ProgramacionContext";
import TipoEmi from "../columnas/ColumnaProgra/Celda/InfoAdicional/tipo-emi/TipoEmi";
import {
  useGrillaData,
  grillaDataTypes,
} from "../../../contexts/grilla-data-context";
import moment from "moment";

function GrillaPrograMenuDiaria({
  fechaRef,
  actualizarGrillaCBF,
  handleRefreshData,
  handleReferenceCBF,
}) {
  const [state] = useProgramacionState();
  const grillaData = useGrillaData();

  const [cfechaRef, setFechaRef] = useState(fechaRef);

  useEffect(() => {
    grillaData.dispatch({
      type: grillaDataTypes.SET_FECHA_ACTUAL,
      payload: { fecha: cfechaRef },
    });
    actualizarGrillaCBF(cfechaRef);
  }, [cfechaRef]);

  const [fechaloaded, setFechaLoaded] = useState(true);

  useEffect(() => {
    if (fechaloaded && typeof fechaRef !== "undefined") {
      setFechaRef(() => fechaRef);
    }
    return () => {};
  });

  const handleFechaChange = (e) => {
    e.persist();
    let value = Date.parse(e.target.value);
    let min = Date.parse(e.target.min);
    let max = Date.parse(e.target.max);
    let fecha = new Date(e.target.value + "T00:00:00");
    if (!Number.isNaN(value)) {
      if (min < value && value < max) {
        setFechaLoaded(false);
        setFechaRef(() => fecha);
      }
    }
  };

  if (cfechaRef == null) {
    setFechaRef(() => new Date());
  }

  const handleFechaKeyPress = (e) => {
    e.persist();
    if (e.which === 13) {
      let value = Date.parse(e.target.value);
      let min = Date.parse(e.target.min);
      let max = Date.parse(e.target.max);
      let fecha = new Date(e.target.value + "T00:00:00");
      if (!Number.isNaN(value)) {
        if (min < value && value < max) {
          setFechaLoaded(false);
          setFechaRef(() => fecha);
          actualizarGrillaCBF(fecha);
        }
      }
    }
  };

  const irAFechasAnteriores = (e) => {
    e.preventDefault();
    let newDate = new Date(fechaRef);
    newDate.setDate(newDate.getDate() - 1);
    setFechaLoaded(false);
    setFechaRef(newDate);
  };

  const irAFechasSiguientes = (e) => {
    e.preventDefault();
    let newDate = new Date(fechaRef);
    newDate.setDate(newDate.getDate() + 1);
    setFechaLoaded(false);
    setFechaRef(newDate);
  };

  const handleFechaSubmit = (e) => {
    e.persist();
    setFechaLoaded(true);
    actualizarGrillaCBF(cfechaRef);
  };

  return (
    <div className="grilla-progra__grilla-nav">
      <div className="grilla-progra__flecha-izquierda">
        <FlechaNav accion={irAFechasAnteriores} direccion="izquierda" />
      </div>
      <div className="grilla-progra__flecha-derecha">
        <FlechaNav accion={irAFechasSiguientes} direccion="derecha" />
      </div>
      <div className="grilla-progra__flecha-centro">
        <div className="grilla-progra__diaria-filtro">
          <div className="grilla-progra__nav-fecha-ref">
            <input
              type="date"
              id="fecha"
              className="grilla__fecha-ref-control"
              min="2000-01-01"
              max="2050-01-01"
              value={global.util.fechaHTML(cfechaRef)}
              onKeyPress={handleFechaKeyPress}
              onChange={handleFechaChange}
              style={{ visibility: "hidden", width: "1px" }}
            />
            <label
              onClick={() => {
                const element = document.getElementById("fecha");
                if (element) {
                  element.showPicker();
                }
              }}
              style={{cursor:"pointer"}}
            >
              {moment(grillaData.state.fechaActual).format("DD-MM-YYYY")}
            </label>
          </div>

          <div className="grilla-progra__nav-boton-filtro">
            <img
              className="grilla-progra__nav-boton-filtro-img"
              width="40px"
              height="30px"
              src={imgEnter}
              onClick={handleFechaSubmit}
              alt=""
            />
          </div>

          <div className="grilla-progra__nav-tipo-emi">
            &nbsp;
            {state.lts.opciones.map((el) => {
              if (el.seleccionado)
                return <TipoEmi key={`tipo-emi-${el.codi}`} lts={el.codi} />;
              else return null;
            })}
            &nbsp;
          </div>
          <div className="grilla-progra__nav-tipo-emi">
            &nbsp;
            {state.lts.opciones.map((el) => {
              if (el.seleccionado)
                return <TipoEmi key={`tipo-emi-${el.codi}`} lts={el.codi} />;
              else return null;
            })}
            &nbsp;
          </div>
        </div>
      </div>
      <div className="grilla-progra__info-adicional">
        <MenuInfoAdicional />
      </div>
      <div className="grilla-progra__nav-reference">
        <div
          className="grilla-progra__nav-reference-switch"
          onClick={handleReferenceCBF}
        >
          ?
        </div>
      </div>
      <div className="grilla-progra__nav-reference">
        <div
          className="grilla-progra__nav-reference-switch refresh"
          onClick={handleRefreshData}
        >
          <img
            src={refreshImg}
            height="30px"
            width="30px"
            alt="Recargar pagina"
          />
        </div>
      </div>
    </div>
  );
}

export default GrillaPrograMenuDiaria;
