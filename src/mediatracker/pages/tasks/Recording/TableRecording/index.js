import React, { useEffect } from "react";
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
import { ButtonStyled } from "../../../../../commons/Button";
import { Select } from "../../../../../commons/Select";
import { convertirSegundosAHorasMinutosSegundos } from "../../../../../../utils/durationHelper";
import { DateTime } from "luxon";

const TableRecording = ({
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
  setSortByRecording = () => {},
  sortByRecording,
  setIsInConfig,
}) => {
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
    state: { pageIndex, sortBy },
  } = useTable(
    {
      columns,
      data,
      //disableSortRemove: true,
      initialState: {
        pageIndex: selectPage ? selectPage : 0,
        pageSize: 20,
        sortBy: sortByRecording ? sortByRecording : [],
        // sortBy: [
        //   {
        //     id: "date",
        //     desc: false,
        //   },
        // ],
      },
    },
    useSortBy,
    usePagination
  );
  const options = [
    { value: 10, label: "Show 10" },
    { value: 20, label: "Show 20" },
    { value: 30, label: "Show 30" },
    { value: 50, label: "Show 50" },
  ];

  useEffect(() => {
    if (setSelectPage) return setSelectPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    if (JSON.stringify(sortBy) != JSON.stringify(sortByRecording)) {
      if (setSortByRecording) {
        setSortByRecording(sortBy);
      }
    }
  }, [sortBy]);

  return (
    <TableConteiner>
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
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <StyledTableRow
                isSelected={row.original.epi === selectedRowIndex}
                {...row.getRowProps()}
                isEven={i % 2 === 0}
                onDoubleClick={() => {
                  if (rowClickHandler) {
                    setIsInConfig(true);
                  }
                }}
                onClick={() => {
                  rowClickHandler(row.original);
                  setSelectedRowIndex(row.original.epi);
                }}
                hasClickHandler={rowClickHandler}
              >
                {row.cells.map((cell) => {
                  let cellValue = cell.render("Cell");

                  const diferido = cell.row.original.type === "Diferido";
                  const dateDiferido = cell.row.original.dateRecording;
                  if (cell.column.Header === "Date" && diferido) {
                    cellValue = dateDiferido
                      ? DateTime.fromISO(dateDiferido).toFormat(
                          "dd/MM/yyyy HH:mm"
                        )
                      : null;
                  }
                  if (cell.column.Header === "Duration" && diferido) {
                    cellValue = convertirSegundosAHorasMinutosSegundos(
                      cell.row.original.dura_recording
                    );
                  }

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
      {data.length === 0 ? <EmptyComponent>{dataEmpty}</EmptyComponent> : null}

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
        <div>
          <Select
            options={options}
            onChange={(e) =>
              setPageSize(e.target.value ? Number(e.target.value) : 20)
            }
          />
        </div>
      </Boxstyled>
    </TableConteiner>
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

export { TableRecording };
