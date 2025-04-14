import React, { useState, useEffect, useRef } from 'react';
import './Superposicion.scss';
import { useProgramacionState } from '../../../../../contexts/ProgramacionContext';
import uuid from 'react-uuid';
import CeldaContextMenu from '../../ColumnaProgra/Celda/context-menu/CeldaContextMenu';
import { actionTypes, useTracked } from '../../../../../contexts/CeldaMenuContext'
import { useOutsideClick } from '../../../../../hooks/useOutsideClick'

function Superposicion({ supBlock, coefAltura, zIndex }) {
  const [contenidoJSX, setContenidoJSX] = useState(<></>);
  const getData = () => {
    let d1 = new Date('2100-01-01T00:00:00');
    let d2 = new Date('1980-01-01T00:00:00');
    let newZIndex = 100;
    const contenido = [];
    let posicion_rem = '0rem';
    let altura_rem = '0rem';
    supBlock.forEach((sup, i) => {
      let className = 'superpos__contenido';
      if (i == supBlock.length - 1)
        className = 'superpos__footer';
        
        contenido.push({ className, horaIni: sup.horaIni, horaFin: sup.horaFin, codigoLargo: sup.codigoLargo, originalShow: sup.show, isOnComparador: !!sup.isOnComparador });
        
      let auxIni = new Date(sup.fecha_hora_ini);
      let auxFin = new Date(sup.fecha_hora_fin);

      if (d1 > auxIni)
        d1 = auxIni;
        if (d2 < auxFin)
        d2 = auxFin;
      let d1SinHora = global.util.fechaSinHora(d1);
      if (sup.continuacion) d1 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 0, 0, 0)
      if (sup.continuara) d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 23, 59, 59)
      let diffMs = (d2 - d1);
      let altura = (diffMs / 1000) / 86400 * 240 * coefAltura; // Segundos
      altura_rem = altura.toString() + 'rem';
      let posicion = (parseFloat(d1 - d1SinHora) / parseFloat(86400000) * parseFloat(100)) * 2.4 * coefAltura;
      posicion_rem = posicion.toString() + 'rem';
      newZIndex++;
    });
    setContenidoJSX(<CeldaSuperpos posicion_rem={posicion_rem} altura_rem={altura_rem} newZIndex={newZIndex} contenido={contenido} />);
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <div>
      {contenidoJSX}
    </div>
  )
}

const CeldaSuperpos = ({ posicion_rem, altura_rem, newZIndex, contenido }) => {
  const [state] = useProgramacionState();
  const [_, dispatch] = useTracked()
  const superposRef = useRef(null);
  const [contenidoJSX, setContenidoJSX] = useState([]);
  const [effects, setEffects] = useState("");
  const [isHover, setIsHover] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const refJustLoaded = useRef(true);
  const wrapperRef = useRef(null);

  useOutsideClick(superposRef, ()=>{setContextMenuOpen(false);setIsHover(false)});

  const colorTipoEmi = (tipoEmi) => {
    let color = "rgb(225, 225, 225)";
    switch (tipoEmi) {
      case 'Vivo':
         color = '#bb5250'
        break;
      case 'Diferido':
        color = '#faf083'
        break;
      default:
        return color
      }
      return color
  }

  const handleContextMenu = (e, show, isOnComparador) => {
    wrapperRef.current.click()
    e.preventDefault();
    let scrollTop = document.querySelector("#grilla-progra").scrollTop
    dispatch({type: actionTypes.CELDA_CONTEXT_MENU_SET, payload: <CeldaContextMenu show={show} x={e.pageX} y={scrollTop + e.pageY } offsetY={isOnComparador ? -120 : -80} />})
    setContextMenuOpen(true)
  }

  useEffect(() => {
    setContenidoJSX(contenido.map((el, i) => {
      return <div key={"sup-item-" + uuid()} className={`superpos__contenido`}>
        {el.horaIni + ' - ' + el.horaFin + ' · ' + el.codigoLargo}
        <div 
          className={`superpos__contenido__detalle${isHover ? " open" : ""}`} 
          style={{backgroundColor: colorTipoEmi(el.originalShow.lts)}}
          onContextMenu={(e) => handleContextMenu(e, el.originalShow, el.isOnComparador)}
          ref={wrapperRef}
          >
          <div title={el.originalShow.show_descrip} style={{fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
            {el.originalShow.show_descrip}
          </div>
          <div>{el.originalShow.lts}</div>
          <div>{el.originalShow.esta_progra_descrip}</div>
          <div>{el.originalShow.epi}</div>
        </div>
        </div>
    }));
  }, [isHover])

  useEffect(() => {
    //SI SE CAMBIÓ DE PANTALLA O SE VIENE DEL CAMBIO DE MENÚ INFO ADICIONAL
    if (state.infoAdicionalConfig.superposicion) {
      if (refJustLoaded.current)
        setEffects('superpos__wrapper__visible');
      else
        setEffects('superpos__wrapper__show');
    }
    else {
      if (refJustLoaded.current)
        setEffects('superpos__wrapper__hidden');
      else
        setEffects('superpos__wrapper__hide');
    }
    refJustLoaded.current = false;
  }, [state.infoAdicionalConfig.superposicion])

  return (
    <div ref={superposRef}
      className={`superpos__wrapper ${effects}${isHover ? " open-container" : ""}`}
      style={{
        top: posicion_rem, height: altura_rem, zIndex: newZIndex,
        animationDelay: (Math.random() / 4).toString() + 's'
      }}
      onMouseEnter={()=>setIsHover(true)}
      onMouseLeave={()=> {
        !contextMenuOpen && setIsHover(false)
      }}
      >
      <div className={`superpos__frame`}>
        <div className="superpos__titulo" >SUPERPOSICIÓN</div>
        {contenidoJSX}
      </div>
    </div>
  )
};

export default Superposicion;

