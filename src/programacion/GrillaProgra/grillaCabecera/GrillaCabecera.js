import React, { useState, useEffect } from 'react';
import './GrillaCabecera.scss';
import { useProgramacionState } from '../../../contexts/ProgramacionContext';
import MenuAsRun from '../../pop-up-forms/listadoAsRun/MenuAsRun'
import { actionTypes, useTracked } from '../../../contexts/CeldaMenuContext';
import {useGrillaData} from '../../../contexts/grilla-data-context'

function GrillaCabecera({ arrTitles, columnType = ""}) {
  const [grillaCabeceraJSX, setGrillaCabeceraJSX] = useState([]);
  const [state] = useProgramacionState()
  const [, dispatch] = useTracked();
  const grillaData = useGrillaData()

  const handleGrillaAuxiliarSalir = (delay) => {
    if (!delay)
    delay = 0
    setTimeout(() =>
    dispatch({ type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET, payload: null })
    , delay);
  }
  
  const handleContextMenu = (e, channel) => {
    const isDaily = grillaData.state.grillaType === 'diaria'
    // se formatea el channel como fecha por que en la cabecera semanal no viene el canal sino la fecha
    const weeklyDateSliced = channel.split('/')
    const dateFormated = isDaily ? grillaData.state.fechaRef : `${weeklyDateSliced[2]}-${weeklyDateSliced[1]}-${weeklyDateSliced[0]}`
    const channelFormated = isDaily ? channel : `${grillaData.state.filtro.canal}-${grillaData.state.filtro.senial}`
    e.preventDefault();
    dispatch({ type: actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET, payload: <MenuAsRun channel={channelFormated} date={dateFormated} salirCBF={handleGrillaAuxiliarSalir} /> });
  }

  useEffect(() => {
    setGrillaCabeceraJSX(() => arrTitles.map((x, index) => {
      return (
        <div 
        className={`grilla-cabecera__item-cabecera ${columnsIsVisible(x.substring(x.length - 1)) ? "" : "grilla-cabecera__item-cabecera__hide"}`}
        key={index}
        onContextMenu={(e)=>handleContextMenu(e, x)}
        >{x}</div>
      )
    }));
  }, [arrTitles, state.topMenuConfig])

  const columnsIsVisible = (senial) => {
    if (columnType !== "diaria")
      return true
    return state.topMenuConfig.find(el => el.senial === senial.trim() && el.estado === "true")
  }

  return (
    <>
      {grillaCabeceraJSX}
    </>
  )
}

export default GrillaCabecera;

