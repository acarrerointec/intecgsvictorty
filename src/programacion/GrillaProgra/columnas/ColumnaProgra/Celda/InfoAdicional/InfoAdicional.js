import React, { useState, useEffect } from "react";
import "./InfoAdicional.scss";
import { useProgramacionState } from "../../../../../../contexts/ProgramacionContext";
import EstadoPrograma from "../../../../../estadoPrograma/EstadoPrograma";
import TipoEmi from "./tipo-emi/TipoEmi";
import SegmentacionTag from "./segmentacion/SegmentacionTag";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import AlternativoTag from "./alternativoTag/AlternativoTag";

const iconosMasInfo = require.context("../../../../../../../images/masInfo");

const InfoAdicional = ({ show }) => {
  const [state, dispatch] = useProgramacionState();
  const [contentJSX, setContentJSX] = useState();
  const [loading, setLoading] = useState(true);
  // When p.tipo_emi = 'L' Then 'Vivo'
  // When p.tipo_emi IN ('S','A') Then 'Diferido'
  // When (p.tipo_emi = 'T' AND p.Emi = 0) Then 'Grabado'
  // When (UPPER(p.tipo_emi) = 'T' AND p.Emi <> 0) Then 'Repetición'
  // When (UPPER(p.tipo_emi) = 'H') Then 'Short Turnaround'
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (state.infoAdicionalConfig === undefined) setContentJSX(<></>);
      else
        setContentJSX(
          <div className="info-adicional__body">
            {state.infoAdicionalConfig.estadoMateriales &&
            (!show.esta_mate || show.tiene_mate) ? (
              <div className="info-adicional__esta-mate">
                <Tippy
                  content={
                    !show.esta_mate ? "Faltan Materiales" : "Tiene Materiales"
                  }
                >
                  <div className="info-adicional__esta-mate__mask">
                    <div className="info-adicional__esta-mate__anim">
                      {!show.esta_mate ? (
                        <>
                          <img
                            src={iconosMasInfo("./material_04.png")}
                            alt=""
                          />
                          <img
                            src={iconosMasInfo("./material_04.png")}
                            alt=""
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={iconosMasInfo("./material_yes.png")}
                            alt=""
                          />
                          <img
                            src={iconosMasInfo("./material_yes.png")}
                            alt=""
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Tippy>
              </div>
            ) : null}
            {state.infoAdicionalConfig.tieneGuias && show.guias ? (
              <div className="info-adicional__tiene-guias">
                <div className="info-adicional__bg">
                  <Tippy
                    content={show.guias}
                    interactiveBorder={20}
                    delay={100}
                  >
                    <div className="info-adicional__giggle" />
                  </Tippy>
                </div>
              </div>
            ) : null}
            {state.infoAdicionalConfig.tieneRepoTecnico &&
            show.tiene_repo_tecnico_error ? (
              <div className="info-adicional__tiene-repo_tecnico">
                <Tippy content="Tiene Error Reporte Técnico">
                  <div className="info-adicional__tiene-repo_tecnico__giggle_error"></div>
                </Tippy>
              </div>
            ) : state.infoAdicionalConfig.tieneRepoTecnico &&
              show.tiene_repo_tecnico ? (
              <div className="info-adicional__tiene-repo_tecnico">
                <Tippy content="Tiene Reporte Técnico">
                  <div className="info-adicional__tiene-repo_tecnico__giggle"></div>
                </Tippy>
              </div>
            ) : null}
            {state.infoAdicionalConfig.estadoPrograma &&
            show.esta_progra != null ? (
              <div
                className="info-adicional__esta-progra"
                title={show.esta_progra_descrip}
              >
                <Tippy content={show.esta_progra_descrip}>
                  <EstadoPrograma
                    estadoProgra={show.esta_progra_web}
                    colorFondo={show.esta_progra_web_color}
                  />
                </Tippy>
              </div>
            ) : null}
            {state.infoAdicionalConfig.tipoEmision ? (
              <TipoEmi lts={show.lts} />
            ) : null}
            {state.infoAdicionalConfig.segmentacion ? (
              <SegmentacionTag segmentId={show.tiene_segmentacion} />
            ) : null}
            {state.infoAdicionalConfig.alternativo ? (
              <AlternativoTag tieneAlternativo={show.tiene_senial_u} />
            ) : null}
          </div>
        );
      setLoading(() => false);
    }
    return () => (mounted = false);
  }, [state.infoAdicionalConfig]);

  return <div className="info-adicional__wrapper">{contentJSX}</div>;
};

export default React.memo(InfoAdicional);
