import React from "react";
import Chart from "react-apexcharts";
import { DateTime } from "luxon";
import { convertirSegundosAHorasMinutosSegundos } from "../../../../../../utils/durationHelper";

  const TableShows = ({ dataArray, dateSelect}) => {
  const iconSolid = `<svg  xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" fill="#6E8192" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`;
  const iconReset = `<svg  xmlns="http://www.w3.org/2000/svg" height="17" width="20" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" fill="#6E8192" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>
`;

  const colorStatus = (status) => {
    if (status === "No action") return "#BEBEBE";
    if (status === "Need configuration") return "#ffa439";
    if (status === "Need change") return "#ef7070";
    if (status === "Waiting") return "#E2DB68";
    if (status === "Done" || status === "Recording") return "#80cd7b";
    if (status === "Event Change" || status === "Over Lapping")
      return "#ef7070";
  };
  const series = dataArray.map((d, index) => {
    return {
      x: `${d.code}`,
      y: [
        DateTime.fromISO(d.fecha_desde).toMillis(),
        DateTime.fromISO(d.fecha_hasta).toMillis(),
      ],
      show: d,
      fillColor: colorStatus(d.status),
      seriesIndex: index,
      strokeColor: colorStatus(d.status),
    };
  })
  
  const options = {
    yaxis: {
      labels: {
        style: {
          fontWeight: "500",
          fontSize: "16px",
          fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
        },
      },
      axisTicks: {
        show: true,
        borderType: "solid",
        color: "#78909C",
        width: 8,
        offsetX: 0,
        offsetY: 0,
      },
    },
    xaxis: {
      position: "top",
      type: "datetime",
      labels: {
        offsetY: 8,
        datetimeUTC: false,
        style: {
          fontSize: "16px",
        },
      },
       timezone: "America/Argentina/Buenos_Aires",
    },
    chart: {
      type: "rangeBar",
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: -10,
        tools: {
          download: `<div id="iconSolid">${iconSolid}</div>`,
          selection: false,
          zoom: false,
          zoomin: true,
          zoomout: true,
          reset: `<div id="iconReset">${iconReset}</div>`,
          pan: false,
        },
        // autoSelected: "pan",
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        barHeight: "90%",
        // rangeBarOverlap:true,
        // isDumbbell: true,
      },
    },
    fill: {
      type: "solid",
      //  opacity: 0.7,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    tooltip: {
      shared: false,
      custom: function (ops) {
        const indexData = ops.dataPointIndex;
        const show = ops.w.config.series[0].data.filter((d, index) => {
          return index === indexData;
        });
        const showData = show[0].show || {};
        const formatDateFrom = DateTime.fromMillis(ops.y1).toFormat(
          "dd/MM/yyyy HH:mm"
        );
        const formatDateTo = DateTime.fromMillis(ops.y2).toFormat(
          "dd/MM/yyyy HH:mm"
        );
        return `
        <div class="arrow_box">
        <div class="text"><strong>Code:</strong> ${
          showData.code || "Not code"
        }</div>
        <div class="text"><strong>Equipment:</strong> ${
          showData.equi_graba || "Not equipment"
        }</div>
        <div class="text"><strong>Input:</strong> ${
          showData.vinculo || "Not inputs"
        }</div>
        <div class="text"><strong>Operator:</strong> ${
          showData.operador || "Not operator"
        }</div>
        <div class="text"><strong>Date From:</strong> ${
          formatDateFrom || "Not date"
        }</div>
        <div class="text"><strong>Date To:</strong> ${
          formatDateTo || "Not date"
        }</div>
        <div class="text"><strong>Status:</strong> ${
          showData.status || "Not status"
        }</div>
        <div class="text"><strong>Duration:</strong> ${
          convertirSegundosAHorasMinutosSegundos(showData.duracion) ||
          "Not duration"
        }</div>
        <div class="text"><strong>Type:</strong> ${
          showData.type || "Not type"
        }</div>
        <div class="text"><strong>Description:</strong> ${
          showData.descrip || "Not description"
        }</div>
        </div>
              `;
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const indexData = opts.dataPointIndex;
        const show = opts.w.config.series[0].data.filter((d, index) => {
          return index === indexData;
        });
        const showData = show[0].show || {};
        return `DURATION: ${convertirSegundosAHorasMinutosSegundos(showData.duracion)}`;
      },
      //textAnchor: "start",
      distributed: true,
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: "bold",
      },
      enabledOnSeries: [0],
    },
    grid: {
      show: true,
      borderColor: "#cdcdcd",
      strokeDashArray: 5,
      position: "back",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 30,
        bottom: 0,
        left: 30,
      },
    },
    states: {
      hover: {
        filter: {
          type: "lighten",
          value: -0.15,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "lighten",
          value: -0.35,
        },
      },
    },
    stroke: {
      width: 1,
    },
    annotations: {
      xaxis: [
        {
          x: new Date().getTime(),
          borderColor: "#FF0000",
          strokeDashArray: 10,
          label: {
           text: "Current time",
           position:"top",
           offsetY: 0,
          },
        }
      ],
    },
  };

  return (
    <Chart
      options={options}
      series={[{ data: series }]}
      type="rangeBar"
      height={60 + 44 * dataArray.length}
    />
  );
};

export { TableShows };
