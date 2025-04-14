import React, { useState } from 'react';
import './ChannelCommands.scss';
import FlechaNav from '../../../flecha-nav/FlechaNav'
import axiosApi from '../../../../axiosApi';
import useIsMounted from '../../../hooks/useIsMounted'
import moment from 'moment';
import { fechaHHMM } from '../../../../utils/util';
import useMessageBox from '../../../hooks/useMessageBox';
import Loader from "../../../Loader/Loader";

function ChannelCommands ({show, setShow, epiErrorHandler}){
  const isMounted = useIsMounted();
  const [fetching, setFetching] = useState(false);
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();
  
  async function handleChange(direction){
    setFetching(true);
    const newDate = moment(show.fecha_hora_ini)
    const dateFormated = newDate.format("YYYY-MM-DD")
    const hourFormated = newDate.format("HH-mm")
    const url = `episode/${direction}/${show.canal.trim()}/${show.senial}/${dateFormated}/${hourFormated}`
    const api = await axiosApi()
    const {data} = await api.get(url)
    
    const {model, message} = data;
    if(!message.success) {
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => { },
        type: messageTypes.ERROR,
      })
    };
    const iniHHMM = fechaHHMM(model.fecha_hora_ini);
    const finHHMM = fechaHHMM(model.fecha_hora_fin);
    if(model.epi === 0 ) return epiErrorHandler()
    if(isMounted() && model) {
      setShow({...show, ...model, iniHHMM, finHHMM})
    }
    setFetching(false);
  }

  return (
    <div className="channel-commands__buttons-container">
      {fetching ? (
        <div className="channel-commands__loader"><Loader/></div>
      ) : (
        <>
          <div className="channel-commands__flecha-izquierda">
            <FlechaNav
              accion={() => !fetching && handleChange("next")}
              direccion="izquierda"
            />
          </div>
          <div className="channel-commands__flecha-derecha">
            <FlechaNav
              accion={() => !fetching && handleChange("previous")}
              direccion="derecha"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ChannelCommands