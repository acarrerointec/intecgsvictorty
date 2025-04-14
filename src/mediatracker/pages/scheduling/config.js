export const columnsTable = [
  { accessor: "net", Header: "Feed"},
  { accessor: "feed", Header: "Network" },
  { accessor: "show_code", Header: "Show Code" },
  { accessor: (row) => `${row?.depor?.trim()}${row?.program?.trim()}`, Header: "Program" },
  { accessor: (row) => row.show, Header: "Title #" },
  { accessor: "epi_title", Header: "Episode Title" },
  { accessor: "dow", Header: "DOW" },
  {
    accessor: "start_date",
    Header: "Start Date",
  },
  {
    accessor: "start_time",
    Header: "Start Time",
  },
  { accessor: "end_date", Header: "End Date"}, 
  { accessor: "end_time", Header: "End Time"},
  { accessor: "duration", Header: "Duration" },
  { accessor: "ltsa", Header: "LTSA" },
  { accessor: "status", Header: "Status" },
];

export const columnsTableRutina = [
  { accessor: "orden", Header: "Order" },
  { accessor: "avail", Header: "Avail" },
  { accessor: "tipo_publi", Header: "TP" },
  { accessor: "dura_real", Header: "Duration" },
  { accessor: "mate_tmk", Header: "Material TMK" },
  { accessor: "mate", Header: "Material" },
  {
    accessor: "nombre",
    Header: "Name ",
  },
  {
    accessor: "observacion",
    Header: "Observation",
  },
  {
    accessor: "cliente_razon",
    Header: "Client",
  },
  { accessor: "rubro_descrip", Header: "Heading" },
  { accessor: "selling_rota_descrip", Header: "SR" },
  { accessor: "op", Header: "OP" },
  { accessor: "ncs_prp_id", Header: "NCS PRP" },
  { accessor: "ncs_pob_id", Header: "NCS POB" },
  { accessor: "id_version", Header: "Id_version" },
  { accessor: "spot", Header: "Spot" },
  { accessor: "ncs_ut_id", Header: "NCS UT" },
  { accessor: "ncs_epi_id", Header: "NCS EPI" },
  { accessor: "conci", Header: "STATE" },
];
