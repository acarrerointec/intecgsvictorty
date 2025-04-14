import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AddIcon from "../../../../images/icons/add-i.png";
import "./TablaDnd.scss";

export default function TablaDnD({
  itemList,
  newVersionMode,
  deleteHandler,
  setItemList,
  duraTotal
}) {
  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) return;
    var updatedList = [...itemList];
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    setItemList(updatedList);
  };

  const handleChangeBtoB = (bloqueId, cSegment, e) => {
    const tempArr = itemList.map((item, i) =>{
      if(item.bloque == bloqueId && item.segmen == cSegment) {
        return {...item, backToBack: e.target.checked ? 1 : 0}
      }
      return item
    })
    setItemList(tempArr)
  }

  const getItemStyle = (isDragging, draggableStyle) => {
    const myStyles = isDragging
      ? {
          display: "flex",
          justifyContent: "space-around",
        }
      : {};
    return {
      // change background colour if dragging
      background: isDragging ? "#6c6b6b9c" : "transparent",
      justifyContent: "space-between",

      // styles we need to apply on draggables
      ...draggableStyle,
      ...myStyles,
    };
  };
  const headersKeys = ["bloque", "ini", "fin", "dura", "descrip", "mediaDesc"];
  const columnWidth = newVersionMode ? '8%' : '15%'

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <Droppable droppableId="list-container">
        {(provided) => (
          <div className="table-container">
            <div className="table-title">Bloques de la versión</div>
            <table
              className="table-content"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr>
                  <th style={{ width: `5%` }}>Segmento</th>
                  <th style={{ width: columnWidth }}>TCIn</th>
                  <th style={{ width: columnWidth }}>TCOut</th>
                  <th style={{ width: columnWidth }}>Duración</th>
                  <th style={{ width: `40%` }}>Descripción</th>
                  {newVersionMode ? <th style={{ width: `15%`, whiteSpace: 'nowrap' }}>Media Desc.</th> : null}
                  {newVersionMode ? <th style={{ width: columnWidth, whiteSpace: 'nowrap' }}>Back to Back</th> : null}
                  {!newVersionMode ? <th style={{ width: `4%`, whiteSpace: 'nowrap' }}></th> : null}
                  <th style={{ width: `10%` }}></th>
                </tr>
              </thead>
              <tbody>
                {itemList.map((item, index) => {
                  return (<Draggable
                    key={`${item.bloque}/${index}`}
                    draggableId={`${item.bloque}/${index}`}
                    index={index}
                    isDragDisabled={!newVersionMode}
                  >
                    {(provided, snapshot) => {
                      return (
                        <tr
                          className=""
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {headersKeys.map((i) => {
                            return <td key={item.orden + i} style={{backgroundColor: `${i === 'fin' ? '#545454' : 'transparent'}`}}>{item[i]}</td>;
                          })}
                          {newVersionMode && index !== 0 && (
                            <td>
                              <input type="checkbox" checked={item.backToBack} onChange={(e)=> handleChangeBtoB(item.bloque, item.segmen, e)}/>
                            </td>
                          )}
                          {newVersionMode && index === 0  && (
                            <td>
                              <input type="checkbox" onChange={()=> {}} disabled/>
                            </td>
                          )}
                          {newVersionMode && (
                            <td>
                              <img
                                onClick={() => deleteHandler(item)}
                                style={{
                                  transform: "rotate(45deg)",
                                  cursor: "pointer",
                                }}
                                src={AddIcon}
                                width={16}
                                height={16}
                                alt="Icono eliminar"
                              />
                            </td>
                          )}
                          {!newVersionMode && (
                            <td>
                              <input type="checkbox" checked={item.subOrden > 1} onChange={()=> {}}/>
                            </td>
                          )}
                        </tr>
                      );
                    }}
                  </Draggable>)}
                )}
                {provided.placeholder}
              </tbody>
            </table>
            <div className="table-total">Duración total: {duraTotal || 0}</div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
