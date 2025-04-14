import React, { useState, useEffect } from "react";
import "./Segmentos.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import Bloques from "./Bloques";
import Loader from "../../../Loader/Loader";
import Historial from "./Historial";
import TablaDnD from "./TablaDnD";
import useMessageBox from "../../../hooks/useMessageBox";
import moment from "moment";
import uuid from "react-uuid";
// RC Time Picker
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";

let segmentosDefault = {
  deta: "",
  dura_real: 0,
  estado: null,
  fecha_regis: "",
  file_size: null,
  frame_rate: 60,
  drop_frame:0,
  grillaDer: null,
  grillaIzq: null,
  media_name: "",
  nombre: "",
  obser: "",
};
// al actualizar los default actualizar los obligatorios debajo
const versionDefault = {
  deta: "",
  obser: "",
  media: "",
  dura_ventana: "",
};

const camposObligatorios = ["deta", "dura_ventana"];

const Segmentos = ({ show, salirCBF, hasPermission,onMediaTraker=false }) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [data, setData] = useState(segmentosDefault);
  const [formData, setFormData] = useState(versionDefault);
  const [newVersionMode, setNewVersionMode] = useState(false);
  const [newVersionBloques, setNewVersionBloques] = useState([]);
  const [bloquesCurrentVersion, setBloquesCurrentVersion] = useState([]);
  const [hasBloquesChange, setHasBloquesChange] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [updatingBloques, setUpdatingBloques] = useState(false);
  const [deletingBloques, setDeletingBloques] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [duraTotal, setDuraTotal] = useState("00:00:00");
  const [loadStatus, setLoadStatus] = useState({ completed: false });

  //version history states
  const [dataHistory, setDataHistory] = useState([]);
  //media states
  const [mediaOptions, setMediaOptions] = useState([]);
  const [mediaOptionSelected, setMediaOptionsSelected] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [segmentsByMedia, setSegmentByMedia] = useState([]);
  //version states
  const [versionList, setVersionList] = useState([]);
  const [versionSelected, setVersionSelected] = useState(null);
  const [loadingVersion, setLoadingVersion] = useState(true);
  // update status
  const [updateMode, setUpdateMode] = useState(false);
  //time picker states
  const [dispatchTime, setDispatchTime] = useState(null);

  //time picker handler
  const handlePickerChange = (value) => {
    setDispatchTime(value);
    const formatValue = moment(value).format("HH:mm");
    handleChange("dura_ventana", value != null ? formatValue : "");
  };

  const setDateToUpdate = (hora) => {
    if (!hora) return setDispatchTime(null);
    var time = moment().toDate();
    time.setHours(hora.slice(0, 2));
    time.setMinutes(hora.slice(3, 5));
    setDispatchTime(moment(time));
  };

  function onUpdate() {
    // data y la version del historial no tienen los mismo datos
    if (!dataHistory || !dataHistory.length) return;
    const versionId = versionSelected;
    const version = dataHistory.filter((d) => d.IDVersion == versionId);
    if (!version.length) return;
    const currentVersion = version[0];
    const hora = currentVersion.ventana;
    setDateToUpdate(hora);
    const newFormData = {
      ...formData,
      dura_ventana: currentVersion.ventana || "",
      deta: currentVersion.Detalle ? currentVersion.Detalle.trim() : "",
      obser: currentVersion.Observaciones || "",
    };
    setFormData(newFormData);
    setNewVersionBloques(bloquesCurrentVersion);
    setUpdateMode(true);
  }

  useEffect(() => {
    getHistoryList();
    getMedia();
  }, []);

  useEffect(() => {
    if (mediaOptionSelected && !loadingMedia) {
      getVersionList();
      getSegmentsByMedia();
    }
  }, [mediaOptionSelected]);

  useEffect(() => {
    if (versionSelected && !loadingVersion) {
      getSegmentData();
    }
  }, [versionSelected]);

  const getSegmentsByMedia = async (mediaId) => {
    const api = await axiosApi()
    const { data } = await api.get(
      `segmentacion/${mediaId || mediaOptionSelected}/-1`
    );

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

    setSegmentByMedia(data.model.grillaIzq || []);
  };

  const getMedia = async () => {
    setLoadingMedia(true);
    const { depor, progra } = show;
    const api = await axiosApi()
    const { data } = await api.get(
      `segmentacionMediaList/${depor.trim()}/${progra.trim()}/${show.show}`
    );
    setLoadingMedia(false);
    setLoadStatus({ completed: true });
    const hasError = !data.message.success;
    if (hasError) {
      dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
      return null;
    }
    setMediaOptions(data.model);
    if (data.model && data.model.length > 0) {
      setMediaOptionsSelected(data.model[0].media);
      return data.model[0].media;
    }
    return null;
  };

  const getVersionList = async (mediaId) => {
    setLoadingVersion(true);
    const api = await axiosApi()
    const { data } = await api.get(
      `segmentacionVersionList/${mediaId || mediaOptionSelected}`
    );
    setLoadingVersion(false);

    const hasError = !data.message.success;
    if (hasError) {
      dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
      return null;
    }

    setVersionList(data.model);
    if (data.model && data.model.length > 0) {
      setVersionSelected(data.model[0].id_version);
      return data.model[0].id_version;
    } else {
      // se agrega el else para reiniciar los valores si es que se borro la unica version
      setData(segmentosDefault);
      setBloquesCurrentVersion([]);
      return null;
    }
  };

  const reloadModalData = async () => {
    getHistoryList();
    const firstMedia = await getMedia();
    if (firstMedia) {
      getSegmentsByMedia(firstMedia);
    } else {
      return resetSelectorData();
    }
    const firstVersion = await getVersionList(firstMedia);
    if (firstVersion) {
      getSegmentData(firstMedia, firstVersion);
    } else {
      setVersionList([]);
      setBloquesCurrentVersion([]);
    }
  };

  const getSegmentData = async (mediaId, versionId) => {
    const api = await axiosApi()
    const { data } = await api.get(
      `segmentacion/${mediaId || mediaOptionSelected}/${versionId || versionSelected}`
    );

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
    setData(data.model || segmentosDefault);
    setBloquesCurrentVersion(data.model.grillaDer ? data.model.grillaDer : []);
  };

  const selectVersion = async (id_version, isSelected) => {
    const { epi } = show;
    const api = await axiosApi()
    const { data } = await api.get(
      `seleccionarVersion/${epi}/${id_version}`
    );
    const textSuccess = isSelected
      ? `Se ha quitado la selección sobre esta versión`
      : `Se ha seleccionado correctamente la versión`;

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

    getHistoryList();
    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Selección de versión`,
        message: textSuccess,
        okCBF: () => {},
        type: messageTypes.SUCCESS,
      },
    });
  };

  const getHistoryList = async () => {
    const { depor, progra, epi } = show;
    const api = await axiosApi()
    const { data } = await api.get(
      `segmentacionList/${depor.trim()}/${progra.trim()}/${show.show}/${epi}`
    );

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
    setDataHistory(data.model);

    const options = [];
    if (data.model) {
      data.model.map((item) =>
        options.push({
          name: `${item.Version} - ${item.Detalle}`,
          value: item.Version,
          idVersion: item.IDVersion,
        })
      );
    }
  };

  const getBloquesByVersion = () =>
    newVersionMode ? newVersionBloques : bloquesCurrentVersion;

  const formatTimeInSeconds = (time) => {
    let seconds = 0;
    time.split(":").forEach((t, i) => {
      if (i == 0) {
        seconds += parseInt(t) * 60 * 60;
      }
      if (i == 1) {
        seconds += parseInt(t) * 60;
      }
      if (i == 2) {
        seconds += parseInt(t);
      }
    });
    return seconds;
  };

  const checkTimeConflicts = (item) => {
    let hasConflict = false;
    const currentBloques = getBloquesByVersion();
    currentBloques.forEach((b) => {
      if (
        checkTimeInRange(
          formatTimeInSeconds(b.iniSFrame),
          formatTimeInSeconds(b.finSFrame),
          formatTimeInSeconds(item.iniSFrame),
          formatTimeInSeconds(item.finSFrame)
        )
      ) {
        hasConflict = true;
      }
    });
    return hasConflict;
  };

  const checkTimeConflicts2 = (ventana, duracionT) =>
    formatTimeInSeconds(ventana) < formatTimeInSeconds(duracionT);

  const checkTimeInRange = (r1, r2, t1, t2) => {
    if (!r1 || !r2 || !t1 || !t2) return false;

    if (r1 == t1 && r2 == t2) return true;

    if ((r1 - 1 < t1 && t1 < r2) || (r1 < t2 && t2 < r2 + 1)) {
      return true;
    }

    if ((t1 - 1 < r1 && r1 < t2) || (t1 < r2 && r2 < t2 + 1)) {
      return true;
    }

    return false;
  };

  const sortList = (list) => {
    list.sort(
      (a, b) => formatTimeInSeconds(a.ini) - formatTimeInSeconds(b.ini)
    );
  };

  const checkBloquesConflict = (item) => {
    let hasConflict = false;
    const currentBloques = getBloquesByVersion();
    if (!currentBloques.length) return hasConflict;
    currentBloques.map((b) => {
      if (b.bloque == item.bloque && b.segmen == item.segmen) {
        hasConflict = true;
      }
    });
    return hasConflict;
  };

  const addHandler = (item) => {
    /* const hasConflict = checkTimeConflicts(item);

    if (hasConflict) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message:
            "El bloque que intenta incluir se solapa con el TCIn y TCOut de un bloque ya cargado",
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    } */
    const hasConflict = checkBloquesConflict(item);

    if (hasConflict) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: "El bloque que intenta incluir ya se encuentra en la lista",
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }

    const listByVersion = [...getBloquesByVersion(), { ...item, backToBack: false}];
    //sortList(listByVersion);
    setHasBloquesChange(true);
    newVersionMode
      ? setNewVersionBloques(listByVersion)
      : setBloquesCurrentVersion(listByVersion);
  };

  const deleteHandler = (item) => {
    setHasBloquesChange(true);
    const list = newVersionMode ? newVersionBloques : bloquesCurrentVersion;
    const newArray = list.filter((i) => i.bloque != item.bloque || i.segmen != item.segmen);
    newVersionMode
      ? setNewVersionBloques(newArray)
      : setBloquesCurrentVersion(newArray);
  };

  const updateBloquesOrder = (list) => {
    const newOrderList = [];
    list.forEach((item, i) => {
      newOrderList.push({ ...item, orden: i + 1 });
    });
    return newOrderList;
  };

  const handleChange = (id, text) => {
    setFormData({ ...formData, [id]: text });
  };

  const getBacktoBackValue = (listItem, index) => {
    // con el index se valida que el primer elemento de la lista tenga el backtoback en 0
    if(index === 0) return 0;
    return listItem.backToBack ? 1 : 0
  }

  const createNewVersion = async (media, deta, obser, list, dura_ventana) => {
    setLoadingSave(true);
    const hasConflict = checkTimeConflicts2(dura_ventana, duraTotal.toString());

    if (hasConflict) {
      setLoadingSave(false);
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message:
            "La duración total de los bloques es mayor que la de la ventana",
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }

    const api = await axiosApi()
    const { data } = await api.put(
      `mediaVersionSegmentacion`,
      //nuevo objeto de body
      {
        dura_time: duraTotal.toString(),
        media,
        deta,
        obser,
        version_usua: state.globalUser.name,
        dura_ventana,
        id_version: !updateMode ? null : versionSelected,
      }
      );
      const hasError = !data.message.success;
      
      if (hasError) {
        setLoadingSave(false);
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
    
    // se le agrega el tipo de operacion 1 = create 3= update
    const listAdapted = list.map((m,index) => {
      return { segmen: m.segmen, orden: m.orden, dura: m.dura, media, backToBack: getBacktoBackValue(m,index), id_version: data.model, ope: !updateMode ? 1 : 3 };
    });

    const resList = await saveSegmentList(listAdapted);
    setLoadingSave(false);

    if (resList === "error") return;

    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Versión ${!updateMode ? "creada" : "actualizada"}`,
        message: `La nueva versión se ${
          !updateMode ? "creo" : "actualizo"
        } correctamente`,
        okCBF: () => {
          reloadModalData();
          //getVersionList();
          //getHistoryList();
          handleCancelCreate();
        },
        type: messageTypes.SUCCESS,
      },
    });
  };

  const saveSegmentList = async (listOfSegments, isUpdate) => {
    // se le coloca el orden segun como llegan de la lista ya ordenada para enviar
    const listWithCorrectOrders = updateBloquesOrder(listOfSegments);
    setLoadingSave(true);
    const api = await axiosApi()
    const res = await api.put(
      `mediaVersionSegmento/${data.frame_rate}/${data.drop_frame}`,
      listWithCorrectOrders
    );
    setLoadingSave(false);

    const hasError = !res.data.message.success;

    if (hasError) {
      dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: res.data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
      return "error";
    }

    setHasBloquesChange(false);

    if (isUpdate) {
      dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: `Versión ${!updateMode ? "creada" : "actualizada"}`,
          message: `La nueva versión se ${
            !updateMode ? "creo" : "actualizo"
          } correctamente`,
          okCBF: () => {
            getVersionList();
            getHistoryList();
          },
          type: messageTypes.SUCCESS,
        },
      });
    }
    return "ok";
  };

  const handleCreate = async () => {
    const deta = document.getElementById("deta").value;
    const obser = document.getElementById("obser").value;
    const dura_ventana = formData.dura_ventana;
    // le paso la media actual por que en base a eso se arma el drop de versiones
    createNewVersion(
      mediaOptionSelected,
      deta,
      obser,
      newVersionBloques,
      dura_ventana
    );
  };

  const checkMandatory = (fd) => {
    let nothingEmpty = true;
    camposObligatorios.forEach((key) => {
      if (fd[key].trim() === "") {
        nothingEmpty = false;
      }
    });
    setFormComplete(nothingEmpty);
  };

  useEffect(() => {
    checkMandatory(formData);
  }, [formData]);

  const handleCancelCreate = () => {
    setFormData(versionDefault);
    setNewVersionBloques([]);
    setNewVersionMode(false);
    setUpdateMode(false);
    setHasBloquesChange(false);
    setBloquesCurrentVersion(data.grillaDer ? data.grillaDer : []);
    setDispatchTime(null);
  };

  const handleListChange = (newList) => {
    setHasBloquesChange(true);
    newVersionMode
      ? setNewVersionBloques(newList)
      : setBloquesCurrentVersion(newList);
  };

  const disabledSaveButton = () =>
    newVersionMode ? !hasBloquesChange : !hasBloquesChange;

  const disabledCancelButton = () =>
    newVersionMode ? false : !hasBloquesChange;

  const disabledNewVersionButton = () => {
    if (hasBloquesChange && !newVersionMode) return true;
    return newVersionMode;
  };

  const onClickCancel = () => {
    if (newVersionMode && !formComplete && newVersionBloques.length === 0)
      return handleCancelCreate();
    return showMessage({
      title: "Atención",
      message: "Se borrara la información cargada",
      okCBF: handleCancelCreate,
      cancelCBF: () => {},
      type: messageTypes.ALERT,
    });
  };

  const handleUpdateBloques = async () => {
    if(!hasPermission) return;
    setUpdatingBloques(true);
    const api = await axiosApi()
    const { data } = await api.get(
      `actualizacionbloquesSegmentacion/${show.depor.trim()}/${show.progra.trim()}/${show.show}`
    );
    setUpdatingBloques(false);
    reloadModalData();

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
        title: "Actualización exitosa",
        message: data.message.message,
        okCBF: () => {},
        type: messageTypes.SUCCESS,
      },
    });
  };

  useEffect(() => {
    if (newVersionMode) {
      setDuraTotal(calcDuraTotal(newVersionBloques));
    } else {
      setDuraTotal(calcDuraTotal(bloquesCurrentVersion));
    }
  }, [data, newVersionMode, bloquesCurrentVersion, newVersionBloques]);

  const calcDuraTotal = (list) => {
    let acc = 0;
    list.forEach((i) => {
      acc += formatTimeInSeconds(i.dura);
    });

    const segundos = Math.round(acc % 0x3c).toString();
    const horas = Math.floor(acc / 0xe10).toString();
    const minutos = (Math.floor(acc / 0x3c) % 0x3c).toString();

    const duraStr = `${addZero(horas)}:${addZero(minutos)}:${addZero(
      segundos
    )}`;
    return duraStr;
  };

  const addZero = (d) => {
    if (d.length === 1) {
      return `0${d}`;
    }
    return d;
  };

  const deleteVersionAction = async (idVersion) => {
    const api = await axiosApi()
    const { data } = await api.delete(`borrarVersion/${idVersion}`);
    const hasError = !data.message.success;
    if (hasError) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: data.message.message,
          okCBF: () => {
            getHistoryList();
            getVersionList();
          },
          type: messageTypes.ERROR,
        },
      });
    }

    getHistoryList();
    getVersionList();

    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Versión eliminada`,
        message: `La versión fue eliminada correctamente`,
        okCBF: () => {},
        cancelCBF: undefined,
        type: messageTypes.SUCCESS,
      },
    });
  };

  const handleDeleteVersion = (idVersion) => {
    let message = "¿Está seguro que desea eliminar esta versión?"
    const messageVersionasignada = "La versión está siendo utilizada en otros segmentos."
    const versionAsignada = dataHistory.filter((data)=> data.IDVersion === idVersion)
    
    if(versionAsignada[0].Versiones_Asignadas > 0){
      message= `${messageVersionasignada}\n${message}`
    } 

    return showMessage({
      title: "Atención",
      message: message,
      cancelCBF: () => {},
      okCBF: () => deleteVersionAction(idVersion),
      type: messageTypes.ALERT,
    });
  };

  function handleDeleteSegment() {
    if(!hasPermission) return;
    return showMessage({
      title: "Atención",
      message: "¿Está seguro que desea eliminar esta Segmentación?",
      cancelCBF: () => {},
      okCBF: () => deleteSegment(data.media),
      type: messageTypes.ALERT,
    });
  }
  const resetSelectorData = () => {
    setMediaOptions([]);
    setVersionList([]);
    setSegmentByMedia([]);
    setBloquesCurrentVersion([]);
  };

  const deleteSegment = async (media) => {
    const url = `borrarMediaSegmento/${media}`
    setDeletingBloques(true)
    const api = await axiosApi()
    const { data } = await api.delete(url);
    const hasError = !data.message.success;
    if (hasError) {
      setDeletingBloques(false)
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
    setDeletingBloques(false)
    getSegmentData();
    getHistoryList();
    resetSelectorData();
    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Segmentación eliminado`,
        message: `La Segmentación fue eliminada correctamente`,
        okCBF: () => {},
        cancelCBF: undefined,
        type: messageTypes.SUCCESS,
      },
    });
    
  }

  const formLayout = () => {
    return (
      <div className="segmentos__wrapper"  style={{height: `${newVersionMode ? '100%' : 'fit-content'}`}}>
        <div className="segmentos__form">
          <div className="segmentos__form-body">
            <div
              className={`segments__cabecera${newVersionMode ? " isNew" : ""}`}
            >
              {!newVersionMode ? (
                <>
                  <Row
                    key={uuid()}
                    tag="Media"
                    data={
                      <select
                        disabled={newVersionMode || !mediaOptions.length}
                        onChange={(e) =>
                          setMediaOptionsSelected(e.target.value)
                        }
                      >
                        {!mediaOptions ||
                          (!mediaOptions.length > 0 && (
                            <option disabled selected>
                              No hay medias disponibles
                            </option>
                          ))}
                        {mediaOptions.map((option) => (
                          <option
                            key={uuid()}
                            value={option.media}
                            selected={mediaOptionSelected == option.media}
                          >
                            {option.descrip}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Row
                    key={uuid()}
                    tag="Versión"
                    data={
                      <select
                        disabled={newVersionMode || !versionList.length}
                        onChange={(e) => setVersionSelected(e.target.value)}
                      >
                        {!versionList ||
                          (!versionList.length > 0 && (
                            <option disabled selected>
                              No hay versiones disponibles
                            </option>
                          ))}
                        {versionList.map((option) => (
                          <option
                            key={uuid()}
                            value={option.id_version}
                            selected={versionSelected == option.id_version}
                          >
                            {option.descrip && option.descrip.trim()}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Row key={uuid()} tag="Box number" data={data.box_number} />
                  <Row
                    tag="Fecha registro"
                    data={
                      data.fecha_regis
                        ? moment(data.fecha_regis).format("DD/MM/yyyy HH:MM")
                        : ""
                    }
                  />
                  <Row tag="Nombre" data={data.nombre} />
                  <Row tag="Estado" data={data.estado} />
                  <Row tag="Duración" data={data.dura_time} />
                  <Row tag="Observaciones" data={data.obser} className="new" />
                </>
              ) : (
                <>
                  <Row
                    tag="Detalle"
                    data={
                      <input
                        id="deta"
                        className="segmentos__input-text"
                        value={newVersionMode ? formData.deta : data.deta}
                        onChange={(e) => handleChange("deta", e.target.value)}
                      />
                    }
                    className="new"
                  />
                  <Row
                    tag="Observaciones"
                    data={
                      <textarea
                        id="obser"
                        className="segmentos__textarea"
                        value={newVersionMode ? formData.obser : data.obser}
                        onChange={(e) => handleChange("obser", e.target.value)}
                      />
                    }
                    className="new"
                  />
                  <Row
                    tag="Duración ventana"
                    data={
                      <TimePicker
                        focusOnOpen
                        placeholder="00:00"
                        defaultOpenValue={moment(new Date()).startOf("day")}
                        disabled={updateMode}
                        value={dispatchTime}
                        onChange={handlePickerChange}
                        showSecond={false}
                        allowEmpty
                      />
                    }
                  />
                </>
              )}
            </div>
            <div className={`segmentos__form-columns`}>
              <div className="segmentos__form-column">
                <div className="segmentos-bloques__area">
                  <Bloques
                    bloques={segmentsByMedia}
                    addHandler={addHandler}
                    newVersionMode={newVersionMode}
                  />
                </div>
              </div>
              <div className="segmentos__form-column">
                <div className="segmentos-bloques__area">
                  <TablaDnD
                    itemList={getBloquesByVersion()}
                    deleteHandler={deleteHandler}
                    newVersionMode={newVersionMode}
                    setItemList={handleListChange}
                    duraTotal={duraTotal}
                  />
                </div>
              </div>
            </div>
            <div className="segmentos__row-filler">
              <div className="segmentos__row-buttons">
                {loadingSave && <div className="segmentos__loader" />}
                <div>
                  <button
                    className="segmentos__row-button shadow-left-down"
                    disabled={
                      newVersionMode
                        ? !formComplete || !newVersionBloques.length
                        : disabledSaveButton()
                    }
                    onClick={handleCreate}
                  >
                    {loadingSave ? <Loader /> : "GUARDAR"}
                  </button>
                </div>
                {!newVersionMode && (
                  <>
                    <div>
                      <button
                        className="segmentos__row-button shadow-left-down"
                        disabled={disabledNewVersionButton() || !hasPermission}
                        onClick={() => {
                          if(!hasPermission) return;
                          setNewVersionMode(true)
                        }}
                      >
                        NUEVA VERSIÓN
                      </button>
                    </div>
                    <div>
                      <button
                        className="segmentos__row-button shadow-left-down"
                        disabled={disabledNewVersionButton() || !hasPermission}
                        onClick={() => {
                          if(!hasPermission) return;
                          onUpdate();
                          setNewVersionMode(true);
                        }}
                      >
                        EDITAR VERSIÓN
                      </button>
                    </div>
                  </>
                )}
                <div>
                  <button
                    className="segmentos__row-button shadow-left-down"
                    disabled={disabledCancelButton()}
                    onClick={onClickCancel}
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
              {!newVersionMode && (
                <div className="segmentos-bloques__area">
                  <Historial
                    data={dataHistory}
                    handleDelete={handleDeleteVersion}
                    handleSelectVersion={selectVersion}
                    hasPermission={hasPermission}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FormWindow
        title="Segmentación – Versiones"
        show={show}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        actions={[
          {
            label: updatingBloques ? <Loader /> : "Actualizar Segmentación tmk",
            onClick: () =>
              !updatingBloques ? handleUpdateBloques() : () => {},
            icon: null,
            disabled: !hasPermission,
          },
          {
            label: deletingBloques ? <Loader /> : "Eliminar Segmentación",
            onClick: () =>
              !deletingBloques ? handleDeleteSegment() : () => {},
            icon: null,
            disabled: !hasPermission,
          },
        ]}
        helpUrlJson={null}
        addStyle={{ maxHeight: "74.6rem" }}
        disabledDrag={newVersionMode}
        onMediaTraker={onMediaTraker}
      >
        {formLayout()}
      </FormWindow>
    </>
  );
};

const Row = ({ tag, data, className = "" }) => {
  return (
    <div className={`segmentos__row ${className}`}>
      <div className="segmentos__tag">{tag}</div>
      <div className="segmentos__data">{data}</div>
    </div>
  );
};

export default Segmentos;
