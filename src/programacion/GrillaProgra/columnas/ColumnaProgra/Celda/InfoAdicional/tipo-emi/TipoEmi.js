import React from "react";
import "./TipoEmi.scss";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const TipoEmi = ({ lts }) => {
  return (
    <div className="info-adicional__tipo-emi__wrapper ">
      <Tippy content={lts}>
        <div
          className="info-adicional__tipo-emi__giggle"
          style={colorTipoEmi(lts)}
        >
          {lts.substring(0, 1) == "D" ? "A" : lts.substring(0, 1)}
        </div>
      </Tippy>
    </div>
  );
};

const colorTipoEmi = (tipoEmi) => {
  const style = {
    color: '#eee',
    backgroundColor: '#000'
  }
  switch (tipoEmi) {
    case 'Vivo':
      style.backgroundColor = '#a00'
      break;
    case 'Diferido':
      style.backgroundColor = '#ffe800'
      style.color = '#000'
      
      break;
    case 'Grabado':
      style.backgroundColor = '#070'
      break;
    case 'Repetición':
      style.backgroundColor = '#05a'
      break;
    case 'Short Turnaround':
      style.backgroundColor = '#0cd'
      style.color = '#000'
      break;
  }
  return style;
}

export default TipoEmi;
export {colorTipoEmi};
