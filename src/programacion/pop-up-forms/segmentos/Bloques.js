import React, { useState, useEffect } from "react";
import AddIcon from "../../../../images/icons/add-i.png";

const Bloques = ({
  bloques,
  onChangeCBF,
  newVersionMode,
  addHandler = () => {},
}) => {
  const [itemList, setItemList] = useState([]);
  const headersKeys = ["bloque", "ini", "fin", "dura", "descrip", "mediaDesc"];
  const columnWidth = newVersionMode ? '10%' : '15%'

  useEffect(() => {
    if (bloques) {
      setItemList(bloques);
    }
  }, [bloques]);

  return (
    <div className="ficha-copiado-bloques__wrapper">
      <div className="table-container">
        <div className="table-title">Bloques del programa</div>
        <table className="table-content">
          <thead>
            <tr>
              <th style={{ width: `5%` }}>Segmento</th>
              <th style={{ width: columnWidth }}>TCIn</th>
              <th style={{ width: columnWidth }}>TCOut</th>
              <th style={{ width: columnWidth }}>Duración</th>
              <th style={{ width: `40%` }}>Descripción</th>
              {newVersionMode ? <th style={{ width: `15%`, whiteSpace: 'nowrap' }}>Media Desc.</th> : null}
              <th style={{ width: `10%` }}></th>
            </tr>
          </thead>
          <tbody>
            {itemList.map((item, index) => {
              return (
                <tr className="" key={index}>
                  {headersKeys.map((i) => {
                    return <td key={item.orden + i} style={{backgroundColor: `${i === 'fin' ? '#545454' : 'transparent'}`}}>{item[i]}</td>;
                  })}
                  {newVersionMode && (
                    <td>
                      <img
                        onClick={() => addHandler(item)}
                        style={{
                          cursor: "pointer",
                        }}
                        src={AddIcon}
                        width={16}
                        height={16}
                        alt="Icono eliminar"
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bloques;
