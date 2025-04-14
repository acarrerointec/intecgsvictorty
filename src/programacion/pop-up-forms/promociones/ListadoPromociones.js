import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import imageCheckSi from "../../../../images/checkmark-si.png";
import imageCheckNo from "../../../../images/checkmark-no.png";
import ListingWindow from "../listingWindow/ListingWindow";
import useMessageBox from "../../../hooks/useMessageBox";
import { useColumnFilter, Filter } from "../filter/useColumnFilter";
import moment from "moment";

const ListadoPromociones = ({ show, salirCBF ,onMediaTraker= false}) => {
  const [contenidoJSX, setContenidoJSX] = useState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [data, setData, filters, setFilters, hasChanged, setHasChanged] =
    useColumnFilter();

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => (mounted = false);
  }, [show.epi]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setContenidoJSX(() =>
        data.map((el, i) => {
          if (i == data.length - 1)
            setLoadStatus(() => {
              return { completed: true };
            });

          let pass = true;

          if (filters.size > 0) {
            let mapIter = filters.entries();
            for (let i = 0; i < filters.size; ++i) {
              let pair = mapIter.next().value;
              let key = pair[0]; // key
              let textoFiltro = pair[1]; // Value
              if (textoFiltro === "") pass &= true;
              else {
                pass &= filter(el[key], textoFiltro);
              }
            }
          }

          if (pass) {
            return <PromoItem el={el} key={`promo-row-${i}`} />;
          }
        })
      );
    }
    return () => (mounted = false);
  }, [data, hasChanged]);

  const getData = async () => {
    try {
      const url = "PromocionesDisponibles/" + show.epi.toString();
      const api = await axiosApi();
      const { data } = await api.get(url);

      const { model, message } = await data;
      if (!message.success) {
        return showMessage({
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        });
      }
      setLoadStatus(() => {
        return { completed: true };
      });
      setData(model);
    } catch (err) {
      console.log("Error en listado de promociones", err);
    }
  };

  function filter(hay, needle) {
    if (!hay) return false;
    return (
      hay.toString().toLowerCase().indexOf(needle.toString().toLowerCase()) !==
      -1
    );
  }

  const handleFilters = (fieldName, value) => {
    if (value.trim() == "") filters.delete(fieldName);
    else filters.set(fieldName, value);
    setFilters(() => filters);
    setHasChanged((prev) => !prev);
  };

  return (
    <>
      <ListingWindow
        onMediaTraker={onMediaTraker}
        headers={
          <tr className="listing-window__row__cabecera">
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "cod" }}
            >
              <Filter
                display="Código"
                fieldName="cod"
                onChange={handleFilters}
                value={filters.get("cod")}
              />
            </td>
            {/* <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "av" }}
            >
              <Filter
                display="AV"
                fieldName="av"
                onChange={handleFilters}
                value={filters.get("av")}
              />
            </td> */}
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "baja" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Baja</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "duracion" }}
            >
              <Filter
                display="Duración"
                fieldName="duracion"
                onChange={handleFilters}
                value={filters.get("duracion")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ingestado" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                Inges
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "material" }}
            >
              <Filter
                display="Material"
                fieldName="material"
                onChange={handleFilters}
                value={filters.get("material")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "detalle" }}
            >
              <Filter
                display="Detalle"
                fieldName="detalle"
                onChange={handleFilters}
                value={filters.get("detalle")}
              />
            </td>
        
            {/* <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "esquema" }}
            >
              <Filter
                display="Esquema"
                fieldName="esquema"
                onChange={handleFilters}
                value={filters.get("esquema")}
              />
            </td> */}
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "observaciones" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Observaciones
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "pgm" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">PGM</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "prioridad" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Prioridad
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            {/* <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "recibido" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Recibido
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td> */}
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "sr" }}
            >
              <Filter
                display="SR"
                fieldName="sr"
                onChange={handleFilters}
                value={filters.get("sr")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tp" }}
            >
              <Filter
                display="TP"
                fieldName="tp"
                onChange={handleFilters}
                value={filters.get("tp")}
              />
            </td>
            {/* <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tp_descrip" }}
            >
              <Filter
                display="TP Descrip"
                fieldName="tp_descrip"
                onChange={handleFilters}
                value={filters.get("tp_descrip")}
              />
            </td> */}
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tope" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Tope</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "usadas" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Usadas
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "usadas_x_dia" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Usadas por día
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
          </tr>
        }
        title="Promociones"
        show={show}
        rows={contenidoJSX}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
      />
    </>
  );
};

const PromoItem = ({ el }) => {
  return (
    <tr className="listing-window__row">
      <td style={{ gridArea: "cod" }}>
        {el.cod}
        <wbr />
      </td>
      {/* <td style={{ gridArea: "av" }}>
        {el.av}
        <wbr />
      </td> */}
      <td style={{ gridArea: "baja" }}>
        {/**CAMBIAR FORMATO DE FECHA */}
        {el.baja && moment(el.baja).format("DD/MM/yyyy HH:MM")}
        <wbr />
      </td>
      <td style={{ gridArea: "duracion" }}>
        {el.duracion}
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "ingestado" }}
      >
        <img alt="" src={el.ingestado ? imageCheckSi : imageCheckNo} />
        <wbr />
      </td>
      <td
        className="listing-window__cell__left max_width"
        style={{ gridArea: "material" }}
      >
        {el.material}
        <wbr />
      </td>
      <td
        className="listing-window__cell__left max_width"
        style={{ gridArea: "detalle" }}
      >
        {el.detalle}
        <wbr />
      </td>
      
      {/* <td style={{ gridArea: "esquema" }}>
        {el.esquema}
        <wbr />
      </td> */}
  
      <td
        className="listing-window__cell__left max_width"
        style={{ gridArea: "observaciones" }}
      >
        {el.observaciones}
        <wbr />
      </td>
      <td style={{ gridArea: "pgm" }}>
        {el.pgm}
        <wbr />
      </td>
      <td style={{ gridArea: "prioridad" }}>
        {el.prioridad}
        <wbr />
      </td>
      {/* <td
        className="listing-window__cell__center"
        style={{ gridArea: "recibido" }}
      >
        <img alt="" src={el.recibido ? imageCheckSi : imageCheckNo} />
        <wbr />
      </td> */}
      <td style={{ gridArea: "sr" }}>
        {el.sr}
        <wbr />
      </td>
      <td style={{ gridArea: "tp" }}>
        {el.tp}
        <wbr />
      </td>
      {/* <td style={{ gridArea: "tp_descrip" }}>
        {el.tp_descrip}
        <wbr />
      </td> */}
      <td style={{ gridArea: "tope" }}>
        {el.tope}
        <wbr />
      </td>
      <td style={{ gridArea: "usadas" }}>
        {el.usadas}
        <wbr />
      </td>
      <td style={{ gridArea: "usadas_x_dia" }}>
        {el.usadas_x_dia}
        <wbr />
      </td>
    </tr>
  );
};

export default ListadoPromociones;
