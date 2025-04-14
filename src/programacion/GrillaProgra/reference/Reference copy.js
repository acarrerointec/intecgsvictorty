import React, { useState, useEffect } from 'react';
import './Reference.scss';
import EstadoPrograma from '../../estadoPrograma/EstadoPrograma';
import { isMobile } from 'react-device-detect';
import axiosApi from '../../../../axiosApi';

const imgMasInfo = require.context('../../../../images/masInfo');
const icons = require.context('../../../../images/icons');

function Reference({ pVisible, visibleCBF }) {

  const [ltsJSX, setLtsJSX] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (mounted)
      getLts();
    return () => mounted = false;
  }, [])

  const getLts = async () => {
    let url = 'listas/lts';
    const api = await axiosApi()
    const result = await api.get(url);
    const data = await result.data;
    setLtsJSX(
      data.map((el, i) => {
        return (
          <div key={`lts-ref-${i}`} className="reference__base-list-item">
            <div className="reference__base-icon">
              <div className="reference__tipo-emi__icono" style={{ backgroundColor: el.bg_color, color: el.text_color }}>{el.codi.substring(0, 1)}</div>
            </div>
            <div className="reference__tipo-emi__descrip">
              {el.descrip} <p>{el.explicacion}</p>
            </div>
          </div>
        );
      })
    );
  }


  return (
    <div className={`reference__wrapper ${isMobile ? 'reference__wrapper__mobile' : ''} ${!pVisible ? 'reference__wrapper__mobile__invisible' : ''}`} onClickCapture={visibleCBF} >
      <div className="reference__body">
        <div className="reference__superposicion">
          <div className="reference__base-title">
            Superposición
            </div>
          <div className="reference__base-list">
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <img src={imgMasInfo('./superpos.png')} alt="" />
              </div>
              <div className="reference__superposicion__descrip">
                Indica una superposición de horarios.<br />
                  El área sombreada cubre a todos los programas superpuestos.<br />
                  Al deslizar el mouse encima, se ven la lista.
                </div>
            </div>
          </div>
        </div>
        <div className="reference__esta-progra">
          <div className="reference__base-title">
            Estados de programa
            </div>
          <div className="reference__base-list">
            <div className="reference__base-list-item">
              <div className="reference__base-icon reference__esta-progra__icon">
                <EstadoPrograma estadoProgra={0} colorFondo={'#f55'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Cancelado / Cancelled / Sin Uso
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={1} colorFondo={'#fa0'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Borrador / Working
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={2} colorFondo={'#fa0'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Aprobado / Released
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={3} colorFondo={'#fa0'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Publicado / Published
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={5} colorFondo={'#dd0'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Pauta Iniciada
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={7} colorFondo={'#0d0'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Pauta Definitiva
                </div>
            </div>

            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={1} colorFondo={'#eee'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Actualizada Programación
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={3} colorFondo={'#eee'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Actualizada sin Horarios
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={5} colorFondo={'#eee'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Actualizados Horarios
                </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <EstadoPrograma estadoProgra={7} colorFondo={'#888'} />
              </div>
              <div className="reference__esta-progra__descrip">
                Actualizado Definitivo
                </div>
            </div>
          </div>
        </div>
        <div className="reference__guias">
          <div className="reference__base-title">
            Guías
            </div>
          <div className="reference__base-list">
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <img src={imgMasInfo('./guias.png')} alt="" />
              </div>
              <div className="reference__guias__descrip">
                Tiene Guías y Condiciones.<br />
                  Las Guías se muestran al deslizar el mouse encima del ícono.
                </div>
            </div>
          </div>
        </div>
        <div className="reference__repo_tecnico">
          <div className="reference__base-title">
            Reportes Técnicos
            </div>
          <div className="reference__base-list">
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <img src={imgMasInfo('./tieneRepoEmi.png')} alt="" />
              </div>
              <div className="reference__repo_tecnico__descrip">
                Tiene Reportes Técnicos.
                </div>
            </div>
          </div>
        </div>
        <div className="reference__tipo-emi">
          <div className="reference__base-title">
            Tipo Emisión
            </div>
          <div className="reference__base-list">
            {ltsJSX}
          </div>
        </div>

        <div className="reference__esta-mate">
          <div className="reference__base-title">
            Estado Materiales
            </div>
          <div className="reference__base-list">
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <img src={imgMasInfo('./material_yes.png')} alt="" />
              </div>
              <div className="reference__esta-mate__descrip">
                Tiene Materiales <br />en la lista.
              </div>
            </div>
            <div className="reference__base-list-item">
              <div className="reference__base-icon">
                <img src={imgMasInfo('./material_04.png')} alt="" />
              </div>
              <div className="reference__esta-mate__descrip">
                Faltan Materiales.<br />
                  Falta ingestar o recibir materiales.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reference;
