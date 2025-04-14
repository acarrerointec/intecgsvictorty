import Box from "../../../../commons/Box";
import { SchedulingDisneyPlusSearch } from "./SchedulingDisneyPlusSearch";
import { Container, ContainerButtons, ContainerTitle, Title } from "./styles";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { useEffect, useState } from "react";
import SimpleTabs from "./TabPanel";
import ReactExport from "react-data-export";
import {
  headerStyles,
  rowStyles,
} from "../../../../programacion/pop-up-forms/certificacionProgra/excelStyles";
import { BsDownload } from "react-icons/bs";
import { TableScheduling } from "../TableScheduling";
import { columnsTable } from "../config";
import { DateTime } from "luxon";
import { TimeLine } from "../TimeLine";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { Provider } from "../../../../contexts/CeldaMenuContext";
import { ProgramacionContext } from "../../../../contexts/ProgramacionContext";
import PopUpModules from "../../../../../pages/PopUpModules";
import axiosApi from "../../../../../axiosApi";
import { TbSettingsPause } from "react-icons/tb";
import { useOrderColumns } from "../../../../hooks/useOrderColumns";
import DrawerColumns from "../../../../commons/DrawerColumns";
import { tableConfigByPage } from "../../../../../utils/helperTableConfigByPage";

