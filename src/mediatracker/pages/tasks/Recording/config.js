import { DateTime } from "luxon";
import { convertirSegundosAHorasMinutosSegundos } from "../../../../../utils/durationHelper";
import { BsCheckSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { CodeCopy } from "../../../../commons/Table/CopyCode";

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

export const columnsRecords = [
  { accessor: "code", Header: "Code",Cell: (props) => (
    <CodeCopy code={props.value}></CodeCopy> )},
  { accessor: "description", Header: "Description" },
  { accessor: "type", Header: "Type" },
  // { accessor: "feed", Header: "Feed" },
  {
    accessor: "date",
    Header: "Date",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  { accessor: "dateDiferido", Header: "Date deferred", 
   Cell: (props) => props.value ? 
   DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm") : "-"},
  { accessor: "duration", Header: "Duration" },
  { accessor: "status", Header: "Status" },
  { accessor: "input", Header: "Input" },
  { accessor: "equipment", Header: "Equipment" },
  { accessor: "operador", Header: "Operator" },
  { accessor: "epi", Header: "Epi" },
  { accessor: "priority", Header: "Priority" },
  {
    accessor: "reqGrabacion",
    Header: "Need file",
    sortType: customSort,
    Cell: (props) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.value === true ? (
          <BsCheckSquareFill color={"#80cd7b"} />
        ) : props.value === false ? (
          <MdCancel color={"#ef7070"} />
        ) : (
          <></>
        )}
      </div>
    ),
  },
];

export const columnsEpiConfig = [
  {
    accessor: "date",
    Header: "Date",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  {
    accessor: "duracion",
    Header: "Duration",
    Cell: (props) => convertirSegundosAHorasMinutosSegundos(props.value),
  },
  { accessor: "vinculo", Header: "Input" },
  { accessor: "equi_graba", Header: "Equipment" },
  { accessor: "operador", Header: "Operator" },
];

export const defaultValues = {
  code: "",
  description: "",
  type: [],
  feed: [],
  date: "",
  dateDiferido:"",
  duration: "",
  status: [],
  input: [],
  equipment: [],
  operator: [],
  epi: [],
  priority: [],
};

export const defaultValuesSearch = {
  fechaHoraInicio: [DateTime.now().toFormat("dd-MM-yyyy"), DateTime.now().toFormat("dd-MM-yyyy")],
};

export const statusOptions = [
  { value: "recording", label: "Recording" },
  { value: "done", label: "Done" },
  { value: "Waiting", label: "Waiting" },
  { value: "Need configuration", label: "Need configuration" },
  { value: "Need change", label: "Need change" },
  { value: "event Change", label: "Event Change" },
  { value: "over laping", label: "Over Laping" },
  { value: "No action", label: "No action" },
];

export const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Done", label: "Done" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
];

export const typeOptions = [
  { value: "Diferido", label: "Diferido" },
  { value: "Live", label: "Live" },
];

export const multiSelectFilter = [
  "status",
  "type",
  "input",
  "priority",
  "feed",
  "operator",
  "equipment",
];

export const defaultResetIds = [
  "select-type",
  "select-feed",
  "select-status",
  "select-priority",
  "select-operator",
  "select-input",
  "select-equipment",
];
export const SELECT_OPTIONS = "";
