import React from "react";
import { columnReportViewer } from "./config";
import { Table } from "../../../../commons/Table";

const TableReportViewer = ({ data,showReport }) => {

  return (
    <>
      <h3 style={{marginBottom: '0px'}}>Report preview</h3>
      <div style={{maxHeight: '244px', overflow: 'auto'}}>
        <Table
          columns={columnReportViewer.map((column) => ({
            ...column,
            viewReport: showReport,
          }))}
          data={data}
          pageSizeTable={4}
          withoutSelection
          dataEmpty={"No results were found with the applied parameters"}
        />
      </div>
    </>
  );
};

export default TableReportViewer;
