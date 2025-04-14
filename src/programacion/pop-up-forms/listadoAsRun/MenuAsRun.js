import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import ListingWindow from "../listingWindow/ListingWindow";
import useMessageBox from "../../../hooks/useMessageBox";
import { useColumnFilter, Filter } from "../filter/useColumnFilter";
import moment from "moment";

const MenuAsRun = ({ channel, salirCBF, date }) => {
  const [contenidoJSX, setContenidoJSX] = useState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [data, setData, filters, setFilters, hasChanged, setHasChanged] =
    useColumnFilter();

  const formatedDate = date && moment(date).format("YYYY-MM-DD");
  const formatedChannel = channel && channel.split("-");

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => (mounted = false);
  }, [channel]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setContenidoJSX(() =>
        data.map((el, i) => {
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
            return <MaterialItem el={el} key={`asrun-row-${i}`} />;
          }
        })
      );
    }
    return () => (mounted = false);
  }, [data, hasChanged]);

  const getData = async () => {
    try {
      let url = `InformacionAsrun/${
        formatedChannel[0] && formatedChannel[0].trim()
      }/${formatedChannel[1] && formatedChannel[1].trim()}/${formatedDate}`;
      const api = await axiosApi();
      const { data } = await api.get(url);

      const { model, message } = await data;
      setLoadStatus(() => {
        return { completed: true };
      });
      if (!message.success) {
        return showMessage({
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        });
      }
      setData(model);
    } catch (err) {
      console.log("Error MenuAsRun", err);
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
        headers={
          <tr className="listing-window__row__cabecera">
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "descripcion" }}
            >
              <Filter
                display="Descripción"
                fieldName="descripcion"
                onChange={handleFilters}
                value={filters.get("descripcion")}
                placeholder="Búsqueda por descripción"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "segmen" }}
            >
              <Filter
                display="Segmento"
                fieldName="segmen"
                onChange={handleFilters}
                value={filters.get("segmen")}
                placeholder="Búsqueda por segmento"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mediaName" }}
            >
              <Filter
                display="Media"
                fieldName="mediaName"
                onChange={handleFilters}
                value={filters.get("mediaName")}
                placeholder="Búsqueda por media"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "fecha" }}
            >
              <Filter
                display="Fecha"
                fieldName="fecha"
                onChange={handleFilters}
                value={filters.get("fecha")}
                placeholder="Búsqueda por fecha"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "fecha_et" }}
            >
              <Filter
                display="Fecha et"
                fieldName="fecha_et"
                onChange={handleFilters}
                value={filters.get("fecha_et")}
                placeholder="Búsqueda por fecha"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "dur_corte" }}
            >
              <Filter
                display="Duración corte"
                fieldName="dur_corte"
                onChange={handleFilters}
                value={filters.get("dur_corte")}
                placeholder="Búsqueda duración"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "episodio" }}
            >
              <Filter
                display="Episodio"
                fieldName="episodio"
                onChange={handleFilters}
                value={filters.get("episodio")}
                placeholder="Búsqueda por episodio"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ncs_episodio" }}
            >
              <Filter
                display="Ncs episodio"
                fieldName="ncs_episodio"
                onChange={handleFilters}
                value={filters.get("ncs_episodio")}
                placeholder="Búsqueda por ncs"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "prograCodi" }}
            >
              <Filter
                display="Cod. Programa"
                fieldName="prograCodi"
                onChange={handleFilters}
                value={filters.get("prograCodi")}
                placeholder="Búsqueda por progra cod."
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "fechaHoraIni" }}
            >
              <Filter
                display="Fecha Hora Inicio"
                fieldName="fechaHoraIni"
                onChange={handleFilters}
                value={filters.get("fechaHoraIni")}
                placeholder="Búsqueda por fecha/hora"
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "fechaHoraFin" }}
            >
              <Filter
                display="Fecha Hora Fin"
                fieldName="fechaHoraFin"
                onChange={handleFilters}
                value={filters.get("fechaHoraFin")}
                placeholder="Búsqueda por fecha/hora"
              />
            </td>
          </tr>
        }
        title="Información AsRun"
        channel={channel}
        date={formatedDate}
        show={{}}
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
      <td style={{ gridArea: "descripcion" }}>
        {el.descripcion}
        <wbr />
      </td>
      <td style={{ gridArea: "segmen" }}>
        {el.segmen}
        <wbr />
      </td>
      <td style={{ gridArea: "mediaName" }}>
        {el.mediaName}
        <wbr />
      </td>
      <td style={{ gridArea: "fecha" }}>
        {el.fecha && el.fecha.replace("T", " ")}
        <wbr />
      </td>
      <td style={{ gridArea: "fecha_et" }}>
        {el.fecha_et && el.fecha_et.replace("T", " ")}
        <wbr />
      </td>
      <td style={{ gridArea: "dur_corte" }}>
        {el.dur_corte}
        <wbr />
      </td>
      <td style={{ gridArea: "episodio" }}>
        {el.episodio}
        <wbr />
      </td>
      <td style={{ gridArea: "ncs_episodio" }}>
        {el.ncs_episodio}
        <wbr />
      </td>
      <td style={{ gridArea: "prograCodi" }}>
        {el.prograCodi}
        <wbr />
      </td>
      <td style={{ gridArea: "fechaHoraIni" }}>
        {el.fechaHoraIni && el.fechaHoraIni.replace("T", " ")}
        <wbr />
      </td>
      <td style={{ gridArea: "fechaHoraFin" }}>
        {el.fechaHoraFin && el.fechaHoraFin.replace("T", " ")}
        <wbr />
      </td>
    </tr>
  );
};

export default MenuAsRun;
