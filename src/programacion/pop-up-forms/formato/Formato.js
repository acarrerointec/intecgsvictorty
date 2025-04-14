import React, { useState, useEffect } from "react";
import "./Formato.scss";
import ListingWindow from "../listingWindow/ListingWindow";
import axiosApi from "../../../../axiosApi";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import useMessageBox from "../../../hooks/useMessageBox";

const initialData = [];

const Formato = ({ initialShow, salirCBF,onMediaTraker=false }) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  //const [sending, setSending] = useState(false);
  const [show, setShow] = useState(initialShow);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    getFormatData();
  }, []);

  const getFormatData = async () => {
    const { epi } = show;
    const api = await axiosApi();
    const { data } = await api.get(`formato/${epi}`);
    setLoadStatus(() => {
      return { completed: true };
    });

    const hasError = !data.message.success;
    if (hasError) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }
    setData(data.model);
  };

  return (
    <>
      <ListingWindow
        onMediaTraker={onMediaTraker}
        headers={
          <tr className="listing-window__row__cabecera">
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "orden" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Orden</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ubicacion" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Ubicación
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Tipo" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Tipo</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Origen" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Origen
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Total" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Total</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Duración" }}
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
              style={{ gridArea: "Impu" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Impu</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Diferencia" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Diferencia
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "Observaciones" }}
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
          </tr>
        }
        title="Formato"
        show={show}
        rows={
          data.length > 0
            ? data.map((el, i) => <FormatoItem el={el} key={i} />)
            : null
        }
        salirCBF={salirCBF}
        loadStatus={loadStatus}
      />
    </>
  );
};

const FormatoItem = ({ el }) => {
  return (
    <tr className="listing-window__row">
      <td style={{ gridArea: "orden" }}>
        {el.orden}
        <wbr />
      </td>
      <td style={{ gridArea: "ubicacion" }}>
        {el.ubi}
        <wbr />
      </td>
      <td style={{ gridArea: "Tipo" }}>
        {el.Tipo}
        <wbr />
      </td>
      <td style={{ gridArea: "Origen" }}>
        {el.Ori}
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "Total" }}
      >
        {el.Total}
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "Duración" }}
      >
        {el.Durac}
        <wbr />
      </td>
      <td className="listing-window__cell__center" style={{ gridArea: "Impu" }}>
        {el.Impu}
        <wbr />
      </td>
      <td
        className="listing-window__cell__center"
        style={{ gridArea: "Diferencia" }}
      >
        {el.Dife}
        <wbr />
      </td>
      <td
        className="listing-window__cell__left max_width"
        style={{ gridArea: "Observaciones" }}
      >
        {el.Observaciones}
        <wbr />
      </td>
    </tr>
  );
};

export default Formato;
