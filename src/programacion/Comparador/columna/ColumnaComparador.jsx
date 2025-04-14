import React, { useState, useEffect } from 'react';
import './ColumnaComparador.scss';
import Celda from '../../GrillaProgra/columnas/ColumnaProgra/Celda/Celda';
import Superposicion from '../../GrillaProgra/columnas/ColumnaProgra/Superposicion/Superposicion';
import { getDataGrillaProgra } from '../../programacionHeavyLifting';
import Filtro from './Filtro/Filtro';
import useMessageBox from '../../../hooks/useMessageBox';
import { useProgramacionState } from '../../../contexts/ProgramacionContext';
import uuid from 'react-uuid';

const ColumnaComparador = ({ pFechaRef, filter}) => {
  let mounted = true;
  const [state] = useProgramacionState();
  const contextMenuOffsetY = -130;
  const [localFilter, setLocalFilter] = useState(filter);
  const [showList, setShowList] = useState();
  const [shows, setShows] = useState([]);
  let zIndex = 1;
  const coefAltura = 1;
  //SUPERPOSICION
  const superpuestos = [];
  const [superpuestosColumna, setSuperpuestosColumna] = useState([]);
  let bloqueSuperpos = [];
  let prevShow = null;
  let minSup = null;
  let maxSup = null;
  let cut = false;
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();
  // es una lista de elementos de react
  let [superposicionList, setSuperposicionList] = useState(null);

  const onGetDataError = msg=>{
    showMessage({
      title: "Error",
      message: msg,
      okCBF: () => { },
      type: messageTypes.ERROR,
    })
  }

  useEffect(() => {
    mounted = true;
    if (localFilter != undefined && localFilter.canal != '' && localFilter.senial != '') {
      getData(localFilter.fechaRef, localFilter.canal, localFilter.senial);
    }
    return () => mounted = false;
  }, [localFilter])

  useEffect(() => {
    setLocalFilter(prev => { return { ...prev, fechaRef: pFechaRef } });
  }, [pFechaRef])

  const getData = async (fechaRef, canal, senial, columna) => {
    let mounted = true;
    const result = await getDataGrillaProgra(fechaRef, canal, senial, 1, onGetDataError, state.infoAdicionalConfig.emitido, state.infoAdicionalConfig.pautado);
    if (!mounted) return;
    if (result.length > 0)
      setShows(() => result[0]);
    else
      setShows(() => []);
  }

  useEffect(() => {
    if (shows != undefined) {
      const temp = shows.map((show, index) => {
        let diffMs = (show.d2 - show.d1);
        let altura = (diffMs / 1000) / 86400 * 240 * coefAltura; // Segundos
        let ceroHoras = new Date(show.d1.getFullYear(), show.d1.getMonth(), show.d1.getDate(), 0, 0, 0);
        let posicion = (parseFloat(show.d1 - ceroHoras) / parseFloat(86400000) * parseFloat(100)) * 2.4 * coefAltura;
        zIndex++;

        //SUPERPOSICION
        if (prevShow == null) {
          maxSup = show.d2;
          minSup = show.d1;
        } else {

          if (show.d1 >= maxSup) {
            minSup = show.d1;
            cut = true;
          }

          if (minSup < show.d2 && maxSup > show.d1) {
            if (superpuestos.length == 0 || cut) {
              bloqueSuperpos = [];
              bloqueSuperpos.push(crearItemSuperposicion(prevShow));
              bloqueSuperpos.push(crearItemSuperposicion(show));
              superpuestos.push(bloqueSuperpos);
              cut = false;
            } else {
              bloqueSuperpos.push(crearItemSuperposicion(show));
            }
            if (show.d2 >= maxSup) {
              minSup = show.d1;
              maxSup = show.d2;
            }
          } else {
            maxSup = show.d2;
          }
        }

        prevShow = show;
        return (
          <Celda key={uuid()} show={show} zIndex={zIndex} altura={altura} posicion={posicion} visible={true} contextMenuOffsetY={contextMenuOffsetY} />
        );
      });
      setShowList(() => temp);
    }
    setSuperpuestosColumna(superpuestos)
  }, [shows]);

  useEffect(() => {
    setSuperposicionList(superpuestosColumna.map((supBlock, index) => {
      return (
        <Superposicion key={'superpos' + uuid()} supBlock={supBlock} coefAltura={coefAltura} zIndex={zIndex} />
      )
    }));
  }, [superpuestosColumna])

  const actualizarGrillaDesdeFiltroCBF = (filter) => {
    setLocalFilter(prev => { return { ...prev, canal: filter.canal, senial: filter.senial } })
  }

  return (
    <div className="columna-comparador__wrapper">
      <div className="columna-comparador__filter">
        <Filtro filtroProgra={localFilter} visibility={false} actualizarGrillaCBF={actualizarGrillaDesdeFiltroCBF} />
      </div>
      <div className="columna-comparador__body">
        {showList}
        {superposicionList}
      </div>
    </div>
  )
}

const crearItemSuperposicion = show => {
  return {
    epi: show.epi,
    codigoLargo: show.depor + show.progra + "-" + show.show + "-" + show.emi + "-" + show.parte,
    titulo: show.iniHHMM + " - " + show.finHHMM + "·" + show.depor + show.progra + "-" + show.show + "-" + show.emi + "-" + show.parte,
    horaIni: show.iniHHMM,
    horaFin: show.finHHMM,
    fecha_hora_ini: show.fecha_hora_ini,
    fecha_hora_fin: show.fecha_hora_fin,
    continuara: show.continuara,
    continuacion: show.continuacion,
    show,
    isOnComparador: true
  }
}

export default ColumnaComparador;