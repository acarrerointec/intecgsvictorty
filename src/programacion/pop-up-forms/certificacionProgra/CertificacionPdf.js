import React from "react";
/* import {
  PDFDownloadLink
} from "@react-pdf/renderer"; */
import Table from "./Table";

const data = [
    {
        sr: 1,
        desc: "desc1",
        xyz: 5,
    },
    {
        sr: 2,
        desc: "desc2",
        xyz: 6,
    },
];

function ExportPDF() {
    return <></>;
    {
        /* (
        <PDFDownloadLink document={<Table data={data} />} fileName="Certificación de programación.pdf">
          {({ blob, url, loading, error }) =>
            loading ? "Cargando..." : "Descargar PDF"
          }
        </PDFDownloadLink>
      );*/
    }
}

export default ExportPDF;
