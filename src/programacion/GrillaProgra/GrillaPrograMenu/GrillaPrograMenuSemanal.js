import React from 'react';
import './GrillaPrograMenu.scss';
import FlechaNav from '../../../flecha-nav/FlechaNav';
import MenuInfoAdicional from '../MenuInfoAdicional/MenuInfoAdicional';
import imgFilter from '../../../../images/filter-button-64.png';
import { useProgramacionState } from '../../../contexts/ProgramacionContext';
import TipoEmi from '../columnas/ColumnaProgra/Celda/InfoAdicional/tipo-emi/TipoEmi';
import refreshImg from '../../../../images/refresh.png';

function GrillaPrograMenuSemanal({ filtro, irAFechasAnteriores, irAFechasSiguientes,handleRefresh, filterClickCBF, handleReferenceCBF, cantidadColumnas }) {
  const [state, dispatch] = useProgramacionState();
  let fecha = "";
  if (filtro != null) {
    fecha = global.util.soloFecha(filtro.fechaRef) + ' - ' + global.util.soloFecha(global.util.fechaSumaDias(filtro.fechaRef, cantidadColumnas - 1));
  }
  return (
    <div className="grilla-progra__grilla-nav">
      <div className="grilla-progra__flecha-izquierda">
        <FlechaNav accion={irAFechasAnteriores} direccion="izquierda" />
      </div>
      <div className="grilla-progra__flecha-derecha">
        <FlechaNav accion={irAFechasSiguientes} direccion="derecha" />
      </div>
      <div className="grilla-progra__flecha-centro">
        <div className="grilla-progra__grilla-filtro">
          <div className="grilla-progra__nav-boton-filtro" >
            <img className="grilla-progra__nav-boton-filtro-img" src={imgFilter} onClick={filterClickCBF.bind(this)} alt="" />
          </div>
          <div className="grilla-progra__nav-fecha-ref">{fecha}</div>
          <div className="grilla-progra__nav-canal">&nbsp;{filtro.canal}&nbsp;</div>
          <div className="grilla-progra__nav-senial">&nbsp;{filtro.senial}&nbsp;</div>
          <div className="grilla-progra__nav-tipo-emi">&nbsp;
            {state.lts.opciones.map(el => { if (el.seleccionado) return <TipoEmi key={`tipo-emi-${el.codi}`} lts={el.codi} />; else return null })}&nbsp;
          </div>
        </div>
      </div>
      <div className="grilla-progra__info-adicional">
        <MenuInfoAdicional />
      </div>
      <div className="grilla-progra__nav-reference">
        <div className="grilla-progra__nav-reference-switch" onClick={handleReferenceCBF}>?</div>
      </div>
      <div className="grilla-progra__nav-reference">
        <div className="grilla-progra__nav-reference-switch refresh" onClick={handleRefresh}>
          <img src={refreshImg} height="30px" width="30px" alt="Recargar pagina"/>
        </div>
      </div>
    </div>
  )
}

export default GrillaPrograMenuSemanal;
