import React, { useEffect, useRef, useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import {
  Boxstyled,
  StyledTable,
  StyledTableCell,
  StyledTableHeaderCell,
  StyledTableRow,
  TableConteiner,
  Thead,
  EmptyComponent,
} from "./styles";
import { DateTime } from "luxon";
import { ButtonStyled } from "../../../../commons/Button";
import { convertirSegundosAHorasMinutosSegundos } from "../../../../../utils/durationHelper";
import { Select } from "../../../../commons/Select";
import { useTracked, actionTypes } from "../../../../contexts/CeldaMenuContext";
import CeldaContextMenuDisney from "../../../../programacion/GrillaProgra/columnas/ColumnaProgra/Celda/context-menu/CeldaContextMenuDisney";

const TableScheduling = ({
  columns = [],
  data = [],
  actions = [],
  dataEmpty = "",
  rowClickHandler = () => {},
  selectedRowIndex = null,
  setSelectedRowIndex = () => {},
  selectPage,
  setSelectPage = () => {},
  selectRowData,
  handleRightClick = () => {},
  paginate = true,
  withoutSelection,
  pageSizeTable,
  isOpenLeftBar
}) => {
  const plugins = [useSortBy];
  if (paginate) {
    plugins.push(usePagination);
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    rows,
    state: { pageIndex, sortBy },
  } = useTable(
    {
      columns,
      data,
      //disableSortRemove: true,
      initialState: {
        pageIndex: selectPage ? selectPage : 0,
        pageSize: pageSizeTable ? pageSizeTable : 20,
        // sortBy: [
        //   {
        //     id: "date",
        //     desc: false,
        //   },
        // ],
      },
    },
    ...plugins
  );

  const [selectedRow, setSelectedRow] = useState(null);
  const tableRef = useRef(null);
  const [state, dispatch] = useTracked();
  const [notScrollContainerTable,setNotScrollContainerTable]=useState(false)

  const displayedRows = paginate ? page : rows;

  const options = [
    { value: 10, label: "Show 10" },
    { value: 20, label: "Show 20" },
    { value: 30, label: "Show 30" },
    { value: 50, label: "Show 50" },
  ];

  useEffect(() => {
    if (setSelectPage) return setSelectPage(pageIndex);
  }, [pageIndex]);

  const handleContextMenu = (e,row) => {
    e.persist()
    e.preventDefault();
    let scrollTopContainer = document.querySelector("#main-container").scrollTop
    setSelectedRowIndex(row.id)
    let scrollTop = tableRef.current.scrollTop
    const contextMenuOffsetY = -50
    const y=e.clientY +scrollTopContainer - 50
    const formatHoraIni=DateTime.fromISO(row.original.data_menu.fechaIni).toFormat("HH:mm")
    const formatHoraFin=DateTime.fromISO(row.original.data_menu.fechaFin).toFormat("HH:mm")
    dispatch({
      type: actionTypes.CELDA_CONTEXT_MENU_SET,
      payload: (
        <CeldaContextMenuDisney
          dataTable={data}
          show={{
            ...row.original.data_menu,
            finHHMM: formatHoraFin,
            iniHHMM: formatHoraIni,
          }}
          x={e.pageX}
          y={y}
          scrollTop={scrollTop}
          offsetY={contextMenuOffsetY}
          isOpenLeftBar={isOpenLeftBar}
        />
      ),
    });
  }

  useEffect(()=>{
    if(state.celdaContextMenu){
      setNotScrollContainerTable(true)
    }else{
      setNotScrollContainerTable(false)
      setSelectedRowIndex(null)
    }
  },[state.celdaContextMenu])

  return (
    <div>
      <TableConteiner
        notOverflow={notScrollContainerTable}
        id="container-table"
        ref={tableRef}
      >
        <StyledTable {...getTableProps()} variant="striped">
          <Thead
            borderBottom="2px solid"
            borderBottomColor={"paleta.secundary"}
            marginBottom={"5px"}
          >
            {headerGroups.map((headerGroup) => (
              <StyledTableRow {...headerGroup.getHeaderGroupProps()} isHeader>
                {headerGroup.headers.map((column) => {
                  return (
                    <StyledTableHeaderCell
                      color={"black"}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </StyledTableHeaderCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </Thead>
          <tbody {...getTableBodyProps()} style={{ marginTop: "40px" }}>
            {displayedRows.map((row, i) => {
              prepareRow(row);
              return (
                <StyledTableRow
                  isSelected={row.id == selectedRowIndex}
                  {...row.getRowProps()}
                  isEven={i % 2 === 0}
                  // onDoubleClick={() => {
                  //   if (rowClickHandler) {
                  //   }
                  // }}
                  // onClick={() => {
                  //   rowClickHandler(row.original);
                  //   setSelectedRowIndex(row.original.epi);
                  // }}
                  // hasClickHandler={rowClickHandler}
                  onContextMenu={(event) => handleContextMenu(event, row)}
                >
                  {row.cells.map((cell) => {
                    let cellValue = cell.render("Cell");
                    return (
                      <StyledTableCell
                        className="td"
                        {...cell.getCellProps()}
                        color={
                          ["Status", "Priority"].includes(cell.column.Header)
                            ? colors[cell.value]
                            : null
                        }
                      >
                        {cell.column.Header === "Actions" ? (
                          <ActionsContainer actions={actions} row={row} />
                        ) : (
                          cellValue
                        )}
                      </StyledTableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
          </tbody>
        </StyledTable>
        {data.length === 0 ? (
          <EmptyComponent>{dataEmpty}</EmptyComponent>
        ) : null}

        {paginate && (
          <Boxstyled>
            <ButtonStyled
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              width={"40px"}
              height={"40px"}
            >
              {"<"}
            </ButtonStyled>{" "}
            <ButtonStyled
              onClick={() => nextPage()}
              disabled={!canNextPage}
              width={"40px"}
              height={"40px"}
            >
              {">"}
            </ButtonStyled>
            <span>
              {"Page "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{" "}
            </span>
            {!withoutSelection && (
              <div>
                <Select
                  options={options}
                  onChange={(e) =>
                    setPageSize(
                      e.target.value
                        ? Number(e.target.value)
                        : pageSizeTable
                        ? pageSizeTable
                        : 20
                    )
                  }
                />
              </div>
            )}
          </Boxstyled>
        )}
      </TableConteiner>
    </div>
  );
};

const ActionsContainer = ({ actions, row }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        justifyContent: "center",
        color: "grey",
      }}
    >
      {actions?.map((action) => {
        if (row.original.Status !== "Not File" && action.validate)
          return <div key={action.key}></div>;
        return (
          <div
            style={{ cursor: "pointer", fontSize: "20px" }}
            onClick={() => action.handler(row.original)}
            key={action.key}
          >
            {action.icon}
          </div>
        );
      })}
    </div>
  );
};

const colors = {
  Low: "#80cd7b",
  Medium: "#e2db68",
  High: "#ef7070",
  Done: "#80cd7b",
  Recording: "#80cd7b",
  Waiting: "#e2db68",
  "Need configuration": "#ffa439",
  "Need change": "#ef7070",
  "Event Change": "#ef7070",
  "Over Lapping": "#ef7070",
  "No action": "#cbcbcb",
  DONE: "#80cd7b",
  INPROGRESS: "#e2db68",
  WARNING: "#ef7070",
  Placeholder: "#eaeaea",
  "Ready for QC": "#e2db68",
  "QC Failed": "#ef7070",
  "Ready for Distribution": "#80cd7b",
};

export { TableScheduling };