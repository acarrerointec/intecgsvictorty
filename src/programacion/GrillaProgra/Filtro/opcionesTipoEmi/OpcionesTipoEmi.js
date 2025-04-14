import React, { useState, useEffect, useReducer, useContext } from 'react';
import { useProgramacionState, actionTypes } from '../../../../contexts/ProgramacionContext';
import './OpcionesTipoEmi.scss';

function OpcionesTipoEmi({ visible }) {
  const [state, dispatch] = useProgramacionState();

  const [opcionesJSX, setOpcionesJSX] = useState(<></>);

  const [ver, setVer] = useState(visible);


  useEffect(() => {
    setVer(visible);
  }, [visible])

  useEffect(() => {
    let mounted = true;
    const asyncFn = async () => {
      try {
        if (mounted) {
          const data = state.lts.opciones
          let payload = data.map((el) => {
            return (
              <div key={"CheckboxTipoEmi-" + el.codi} >
                <CheckboxTipoEmi pair={el} />
              </div>
            );
          })
          payload = [
            (<div key="CheckboxTipoEmi-sel" >
              SELECCIONE
            </div>)
            , ...payload];

          setOpcionesJSX(() => payload);
        }
      } catch (error) {
        console.log('Error', error)
      }
    }
    asyncFn();
    return () => mounted = false;
  }, [state.lts.opciones])

  return (
    <div className={`opciones-tipo-emi__wrapper ${ver ? 'opciones-tipo-emi__wrapper__in' : ''}`}>
      <div className="opciones-tipo-emi__center">
        <div className="opciones-tipo-emi__shadow">
          {opcionesJSX}
        </div>
      </div>
    </div >
  );
}
//)

//###############################################################################################

//const CheckboxTipoEmi = React.memo(
function CheckboxTipoEmi({ pair }) {  /* pair tcontiene codi, descrip y seleccionado:true/false */
  const [localState, setLocalState] = useState(pair.seleccionado);

  const [state, dispatch] = useProgramacionState();

  const handleChange = (e) => {
    let seleccionado = e.target.checked;
    setLocalState(seleccionado);
    const newPair = {
      codi: pair.codi,
      descrip: pair.descrip,
      explicacion: pair.explicacion,
      seleccionado: seleccionado
    }
    dispatch({ type: actionTypes.LTS_SET_OPCION, payload: newPair })
  }
  return (
    <div className="opciones-tipo-emi__item" title={pair.explicacion}>
      <div className="opciones-tipo-emi__item2">
        <input type="checkbox" checked={localState} id={pair.descrip} value={localState} onChange={handleChange} /><label htmlFor={pair.descrip}>{pair.descrip}</label>
      </div>
    </div>
  )
}
//)

export default OpcionesTipoEmi;