import React, { useState, useEffect } from "react";
import "./ListingWindow.scss";
import icoSalir from "../../../../images/icons/window-close.png";
import icoHelp from "../../../../images/icons/window-help.png";
import HelpWindow from "../../../helpWindow/HelpWindow";
import { FiCopy } from "react-icons/fi";
import useCopyToClipboard from "../../../hooks/useCopyToClipboard";
import ChannelCommands from "../channelCommands/ChannelCommands";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const ListingWindow = ({
  title,
  show,
  salirCBF,
  headers,
  rows,
  loadStatus,
  addStyle,
  helpUrlJson,
  channel,
  date,
  totalDuration,
  actions,
  toggleView = true,
  secondaryComponent,
  disabledDrag = false,
  channelCommands=false,
  setShow=()=>{},
  onMediaTraker=false
}) => {
  const [value, copy] = useCopyToClipboard();
  const [saliendo, setSaliendo] = useState(false);
  const [pathImg, setPathImg] = useState(
    show.depor &&
      `${
        // eslint-disable-next-line no-undef
        REACT_APP_IMAGES_BASE_URL
      }programLogos/${show.depor.trim()}_${show.progra.trim()}.png`
  );
  const [helpVisible, setHelpVisible] = useState(false);
  const [timeoutEpiError, setTimeoutEpiError] = useState(null);
  const [hasActiveTimeout, setHasActiveTimeout] = useState(false)


  useEffect(() => {
    setHasActiveTimeout(true)
    return ()=> {
      hasActiveTimeout && clearTimeout(timeoutEpiError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[timeoutEpiError])

  function epiErrorHandler() {
    const timeoutId = setTimeout(salirCBF, 5000);
    setTimeoutEpiError(timeoutId);
  }


  //SALIR
  const handleSalirClick = () => {
    setSaliendo(true);
    setTimeout(salirCBF, 350);
  };
  // HELP
  const handleHelpClick = () => {
    // show help
    setHelpVisible((prev) => !prev);
  };

  // eslint-disable-next-line no-undef
  let baseUrl = REACT_APP_IMAGES_BASE_URL;
  let pathImgFallBack1 =
    show.depor && `${baseUrl}sportLogos/${show.depor.trim()}.png`;
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
  };

  useEffect(() => {
    window.$("#listing-window__frame").resizable();
  }, []);

  useEffect(() => {
    window.$("#listing-window__frame").draggable({ disabled: disabledDrag });
  }, [disabledDrag]);

  const hasEmptyData = (data) => {
    if (!data) return !data;
    return data.length === 0;
  };

  return (
    <div
      className={`listing-window__wrapper ${
        saliendo ? "listing-window__hide" : ""
      } ${
        onMediaTraker ? "onMediaTraker" : ""
      }`}
    >
      <img
        style={{ height: "0px", width: "0px" }}
        src={pathImg}
        alt=""
        onError={handleError}
      />
      <div
        className="listing-window__frame"
        id="listing-window__frame"
        style={addStyle ? addStyle : null}
      >
        <div
          className="listing-window__bg show-ease-50"
          style={{
            backgroundImage: `url(${pathImg})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "auto 100%",
            backgroundPosition: "center center",
            backgroundBlendMode: "multiply",
          }}
        ></div>
        <div className="listing-window__body">
          <div className="listing-window__cabecera">
            <div
              className="listing-window__titulo_1"
              style={{
                backgroundImage: `url(${pathImg}) `,
              }}
            ></div>
            <div
              className="listing-window__titulo_2"
              style={{ alignItems: "center" }}
            >
              {show.epi ? (
                <>
                  <div className="codigo-largo-1">
                    {global.util.soloFecha(show.fecha_hora_ini)}
                  </div>
                  &nbsp;&nbsp;
                  <div className="codigo-largo-3">{`${show.canal} - ${show.senial}`}</div>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <div className="codigo-largo-2">{`${show.iniHHMM} - ${show.finHHMM}`}</div>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <div className="codigo-largo-3">
                    {show.progra_codi}
                    <Tippy content={"Copiar código"}>
                      <div
                        className="listing-window__copy-button"
                        onClick={() => copy(show.progra_codi)}
                      >
                        <FiCopy />
                      </div>
                    </Tippy>
                  </div>
                </>
              ) : (
                <>
                  <div className="channel">{channel}</div>
                  <div className="senial">{date}</div>
                </>
              )}
            </div>
            <div className="listing-window__titulo_3">
              <div>
                {title}
                {totalDuration && (
                  <div className="listing-window__titulo-total-duration">
                    <div>Tanda: {totalDuration.tanda}</div>
                    <div>Artistica: {totalDuration.artistica}</div>
                  </div>
                )}
              </div>
              {actions && (
                <div
                  className="actions-section"
                  style={{ alignItems: "flex-end" }}
                >
                  {actions.map((action) => {
                    const { onClick, label, icon } = action;
                    return (
                      <div
                        className="action-button"
                        onClick={() => onClick()}
                        key={label}
                      >
                        {icon && <img src={icon} alt="icono del boton" />}
                        {label}
                      </div>
                    );
                  })}
                  {channelCommands && (
                    <div>
                      <ChannelCommands
                        show={show}
                        setShow={setShow}
                        epiErrorHandler={epiErrorHandler}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {toggleView ? (
            <div
              className="listing-window__grilla"
              style={{
                opacity: `${loadStatus.completed ? "1" : "0"}`,
              }}
            >
              <table className="listing-window__table">
                <tbody>
                  {headers}
                  {rows}
                </tbody>
              </table>
              {hasEmptyData(rows) ? (
                <div className="empty-data">
                  No hay datos disponibles para este programa
                </div>
              ) : null}
            </div>
          ) : (
            secondaryComponent
          )}
        </div>
        <div className="listing-window__botones">
          {helpUrlJson ? (
            <img
              className="listing-window__btn-help"
              src={icoHelp}
              onClick={handleHelpClick}
              alt=""
            />
          ) : null}
          <img
            className="listing-window__btn"
            src={icoSalir}
            onClick={handleSalirClick}
            alt=""
          />
        </div>
      </div>
      {helpVisible ? (
        <HelpWindow helpUrlJson={helpUrlJson} closeCbf={handleHelpClick} />
      ) : null}
      {timeoutEpiError && (
        <div className="disabled-form-error">
          Error: espisodio no encontrado.
        </div>
      )}
    </div>
  );
};

export default ListingWindow;
