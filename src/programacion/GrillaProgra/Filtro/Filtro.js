import React, { useState, useEffect } from 'react';
import './Filtro.scss';
import Combo from '../../../combos/Combo';

const Filtro = ({ filtroProgra, actualizarGrillaCBF, visibility, hideCBF }) => {
  var mounted = true;
  const [visible, setVisible] = useState(false);
  const [fechaRef, setFechaRef] = useState(filtroProgra.fechaRef);
  const [canal, setCanal] = useState(filtroProgra.canal);
  const [senial, setSenial] = useState(filtroProgra.snial);

  useEffect(() => {
    if (mounted)
      setVisible(visibility);
    return () => mounted = false;
  }, [visibility]);

  useEffect(() => {
    if (mounted) {
      setFechaRef(filtroProgra.fechaRef);
      setCanal(filtroProgra.canal);
      setSenial(filtroProgra.senial);
    }
    return () => mounted = false;
  }, [filtroProgra]);

  const handleCanalChange = (e) => {
    e.persist();
    let val = e.target.options[e.target.selectedIndex].value;
    setCanal(val.toString().trim());
  }

  const handleSenialChange = (e) => {
    e.persist();
    let val = e.target.options[e.target.selectedIndex].value;
    setSenial(val.toString().trim());
  }

  const handleFechaChange = (e) => {
    e.persist();
    let value = Date.parse(e.target.value);
    let min = Date.parse(e.target.min);
    let max = Date.parse(e.target.max);
    if (!Number.isNaN(value)) {
      if (min < value && value < max) {
        setFechaRef(() => new Date(e.target.value + 'T00:00:00'));
      }
    }
  }

  const handleAplicarClick = (e) => {
    let response = {
      fechaRef: fechaRef,
      canal: canal,
      senial: senial
    };
    actualizarGrillaCBF(response);
  }

  const handleFinalizarClick = (e) => {
    handleAplicarClick(e);
    hideCBF();
  }

  const handleSalirClick = (e) => {
    hideCBF();
  }

  const handleClickOutside = (e) => {
    if (e.target.id === 'filtro__wrapper')
      hideCBF();
  }

  return (
    <div id="filtro__wrapper" className={`filtro__wrapper ${visible ? 'filtro__wrapper__visible' : ''}`} onClickCapture={handleClickOutside}>
      <div className="filtro__form">
        <div className="filtro__form-titulo">
          <div>
            FILTRO PROGRAMACION
          </div>
        </div>
        <div className="filtro__form-canal">
          <div>
            <label htmlFor="canal">Canal</label>
          </div>
          <div>
            <Combo id="canal" comboNombre="canal" pValue={canal} returnFn={handleCanalChange} placeHolder="Seleccione..." />
          </div>
        </div>
        <div className="filtro__form-senial">
          <div>
            <label htmlFor="senial">Señal</label>
          </div>
          <div>
            <Combo id="senial" comboNombre="senial" pValue={senial} returnFn={handleSenialChange} placeHolder="Seleccione..." filterValArr={[canal]} />
          </div>
        </div>
        <div className="filtro__form-fecha">
          <div>
            <label htmlFor="fecha">Fecha</label>
          </div>
          <div>
            <input type="date" id="fecha" min="2000-01-01" max="2050-01-01" value={global.util.fechaHTML(fechaRef)} onChange={handleFechaChange} />
          </div>
        </div>
        <div className="filtro__form-botones">
          <div>
            <button onClick={handleAplicarClick}>Aplicar</button>
          </div>
          <div>
            <button onClick={handleFinalizarClick}>Finalizar</button>
          </div>
          <div>
            <button onClick={handleSalirClick}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filtro;