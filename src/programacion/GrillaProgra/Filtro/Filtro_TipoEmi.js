import React, { useState, useEffect, useContext } from 'react';
import './Filtro.scss';
import { setPreference } from '../../../contexts/context-functions';

const Filtro_TipoEmi = ({ pFechaRef, actualizarGrillaCBF, visibility, hideCBF }) => {
  var mounted = true;

  
  const [visible, setVisible] = useState(false);
  const [fechaRef, setFechaRef] = useState(pFechaRef);
  

  useEffect(() => {
    if (mounted)
      setVisible(visibility);
    return () => mounted = false;
  }, [visibility]);

  useEffect(() => {
    if (mounted) {
      setFechaRef(pFechaRef);
    }
    return () => mounted = false;
  }, [pFechaRef]);

  const handleFechaChange = (e) => {
    e.persist();
    let value = Date.parse(e.target.value);
    let min = Date.parse(e.target.min);
    let max = Date.parse(e.target.max);
    let fecha = new Date(e.target.value + 'T00:00:00');
    if (!Number.isNaN(value)) {
      if (min < value && value < max) {
        setFechaRef(() => fecha);
      }
    }
    setPreference({ modulo: "Filtro_TipoEmi", opcion: "fechaRef", descrip: "Fecha para Programación diaria", valor: global.util.fechaJS(fecha) });
  }

  
 

  const handleAplicarClick = (e) => {
    actualizarGrillaCBF(fechaRef);
  }

  const handleFinalizarClick = (e) => {
    handleAplicarClick(e);
    hideCBF();
  }

  const handleSalirClick = (e) => {
    hideCBF();
  }

  const handleClickOutside = (e) => {
    if (e.target.id == 'filtro__wrapper')
      hideCBF();
  }

  return (
    <div id="filtro__wrapper" className={`filtro__wrapper ${visible ? 'filtro__wrapper__visible' : ''}`} onClickCapture={handleClickOutside}>
      <div className="filtro__form__fecha">
        <div className="filtro__form-titulo">
          <div>
            FILTRO PROGRAMACION
          </div>
        </div>
        <div className="filtro__form-fecha">
          <div>
            <label htmlFor="fecha">Fecha</label>
          </div>
          <div >
            <input type="date" id="fecha" min="2000-01-01" max="2050-01-01" value={global.util.fechaHTML(fechaRef)}  onChange={handleFechaChange} />
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

export default Filtro_TipoEmi;