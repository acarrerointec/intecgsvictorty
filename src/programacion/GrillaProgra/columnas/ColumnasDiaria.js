import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getDataGrillaPrograTipoEmi } from '../../programacionHeavyLifting';
import ColumnaProgra from './ColumnaProgra/ColumnaProgra';
import {useGrillaData, grillaDataTypes} from '../../../contexts/grilla-data-context'
import useMessageBox from '../../../hooks/useMessageBox';
import { useProgramacionState } from '../../../contexts/ProgramacionContext';
import './Columnas.scss';
import axiosApi from "../../../../axiosApi";
import LoadingMask from '../../../commons/LoaderMask';

function ColumnasDiaria({ fechaRef, cabeceraCBF, refresh }) {
  var mounted = false;
  const [state] = useProgramacionState();
  const [showsListaDiasJSX, setShowsListaDiasJSX] = useState([]);
  //Se modifica por Loader
  // const [grillaSwipeEffect, setGrillaSwipeEffect] = useState("");
  // const [grillaSwipeEffectInOut, setGrillaSwipeEffectInOut] = useState({ in: "", out: "" });
  const grillaData = useGrillaData();
  const [delay, setDelay] = useState(false)
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();
  const [pageLoading, setPageLoading] = useState(false);


  const onGetDataError = msg=>{
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => { },
      type: messageTypes.ERROR,
    })
  }

  const wrapperRef = useRef();

  const getIntervalTime = async () => {
    const api = await axiosApi()
    const {data} = await api.get('/preferences/refresh')
    if(!data) return;
    grillaData.dispatch({type: grillaDataTypes.SET_INTERVAL_DELAY, payload: {delay: data.model}})
  }

  useEffect(() => {
    // setGrillaSwipeEffectInOut(() => ({ in: "grilla-progra__grilla__blur-in", out: "grilla-progra__grilla__blur-out" }));
    //getIntervalTime()
    return ()=>{
      grillaData.dispatch({type: grillaDataTypes.RESET_DATA})
    }
  }, [])

  const showListMemo = useMemo(() => {
    if (grillaData.state.data.length) {
      const columnas = grillaData.state.data.map((shows, i) => {
        return (
          <ColumnaProgra
            key={i}
            shows={shows}
            columnType="diaria"
            customStyle={{ background: "blue", flex: "1 1 auto" }}
          />
        );
      });
      // setShowsListaDiasJSX(() => columnas);
      return columnas
    } else {
      return []
      // setShowsListaDiasJSX([]);
    }
  }, [grillaData?.state?.data]);

  useEffect(() => {
    /* datos para la cabecera de la grilla */
    if(grillaData.state.data && grillaData.state.data[0] && grillaData.state.data[0].length){
      cabeceraCBF(grillaData.state.data.map(col => col[0].canal + ' - ' + col[0].senial));
    } else { 
      cabeceraCBF([])
    }
    // // armado de columnas por canal-senial
    // if(grillaData.state.data.length){
    //   const columnas = grillaData.state.data.map((shows,i) => {
    //     return (
    //       <ColumnaProgra key={i} shows={shows} columnType="diaria" customStyle={{ background: 'blue', flex: '1 1 auto' }} />
    //     )
    //   })
    //   setShowsListaDiasJSX(() => columnas);
    // } else {
    //   setShowsListaDiasJSX([])
    // }
  },[grillaData])

  function handleDelay(){
    setTimeout(() =>{
      setDelay(false)
    },300);
  }

  useEffect(() => {
    mounted = true;
    let timeout;

    if (mounted) {
      if ((fechaRef && !delay) || refresh) {
        setDelay(true)
        // setGrillaSwipeEffect(() => grillaSwipeEffectInOut.out);
        const asyncFn = async () => {
          await getData(fechaRef);
          setPageLoading(false)
        }
        asyncFn();
        handleDelay();
      }
    }
    return () => {
      mounted = false;
      clearTimeout(timeout);
    }
  }, [fechaRef, refresh])
  
  const getData = async (fechaRef) => {
    if (fechaRef !== null) {
      setPageLoading(true)
      const data = await getDataGrillaPrograTipoEmi(fechaRef, onGetDataError,state.infoAdicionalConfig.emitido, state.infoAdicionalConfig.pautado, grillaData.state.channelsGroups);
      // setGrillaSwipeEffect(() => grillaSwipeEffectInOut.in);
      if(data != null){
        grillaData.dispatch({type: grillaDataTypes.SET_GRILLA_DATA, payload: {data, fechaRef,grillaType: 'diaria'}});
      }
    }
  }

  return (
    <>
      {pageLoading && <LoadingMask />}
      <div ref={wrapperRef} className={`grilla-progra-tipo-emi__grilla`}>
        {showListMemo}
      </div>
    </>
  );
}

export default ColumnasDiaria;
