import React, { useState } from "react";
import moment from "moment";
import CloseIcon from "../../../../images/icons/window-close.png";

const ReportViewer = ({ data }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const [markerOpenReport, setMarkerOpenReport] = useState(null);

  const headers = [
    "canal",
    "senial",
    "tipo",
    "descripcion",
    "duracion",
    "emision",
    "episodio",
    "fecha_Inicio",
    "fecha_Fin",
  ];

  const showReport = (data, epi) => {
    setCurrentReport(data);
    setMarkerOpenReport(epi);
  };

  const onCloseTextViewer = () => {
    setCurrentReport(null);
    setMarkerOpenReport(null);
  };

  return (
    <div className="certificacion-bloques__wrapper">
      {currentReport && (
        <div className="certificacion-bloques__viewer-wrapper">
          <div className="certificacion-bloques__text-viewer">
            <div
              className="certificacion-bloques__close-button"
              onClick={onCloseTextViewer}
            >
              <img src={CloseIcon} alt="Close" />
            </div>
            <div className="certificacion-text-area">{currentReport}</div>
          </div>
        </div>
      )}
      <div className="certificacion-bloques__title">
      Report preview
      </div>
      <table className="certificacion-bloques__table">
        <thead>
          <tr>
            <th style={{ width: `3%` }}>Canal</th>
            <th style={{ width: `3%` }}>Señal</th>
            <th style={{ width: `3%` }}>Tipo</th>
            <th style={{ width: `30%` }}>Descripción</th>
            <th style={{ width: `8%` }}>Duración</th>
            <th style={{ width: `12%` }}>Emisión</th>
            <th style={{ width: `5%` }}>Episodio</th>
            <th style={{ width: `13%` }}>Inicio</th>
            <th style={{ width: `13%` }}>Fin</th>
            <th style={{ width: `10%` }}>Reporte</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((item, index) => (
              <tr className="item-container" key={index}>
                {headers.map((i, idx) => (
                  <td
                    key={item.id + i}
                    style={{ textAlign: `${idx == 3 ? "start" : "center"}` }}
                  >
                    {i === "fecha_Inicio" || i === "fecha_Fin"
                      ? moment(item[i]).format("DD/MM/yyyy hh:mm")
                      : item[i]}
                  </td>
                ))}
                <td
                  className={`button-action-container ${
                    item.reporte && item.reporte.trim() ? "link" : ""
                  } ${markerOpenReport === item.episodio ? "selected" : ""}`}
                  onClick={() =>
                    item.reporte &&
                    item.reporte.trim() &&
                    showReport(item.reporte, item.episodio)
                  }
                >
                  {item.reporte && item.reporte.trim()
                    ? "Ver reporte"
                    : "Sin reporte"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportViewer;
