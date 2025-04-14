import { DateTime } from "luxon";
import { RxEyeOpen  } from "react-icons/rx";
import { MdCancel } from "react-icons/md";

export const columnReportViewer = [
  {
    accessor: "reporte",
    Header: "Report",
    viewReport: true,
    Cell: (props) =>
      props.value.length > 0 ? (
        <div
          style={{ cursor: "pointer" }}
          onClick={() =>
            props.column.viewReport &&
            props.column.viewReport(props.row.original.reporte,props.row.original.episodio)
          }
        >
          <RxEyeOpen color={"#80cd7b"} fontSize={"20px"} />
        </div>
      ) : props.value == false ? (
        <div style={{ cursor: "not-allowed" }}>
          <MdCancel color={"#ef7070"} fontSize={"20px"} />
        </div>
      ) : (
        <></>
      ),
  },
  { accessor: "canal", Header: "Channel" },
  { accessor: "senial", Header: "Signal" },
  { accessor: "tipo", Header: "Type" },
  { accessor: "descripcion", Header: "Description" },
  { accessor: "duracion", Header: "Duration" },
  { accessor: "emision", Header: "Emission" },
  { accessor: "episodio", Header: "Episode" },
  {
    accessor: "fecha_Fin",
    Header: "Date end",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  {
    accessor: "fecha_Inicio",
    Header: "Date to",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  // { accessor: "reporte",
  //  Header: "Report" ,
  // Cell: (props) => {
  //   {props.value === true ? (
  //     <Box>
  //   ) : props.value === false ? (
  //     <MdCancel color={"#ef7070"} />
  //   ) : (
  //     <></>
  //   )}

  //     <FaRegTrashCan
  //       cursor={"pointer"}
  //     onClick={() =>
  // item.reporte &&
  // item.reporte.trim() &&
  // showReport(item.reporte, item.episodio)
  //     />
  //   )}
  //   },
];


// {item.reporte && item.reporte.trim()
//   ? "Ver reporte"
//   : "Sin reporte"}