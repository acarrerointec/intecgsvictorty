import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import './GrillaPrograSemanal.scss';
import GrillaPrograMenuSemanal from './GrillaPrograMenu/GrillaPrograMenuSemanal';
import Filtro from './Filtro/Filtro';
import ColumnasSemanal from './columnas/ColumnasSemanal'
import GrillaCabecera from './grillaCabecera/GrillaCabecera';
import Reference from './reference/Reference';
import { getPreference, setPreference } from '../../contexts/context-functions';
import PopUpModules from "../../../pages/PopUpModules";
import {useGrillaData, grillaDataTypes} from '../../contexts/grilla-data-context'
import useInterval from "../../hooks/useInterval"

const GrillaPrograSemanal = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const grillaData = useGrillaData()
  const {filtro, cantColumnSemanal, fechaRef} = grillaData.state;
  const [refresh, setRefresh] = useState(0);

  const [referenciaVisible, setReferenciaVisible] = useState(false);

  useEffect(() => {
    if (grillaData.state.globalReloadData !== 0) {
      setRefresh(refresh+1)
    }
  }, [grillaData.state.globalReloadData]);

  useEffect(() => {
    if(isMobile) grillaData.dispatch({type: grillaDataTypes.SET_COLUMN_SEMANAL, payload:3 })
    const f = async () => {
      let fechaRef = await getPreference('grilla_progra', 'fechaRef');
      if (fechaRef === undefined || fechaRef === null || fechaRef === ''){
        fechaRef = new Date();
      }
      let canal = await getPreference('grilla_progra', 'canal');
      if (!canal)
        canal = '17';
      let senial = await getPreference('grilla_progra', 'senial');
      if (!senial)
        senial = 'A';
      grillaData.dispatch( {
        // temp si se quiere guardar la ultima fecha ingresada en las config de la base hay que arreglar el endpoint de las preferencias
        type: grillaDataTypes.SET_FILTROS, payload: { ...filtro, fechaRef: new Date(), canal: canal, senial: senial } 
        //type: grillaDataTypes.SET_FILTROS, payload: { ...filtro, fechaRef: new Date(fechaRef), canal: canal, senial: senial } 
      });
    }
    f();
  }, []);

  useEffect(() => {
    grillaData.dispatch({
      type: grillaDataTypes.SET_FECHA_ACTUAL,
      payload: { fecha: filtro.fechaRef },
    });
  }, [filtro.fechaRef]);

  useInterval(()=>{
    setRefresh(refresh+1)
  },1800000)

  const irAFechasAnteriores = (e) => {
    e.preventDefault()
    e.stopPropagation();
    let newDate = new Date(filtro.fechaRef);
    newDate.setDate(newDate.getDate() - cantColumnSemanal);
    setPreference({ modulo: "grilla_progra", opcion: "fechaRef", descrip: "", valor: global.util.fechaJS(newDate) });
    grillaData.dispatch( { type: grillaDataTypes.SET_FILTROS, payload: { ...filtro, fechaRef: newDate } });
  }

  const irAFechasSiguientes = (e) => {
    e.preventDefault()
    e.stopPropagation();
    let newDate = new Date(filtro.fechaRef);
    newDate.setDate(newDate.getDate() + cantColumnSemanal);
    setPreference({ modulo: "grilla_progra", opcion: "fechaRef", descrip: "", valor: global.util.fechaJS(newDate) });
    grillaData.dispatch( {type: grillaDataTypes.SET_FILTROS, payload: { ...filtro, fechaRef: newDate } });
  }

  const handleShowFilterClick = (e) => {
    setFilterVisible(() => !filterVisible);
  }

  const actualizarGrillaDesdeFiltroCBF = (filtroP) => {
    setPreference({ modulo: "grilla_progra", opcion: "fechaRef", descrip: "", valor: global.util.fechaJS(filtroP.fechaRef) });
    setPreference({ modulo: "grilla_progra", opcion: "canal", descrip: "", valor: filtroP.canal });
    setPreference({ modulo: "grilla_progra", opcion: "senial", descrip: "", valor: filtroP.senial });
    grillaData.dispatch( {
      type: grillaDataTypes.SET_FILTROS, 
      payload: {
        ...filtro,
        canal: filtroP.canal,
        senial: filtroP.senial,
        fechaRef: new Date(filtroP.fechaRef)
      }
    });
  }

  const handleReferencia = () => {
    setReferenciaVisible(prev => !prev);
  }

  const handleRefresh = () => {
    setRefresh(refresh+1)
  }

  const Fechas = () => {
    const fechasCabecera = [];

    let auxFechaRef = new Date(filtro.fechaRef);
    for (let i = 0; i < cantColumnSemanal; i++) {
      fechasCabecera.push(auxFechaRef.getDate().toString().padStart(2, '0') + '/' + (auxFechaRef.getMonth() + 1).toString().padStart(2, '0') + '/' + auxFechaRef.getFullYear().toString());
      auxFechaRef.setDate(auxFechaRef.getDate() + 1);
    }

    return fechasCabecera;
  }

  return (
    <div className="grilla-progra__wrapper">
      <GrillaPrograMenuSemanal filtro={filtro}
        irAFechasAnteriores={irAFechasAnteriores}
        irAFechasSiguientes={irAFechasSiguientes}
        filterClickCBF={handleShowFilterClick.bind(this)}
        handleReferenceCBF={handleReferencia}
        cantidadColumnas={cantColumnSemanal}
        handleRefresh={handleRefresh}
      />
      <div className={`${isMobile ? 'grilla-progra__fechas__mobile' : 'grilla-progra__fechas'}`} >
        <GrillaCabecera arrTitles={Fechas()} columnType="semanal" />
      </div>
      <ColumnasSemanal refresh={refresh} filtro={filtro} cantidadColumnas={cantColumnSemanal} />
      <div className="grilla-progra__boton-menu">
        <Filtro filtroProgra={filtro} visibility={filterVisible} actualizarGrillaCBF={actualizarGrillaDesdeFiltroCBF} hideCBF={() => setFilterVisible(() => false)} />
        <PopUpModules />
      </div>
      <div className="grilla-progra__horas">
        <Horas />
      </div>
      <Reference pVisible={referenciaVisible} visibleCBF={handleReferencia} />
    </div>
  )
}

export default GrillaPrograSemanal;

function Horas() {
  var horas = [];
  for (let h = 0; h < 24; h++) {
    horas.push(
      <div key={h} className="grilla-progra__horas-item">
        <div className="grilla-progra__horas-texto">
          {h.toString().padStart(2, '0')}
        </div>
        <div className="grilla-progra__horas-linea">
        </div>
      </div>
    )
  }
  return (
    <>
      {horas}
    </>
  )
}

