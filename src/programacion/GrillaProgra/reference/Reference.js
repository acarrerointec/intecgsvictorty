import React, { useState, useEffect } from 'react';
import './Reference.scss';
import EstadoPrograma from '../../estadoPrograma/EstadoPrograma';
import axiosApi from '../../../../axiosApi';
import axios from 'axios';
import { colorTipoEmi } from '../../GrillaProgra/columnas/ColumnaProgra/Celda/InfoAdicional/tipo-emi/TipoEmi';
import useMessageBox from '../../../hooks/useMessageBox';

const imgMasInfo = require.context('../../../../images/masInfo');

function Reference({ pVisible, visibleCBF }) {

  const [ltsJSX, setLtsJSX] = useState([]);
  const [estaPrograJSX, setEstaPrograJSX] = useState([]);
  const [infoAdicionalJSX, setInfoAdicionalJSX] = useState([]);
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox();

  useEffect(() => {
    let mounted = true;
    if (mounted)
      getLts();
    getSectionsData();
    return () => mounted = false;
  }, [])

  const getLts = async () => {
    let url = 'listas/lts';
    const api = await axiosApi()
    const result = await api.get(url);
    const data = await result.data;
    
    if(!data.message.success){
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => { },
        type: messageTypes.ERROR,
      })
    }
    let list = data.model.map((el, i) => {
      let st = colorTipoEmi(el.codi)
      st.borderRadius = "20rem"
      st.fontSize = "2rem"
      st.margin = "0"
      st.lineHeight = "2.4rem";
      st.minWidth = "2.7rem"
      st.minHeight = "2.7rem"
      st.maxWidth = "2.7rem"
      st.maxHeight = "2.7rem"

      return (
        <div className="reference__item" key={i} style={{ flex: "0 1 4.5rem" }}>
          <div className="reference__item-icon">
            {/* <TipoEmi lts={el.codi} /> */}
            <div style={st}>
            {el.codi.substring(0, 1)=="D"?"A":el.codi.substring(0, 1)}
            </div>
          </div>
          <div className="reference__item-descrip">
            {el.descrip} <p>{el.explicacion}</p>
          </div>
        </div>
      )
    })

    setLtsJSX(
      <div className="reference__section">
        <div className="reference__title">
          Tipo de Emisión
        </div>
        {list}
      </div>
    )
  }

  const getSectionsData = async () => {
    let url = '/help/ref-programacion.json';
    const result = await axios.get(url);
    const data = await result.data;

    setEstaProgra(data.sections.estaProgra.items)

    setInfoAdicional(data.sections.infoAdicional.title, data.sections.infoAdicional.items)

  }

  function setEstaProgra(items) {

    let list = items.map((el, i) => {
      return (<div className="reference__item" key={i}>
        <div className="reference__item-icon">
          <EstadoPrograma estadoProgra={el.state} colorFondo={el.bgColor} />
        </div>
        <div className="reference__item-descrip">
          {el.text}
        </div>
      </div>
      )
    })

    setEstaPrograJSX(
      <div className="reference__section">
        <div className="reference__title">
          Estados de programa
        </div>
        {list}
      </div>
    )
  }

  function setInfoAdicional(title, items) {
    let list = items.map((el, i) => {
      return (
        <div className="reference__item" key={i}>
          <div className="reference__item-icon">
            <img alt="" src={imgMasInfo(el.image)} />
          </div>
          <div className="reference__item-descrip">
            {el.title}
            {global.util.splitTextIntoParagraph(el.text)}
          </div>
        </div>
      )
    })
    setInfoAdicionalJSX(
      <div className="reference__section">
        <div className="reference__title">
          {title}
        </div>
        {list}
      </div>
    )
  }

  return (
    <div className={`reference__wrapper ${!pVisible ? 'reference__wrapper__invisible' : ''}`} onClickCapture={visibleCBF} >
      <div className="reference__body">

        <div className="reference__column" style={{flex: "1 1 33%"}}>
          {infoAdicionalJSX}
        </div>

        <div className="reference__column">
          {estaPrograJSX}
        </div>

        <div className="reference__column">
          {ltsJSX}
        </div>

      </div>
    </div>
  )
}

export default Reference;
