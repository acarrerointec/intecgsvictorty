import React, { useEffect, useState } from "react";
import { error } from "../../../../commons/snackbarConfig";
import { useSnackbar } from "react-simple-snackbar";
import axiosApi from "../../../../../axiosApi";
import { columnsRecords } from "./config";
import { Container } from "./styles";
import Box from "../../../../commons/Box";
import { TaskRecordsFilter } from "./TaskRecordsFilter";
import SimpleTabs from "./TabPanel";
import { TaskConfiguration } from "./TaskConfiguration";
import { TaskRecordingSearch } from "./TaskRecordsSearch";
import { TableRecording } from "./TableRecording";
import { TimeLine } from "./TimeLine";
import { DateTime } from "luxon";
import {ReportePlaylist} from "./ReportePlaylist";
import { useOrderColumns } from "../../../../hooks/useOrderColumns";
import DrawerColumns from "../../../../commons/DrawerColumns";
import { tableConfigByPage } from "../../../../../utils/helperTableConfigByPage";

const TaskRecordingView = ({ setPageLoading }) => {
  const [filteredData, setFilteredData] = useState(null);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [reloadDataWithoutReload, setReloadDataWithoutReload] = useState(0);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectPage, setSelectPage] = useState(null);
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [sortByRecording, setSortByRecording] = useState([]);
  const [selectTabRecording, setSelectedTabRecording] = useState(false);
  const [isInConfig,setIsInConfig]= useState(false)
  const [reportPlayList,setReportPlayList]= useState(false)
  const [selectShowSchedule,setSelectShowSchedule]= useState(null)
  const [dataTimeLine, setDataTime] = useState(null);
  const [dataShow,setDataShow] = useState(null)
  const [tableData, setTableData] = useState(null);
  const [alertTimeLine, setAlertTimeLine] = useState(false);
  const [dataSelectInput, setDataSelectInput] = useState("");
  const [formValuesTimeLine, setFormValuesTimeLine] = useState({
    date: "",
  });
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const { columnsTableOrdered, columnsOrdered, postOrderColumnsData,loading } = useOrderColumns(
    columnsRecords,
    tableConfigByPage.RECORDING
  );

  useEffect(()=>{
   if(selectShowSchedule?.clicksCount == 2){
    setSelectRowData(selectShowSchedule.show)
    setSelectedRowIndex(null)
    setIsInConfig(true)
   }
   if(selectShowSchedule?.clicksCount == 1){
    setSelectRowData(selectShowSchedule.show)
   }
  },[selectShowSchedule])

  const handleReloadClick = () => {
    closeSnackbar();
    setReloadData((prev) => ++prev);
  };

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  const resetTable = () => {
    setSelectPage(0);
    setSelectRowData(null);
    setSelectedRowIndex(null);
  };

  const getData = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `recording`;
      const api = await axiosApi();
      const { data } = await api.get(url, {
        params: {
          fechaDesde: dateFrom,
          fechaHasta: dateTo ? dateTo : null,
        },
      });
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setData(data.model || []);
      // reseteo cada vez que cargo nuevos datos
      setFilteredData(null);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
          <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            onClick={handleReloadClick}
          >
            try again
          </strong>
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataSource = () => {
    if (filteredData) {
      // return filteredData
      const filterDataOrdenCode = filteredData.sort(function (a, b) {
        if (DateTime.fromISO(a.date).toMillis() > DateTime.fromISO(b.date).toMillis()) {
          return 1;
        }
        if (DateTime.fromISO(a.date).toMillis() < DateTime.fromISO(b.date).toMillis()) {
          return -1;
        }
        return 0;
      });
      return filterDataOrdenCode;
    }
    if (data) {
      const dataOrdenCode = data.sort(function (a, b) {
        if (DateTime.fromISO(a.date).toMillis() > DateTime.fromISO(b.date).toMillis()) {
          return 1;
        }
        if (DateTime.fromISO(a.date).toMillis() < DateTime.fromISO(b.date).toMillis()) {
          return -1;
        }
        return 0;
      });
      return dataOrdenCode;
    }
    return [];
  };

  const getDataShows = async (formValuesTimeLine) => {
    try {
      const fechaDesde = DateTime.fromFormat(
        formValuesTimeLine.date,
        "yyyy-MM-dd"
      ).minus({ days: 1 }).toISO();
      const fechaHasta = DateTime.fromFormat(formValuesTimeLine.date, "yyyy-MM-dd")
      .plus({ days: 1 })
        .toISO();

      const url = `recording`;
      const api = await axiosApi();
      const { data } = await api.get(url, {
        params: {
          fechaDesde: fechaDesde,
          fechaHasta: fechaHasta,
        },
      });
      setDataShow(data.model);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
        </p>
      );
      openSnackError(message, 600000);
      console.log(error);
    }
  };

  const getTimeLine = async (withLoading,formValuesTimeLine) => {
    if(!formValuesTimeLine.date) return
    try {
      withLoading && setLoadingData(true);
      const fechaDesde = DateTime.fromFormat(
        formValuesTimeLine.date,
        "yyyy-MM-dd"
      ).toISO();
      const fechaHasta = DateTime.fromFormat(formValuesTimeLine.date, "yyyy-MM-dd")
        .plus({
          minutes: 24 * 60 - 1,
        })
        .toISO();

      const url = `timeLine`;
      const api = await axiosApi();
      const { data } = await api.post(url, {
        fechaDesde,
        fechaHasta,
      });
      setLoadingData(false);
      setDataTime(data.model);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
          {/* <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            // onClick={handleReloadClick}
          >
            try again
          </strong> */}
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const roaldDataSchedule=()=>{
    getDataShows(formValuesTimeLine)
    getTimeLine(false,formValuesTimeLine)
  }

  const rowClickHandle = (d) => setSelectRowData(d);

  const getDataEmpty = () => {
    if (loadingData) return "Loading...";
    if(data === null) return "Generate a search to see the data"
    return "There are no results with the filters applied";
  }

  const dataTabs = [
    {
      titleTabs: "Recording",
      disabledTitle: false,
      contenidoTab: (
        <TableRecording
          columns={columnsTableOrdered}
          data={getDataSource()}
          dataEmpty={getDataEmpty()}
          rowClickHandler={rowClickHandle}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          selectPage={selectPage}
          setSelectPage={setSelectPage}
          selectRowData={selectRowData}
          setSortByRecording={setSortByRecording}
          sortByRecording={sortByRecording}
          setIsInConfig={setIsInConfig}
        />
      ),
    },
    {
      titleTabs: "Configuration",
      disabledTitle: selectRowData === null,
      contenidoTab: selectRowData ? (
        <TaskConfiguration
          resetIsInConfig={()=> setIsInConfig(false)}
          reloadData={() => setReloadDataWithoutReload((prev) => ++prev)}
          selectRowData={selectRowData}
          rowClickHandler={rowClickHandle}
          setSelectRowData={setSelectRowData}
          selectShowSchedule={selectShowSchedule}
          roaldDataSchedule={roaldDataSchedule}
        />
      ) : null,
    },
    {
      titleTabs: "Schedule",
      contenidoTab:
        <TimeLine
        setSelectShowSchedule={setSelectShowSchedule} 
        dataTimeLine={dataTimeLine}
        dataShow={dataShow}     
        getDataShows={getDataShows}
        getTimeLine={getTimeLine}
        loadingData={loadingData}
        setTableData={setTableData}
        tableData={tableData}
        alertTimeLine={alertTimeLine}
        setAlertTimeLine={setAlertTimeLine}
        setDataSelectInput={setDataSelectInput}
        dataSelectInput={dataSelectInput}
        setFormValuesTimeLine={setFormValuesTimeLine}
        formValuesTimeLine={formValuesTimeLine}
        />
    },
  ];

  return (
    <Container>
      <Box>
        <TaskRecordingSearch
          getData={getData}
          reloadData={reloadData}
          reloadDataWithoutReload={reloadDataWithoutReload}
          resetTable={resetTable}
        />
      </Box>
      <Box>
        <TaskRecordsFilter
          selectTabRecording={selectTabRecording}
          data={data}
          setFilteredData={setFilteredData}
          getData={getData}
          setSelectedRowIndex={setSelectedRowIndex}
          selectedRowIndex={selectedRowIndex}
          setSelectRowData={setSelectRowData}
        />
      </Box>
      <Box>
        <SimpleTabs
          setIsOpenDrawer={setIsOpenDrawer}
          data={dataTabs}
          setReloadData={setReloadData}
          setSelectedTabRecording={setSelectedTabRecording}
          isInConfig={isInConfig}
          setIsInConfig={setIsInConfig}
          setReportPlayList={setReportPlayList}
        />
      </Box>
    {reportPlayList &&
     <ReportePlaylist isOpen={reportPlayList} 
     setReportPlayList={setReportPlayList}/>
     }
     {isOpenDrawer && <DrawerColumns
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        columnsTable={columnsRecords}
        columnsOrdered={columnsOrdered}
        onSave={(items, cb) => postOrderColumnsData(items, cb)}
        loading={loading}
      />}
    </Container>
  );
};

export { TaskRecordingView };
