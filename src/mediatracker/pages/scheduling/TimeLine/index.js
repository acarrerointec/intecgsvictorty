import { useMemo, useRef, useState } from "react";
import { TableTimeLine } from "./TableTimeLine";
import { Alerts } from "../../../../commons/Alerts";
import CeldaContextMenuDisney from "../../../../programacion/GrillaProgra/columnas/ColumnaProgra/Celda/context-menu/CeldaContextMenuDisney";
import { actionTypes, useTracked } from "../../../../contexts/CeldaMenuContext";
import { DateTime } from "luxon";

const TimeLine = ({
  setSelectShowSchedule = () => {},
  dataTimeLine,
  getDataShows = () => {},
  loadingData,
  tableData,
  setTableData = () => {},
  searchDate,
  isOpenLeftBar,
}) => {
  const [dataModal, setDataModal] = useState([]);
  const [nameClickEjeY, setNameClickEjeY] = useState(null);
  const [showSelectLabel, setShowSelectLabel] = useState(null);
  const [state, dispatch] = useTracked();
  const timeLineRef = useRef(null);
  const [positionLabelSelect, setPositionLabelSelect] = useState(null);

  const getDataEmptyText = (dataTimeLine) => {
    if (dataTimeLine === null) {
      return "Generate a search to see the data.";
    }
    if (dataTimeLine.length === 0) {
      return "There are no results with the filters applied.";
    }
    return "";
  };

  const alertData = () => {
    const emptyText = getDataEmptyText(dataTimeLine);
    if (!emptyText || loadingData) return null;

    return (
      <div style={{ marginTop: "1rem" }}>
        <Alerts variant="warning">{emptyText}</Alerts>
      </div>
    );
  };

  const onCloseMenuContext = () => {
    setPositionLabelSelect(null);
    setShowSelectLabel(null);
  };

  const handleContextMenu = (e, showLabel, index) => {
    let scrollTopContainer =
      document.querySelector("#main-container").scrollTop;
    setShowSelectLabel(showLabel);
    let scrollTop = timeLineRef.current.scrollTop;
    const contextMenuOffsetY = -50;
    const y = e.clientY + scrollTopContainer - 50;
    dispatch({
      type: actionTypes.CELDA_CONTEXT_MENU_SET,
      payload: (
        <CeldaContextMenuDisney
          show={showLabel?.data_menu}
          x={e.clientX}
          y={y}
          scrollTop={scrollTop}
          offsetY={contextMenuOffsetY}
          isOpenLeftBar={isOpenLeftBar}
          onCloseMenuContext={onCloseMenuContext}
          onSchedule
        />
      ),
    });
  };

  const timeLineMemo = useMemo(() => {
    return (
      <div ref={timeLineRef}>
        <TableTimeLine
          dataArray={dataTimeLine}
          setSelectShowSchedule={setSelectShowSchedule}
          searchDate={searchDate}
          onClickDataLabel={handleContextMenu}
          showSelectLabel={showSelectLabel}
          setPositionLabelSelect={setPositionLabelSelect}
          positionLabelSelect={positionLabelSelect}
        />
      </div>
    );
  }, [positionLabelSelect, dataTimeLine,showSelectLabel]);

  return (
    <>
      {timeLineMemo}
      {alertData()}
    </>
  );
};

export { TimeLine };
