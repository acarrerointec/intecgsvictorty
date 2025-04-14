import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import ListingWindow from "../listingWindow/ListingWindow";

const SpotsEmitidos = ({ show, salirCBF,onMediaTraker=false }) => {
  const [contenidoJSX, setContenidoJSX] = useState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => (mounted = false);
  }, [show.emi_epi]);

  const getData = async () => {
    try {
      let url = "spots-emitidos/" + show.emi_epi;
      const api = await axiosApi();
      const result = await api.get(url);
      const data = await result.data.model;
      setLoadStatus({
        completed: true,
      });
      setContenidoJSX(
        data.map((el, i) => {
          return (
            <tr key={`material-row-${i}`} className="listing-window__row">
              <td>
                {el.corte}
                <wbr />
              </td>
              <td>
                {el.tipo}
                <wbr />
              </td>
              <td>
                {el.orden}
                <wbr />
              </td>
              <td>
                {el.mate}
                <wbr />
              </td>
              <td className="listing-window__cell__left">
                {el.nombre}
                <wbr />
              </td>
              <td>
                {el.tipo_publi}
                <wbr />
              </td>
              <td>
                {el.dura_real}
                <wbr />
              </td>
              <td>
                {el.hora_emi}
                <wbr />
              </td>
              <td className="listing-window__cell__left">
                {el.status}
                <wbr />
              </td>
              <td className="listing-window__cell__left">
                {el.cliente}
                <wbr />
              </td>
              <td className="listing-window__cell__left">
                {el.marca}
                <wbr />
              </td>
              <td>
                {el.ncs_ut_it}
                <wbr />
              </td>
              <td>
                {el.ncs_pob_id}
                <wbr />
              </td>
              <td>
                {el.ncs_prp_id}
                <wbr />
              </td>
            </tr>
          );
        })
      );
    } catch (err) {
      console.log("Error ListadoMateriales", err);
    }
  };

  return (
    <>
      {/*  */}
      <ListingWindow
        onMediaTraker={onMediaTraker}
        headers={
          <tr className="listing-window__row__cabecera">
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "corte" }}
            >
              Corte
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tipo" }}
            >
              Tipo
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "orden" }}
            >
              Orden
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate" }}
            >
              Mat
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "dura_real" }}
            >
              Nombre
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate_reci" }}
            >
              TP
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate_inges" }}
            >
              Dura Emi
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "cliente" }}
            >
              Hora Emi
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              Estado
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              Cliente
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              Marca
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              NCS UT ID
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              NCS POB
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "estado" }}
            >
              NCS PRP
            </td>
          </tr>
        }
        title="Spots Emitidos"
        show={show}
        rows={contenidoJSX}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
      />
    </>
  );
};

export default SpotsEmitidos;
