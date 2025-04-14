import { DateTime } from "luxon";

export const columnReportViewer = [
  { accessor: "station", Header: "STATION" },
  {
    accessor: "schedule_date",
    Header: "SCHEDULE DATE",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy"),
  },
  { accessor: "schedule_time", Header: "SCHEDULE TIME" },
  {
    accessor: "schedule_end_date",
    Header: "SCHEDULE END DATE",
    Cell: (props) => DateTime.fromISO(props.value).toFormat("dd/MM/yyyy"),
  },
  { accessor: "schedule_end_time", Header: "SCHEDULE END TIME" },
  { accessor: "episode_title", Header: "EPISODE TITLE" },
  { accessor: "program_title", Header: "PROGRAM TITLE" },
  { accessor: "production_episode", Header: "PRODUCTION EPISODE" },
  { accessor: "show_code", Header: "SHOW CODE" },
  { accessor: "box_number", Header: "BOX NUMBER" },
  { accessor: "count_segments", Header: "COUNT SEGMENTS" },
  { accessor: "segment_detail", Header: "FORMATTING" },
  { accessor: "edition", Header: "EDITION" },
  { accessor: "lts", Header: "PROGRAM TYPE" },
];