const SchedulingDisneyPlus = ({ setPageLoading, isOpenLeftBar }) => {
  const [dataDisneyPlus, setDataDisneyPlus] = useState(null);
  const [dataTimeLine, setDataTimeLine] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [multiDataSet, setMultiDataSet] = useState(null);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectPage, setSelectPage] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [searchDate, setSearchDate] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const { columnsTableOrdered, columnsOrdered, postOrderColumnsData, loading } =
    useOrderColumns(columnsTable, tableConfigByPage.DISNEYPLUS);

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

  const getDataSource = () => {
    if (filteredData) return filteredData;
    if (dataDisneyPlus) return dataDisneyPlus;
    return [];
  };

  /////EXPORT EXCEL/////////
  useEffect(() => {
    if (multiDataSet) {
      setMultiDataSet(null);
    }
  }, [multiDataSet]);

  const headers = [
    {
      label: "Net",
      value: "net",
      width: 60,
    },
    {
      label: " Feed",
      value: "feed",
      width: 60,
    },
    {
      label: "Show Code",
      value: "show_code",
      width: 100,
    },
    {
      label: "Program",
      width: 100,
    },
    {
      label: "Title",
      value: "title",
      width: 180,
    },
    {
      label: "Episode Title",
      value: "epi_title",
      width: 300,
    },
    {
      label: "Dow",
      value: "dow",
      width: 60,
    },
    {
      label: "Start Date",
      value: "start_date",
      width: 80,
    },
    {
      label: "Start Time",
      value: "start_time",
      width: 80,
    },
    {
      label: "End Time",
      value: "end_time",
      width: 80,
    },
    {
      label: "End Date",
      value: "end_date",
      width: 80,
    },
    {
      label: "Duration",
      value: "duration",
      width: 80,
    },

    {
      label: "LTSA",
      value: "ltsa",
      width: 60,
    },
    {
      label: "Status",
      value: "status",
      width: 100,
    },
  ];

  const generateDateReport = () => {
    const date = new Date();
    const formattedDate = `${("0" + date.getDate()).slice(-2)}/${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}/${date.getFullYear()} ${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}hs`;
    return formattedDate;
  };

  const exportExcelFile = () => {
    const data = getDataSource();
    setMultiDataSet([
      {
        columns: processColumns(),
        data: processTableData(data),
      },
    ]);
  };

  const processColumns = () => {
    const arr = [];
    headers.forEach((header) => {
      const obj = {
        title: header.label,
        width: { wpx: header.width },
        style: headerStyles(),
      };
      arr.push(obj);
    });
    return arr;
  };

  const processTableData = (data) => {
    const edition = (value) => {
      if (value === "UNDEFINED" || value == null) {
        return "";
      }
      return value;
    };
    const arr = [];
    data.forEach((d) => {
      const rowArr = [];
      const prograDepor = `${d?.depor?.trim()}${d?.program?.trim()}`;
      headers.forEach((header) => {
        const obj = {
          value:
            header.value == "fechaHoraInicio"
              ? DateTime.fromISO(d[header.value]).toFormat("dd/MM/yyyy HH:mm")
              : header.value == "edition"
              ? edition(d[header.value])
              : d[header.value] !== null && d[header.value] !== undefined
              ? d[header.value]
              : header.label == "Program"
              ? prograDepor
              : "",
          style: rowStyles(),
        };
        rowArr.push(obj);
      });
      arr.push(rowArr);
    });
    return arr;
  };
  /////EXPORT EXCEL/////////

  const getDataEmpty = () => {
    if (loadingData) return "Loading...";
    if (dataDisneyPlus === null) return "Generate a search to see the data.";
    return "There are no results with the filters applied.";
  };

  const getDataDisneyPlus = async (withLoading, feeds, dateFrom, networks) => {
    try {
      withLoading && setLoadingData(true);
      const url = `disneyplus`;
      const api = await axiosApi();
      const { data } = await api.post(url, {
        feeds,
        fechaDesde: DateTime.fromISO(dateFrom).toFormat("yyyy-MM-dd"),
        networks,
      });
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataDisneyPlus(data.model || []);
      // reseteo cada vez que cargo nuevos datos
      if (!localStorage.getItem("saveSearchDisneyPlus")) {
        setFilteredData(null);
      }
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

  const handleReloadClick = () => {
    closeSnackbar();
    setReloadData((prev) => ++prev);
  };

  const rowClickHandle = (d) => setSelectRowData(d);

  const getTimeLine = async (withLoading, feeds, dateFrom, networks) => {
    withLoading && setLoadingData(true);
    try {
      withLoading && setLoadingData(true);
      const url = `disneyplus/timeLine`;
      const api = await axiosApi();
      const { data } = await api.post(url, {
        feeds,
        fechaDesde: DateTime.fromISO(dateFrom).toFormat("yyyy-MM-dd"),
        networks,
      });
      setLoadingData(false);
      setDataTimeLine(data.model);
    } catch (error) {
      openSnackError(
        "An unexpected error has occurred obtaining the information",
        600000
      );
      setLoadingData(false);
      console.log(error);
    }
  };

  const handleRightClick = (event, row) => {
    event.preventDefault();
  };

  const dataTabs = [
    {
      titleTabs: "Table",
      disabledTitle: false,
      contenidoTab: (
        <TableScheduling
          paginate={false}
          columns={columnsTableOrdered}
          data={dataDisneyPlus || []}
          dataEmpty={getDataEmpty()}
          rowClickHandler={rowClickHandle}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          selectPage={selectPage}
          setSelectPage={setSelectPage}
          selectRowData={selectRowData}
          isOpenLeftBar={isOpenLeftBar}
          // handleRightClick={handleRightClick}
        />
      ),
    },
    {
      titleTabs: "Schedule",
      contenidoTab: (
        <TimeLine
          dataTimeLine={dataTimeLine}
          loadingData={loadingData}
          searchDate={searchDate}
          isOpenLeftBar={isOpenLeftBar}
        />
      ),
    },
  ];

  return (
    <ProgramacionContext>
      <Provider>
        <PopUpModules />
        <Container>
          <Box>
            <SchedulingDisneyPlusSearch
              getData={getDataDisneyPlus}
              getDataTimeLine={getTimeLine}
              reloadData={reloadData}
              setLoadingData={setLoadingData}
              loadingData={loadingData}
              setSearchDate={setSearchDate}
            />
          </Box>
          <ContainerTitle>
            <Title>Disney +</Title>
            <ContainerButtons>
              <ButtonStyled variant="primary" onClick={exportExcelFile}>
                Download Excel <BsDownload style={{ marginLeft: "5px" }} />
              </ButtonStyled>
              {multiDataSet && (
                <ExcelFile
                  filename={`MediaTraker_scheduling_${generateDateReport()}`}
                  hideElement
                  element={
                    <div className="button-container">
                      <div className={`button shadow-left-down`}>
                        Export Excel
                      </div>
                    </div>
                  }
                >
                  <ExcelSheet dataSet={multiDataSet} name="Ingest" />
                </ExcelFile>
              )}
              <ButtonStyled
                variant="primary"
                onClick={() => setReloadData((prev) => ++prev)}
              >
                Reload data <TfiReload style={{ marginLeft: "5px" }} />
              </ButtonStyled>
              <ButtonStyled
                variant="primary"
                onClick={() => setIsOpenDrawer(true)}
              >
                <TbSettingsPause
                  style={{ marginLeft: "5px", fontSize: "20px" }}
                />
              </ButtonStyled>
            </ContainerButtons>
          </ContainerTitle>
          <Box>
            <SimpleTabs data={dataTabs} />
          </Box>
          {isOpenDrawer && (
            <DrawerColumns
              isOpen={isOpenDrawer}
              onClose={() => setIsOpenDrawer(false)}
              columnsTable={columnsTable}
              columnsOrdered={columnsOrdered}
              onSave={(items, cb) => postOrderColumnsData(items, cb)}
              loading={loading}
            />
          )}
        </Container>
      </Provider>
    </ProgramacionContext>
  );
};

export default SchedulingDisneyPlus;
