import React from 'react';
import './ComparadorMenu.scss';
import MenuInfoAdicional from '../GrillaProgra/MenuInfoAdicional/MenuInfoAdicional';
// import refreshImg from '../../../images/refresh.png';

function ComparadorMenu({ handleRefresh, handleReferenceCBF = () => {} }) {
  return (
    <div className="grilla-progra__grilla-nav">
      <div className="grilla-progra__info-adicional">
        <MenuInfoAdicional />
      </div>
      <div className="grilla-progra__nav-reference">
        <div className="grilla-progra__nav-reference-switch" onClick={handleReferenceCBF}>?</div>
      </div>
      {/* <div className="grilla-progra__nav-reference">
        <div className="grilla-progra__nav-reference-switch refresh" onClick={handleRefresh}>
          <img src={refreshImg} height="30px" width="30px" alt="Recargar pagina"/>
        </div>
      </div> */}
    </div>
  )
}

export default ComparadorMenu;
