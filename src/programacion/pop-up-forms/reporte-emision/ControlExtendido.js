import React, { useState, useEffect } from 'react';
import icon from '../../../../images/icons/bell_w.png';
import iconRed from '../../../../images/icons/bell_r.png';

const ControlExtendido = ({ pOpcion, onChangeCBF }) => {
  const [opcion, setOpcion] = useState(pOpcion);
  const [opcionesJSX, setOpcionesJSX] = useState(null);

  useEffect(() => {
    setOpcion(pOpcion);
    if (opcion.extendido_opciones)
      setOpcionesJSX(() => opcion.extendido_opciones.map((el, i) => {
        return (
          <option key={`${i}`} value={el}>{el}</option>
        )
      })
      )
  }, [pOpcion])

  const handleSiChange = (e) => {
    e.persist();
    setOpcion(prev => { return { ...prev, valor: e.target.checked, valor_extendido: opcion.defaultExtendido } });
  }

  const handleNoChange = (e) => {
    e.persist();
    setOpcion(prev => { return { ...prev, valor: !e.target.value } });
  }

  const handleTimeChange = (e) => {
    e.persist();
    setOpcion(prev => { return { ...prev, valor_extendido: e.target.value } });
  }

  useEffect(() => {
    onChangeCBF(opcion)
  }, [opcion.valor, opcion.valor_extendido])

  const tipoExtendido = () => {
    if (opcion.usar_extendido === 'd')
      return 'date';
    else if (opcion.usar_extendido === 't')
      return 'time';
    else if (opcion.usar_extendido === 's')
      return 'text';
  }

  const checkDefaultValue = ()=>{
    const {valor, valor_default} = opcion
    //validar null o vacio por que viene en true o false
    if(valor !== '' && valor !== null) return valor
    return valor_default
  }

  return (
    <div className="reporte-emision__detalle-opcion">
      <div className="reporte-emision__detalle-icon-space">
        <img alt="" src={opcion.obligatorio ? iconRed : icon} className="reporte-emision__detalle-icon" title={opcion.obligatorio ? "Dato obligatorio" : ""} />
      </div>
      <div className="reporte-emision__detalle-opcion-label">
        {opcion.descrip}
      </div>
      <div className="reporte-emision__detalle-opcion-body">
        <div> SI </div>
        <div>
          <input type="radio" name={opcion.descrip} value={true} checked={checkDefaultValue()} onChange={handleSiChange} />
        </div>
        <div> NO </div>
        <div>
          <input type="radio" name={opcion.descrip} value={false} checked={!checkDefaultValue()} onChange={handleNoChange} />
        </div>
        <div>
          {opcion.usar_extendido ?
            opcion.usar_extendido === 'o' ?
              <select disabled={opcion.valor === false ? false : true} value={opcion.valor_extendido} onChange={handleTimeChange} >
                <option key={`00`} value="">Selecciona...</option>
                {opcionesJSX}
              </select>
              :
              <input type={tipoExtendido()} disabled={opcion.valor === false ? false : true} value={opcion.valor_extendido} onChange={handleTimeChange} />
            : null
          }
        </div>
      </div>
    </div>
  )
}

export default ControlExtendido;