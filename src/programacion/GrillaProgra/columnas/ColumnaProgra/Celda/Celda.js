import React, { useRef, useEffect, useState, useMemo } from 'react';
import InfoAdicional from './InfoAdicional/InfoAdicional';
import './Celda.scss';
import CeldaContextMenu from '../../ColumnaProgra/Celda/context-menu/CeldaContextMenu';
import { actionTypes, useTracked } from '../../../../../contexts/CeldaMenuContext'
import { useOutsideClick } from '../../../../../hooks/useOutsideClick'
import uuid from 'react-uuid'

const Celda = ({ show, zIndex, altura, posicion, visible, contextMenuOffsetY = 0 }) => {
  const wrapperRef = useRef(null);
  const [state, dispatch] = useTracked();
  const [effects, setEffects] = useState("");
  const [isSelected, setIsSelected] = useState(false)

  const refJustLoaded = useRef(true);
  useOutsideClick(wrapperRef, () => setIsSelected(false))

  useEffect(() => {
    wrapperRef.current && wrapperRef.current.focus()
  }, []);

  let mouseIsClicked = false;
  let zIndexAlt = 0;

  const handleMouseEnter = (e) => {
    mouseIsClicked = !mouseIsClicked;
    if (mouseIsClicked) {
      wrapperRef.current.style.zIndex = 999;
      if (altura < 15) {
        wrapperRef.current.style.height = '15rem';
      }
    } else {
      wrapperRef.current.style.zIndex = zIndex;
      wrapperRef.current.style.height = altura + 'rem';
    }
  }
  const handleMouseLeave = (e) => {
    mouseIsClicked = false;
    wrapperRef.current.style.zIndex = zIndex;
    wrapperRef.current.style.height = altura + 'rem';
  }

  useEffect(() => {
    //${visible ? 'celda__wrapper__fade-in' : 'celda__wrapper__fade-out'} 
    let tmpEffects = "";
    if (visible) {
      if (refJustLoaded.current)
        tmpEffects = 'celda__wrapper__visible';
      else
        tmpEffects = 'celda__wrapper__fade-in';
    }
    else {
      if (refJustLoaded.current)
        tmpEffects = 'celda__wrapper__hidden';
      else
        tmpEffects = 'celda__wrapper__fade-out';
    }
    setEffects(tmpEffects);
    refJustLoaded.current = false;
  }, [visible])

  const codigoLargo = () => {
    //return show.iniHHMM + " - " + show.finHHMM + " · " + show.depor + show.progra + " - " + show.show + " - " + show.emi + " - " + show.parte;
    return show.iniHHMM + " - " + show.finHHMM + " · " + show.progra_codi;
  }

  const handleContextMenu = (e) => {
    wrapperRef.current.click()
    setIsSelected(true)
    e.preventDefault();
    let scrollTop = document.querySelector("#grilla-progra").scrollTop
    dispatch({type: actionTypes.CELDA_CONTEXT_MENU_SET, payload: <CeldaContextMenu show={show} x={e.pageX} y={scrollTop + e.pageY } offsetY={contextMenuOffsetY} />})
  }

  const duracion = (duraProg) => {
    let duraH = 0;
    let duraM = 0;
    let duraS = duraProg / 60;
    let dura = "";

    duraM = duraS % 60;
    duraH = Math.floor(duraS / 60);

    dura = `${duraH.toString().padStart(2, '0')}:${duraM.toString().padStart(2, '0')}`

    return dura;
  }

  const infoMemo = useMemo(() => {
    return (
      <div
        ref={wrapperRef}
        onMouseEnter={(event) => handleMouseEnter(event)}
        onMouseLeave={(event) => handleMouseLeave(event)}
        onContextMenu={handleContextMenu}
        className={`celda__wrapper 
        ${effects} 
        ${
          show.continuacion
            ? "celda__wrapper__continuacion"
            : show.continuara
            ? "celda__wrapper__continuara"
            : ""
        }
        ${isSelected ? "selected" : ""}
        `}
        key={uuid()}
        style={{
          zIndex: zIndex + zIndexAlt,
          height: altura + "rem",
          top: posicion.toString() + "rem",
          backgroundColor: colorTipoEmi(show.lts),
          //        transition: `opacity 3s`,
          /*opacity: `${visible ? '1' : '0.2'}`*/
          // backgroundImage: `url(${bgLogo})`,
          // backgroundBlendMode: "multiply",
          // backgroundSize: "30rem",
          // backgroundRepeat: "no-repeat",
          // backgroundPosition: "-0rem -0rem",
        }}

        //style={colorTipoEmi(show.lts)}
        //{show.depor + ' ' + show.progra + " - " + show.show + " - " + show.emi + " - " + show.parte}
      >
        <div className="celda__codigo-largo" title={codigoLargo()}>
          <p>{show.iniHHMM + "-" + show.finHHMM}&nbsp;</p>
          {show.progra_codi}
        </div>
        <div className="celda__show-descrip">
          <p>
            <ImageLogo depor={show.depor} progra={show.progra} isSelected={isSelected} />
            {show.show_descrip}
          </p>
        </div>
        <div className="celda__lts">&#7; {show.lts}</div>
        <div className="celda__dura-progra">
          {show.dura_prog ? ` Duración ${duracion(show.dura_prog)}` : ""}
        </div>
        <div className="celda__estado">
          {show.esta_progra_descrip ? " " + show.esta_progra_descrip : ""}
        </div>
        <div className="celda__epi">&#7; Episodio {show.epi}</div>
        <div className="celda__empty"></div>
        <div className="celda__info-adicional">
          <InfoAdicional show={show} />
        </div>
      </div>
    );
  }, [show,isSelected,effects]);

  return infoMemo;
}

const colorTipoEmi = (tipoEmi) => {
  var style = "";
  switch (tipoEmi) {
    case 'Vivo':
       style = '#bb5250'
      break;
    case 'Diferido':
      style = '#faf083'
      break;

    
  }
  return style;
}

export default React.memo(Celda);


const ImageLogo = React.memo(({ depor, progra,isSelected }) => {
  const [imageJSX, setImageJSX] = useState(<img className="celda__show-logo" src="" alt="" />);
  const refImg = useRef()

  useEffect(() => {
    let mounted = true;
    getImage(depor, progra);
    return () => mounted = false;
  }, [depor, progra])

  async function getImage(depor, progra) {
    try {
      // eslint-disable-next-line no-undef
      let baseUrl = REACT_APP_IMAGES_BASE_URL;
      let pathImg = `${baseUrl}programLogos/${depor.trim()}_${progra.trim()}.png`;
      let pathImgFallBack1 = `${baseUrl}sportLogos/${depor.trim()}.png`;
      let pathImgFallBack2 = `${baseUrl}programLogos/no-logo.png`;

      let errAtemptCount = 0;
      const handleError = (e) => {
        if (errAtemptCount === 0)
          e.target.src = pathImgFallBack1;
        else if (errAtemptCount === 1)
          e.target.src = pathImgFallBack2;
        else if (errAtemptCount > 1)
          e.target.src = "";
        errAtemptCount++;
      }

      const handleLoadComplete = (e) => {
        e.persist();
        if (e.target.complete === true) {
          refImg.current.className = 'celda__show-logo celda__show-logo__visible';}
      }

      setImageJSX(<img ref={refImg} className="celda__show-logo" src={pathImg} alt="" onError={handleError} onLoad={handleLoadComplete} />)
    } catch (err) {
      setImageJSX(<></>);
    }
  }

  return (
    <>
      {imageJSX}
    </>
  )
})


export { ImageLogo };