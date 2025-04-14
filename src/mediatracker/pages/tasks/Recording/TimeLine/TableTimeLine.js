import React, { useEffect, useState, useRef } from "react";
import Chart from "react-apexcharts";
import { DateTime } from "luxon";
import "./tableTimeLine.css";
import { obtenerValoresUnicos } from "../../../../../../utils/arraysUtils";
import { identificarSolapamiento } from "../../../../../../utils/identificarSuperposicion";
import { convertirSegundosAHorasMinutosSegundos } from "../../../../../../utils/durationHelper";

const TableTimeLine = ({
  dataSelect,
  dataArray,
  isCheckSuperposition,
  setOpenModal = () => {},
  setNameClickEjeY = () => {},
  idInputSelect,
  setAlert,
  setSelectShowSchedule = () => {},
  dataShow,
}) => {
  const chartRef = useRef(null)
  const [idsSolapados, setIdSolapados] = useState([]);
  const [newObjShow, setNewObjShow] = useState(null);
  const [headerChartVis, setHeaderCharVis] = useState("hidden");
  const [headerChartWidth, setHeaderCharWidth] = useState("0px");
  const idsUnicos = obtenerValoresUnicos(dataArray, idInputSelect);
  // const iconSolid = `<svg  xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" fill="#6E8192" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`;
  const iconReset = `<svg  xmlns="http://www.w3.org/2000/svg" height="17" width="20" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" fill="#6E8192" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>
`;

  useEffect(() => {
    if (newObjShow) {
      const newObj = dataShow?.find((d) => d.epi === newObjShow.id);
      setSelectShowSchedule({ ...newObjShow, show: newObj });
    }
  }, [newObjShow]);

  const onScrollFn = (e) => {
      const bounds = chartRef?.current?.getBoundingClientRect()
      if(bounds?.top < 0){
        setHeaderCharVis("visible")
        const posibleWidth = `${bounds?.width}px`
        if(headerChartWidth == "0px" || posibleWidth != headerChartWidth){
          setHeaderCharWidth(posibleWidth)
        }
      } else {
        setHeaderCharVis("hidden")
      }
  };

  useEffect(() => {
    document.addEventListener("scroll", onScrollFn, true);
    return () => {
      document.removeEventListener("scroll", onScrollFn, true);
    };
  }, []);

  useEffect(() => {
    setIdSolapados(
      identificarSolapamiento(dataArray, idsUnicos, idInputSelect)
    );
    setAlert(dataArray?.length === 0);
  }, [dataArray]);

  const colorStatus = (status) => {
    if (status === "No action") return "#BEBEBE";
    if (status === "Need configuration") return "#ffa439";
    if (status === "Need change") return "#ef7070";
    if (status === "Waiting") return "#E2DB68";
    if (status === "Done" || status === "Recording") return "#80cd7b";
    if (status === "Event Change" || status === "Over Lapping")
      return "#ef7070";
  };

  const groupByIdArray = (data) => {
    const groupedData = [];
    if (!data) return;
    data.forEach((item) => {
      const id =
        idInputSelect === "allShows"
          ? "allShows"
          : idInputSelect === "allAssignedShows"
          ? "allAssignedShows"
          : item[idInputSelect];
      const existingGroup = groupedData.find(
        (group) => group[idInputSelect] === id
      );
      if (existingGroup) {
        existingGroup.data.push(item);
      } else {
        groupedData.push({ id, data: [item] });
      }
    });
    return groupedData;
  };

  const groupedDataArray = groupByIdArray(dataArray);

  const nameEjeY = (item) => {
    if (dataSelect === "equipment") return item.equi_graba;
    if (dataSelect === "vinculo") return item.vinculo;
    if (dataSelect === "operator") return item.operador;
    if (dataSelect === "allShows") return item.code;
    if (dataSelect === "allAssignedShows") return item.code;
  };

  const seriesData = groupedDataArray?.map((group) => {
    if (!group) return;
    return {
      name: String(group.id),
      data: group.data.map((item) => {
        return {
          x: `${nameEjeY(item)}`, // Usa el código como valor en el eje X
          y: [
            DateTime.fromISO(item.fecha_desde).toMillis(),
            DateTime.fromISO(item.fecha_hasta).toMillis(),
          ],
          // id: item.show.code,
          show: item,
          fillColor: colorStatus(item.status),
          strokeColor: colorStatus(item.status),
        };
      }),
    };
  });

  const seriesDataColored = seriesData?.map((series) => {
    const isIdToColor = idsSolapados.includes(Number(series.name));
    const color = isIdToColor ? "#FFC2C2" : "#FFFFFF"; // Color rojo si es un id a colorear, blanco si no
    return {
      ...series,
      color,
    };
  });

  const colorIsCheckSuperposition = () => {
    if (isCheckSuperposition) {
      return seriesDataColored.map((series) => series.color);
    }
  };

  const heigthBar = () => {
    if (idInputSelect !== "allShows" && idInputSelect !== "allAssignedShows") {
      return idsUnicos.length;
    }
    return seriesData.length;
  };

  const addClassRowTile = () => {
    if (idInputSelect === "allShows" || idInputSelect === "allAssignedShows") {
      return "rowTitleDisabled";
    }
    return "rowTitle";
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
          cssClass: addClassRowTile(),
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
    chart: {
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const index = config.seriesIndex;
          const show = config.w.config.series[index].data[0].show;
          setTimeout(() => {
            setNewObjShow((prev) => {
              return {
                id: show.epi,
                show,
                clicksCount: prev?.show?.epi == show.epi ? 2 : 1,
              };
            });
          }, 1);
        },
        xAxisLabelClick: function (event, chartContext, config) {
          const idNameClick = config.config.series[config.labelIndex].name;
          if (
            idNameClick !== "allAssignedShows" &&
            idNameClick !== "allShows"
          ) {
            const nameClick = event.target?.childNodes[0].textContent;
            setNameClickEjeY({ name: nameClick, id: Number(idNameClick) });
            setOpenModal(true);
          }
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
      custom: function (ops) {
        const indexData = ops.dataPointIndex;
        const show = ops.w.config.series[ops.seriesIndex].data.filter(
          (d, index) => {
            return index === indexData;
          }
        );
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
          showData.vinculo || "Not input"
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
          convertirSegundosAHorasMinutosSegundos(
            showData.status == "No action"
              ? showData.dura_real
              : showData.duracion
          ) || "Not duration"
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
        const show = opts.w.config.series[opts.seriesIndex].data.filter(
          (d, index) => {
            return index === indexData;
          }
        );
        const showData = show[0].show || {};
        return `${showData.code}`;
      },
      //textAnchor: "start",
      distributed: true,
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    grid: {
      row: {
        colors: colorIsCheckSuperposition(),
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
            position: "top",
            offsetY: 0,
          },
        },
      ],
    },
  };

  const options2 = {
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
          cssClass: addClassRowTile(),
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
    chart: {
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const index = config.seriesIndex;
          const show = config.w.config.series[index].data[0].show;
          setTimeout(() => {
            setNewObjShow((prev) => {
              return {
                id: show.epi,
                show,
                clicksCount: prev?.show?.epi == show.epi ? 2 : 1,
              };
            });
          }, 1);
        },
        xAxisLabelClick: function (event, chartContext, config) {
          const idNameClick = config.config.series[config.labelIndex].name;
          if (
            idNameClick !== "allAssignedShows" &&
            idNameClick !== "allShows"
          ) {
            const nameClick = event.target?.childNodes[0].textContent;
            setNameClickEjeY({ name: nameClick, id: Number(idNameClick) });
            setOpenModal(true);
          }
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
      custom: function (ops) {
        const indexData = ops.dataPointIndex;
        const show = ops.w.config.series[ops.seriesIndex].data.filter(
          (d, index) => {
            return index === indexData;
          }
        );
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
          showData.vinculo || "Not input"
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
          convertirSegundosAHorasMinutosSegundos(
            showData.status == "No action"
              ? showData.dura_real
              : showData.duracion
          ) || "Not duration"
        }</div>
        <div class="text"><strong>Type:</strong> ${
          showData.type || "Not type"
        }</div>
        <div class="text"><strong>Description:</strong> ${
          showData.descrip || "Not description"
        }</div>
        </div>
        `;
      }
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
        return `${showData.code}`;
      },
      //textAnchor: "start",
      distributed: true,
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    grid: {
      row: {
        colors: colorIsCheckSuperposition(),
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
  if (
    idsUnicos.length > 0 ||
    idInputSelect === "allShows" ||
    idInputSelect === "allAssignedShows"
  ) {
    return (
      <div ref={chartRef}>
        <Chart
         
          options={options}
          type="rangeBar"
          series={seriesData}
          height={60 + 44 * heigthBar()}
        />
        <div style={{height:"40px", overflow: "hidden", position: "fixed", top: "60px", width: headerChartWidth, visibility: headerChartVis, backgroundColor: "white"}}>
          <Chart
          options={options2}
          type="rangeBar"
          series={seriesData}
          height={60 + 44 * heigthBar()}
        />
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export { TableTimeLine };
