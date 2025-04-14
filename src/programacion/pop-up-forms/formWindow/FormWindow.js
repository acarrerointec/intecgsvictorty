import React, { useState, useEffect } from 'react';
import './FormWindow.scss';
import icoSalir from '../../../../images/icons/window-close.png';
import icoHelp from '../../../../images/icons/window-help.png';
import HelpWindow from '../../../helpWindow/HelpWindow';
import { FiCopy } from 'react-icons/fi';
import useCopyToClipboard from '../../../hooks/useCopyToClipboard';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const FormWindow = ({ title, show, loadStatus, salirCBF, addStyle, helpUrlJson, children, actions, disabledDrag = false,select ,onMediaTraker =false}) => {
  const [value, copy] = useCopyToClipboard()
  const [saliendo, setSaliendo] = useState(false);
  // eslint-disable-next-line no-undef
  const [pathImg, setPathImg] = useState(show ? `${REACT_APP_IMAGES_BASE_URL}programLogos/${show?.depor?.trim()}_${show?.progra?.trim()}.png` : null);
  const [helpVisible, setHelpVisible] = useState(false)

  // SALIR
  const handleSalirClick = () => {
    setSaliendo(true);
    setTimeout(salirCBF, 350);
  }
  // HELP
  const handleHelpClick = () => {
    // show help
    setHelpVisible(prev => !prev)
  }

  // eslint-disable-next-line no-undef
  let baseUrl = REACT_APP_IMAGES_BASE_URL;
  let pathImgFallBack1 = show ? `${baseUrl}sportLogos/${show?.depor?.trim()}.png` : null;
  let pathImgFallBack2 = `${baseUrl}programLogos/no-logo.png`;

  let errAtemptCount = 0;
  const handleError = (e) => {
    if (errAtemptCount === 0) {
      e.target.src = pathImgFallBack1;
      setPathImg(pathImgFallBack1);

    }
    if (errAtemptCount === 1) {
      e.target.src = pathImgFallBack2;
      setPathImg(pathImgFallBack2);
    }
    errAtemptCount++;
  }

  /**
   * Runs first time when component is mounted
  */
  useEffect(() => {
    window.$("#form-window__frame").resizable();
  }, []);

  useEffect(() => {
    window.$("#form-window__frame").draggable({disabled: disabledDrag});
  }, [disabledDrag]);


  return (
    <div className={`form-window__wrapper ${saliendo ? 'form-window__hide' : ''} ${
      onMediaTraker ? "onMediaTraker" : ""
    }`}>
      {pathImg && <img style={{ height: '0px', width: '0px' }} src={pathImg} alt="" onError={handleError} />}
      <div id="form-window__frame" className="form-window__frame" style={addStyle ? addStyle : null} >
        <div className="form-window__bg show-ease-50" style={{ backgroundImage: `url(${pathImg})`, backgroundRepeat: 'no-repeat', backgroundSize: 'auto 100%', backgroundPosition: 'center center', backgroundBlendMode: 'multiply' }} >
        </div>
        <div className="form-window__body">
          <div className="form-window__cabecera">
            <div className="form-window__titulo_1"
              style={{
                backgroundImage: `url(${pathImg}) `
              }}
            >
            </div>
            {show && <div className="form-window__titulo_2">
              <div className="row1">
                <div className="codigo-largo-1">{global.util.soloFecha(show.fecha_hora_ini)}</div>
                &nbsp;&nbsp;
                <div className="codigo-largo-3">{show.canal} - {show.senial}</div>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <div className="codigo-largo-2">{`${show.iniHHMM} - ${show.finHHMM}`}</div>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <div className="codigo-largo-3">
                  {show.progra_codi}
                  <Tippy content={"Copiar código"}>
                    <div className="listing-window__copy-button" onClick={() => copy(show.progra_codi)}>
                      <FiCopy/>
                    </div>
                  </Tippy>  
                </div>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <div>
                  Tipo: &nbsp;<div className="attr-descrip">{show.tipo_emi_descrip ? show.tipo_emi_descrip : show.tipo_emi ? show.tipo_emi : '-' }</div>
                </div>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <div>
                  Estado:&nbsp;<div className="attr-descrip">{show.estado_descrip ? show.estado_descrip : show.esta_progra_descrip ? show.esta_progra_descrip : '-'}</div>
                </div>
              </div>
              <div className="row2">
                <div>
                  <div>
                    {show.emitido ? "Emitido" : "Pautado"}
                  </div>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <div className="attr-descrip">{show.show_descrip}</div>
                </div>
              </div>
            </div>}
            <div className="form-window__titulo_3">
              {title}
              {actions && (
                <div className="actions-section">
                  {actions.map((action) => {
                    const { onClick, label, icon, disabled } = action;
                    return (
                      <div
                        className={`action-button ${!!disabled && 'button-disabled'}`}
                        onClick={()=> onClick()}
                        key={label}
                      >
                        {icon && <img src={icon} alt="icono del boton"/>}
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
              {select && (
                <div className="actions-section">
                  {select}
                </div>
              )}
            </div>

          
          </div>
          <div className="form-window__content" style={{
            /*backgroundImage: `url(${pathImg})`,*/
            opacity: `${loadStatus.completed ? '1' : '0'}`,
          }}>
            {children}
          </div>
        </div>
        <div className="form-window__botones">
          
          {helpUrlJson ? <img className="form-window__btn-help" src={icoHelp} onClick={handleHelpClick} alt="" /> : null}
          <img className="form-window__btn" src={icoSalir} onClick={handleSalirClick} alt="" />
        </div>
      </div>

      {helpVisible ? <HelpWindow helpUrlJson={helpUrlJson} closeCbf={handleHelpClick}/> : null}
    </div >
    
  )
}

 
export default FormWindow;
