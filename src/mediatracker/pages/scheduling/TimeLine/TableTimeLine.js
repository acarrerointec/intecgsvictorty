import React, { useEffect, useState, useRef, useMemo } from "react";
import { DateTime } from "luxon";
import "./tableTimeLine.css";
import Chart from "react-apexcharts";

const TableTimeLine = ({
  dataArray,
  searchDate,
  setSelectShowSchedule = () => {},
  onClickDataLabel = () => {},
  showSelectLabel,
  setPositionLabelSelect = () => {},
  positionLabelSelect,
}) => {
  const chartRef = useRef(null);
  const iconReset = `<svg  xmlns="http://www.w3.org/2000/svg" height="17" width="20" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" fill="#6E8192" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>
`;

  const colorStatus = (item) => {
    if (item.status === "No action" ||item.status === "-") return "#BEBEBE";
    if (item.status === "notShown") return "#00FF0000 ";
    return item.status_color
  };

  const groupedDataArray = useMemo(() => {
    const groupedData = [];
    if (!dataArray || !searchDate) return;
    dataArray.forEach((item, index) => {
      //esto se agrega para que en el timeLine se vean 24 hs//
      const bloqueIni = DateTime.fromFormat(searchDate, "dd-MM-yyyy")
        .set({ hour: 0, minute: 10, second: 0 })
        .toISO();
      const bloqueFin = DateTime.fromFormat(searchDate, "dd-MM-yyyy")
        .plus({ days: 1 })
        .set({ hour: 0, minute: 10, second: 0 })
        .toISO();
      const hasStatusNotShown = dataArray[0]?.some(
        (d) => d.status === "notShown"
      );
      if (index === 0 && !hasStatusNotShown) {
        item.push({
          fechaHoraInicio: bloqueIni,
          fechaHoraFin: bloqueIni,
          status: "notShown",
        });
        item.push({
          fechaHoraInicio: bloqueFin,
          fechaHoraFin: bloqueFin,
          status: "notShown",
        });
      }
      //esto se agrega para que en el timeLine se vean 24 hs//

      const id = index;
      const existingGroup = groupedData.find((group) => group.id === id);
      if (existingGroup) {
        existingGroup.data.push(item);
      } else {
        groupedData.push({ id, data: [item] });
      }
    });
    return groupedData;
  }, [dataArray, positionLabelSelect]);

  const seriesData = groupedDataArray?.map((group) => {
    if (!group) return;
    return {
      name: group.id,
      data: group.data
        .map((array) => {
          return array.map((item, i) => {
            const fillColorLabel =
              group.id === positionLabelSelect?.serieIndex &&
              i === positionLabelSelect?.dataPointIndex;
            return {
              x: `${group.id}`,
              y: [
                new Date(item.fechaHoraInicio).getTime(),
                new Date(item.fechaHoraFin).getTime(),
              ],
              show: item,
              fillColor: fillColorLabel ? "#61a5c3" : colorStatus(item),
              strokeColor: fillColorLabel ? "#61a5c3" : colorStatus(item),
            };
          });
        })
        .flat(),
    };
  });

  const heigthBar = () => {
    return seriesData.length;
  };

  const options = {
    xaxis: {
      tickAmount: 24,
      tickPlacement: "on",
      floating: false,
      position: "top",
      type: "datetime",
      forceNiceScale: true,
      labels: {
        format: "HH:mm",
        offsetY: 0,
        datetimeUTC: false,
        style: {
          fontSize: "16px",
        },
      },
       timezone: "America/Argentina/Buenos_Aires",
    },
    yaxis: {
      labels: {
        style: {
          fontWeight: "500",
          fontSize: "16px",
          fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
          //  cssClass: addClassRowTile(),
        },
        show:false
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
    chart: {
      id: "chart-disney",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const index = config.seriesIndex;
          const dataIndex = config.dataPointIndex;
          const showLabel = config.w.config.series[index].data[dataIndex].show;
          onClickDataLabel(event, showLabel);
          setPositionLabelSelect({
            serieIndex: index,
            dataPointIndex: dataIndex,
          });
        },
      },
      type: "rangeBar",
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: -10,
        tools: {
          // download: `<div id="iconSolid">${iconSolid}</div>`,
          download: false,
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
        barHeight: "80%",
        columnWidth: "70%",
        //esto es para que las barras se superpongan(solapamiento)
        rangeBarOverlap: true,
        //esto es para que las bar tomen el total de la row
        rangeBarGroupRows: true,
        //  isDumbbell: true
      },
    },
    fill: {
      type: "solid",
      //  opacity: 0.7,
    },
    legend: {
      show: false,
      // position: "top",
      // horizontalAlign: "left",
    },
    tooltip: {
      enabled: !showSelectLabel,
      custom: function (ops) {
        const indexData = ops.dataPointIndex;
        const show = ops.w.config.series[ops.seriesIndex].data.filter(
          (d, index) => {
            return index === indexData;
          }
        );
        const showData = show[0].show || {};
        const formatDateFrom = DateTime.fromISO(
          showData.fechaHoraInicio
        ).toFormat("dd/MM/yyyy HH:mm");
        const formatDateTo = DateTime.fromISO(showData.fechaHoraFin).toFormat(
          "dd/MM/yyyy HH:mm"
        );
        if (showData.status === "No mostrar") {
          return "";
        }
        return `
        <div class="arrow_box">
        <div class="text"><strong>Show code:</strong>${
          showData.show_code || "-"
        }</div>
        <div class="text"><strong>Feed:</strong> ${
          showData.feed || "Not feed"
        }</div>
        <div class="text"><strong>Net:</strong> ${
          showData.net || "Not net"
        }</div>
        <div class="text"><strong>LTSA:</strong> ${
          showData.ltsa || "Not program"
        }</div>
        <div class="text"><strong>Date From:</strong> ${
          formatDateFrom || "Not date"
        }</div>
        <div class="text"><strong>Date to:</strong> ${
          formatDateTo || "Not date"
        }</div>
        <div class="text"><strong>Duration:</strong> ${
          showData.duration || "Not duration"
        }</div>
        <div class="text"><strong>Program:</strong> ${
          `${showData?.depor?.trim()}${showData?.program?.trim()}` || "Not program"
        }</div>
        <div class="text"><strong>Title #:</strong> ${
          showData.show|| "Not title"
        }</div>
        <div class="text"><strong>Episode Title:</strong> ${
          showData.epi_title || "Not episode  title"
        }</div>
        </div>
        `;
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const indexData = opts.dataPointIndex;
        const show = opts.w.config.series[opts.seriesIndex].data.filter(
          (d, index) => {
            return index === indexData;
          }
        );
        const showData = show[0].show || {};
        return `${showData?.show_code}`;
      },
      //textAnchor: "start",
      distributed: true,
      style: {
        //color letra
        colors: ["#FFFFFF"],
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    grid: {
      row: {
        // colors: "#FFFFFF",
        opacity: 0.5,
      },
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
        filter: {
          type: !positionLabelSelect ? "none" : "lighten",
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
            position: "top",
            offsetY: 0,
          },
        },
      ],
    },
  };

  if (!seriesData || seriesData?.length == 0) {
    return <></>;
  }
  return (
    <div ref={chartRef}>
      <Chart
        options={options}
        type="rangeBar"
        series={seriesData}
        height={60 + 44 * heigthBar()}
      />
    </div>
  );
};

export { TableTimeLine };
