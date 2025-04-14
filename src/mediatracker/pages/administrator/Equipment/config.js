import { DateTime } from "luxon";
import { BsCheckSquareFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

export const columnsEquipment = [
  { accessor: "id", Header: "Id" },
  { accessor: "descrip", Header: "Description" },
  {
    accessor: "tiene_fechas_off",
    Header: "Available",
    Cell: (props) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.value === false ? (
          <BsCheckSquareFill color={"#80cd7b"} />
        ) : props.value === true ? (
          <MdCancel color={"#ef7070"} />
        ) : (
          <></>
        )}
      </div>
    ),
    isCenter: true
  },
];

export const columnsEquipmentChange = [
  { accessor: "id", Header: "Id" },
  {
    accessor: "fechaInicio",
    Header: "Date From",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  {
    accessor: "fechaFin",
    Header: "Date To",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy HH:mm"),
  },
  // { accessor: "description", Header: "Description", Cell: (props) => (props.value).toUpperCase() },
  {
    accessor: "delete",
    Header: "Delete",
    deleteHandler: null,
    Cell: (props) => {
      return (
        <FaRegTrashCan
          cursor={"pointer"}
          onClick={() =>
            props.column.deleteHandler &&
            props.column.deleteHandler(props.row.original)
          }
        />
      );
    },
  },
];

export const defaultValues = {
  id: [],
  descrip: [],
};

export const multiSelectFilter = ["id"];

export const defaultResetIds = ["select-id", "select-description"];
export const SELECT_OPTIONS = "";
