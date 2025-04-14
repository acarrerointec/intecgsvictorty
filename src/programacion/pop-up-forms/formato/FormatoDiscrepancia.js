import React, { useState, useEffect } from "react";
import "./Formato.scss";
import ListingWindow from "../listingWindow/ListingWindow";
import axiosApi from "../../../../axiosApi";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import useMessageBox from "../../../hooks/useMessageBox";

const FormatoDiscrepancia = ({ initialShow, salirCBF,onMediaTraker=false }) => {
  const [messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  //const [sending, setSending] = useState(false);
  const [show, setShow] = useState(initialShow);
  const [data, setData] = useState([]);
  const [columnsTable,setColumnsTable] = useState([])

  useEffect(() => {
    getDataDiscrepancia();
  }, []);

  useEffect(()=>{
    if(data && data.length > 0){
      const columns = Object.keys(data[0])      
      setColumnsTable(columns.filter((e)=> e !== "TieneDiscrepancia"))
    }
  },[data])

  const getDataDiscrepancia = async () => {
    const api = await axiosApi();
    const url= `discrepancia-formatos`
    const obj= {
      depor:show.depor,
      progra: show.progra,
      show: show.show,
      "fecha_hora_ini": show.fecha_hora_ini
  }
    const { data } = await api.post(url,obj);
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
            {columnsTable.map((nameColumn) => (
              <td
                className="listing-window__cell__cabecera"
                style={{ gridArea: nameColumn }}
                key={nameColumn}
              >
                <div className="listing-window__cell__cabecera__filler">
                  <div className="listing-window__cell__cabecera__top">
                    {nameColumn}
                  </div>
                  <div className="listing-window__cell__cabecera__bottom">
                    <wbr />
                  </div>
                </div>
              </td>
            ))}
          </tr>
        }
        title="Discrepancia"
        show={show}
        rows={
          data.length > 0
            ? data.map((el, i) => <FormatoItem el={el} key={i} columns={columnsTable} />)
            : null
        }
        salirCBF={salirCBF}
        loadStatus={loadStatus}
      />
    </>
  );
};

const FormatoItem = ({ el,columns, key }) => {
  return (
    <tr className="listing-window__row" >
      {columns.map((nameColumn) => (
        <td key={key} style={{ gridArea: nameColumn,color: el.TieneDiscrepancia === "True" ? "red" : "unset" }}>
          {el[nameColumn]}
          <wbr />
        </td>
      ))}
    </tr>
  );
};

export  {FormatoDiscrepancia};
