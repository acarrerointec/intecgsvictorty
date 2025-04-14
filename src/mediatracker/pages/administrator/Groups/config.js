import { getTipoNameUnified } from "./dataHelper";

export const columnsGroupsTypes = [
  { accessor: "descrip", Header: "Description" },
  {
    accessor: "deta",
    Header: "Type",
    Cell: (props) => {
      const arrayOrder = props.value
        .map((v) => getTipoNameUnified(v))
        .join(", ");
      return <div>{arrayOrder}</div>;
    },
  },
  {accessor:"usua",Header:"Usuario"},
  {
    accessor: "Actions",
    Header: "Actions",
    isCenter: true,
  },
];
