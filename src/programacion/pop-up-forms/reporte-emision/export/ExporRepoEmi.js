import React, { useState, useEffect, memo, useMemo } from 'react';
import './ExporRepoEmi.scss';
import { Select } from '../../../../commons/Select';
import axiosApi from '../../../../../axiosApi';
import Loader from '../../../../commons/Loader';

const MemoExporRepoEmi = memo( function ExporRepoEmi({ reporteEmision, openStatus, exitCBF,show,rol, hasPermission}) {
  const [contentJSX, setContentJSX] = useState([]);
  const [valueSelectFormWindow, setValueSelectFormWindow] = useState(hasPermission ? rol : "")
  const [listRepoEmi, setListReporteEmision] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const afn = async () => {
      try{
        setIsLoading(true)
        let url = `reporte-emision-lista/${show.epi}/${valueSelectFormWindow || ""}`;
        const api = await axiosApi();
        const result = await api.get(url);
        const response = result.data;
        setIsLoading(false)
        
        if (response.model) {
          // let aux = response.model.slice(0, response.model.length - 1);
          let aux = response.model;
          setListReporteEmision(aux);
        };
      } catch ( e ) {
      setIsLoading(false)
      }
    }
    afn();
  }, [valueSelectFormWindow, reporteEmision]);
  
  const onChangeFormWindowSelect=(e)=>{
    setValueSelectFormWindow(Number(e.target.value))
  }

  useEffect(() => {
    if (listRepoEmi)
    setContentJSX(listRepoEmi.map(
      (el, ix) => {
        return (
          <div className="expor-repo__row" key={`repo-emi-${ix}`}>
            <div className="expor-repo__item expor-repo__row-nowrap">
              <div className="expor-repo__titulo">
                <div className="expor-repo__titulo1">
                  {el.fecha_hora
                    ? `${global.util.fechaDMYHMS(el.fecha_hora)} - ${
                        el.tipo_repo_descrip 
                      }`
                    : // :
                      // el.tipo_repo === 1 ?
                      //   "<Emisión (Histórico)>"
                      " "}
                </div>
                <div className="expor-repo__titulo2">
                  {el.usuario_red ? `(${el.usuario_red})` : ""}
                </div>
              </div>
            </div>
            <div>
              {el.detalle.map((el2, ix2) => {
                if (el2.valor !== null)
                  return (
                    <div
                      className="expor-repo__row-nowrap"
                      key={`repo-emi-detalle${ix2}`}
                    >
                      <div className="expor-repo__label">{el2.descrip}</div>
                      <div className="expor-repo__valor">
                        {el2.valor ? "SÍ" : "NO"}
                      </div>
                      {el2.valor_extendido ? (
                        <div className="expor-repo__valor">
                          {el2.valor_extendido}
                        </div>
                      ) : null}
                    </div>
                  );
              })}
            </div>
            <div className="expor-repo__texto">
              {el.texto
                ? el.texto.split("\n").map((el, ix) => {
                    return (
                      <span key={`repo-emi-span-${ix}`}>
                        {el}
                        <br />
                      </span>
                    );
                  })
                : "[SIN TEXTO]"}
            </div>
          </div>
        );
      }
    ));
  }, [listRepoEmi])

  function handleExit(e) {
    exitCBF();
  }

  return (
    <div
      className={`expor-repo__wrapper ${openStatus ? "expor-repo__show" : ""}`}
    >
      <div className="expor-repo__main-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: " center",
            padding: "0 10px",
            gap: " 10px",
          }}
        >
          <p>Reportado</p>
          <Select
            options={[
              { value: 0, label: "Todos" },
              { value: 1, label: "Operador" },
              { value: 2, label: "Coordinador" },
            ]}
            onChange={(e) => onChangeFormWindowSelect(e)}
            defaultValue={hasPermission ? rol : 0}
            withoutDefault
            isDisabled={isLoading}
          />
        </div>
        <div className="expor-repo__title">Consolidado</div>
        <div className="expor-repo__body">{contentJSX}</div>
        {isLoading &&<div className="expor-repo__loader">
          <Loader/>
        </div>}
      </div>
      <div className="expor-repo__side-bar">
        <div
          className={`expor-repo__side-bar__tab ${
            openStatus ? "expor-repo__side-bar__tab__invert" : ""
          }`}
          onClick={handleExit}
        >
          <div
            className={`expor-repo__side-bar__tab-icon ${
              openStatus ? "expor-repo__side-bar__tab-icon__invert" : ""
            }`}
          >
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
})

export default MemoExporRepoEmi;
