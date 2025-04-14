import React, { useState, useEffect, useRef } from "react";
import "./MediaSegmentacion.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import useMessageBox from "../../../hooks/useMessageBox";
import uuid from "react-uuid";
import Bloques from "./Bloques";
import Row from "./Row";
import NewMediaVesionForm from "./NewMediaVesionForm";
import moment from "moment";

const MediaSegmentacion = ({ show, salirCBF, hasPermission ,onMediaTraker = false }) => {
  const [showMessage, _hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  //current media selected states
  const [mediaLoading, setMediaLoading] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [mediaSegmento, setMediaSegmento] = useState({
    ...mediaSegmentacionDefault,
    depor: show?.depor?.trim(),
    progra: show?.progra?.trim(),
    show: show.show,
    canal: show.canal,
    senial: show.senial,
    user: state.globalUser.name,
  });
  //media options list states
  const [mediaOptions, setMediaOptions] = useState([]);
  const [mediaOptionSelected, setMediaOptionSelected] = useState(null);
  const [loadingMediaList, setLoadingMediaList] = useState(false);
  // new version states
  const [newVersionMode, setNewVersionMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const editionAndDeleteDisabled = mediaSegmento.enProgramacion || mediaSegmento.enVersion; 
  const isOptionsOrMediaLoading = loadingMediaList || mediaLoading;
  const hasMediaOptions = mediaOptions && mediaOptions.length > 0;
  // media origen
  const [mediaOrigenes, setMediaOrigenes] = useState([]);
  //se busca la lista de medias del segmento
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      getMediaList();
      getMediaOrigenes();
    }
    return () => (mounted = false);
  }, []);

  //se busca la informacion de la media seleccionada
  useEffect(() => {
    let mounted = true;
    if (mounted && mediaOptionSelected) {
      getMediaData(mediaOptionSelected);
    }
    return () => (mounted = false);
  }, [mediaOptionSelected]);

  const getMediaOrigenes = async () => {
    const api = await axiosApi();
    const { data } = await api.get(
      'mediaSegmentacion/combo'
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
    setMediaOrigenes(data.model)
  }

  const getMediaList = async () => {
    setMediaOptionSelected(null)
    setLoadingMediaList(true);
    const { depor, progra } = show;
    const api = await axiosApi();
    const { data } = await api.get(
      `segmentacionMediaList/${depor?.trim()}/${progra?.trim()}/${show.show}`
    );
    setLoadingMediaList(false);
    setLoadStatus({ completed: true });
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
    setMediaOptions(data.model);
    if (data.model && data.model.length > 0) {
      setMediaOptionSelected(data.model[0].media);
      return data.model[0].media;
    } else {
      setMediaSegmento({
        ...mediaSegmentacionDefault,
        depor: show?.depor?.trim(),
        progra: show?.progra?.trim(),
        show: show.show,
        canal: show.canal,
        senial: show.senial,
        user: state.globalUser.name,
      })
    }
  };

  const getMediaData = async (mediaId) => {
    setMediaLoading(true);
    const api = await axiosApi();
    const { data } = await api.get(`mediaSegmentacion/${mediaId}`);
    setMediaLoading(false);
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
    return setMediaSegmento({
      ...mediaSegmento,
      ...data.model,
    });
  };

  const bloquesCBF = (bl) => {
    setMediaSegmento((prev) => {
      return { ...prev, bloques: bl.length, bloquesList: bl };
    });
  };

  const nullToEmpty = (val) => {
    return val ? val : "";
  };

  const deleteMediaVersion = async () => {
    const api = await axiosApi();
    const { data } = await api.delete(`newMediaSegmentacion/${mediaSegmento.media}`);
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
    getMediaList();

    return dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: {
        title: `Media eliminada`,
        message: `La media fue eliminada correctamente`,
        okCBF: () => {},
        cancelCBF: undefined,
        type: messageTypes.SUCCESS,
      },
    });
  };

  const handleDelete = () => {
    return showMessage({
      title: "Atención",
      message: "¿Está seguro que desea eliminar esta media?",
      cancelCBF: () => {},
      okCBF: deleteMediaVersion,
      type: messageTypes.ALERT,
    });
  };

  const getFormattedMediaOri = (oriId) => {
    let mediaOriName = "";
    if(mediaOrigenes && mediaOrigenes.length > 0) {
      mediaOrigenes.forEach(ori=> {
        if(ori.mediaOri == oriId){
          mediaOriName = ori.sigla
        }
      })
    }
    return mediaOriName;
  }

  const userName =  mediaSegmento.user || "-";

  const formLayout = () => {
    return (
      <div className="media-segmentacion__wrapper">
        <div className="media-segmentacion__form">
          <div className="media-segmentacion__form-body">
            <div className="media-segmentacion__form-columns">
              <div
                className="media-segmentacion__form-column"
                style={{ flex: 2 }}
              >
                <Row tag={"Canal"} data={`${show.canal} - ${show.senial}`} />
                <Row tag={"Usuario"} data={newVersionMode ? state.globalUser.name : userName} />
                <Row
                  tag={"Media"}
                  data={
                    <select
                      disabled={newVersionMode || !mediaOptions.length || isOptionsOrMediaLoading}
                      onChange={(e) => setMediaOptionSelected(e.target.value)}
                      value={nullToEmpty(mediaOptionSelected)}
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
                <Row tag={"ID"} data={mediaSegmento.media || '-'} />
                <Row tag={"Detalle"} data={mediaSegmento.deta || '-'} />
                <Row tag={"Observaciones"} data={mediaSegmento.obser || '-'} />
                <Row tag={"Fecha registro"} data={mediaSegmento.fechaRegis ? moment(mediaSegmento.fechaRegis).format("DD/MM/yyyy HH:mm") : '-'} />
                <Row tag={"Duración"} data={mediaSegmento.duraTime || '-'} />
                <Row tag={"Frame rate"} data={mediaSegmento.frameRate || '-'} />
                <Row tag={"Media origen"} data={getFormattedMediaOri(mediaSegmento.mediaOri)} />
                <Row tag={"Box Number"} data={mediaSegmento.boxNumber || '-'} />
                <Row tag={"Start time"} data={mediaSegmento.startTime || '-'} />
                <Row tag={"En programación"} data={
                  <div style={{display: 'flex'}}>
                    <div style={{marginRight: '10rem'}}>
                      {mediaSegmento.enProgramacion ? 'SI' : 'NO'}
                    </div>
                    <div>
                        {`En version: ${mediaSegmento.enVersion ? 'SI' : 'NO'}`}
                    </div>
                  </div>}
                />
              </div>
              <div
                className="media-segmentacion__form-column"
                style={{ flex: 3 }}
              >
                <div className="media-segmentacion-bloques__area">
                  <Bloques
                    hasPermission={hasPermission}
                    pBloques={mediaSegmento.bloquesList}
                    onChangeCBF={bloquesCBF}
                  />
                </div>
              </div>
            </div>
            <div className="media-segmentacion__row-filler"></div>
            <div className="media-segmentacion__row-buttons">
              <div>
                <button
                  className="media-segmentacion__row-button shadow-left-down"
                  disabled={!hasPermission || savingMedia || isOptionsOrMediaLoading}
                  onClick={
                    hasPermission ? () => setNewVersionMode(true) : () => {}
                  }
                >
                  NUEVA MEDIA
                </button>
              </div>
              <div>
                <button
                  className="media-segmentacion__row-button shadow-left-down"
                  disabled={!hasPermission || savingMedia || isOptionsOrMediaLoading || editionAndDeleteDisabled || !hasMediaOptions}
                  onClick={hasPermission ? () => setEditMode(true) : () => {}}
                >
                  EDITAR MEDIA
                </button>
              </div>
              <div>
                <button
                  className="media-segmentacion__row-button shadow-left-down"
                  disabled={!hasPermission || savingMedia || isOptionsOrMediaLoading || editionAndDeleteDisabled || !hasMediaOptions}
                  onClick={hasPermission ? handleDelete : () => {}}
                >
                  BORRAR MEDIA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FormWindow
        title="Segmentación – Ficha Manual"
        show={show}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        addStyle={{ maxHeight: "54.6rem" }}
        onMediaTraker={onMediaTraker}
      >
        {newVersionMode || editMode ? (
          <NewMediaVesionForm
            show={show}
            state={state}
            getMediaList={getMediaList}
            mediaOrigen={mediaOrigenes}
            initialData={
              editMode
                ? mediaSegmento
                : {
                    ...mediaSegmentacionDefault,
                    depor: show?.depor?.trim(),
                    progra: show?.progra?.trim(),
                    show: show.show,
                    // revisar la necesidad de hacer un trim en estos datos
                    canal: show.canal,
                    senial: show.senial,
                    user: state.globalUser.name,
                  }
            }
            onClose={() => {
              setNewVersionMode(false);
              setEditMode(false);
            }}
          />
        ) : (
          formLayout()
        )}
      </FormWindow>
    </>
  );
};

export default MediaSegmentacion;

const mediaSegmentacionDefault = {
  id: null,
  depor: "",
  progra: "",
  show: 0,
  version: null,
  canal: "",
  senial: "",
  user: "",
  descripcion: "",
  bloquesList: [],
  media: null,
  estado: 0,
  deta: "",
  obser: "",
  boxNumber: "",
  startTime: "",
  frameRate: 30,
  dropFrame: 0,
  mediaOri: "",
};
