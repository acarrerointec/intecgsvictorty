import { DateTime } from "luxon";
import { BsCheckSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { CodeCopy } from "../../../../commons/Table/CopyCode";
import styled from "styled-components";
import { FiEdit } from "react-icons/fi";

const customSort = (rowA, rowB, columnId) => {
  const valueA = rowA.values[columnId];
  const valueB = rowB.values[columnId];
  if (valueA === valueB) {
    return 0;
  } else if (valueA === null) {
    return 1;
  } else if (valueB === null) {
    return -1;
  } else if (valueA === true || valueA === 1) {
    return valueB === true || valueB === 1 ? 0 : -1;
  } else {
    return valueB === false || valueB === 0 ? 0 : 1;
  }
};

export const columns = (customHandleClick) => {return [
  {
    accessor:"deli_descrip",
    Header:"Delivery",
    //isActionIcon:true,
    Cell: (props) => <LabelWithAction ><FiEdit onClick={() => customHandleClick["deli_descrip"](props)}/>{props.value || "-"}</LabelWithAction>
  },
  {
    accessor: "codigo",
    Header: "Code",
    Cell: (props) => <CodeCopy code={props.value}></CodeCopy>,
  },
  { accessor: "descripcion", Header: "Description" },
  { accessor: "tipoPromoPublicidad", Header: "Type" },
  { accessor: "feed", Header: "Network" },
  {
    accessor: "fechaHoraInicio",
    Header: "Date",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  { accessor: "duracion", Header: "Duration" },
  { accessor: "statusMedia", Header: "Status" },
  {
    accessor: "ingestEdm",
    sortType: customSort,
    Cell: (props) =>
      props.value == true || props.value == 1 ? (
        <BsCheckSquareFill color={"#80cd7b"} />
      ) : props.value == false || props.value == 0 ? (
        <MdCancel color={"#ef7070"} />
      ) : (
        <></>
      ),
    Header: "Edm QC",
  },
  // {
  //   accessor: "recordingReq",
  //   Header: "Need file",
  //   Cell: (props) => (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       {props.value === true ? (
  //         <BsCheckSquareFill color={"#80cd7b"} />
  //       ) : props.value === false ? (
  //         <MdCancel color={"#ef7070"} />
  //       ) : (
  //         <></>
  //       )}
  //     </div>
  //   ),
  // },
   {
    accessor: "ingestTmk",
    Header: "Origin",
  },
  {
    accessor: "edition",
    Header: "Edition",
    Cell: (props) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.value === "UNDEFINED" ||
        props.value === null ||
        props.value === undefined ? (
          <>-</>
        ) : (
          props.value
        )}
      </div>
    ),
  },
]};

export const columnsLogs = [
  { accessor: "usuario", Header: "User" },
  {
    accessor: "fecha",
    Header: "Date",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  { accessor: "observacion", Header: "Observation" },
];

export const typeOptions = [
  //{ label: "All", value: "todos" },
  { label: "Promotion", value: "promotion" },
  { label: "Program", value: "program" },
  { label: "Commercial", value: "commercial" },
];

export const typeOptionsValue ={
  todos:["todos"],
  program:"PRO",
  commercial:"CO",
  promotion:"PR"
}

export const statusMediaOptions = [
  { value: "Placeholder", label: "Placeholder" },
  { value: "Ready for QC", label: "Ready for QC" },
  { value: "QC Failed", label: "QC Failed" },
  { value: "Ready for Distribution", label: "Ready for Distribution" },
];

export const editionOptions = [
  { value: "Inedit", label: "Inedit" },
  { value: "Live", label: "Live" },
  { value: "Repeat", label: "Repeat" },
];

export const ingestOptions = [
  { value: "ingestSur", label: "Ingest South" },
  { value: "ingestNorte", label: "Ingest North" },
  { value: "ingestEdm", label: "QCEdm" },
  { value: "ingestTedial", label: "Ingest Tedial" },
];

export const originOptions = [
  { value: "edm", label: "Edm" },
  { value: "tmk", label: "Tmk" },
];

export const edmQcOptions = [
  { value: "true", label: "YES"},
  { value: "false",  label:"NO" },
];

// Se agregan opciones para cuando se selecciona el Material Programa
export const typesToProgram = [];

export const defaultValues = {
  codigo: "",
  descripcion: "",
  ingestTmk:"",
  tiposPromoPublicidad: [],
  ingestSur: false,
  ingestNorte: false,
  ingestEdm: "",
  ingestTedial: false,
  statusMedia: [],
  ingest: [],
  emptyIngest: [],
  edition:[]
};

export const defaultValuesSearch = {
  feed: [],
  fechaHoraInicio: ["", ""],
  tipo: [],
  groups:[],
  tiposPromoPublicidad:[],
  groupsTypes: []
};

// ids de los inputs de date para el reset
export const timeInputsIds = ["date-input-desde-ini", "date-input-hasta-ini"];

// id de las keyfilter de los inputs de date
export const timeInput = ["fechaHoraInicio"];

export const defaultResetIds = [
  "select-statusMedia",
  "select-tiposPromoPublicidad",
  "select-statusMedia",
  "select-ingest",
  "select-emptyIngest",
  "select-ingestTmk",
  "select-ingestEdm",
  "select-edition"
];

export const SELECT_OPTIONS = "";

export const booleanFilters = [
  "ingestNorte",
  "ingestSur",
  "ingestTedial",
  // "ingestEdm",
];

export const multiSelectFilter = [
  "feed",
  "tiposPromoPublicidad",
  "tipo",
  "statusMedia",
  "ingest",
  "emptyIngest",
  "edition"
];

const LabelWithAction = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
