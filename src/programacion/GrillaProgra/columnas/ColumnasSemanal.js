import React, { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { getDataGrillaProgra } from '../../programacionHeavyLifting';
import ColumnaProgra from './ColumnaProgra/ColumnaProgra';
import './Columnas.scss';
import { useProgramacion } from '../../../contexts/ProgramacionContext';
import useMessageBox from '../../../hooks/useMessageBox';
import {useGrillaData, grillaDataTypes} from '../../../contexts/grilla-data-context';
import axiosApi from "../../../../axiosApi";

function ColumnasSemanal({ filtro, cantidadColumnas, refresh }) {
  var mounted = false;
  const [showsListaDiasJSX, setShowsListaDiasJSX] = useState([]);
  const [grillaSwipeEffect, setGrillaSwipeEffect] = useState("");
  const [grillaSwipeEffectInOut, setGrillaSwipeEffectInOut] = useState({ in: "", out: "" });
  const [delay, setDelay] = useState(false);
  const grillaData = useGrillaData();
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();
  const {infoAdicionalConfig} = useProgramacion();


  const onGetDataError = msg=>{
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => { },
      type: messageTypes.ERROR,
    })
  }

  const getIntervalTime = async () => {
    const api = await axiosApi()
    const {data} = await api.get('/preferences/refresh')
    if(!data) return;
    grillaData.dispatch({type: grillaDataTypes.SET_INTERVAL_DELAY, payload: {delay: data.model}})
  }

  const wrapperRef = useRef();

  useEffect(() => {
    const {state} = grillaData
    if(state.data.length){
      const columnas = state.data.map((shows, i) => {
        return (
          <ColumnaProgra key={i} shows={shows} columnType="semanal"/>
        )
      })
      setShowsListaDiasJSX(() => columnas);
    }
  },[grillaData])

  useEffect(() => {
    setGrillaSwipeEffectInOut(() => ({ in: "grilla-progra__grilla__blur-in", out: "grilla-progra__grilla__blur-out" }));
    //getIntervalTime()
    return ()=>{
      grillaData.dispatch({type: grillaDataTypes.RESET_DATA})
    }
  }, [])

  function handleDelay(){
    setTimeout(() =>{
      setDelay(false)
    },500);
  }

  useEffect(() => {
    mounted = true;
    let timeout;

    if (mounted) {
      if ((filtro?.fechaRef !== undefined && filtro.canal && filtro.senial && !delay)|| refresh) {
        setDelay(true)
        setGrillaSwipeEffect(() => grillaSwipeEffectInOut.out);
        const asyncFn = async () => {
          await getData(filtro.fechaRef, filtro.canal, filtro.senial, cantidadColumnas);
          setGrillaSwipeEffect(() => grillaSwipeEffectInOut.in);
        }
        asyncFn();
        handleDelay();
      }
    }
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
    }
  }, [filtro.fechaRef, filtro.canal, filtro.senial, refresh])

  const getData = async (fechaRef, canal, senial, cantidadColumnas) => {
    const data = await getDataGrillaProgra(fechaRef, canal, senial, cantidadColumnas, onGetDataError,infoAdicionalConfig.emitido, infoAdicionalConfig.pautado);
    grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data, fechaRef, grillaType:'semanal'}});
  }

  return (
    <div ref={wrapperRef} className={`${isMobile ? 'grilla-progra__grilla__mobile' : 'grilla-progra__grilla'} ${grillaSwipeEffect}`}>
      {showsListaDiasJSX}
    </div>
  )
}

export default ColumnasSemanal;
