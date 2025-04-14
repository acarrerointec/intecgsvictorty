import React, { useState, useEffect, useRef } from 'react';
import './Filtro.scss';
import Combo from '../../../../combos/Combo';

const Filtro = ({ filtroProgra, actualizarGrillaCBF, visibility }) => {
  var mounted = true;
  const [visible, setVisible] = useState(true);
  const [canal, setCanal] = useState(filtroProgra.canal);
  const [senial, setSenial] = useState(filtroProgra.senial);

  const filtroRef = useRef(null);

  useEffect(() => {
    if (mounted)
      setVisible(visibility);
    return () => mounted = false;
  }, [visibility]);

  useEffect(() => {
    if (mounted) {
      setCanal(filtroProgra.canal);
      setSenial(filtroProgra.senial);
    }
    return () => mounted = false;
  }, [filtroProgra]);

  const handleCanalChange = (e) => {
    let val = e.currentTarget.options[e.currentTarget.selectedIndex].value;
    setCanal(val.toString().trim());
  }

  const handleSenialChange = (e) => {
    let val = e.currentTarget.options[e.currentTarget.selectedIndex].value;
    setSenial(val.toString().trim());
  }

  const handleAplicarClick = (e) => {
    let response = {
      canal: canal,
      senial: senial,
    };
    actualizarGrillaCBF(response);
  }

  const handleFinalizarClick = (e) => {
    handleAplicarClick(e);
    setVisible(false);
  }

  const showHide = (e) => {
    setVisible(() => !visible);
  }

  useEffect(() => {
    if (visible)
      filtroRef.current.className = "filtro__form filtro__form__visible";
    else
      filtroRef.current.className = "filtro__form";
  }, [visible])

  return (
    <div className="comprarador-filtro__wrapper">
      <div ref={filtroRef} className="filtro__form">
        <div className="filtro__form-titulo" onClickCapture={showHide}>
          <div>
            {canal != "" && senial != "" ? canal + ' - ' + senial : 'AGREGAR'}
          </div>
        </div>
        <div className="comprarador-filtro__body">
          <div className="filtro__form-canal">
            <div className="filtro__form-label">
              <label htmlFor="canal">Canal</label>
            </div>
            <div className="filtro__form-control">
              <Combo id="canal" comboNombre="canal" pValue={canal} returnFn={handleCanalChange} placeHolder="Seleccione..." />
            </div>
          </div>
          <div className="filtro__form-senial">
            <div className="filtro__form-label">
              <label htmlFor="senial">Señal</label>
            </div>
            <div className="filtro__form-control">
              <Combo id="senial" comboNombre="senial" pValue={senial} returnFn={handleSenialChange} placeHolder="Seleccione..." filterValArr={[canal]} />
            </div>
          </div>
          <div className="filtro__form-botones">
            <div>
              <button className="comprarador-filtro__button-ok" onClick={handleFinalizarClick}>OK</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filtro;
