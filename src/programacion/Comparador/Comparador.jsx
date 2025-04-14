import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import './Comparador.scss';
import ColumnaComparador from './columna/ColumnaComparador';
import ComparadorMenu from './ComparadorMenu'
import Reference from '../GrillaProgra/reference/Reference';

const Comparador = ({ pFechaRef }) => {
  const [referenciaVisible, setReferenciaVisible] = useState(false);
  const handleReferencia = () => {
    setReferenciaVisible(prev => !prev);
  }
  var horasJSX = [];
  for (let h = 0; h < 24; h++) {
    horasJSX.push(
      <div key={h} className="comparador__horas-item">
        <div className="comparador__horas-texto">
          {h.toString().padStart(2, '0')}
        </div>
        <div className="comparador__horas-linea">
        </div>
      </div>
    )
  }

  return (
    <div className="comparador__wrapper">
      <ComparadorMenu 
        handleReferenceCBF={handleReferencia}
      />
      <div className="comparador_horas">
        {horasJSX}
      </div>
      <div className="comparador__header">
      </div>
      <div className={`${isMobile ? 'comparador_body__mobile' : 'comparador_body'}`}>
        <div className="comparador_column">
          <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
        </div>
        <div className="column">
          <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
        </div>
        <div className="column">
          <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
        </div>
        {!isMobile ?
          <>
            <div className="column">
              <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
            </div>
            <div className="column">
              <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
            </div>
            <div className="column">
              <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
            </div>
            <div className="column">
              <ColumnaComparador pFechaRef={pFechaRef} filter={{ canal: '', senial: '' }} />
            </div>
          </>
          : null}
      </div>
      <Reference pVisible={referenciaVisible} visibleCBF={handleReferencia} />
    </div>
  )
}
export default Comparador;
