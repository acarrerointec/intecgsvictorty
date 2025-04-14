import React, { useState, useEffect } from "react";
import DeleteIcon from "../../../../images/icons/delete-i.png";
import PowerOn from "../../../../images/icons/power-outline.svg";
import Checked from "../../../../images/icons/checkbox-outline.svg";
import UnChecked from "../../../../images/icons/stop-outline.svg";
import moment from "moment";

const Historial = ({ data, handleDelete, handleSelectVersion, hasPermission }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  const headers = [
    "Version",
    "Origen",
    "Nombre",
    "Detalle",
    "Media",
    "CantBloques",
    "Bloques",
    "dura_time",
    "ventana",
    "version_fecha",
    "version_usua",
    "Observaciones",
  ];

  return (
    <div className="segmentos-bloques__wrapper">
      <div className="segmentos-bloques__title">Historial de versiones</div>
      <table className="segmentos-bloques__table">
        <thead>
          <tr>
            <th style={{ width: `1%` }}></th>
            <th style={{ width: `5%` }}>Versión</th>
            <th style={{ width: `7%` }}>Tipo Media</th>
            <th style={{ width: `10%` }}>Nombre</th>
            <th style={{ width: `10%` }}>Detalle</th>
            <th style={{ width: `8%` }}>Media</th>
            <th style={{ width: `4%` }}>Cant. Segmentos</th>
            <th style={{ width: `12%` }}>Segmentos</th>
            <th style={{ width: `10%` }}>Duración</th>
            <th style={{ width: `10%` }}>Ventana</th>
            <th style={{ width: `10%` }}>Fecha</th>
            <th style={{ width: `10%` }}>Usuario</th>
            <th style={{ width: `10%` }}>Observaciones</th>
            <th style={{ width: `10%` }}></th>
          </tr>
        </thead>
        <tbody>
          {rows &&
            rows.map((item, index) => (
              <tr className="item-container" key={index}>
                <td>
                  <img
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: hasPermission ? "pointer" : "no-drop",
                    }}
                    src={item.selec ? Checked : UnChecked}
                    alt="checked unchecked"
                    onClick={() => {
                      if (!hasPermission) return
                      handleSelectVersion(item.IDVersion, item.selec)
                    }}
                  />
                </td>
                {headers.map((i) => (
                  <td key={item.id + i}>
                    {i === "Registro"
                      ? moment(item[i]).format("DD/MM/yyyy HH:MM")
                      : item[i]}
                  </td>
                ))}
                <td className="button-action-container">
                  <img
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: hasPermission ? "pointer" : "no-drop",
                    }}
                    src={DeleteIcon}
                    alt="trash icon"
                    onClick={() => {
                      if(!hasPermission) return;
                      handleDelete(item.IDVersion)
                    }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Historial;
