import React, { useState, useEffect } from "react";
import "./GenerarPlaylist.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import {
  useGlobalState,
  actionTypes,
  messageTypes,
} from "../../../contexts/GlobalConstext";
import Loader from "../../../Loader/Loader";
import moment from "moment";

const generarPLaylist = {
  canal: "",
  senial: "",
  fecha_emi: "",
};

const GenerarPLaylist = ({ show, salirCBF, hasPermission }) => {
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [formData, setData] = useState(generarPLaylist);
  const [sending, setSending] = useState(false);
  const [channelList, setChannelList] = useState(null);
  const [senialList, setSenialList] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedSenial, setSelectedSenial] = useState(null);
  const [isValidDate, setIsValidDate] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    let url = `canales-combo-diario`;
    const api = await axiosApi();
    const { data } = await api.get(url);

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
    setChannelList(data.model);
    if (data.model) {
      setSelectedChannel(data.model[0].codi.trim());
    }
    setLoadStatus({ completed: true });
  };

  const getSenialList = async () => {
    let url = `combos/senial/${selectedChannel}`;
    const api = await axiosApi();
    const { data } = await api.get(url);

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
    setSenialList(data.model);
    if (data.model) {
      setSelectedSenial(data.model[0].codi.trim());
    }
  };

  useEffect(() => {
    selectedChannel && getSenialList();
  }, [selectedChannel]);

  function row(tag, data, className = "") {
    return (
      <div className={`generar-playlist__row ${className}`}>
        <div className="generar-playlist__tag">{tag}</div>
        <div className="generar-playlist__data">{data}</div>
      </div>
    );
  }

  const validarObligatorios = () =>
    formData &&
    formData.fecha_emi !== "" &&
    selectedSenial.length > 0 &&
    selectedChannel.length > 0;

  const handleSaveClick = async (e) => {
    if (!hasPermission) return;
    setSending(true);
    let url = `play-list-genera-diario`;
    const formatedData = {
      ...formData,
      canal: selectedChannel,
      senial: selectedSenial,
    };
    const api = await axiosApi();
    const { data } = await api.post(url, formatedData);
    setSending(false);

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
    dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: "Generar PLaylist",
        message: "Se genero correctamente la playlist.",
        okCBF: salirCBF,
        type: messageTypes.INFO,
      },
    });
  };

  const handleChange = (e) => {
    setSelectedChannel(e.target.value);
  };

  const handleChangeSenial = (e) => {
    setSelectedSenial(e.target.value);
  };

  const onChangeDate = async (e, type) => {
    const selectDate = moment(e.target.value);
    const hoy = moment();
    if (selectDate) {
      const diff =
        hoy.isBefore(selectDate, "day") || hoy.isSame(selectDate, "day");
      setIsValidDate(diff);
    } else {
      setIsValidDate(false);
    }
    e.persist();
    setData((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const handleConfirm = () => {
    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: "Atención",
        message:
          "¿Está seguro que quiere generar esta playlist? Entienda que los cambios efectuados NO pueden deshacerse una vez generados.",
        okCBF: handleSaveClick,
        cancelCBF: () => {},
        type: messageTypes.ALERT,
      },
    });
  };

  const getMinDate = () => {
    const currentDate = new Date();
    return currentDate.toISOString().split("T")[0];
  };

  const formLayout = () => {
    return (
      <div className="generar-playlist__wrapper">
        <div className="generar-playlist__form">
          <div className="generar-playlist__form-body">
            {row(
              "Canal",
              <select onChange={handleChange}>
                {channelList &&
                  channelList.map((c) => {
                    return (
                      <option value={c.codi.trim()} key={c.codi.trim()}>
                        {c.descrip}
                      </option>
                    );
                  })}
              </select>
            )}
            {row(
              "Senial",
              <select onChange={handleChangeSenial}>
                {senialList &&
                  senialList.map((s) => {
                    return (
                      <option value={s.codi} key={s.codi}>
                        {s.descrip}
                      </option>
                    );
                  })}
              </select>
            )}
            {row(
              "Desde",
              <input
                type="date"
                id="desde"
                value={formData.fecha_emi}
                onChange={(e) => onChangeDate(e, "fecha_emi")}
                min={getMinDate()}
              />
            )}
            <div className="generar-playlist__row-buttons">
              <div>
                <div
                  className={`button shadow-left-down ${
                    validarObligatorios() && hasPermission && isValidDate
                      ? ""
                      : "disabled"
                  }`}
                  onClick={
                    !sending &&
                    validarObligatorios() &&
                    hasPermission &&
                    isValidDate
                      ? handleConfirm
                      : () => {}
                  }
                >
                  {sending ? <Loader /> : "GUARDAR"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FormWindow
      title="Generar Playlist"
      show={show}
      salirCBF={salirCBF}
      loadStatus={loadStatus}
      addStyle={{ maxHeight: "53.1rem" }}
    >
      {formLayout()}
    </FormWindow>
  );
};

export default GenerarPLaylist;
