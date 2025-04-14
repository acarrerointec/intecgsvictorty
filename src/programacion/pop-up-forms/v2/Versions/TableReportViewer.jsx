import React from "react";
import { columnReportViewer } from "./config";
import  SimpleTable  from "../../../../commons/Table/SimpleTable";

const TableReportViewer = ({ data,showReport }) => {

  return (
    <>
      <h3 style={{marginBottom: '0px'}}>Report preview</h3>
      {/* <div style={{maxHeight: '800px', overflow: 'auto'}}> */}
        <SimpleTable
          columns={columnReportViewer.map((column) => ({
            ...column,
            viewReport: showReport,
          }))}
          data={data}
          // notOverflow="unset"
          dataEmpty={"No results were found with the applied parameters"}
        />
      {/* </div> */}
    </>
  );
};

export default TableReportViewer;
