import React, { useState, useEffect } from 'react';
import './ColumnaProgra.scss';
import Celda from './Celda/Celda';
import Superposicion from './Superposicion/Superposicion';
import { useProgramacionState } from '../../../../contexts/ProgramacionContext';
import uuid from 'react-uuid'

const ColumnaProgra = ({ shows, columnType="" }) => {
  const [state, dispatch] = useProgramacionState();
  const contextMenuOffsetY = -90;
  let zIndex = 1;
  const coefAltura = .5;
  //SUPERPOSICION
  const superpuestos = [];
  const [superpuestosColumna, setSuperpuestosColumna] = useState([]);
  let bloqueSuperpos = [];
  let prevShow = null;
  let minSup = null;
  let maxSup = null;
  let cut = false;
  let [showList, setShowList] = useState(null);
  // es una lista de elementos de react
  let [superposicionList, setSuperposicionList] = useState(null);

  const fn = async () => {
    if (shows.length > 0) {
      setShowList(
        shows.map((show, index) => {
        // diferencia en milisegundos entre inicio y fin del show
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
        const lts = state.lts.opciones.find(el => el.codi === show.lts.trim());
        const celdaVisible = lts !== undefined ? lts.seleccionado : false;
        return (
          <Celda key={'celda' + uuid()} show={show} zIndex={zIndex} altura={altura} posicion={posicion} visible={celdaVisible} contextMenuOffsetY={contextMenuOffsetY} />
          );
        })
      );
    }else{setShowList([])}
    setSuperpuestosColumna(superpuestos)
  }

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fn();
    }
    return () => mounted = false;
  }, [shows, state.lts.opciones, (shows.length>0 ? shows[0].fecha_hora_ini: "")] )

  useEffect(() => {
    setSuperposicionList(superpuestosColumna.map((supBlock, index) => {
      return (
        <Superposicion key={'superpos' + uuid()} supBlock={supBlock} coefAltura={coefAltura} zIndex={zIndex} />
      )
    }));
  }, [superpuestosColumna])

  const columnsIsVisible = (senial) => {
    if (columnType !== "diaria") //Sólo se ocultan columnas en la grilla diaria
      return true
    return state.topMenuConfig.find(el => el.senial === senial?.trim() && el.estado === "true")
  }
  // if(!shows[0]) return;
  return (
    <div className={`columna-progra__wrapper ${columnsIsVisible(shows[0]?.senial) ? "" : "columna-progra__wrapper__hide"}`} >
      {showList}
      {superposicionList}
    </div>
  )
}

const crearItemSuperposicion = show => {
  return {
    epi: show.epi,
    codigoLargo: show.depor + ' ' + show.progra + "-" + show.show + "-" + show.emi + "-" + show.parte,
    titulo: show.iniHHMM + " - " + show.finHHMM + "·" + show.depor + show.progra + "-" + show.show + "-" + show.emi + "-" + show.parte,
    horaIni: show.iniHHMM,
    horaFin: show.finHHMM,
    fecha_hora_ini: show.fecha_hora_ini,
    fecha_hora_fin: show.fecha_hora_fin,
    continuara: show.continuara,
    continuacion: show.continuacion,
    show:show
  }
}

export default React.memo(ColumnaProgra);