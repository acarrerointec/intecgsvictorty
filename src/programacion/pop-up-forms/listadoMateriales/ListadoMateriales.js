import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import imageCheckSi from "../../../../images/checkmark-si.png";
import imageCheckNo from "../../../../images/checkmark-no.png";
import ListingWindow from "../listingWindow/ListingWindow";
import useMessageBox from "../../../hooks/useMessageBox";
import { useColumnFilter, Filter } from "../filter/useColumnFilter";

const ListadoMateriales = ({ show, salirCBF, onMediaTraker = false}) => {
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
            return <MaterialItem el={el} key={`material-row-${i}`} />;
          }
        })
      );
    }
    return () => (mounted = false);
  }, [data, hasChanged]);

  const getData = async () => {
    try {
      let url = "materiales/" + show.epi.toString();
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
      console.log("Error ListadoMateriales", err);
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
              style={{ gridArea: "codigo" }}
            >
              <Filter
                display="Código"
                fieldName="codigo"
                onChange={handleFilters}
                value={filters.get("codigo")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tipo_publi" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">TP</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "nombre" }}
            >
              <Filter
                display="Nombre"
                fieldName="nombre"
                onChange={handleFilters}
                value={filters.get("nombre")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "isci" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">ISCI</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "dura_real" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Duración
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate_reci" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Reci</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate_inges" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Inges</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "rubro" }}
            >
              <Filter
                display="Rubro"
                fieldName="rubro"
                onChange={handleFilters}
                value={filters.get("rubro")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "cliente" }}
            >
              <Filter
                display="Cliente"
                fieldName="cliente"
                onChange={handleFilters}
                value={filters.get("cliente")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "marca" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Marca</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Estado
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
          </tr>
        }
        title="Materiales"
        show={show}
        rows={contenidoJSX}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
      />
    </>
  );
};

const MaterialItem = ({ el }) => {
  return (
    <tr className="listing-window__row">
      <td style={{ gridArea: "codigo" }}>
        {el.codigo}
        <wbr />
      </td>
      <td style={{ gridArea: "tipo_publi" }}>
        {el.tipo_publi}
        <wbr />
      </td>
      <td className="listing-window__cell__left" style={{ gridArea: "nombre" }}>
        {el.nombre}
        <wbr />
      </td>
      <td style={{ gridArea: "isci" }}>
        {el.isci}
        <wbr />
      </td>
      <td
        className="listing-window__cell__right"
        style={{ gridArea: "dura_real" }}
      >
        {el.dura_real}
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "mate_reci" }}
      >
        <img alt="" src={el.mate_reci ? imageCheckSi : imageCheckNo} />
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "mate_inges" }}
      >
        <img alt="" src={el.mate_inges ? imageCheckSi : imageCheckNo} />
        <wbr />
      </td>
      <td style={{ gridArea: "rubro" }}>
        {el.rubro}
        <wbr />
      </td>
      <td style={{ gridArea: "cliente" }}>
        {el.cliente}
        <wbr />
      </td>
      <td style={{ gridArea: "marca" }}>
        {el.marca}
        <wbr />
      </td>
      <td style={{ gridArea: "estado" }}>
        {el.estado}
        <wbr />
      </td>
    </tr>
  );
};

export default ListadoMateriales;
