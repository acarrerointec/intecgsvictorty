import React, { useEffect, useMemo, useState } from "react";
import ModalBase from "../../../../commons/Modal";
import ModalPortal from "../../../../commons/ModalWrapper";
import { error } from "../../../../commons/snackbarConfig";
import { useSnackbar } from "react-simple-snackbar";
import { Table } from "../../../../commons/Table";
import SimpleTable from "../../../../commons/Table/SimpleTable";
import Box from "../../../../commons/Box";
import TaskIngestEdmFilter from "./TaskIngestEdmFilter";
import axiosApi from "../../../../../axiosApi";
import { columns } from "./config";
import {
  Container,
  Title,
  ContainerTitle,
  ModalContent,
  ContainerButtons,
  SectionHeader,
  Containerinfo,
  RowInfo,
  SpanInfo,
} from "./styles";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { BsDownload } from "react-icons/bs";
import { DateTime } from "luxon";
import { TaskIngestEdmSearch } from "./TaskIngestEdmSearch";
import {
  headerStyles,
  rowStyles,
} from "../../../../programacion/pop-up-forms/certificacionProgra/excelStyles";
import ReactExport from "react-data-export";
import { FiEdit } from "react-icons/fi";
import { Delivery } from "./Delivery";
import DrawerColumns from "../../../../commons/DrawerColumns";
import { tableConfigByPage } from "../../../../../utils/helperTableConfigByPage";
import { useOrderColumns } from "../../../../hooks/useOrderColumns";
import { TbSettingsPause } from "react-icons/tb";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const headers = [
  {
    label: "Code",
    value: "codigo",
    width: 120,
  },
  {
    label: "Description",
    value: "descripcion",
    width: 300,
  },
  {
    label: "Type",
    value: "tipoPromoPublicidad",
    width: 180,
  },
  {
    label: "Feed",
    value: "feed",
    width: 50,
  },
  {
    label: "Date",
    value: "fechaHoraInicio",
    width: 130,
  },
  {
    label: "Duration",
    value: "duracion",
    width: 70,
  },
  {
    label: "Status",
    value: "statusMedia",
    width: 70,
  },
  {
    label: "Edm Qc",
    value: "ingestEdm",
    width: 100,
  },
  {
    label: "Origin",
    value: "ingestTmk",
    width: 100,
  },
  {
    label: "Edition",
    value: "edition",
    width: 100,
  },
  {
    label: "Delivery",
    value: "deli_descrip",
    width: 100,
  },
];

const TaskIngestEdmView = ({ setPageLoading }) => {
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [selectRowData, setSelectRowData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  //estado para control de fuente de datos para la tabla
  const [filteredData, setFilteredData] = useState(null);
  const [data, setData] = useState(null);
  const [selectedType, setSelectedType] = useState(["todos"]);
  const [reloadData, setReloadData] = useState(0);
  const [saveSearchTempo, setSaveSearchTempo] = useState(null);
  const [multiDataSet, setMultiDataSet] = useState(null);
  const [dataDelivery, setDataDelivery] = useState(null);
  const [rowDelivery, setRowDelivery] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const customHandleClick = {
    deli_descrip: (p) => {
      setRowDelivery(p?.cell?.row?.original);
    },
  };
  const { columnsTableOrdered, columnsOrdered, postOrderColumnsData, loading } =
    useOrderColumns(columns(customHandleClick), tableConfigByPage.INGESTA_EDM);

  const saveSearch = JSON.parse(localStorage.getItem("saveSearchIngestEdm"));

  useEffect(() => {
    if (multiDataSet) {
      setMultiDataSet(null);
    }
  }, [multiDataSet]);

  useEffect(() => {
    if (saveSearch) {
      const newTipo = saveSearch?.tipo?.map((d) => d.value);
      const hastTipoSaved = newTipo && newTipo?.length;
      setSelectedType(hastTipoSaved ? newTipo : ["todos"]);
      setSaveSearchTempo(() => ({
        ...saveSearch,
      }));
    }
  }, []);

  useEffect(() => {
    getDataDelivery(true);
  }, []);

  const handleReloadClick = () => {
    closeSnackbar();
    setReloadData((prev) => ++prev);
  };

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  const getData = async (
    types,
    withLoading,
    feeds,
    dateFrom,
    dateTo,
    tiposPromoPublicidad
  ) => {
    try {
      withLoading && setLoadingData(true);
      const url = `ingestEDM`;
      const api = await axiosApi();
      const { data } = await api.post(url, {
        tipos: types,
        feeds,
        fechaDesde:
          dateFrom ||
          DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        fechaHasta: dateTo || null,
        tiposPromoPublicidad,
      });
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setData(data.model || []);
      // reseteo cada vez que cargo nuevos datos
      if (!localStorage.getItem("saveSearchIngestEdm")) {
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

  const getDataDelivery = async (withLoading) => {
    try {
      withLoading && setLoadingData(true);
      const url = `/delivery`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataDelivery(data.model || []);
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

  const iconsDataDelivery = (row) => {
    return <FiEdit />;
  };

  const onClickLogs = (row) => {
    setRowDelivery(row);
    if (row?.descrip == "N/A") return null;
  };

  const getDataSource = useMemo(() => {
    if (filteredData) return filteredData;
    if (data) return data;
    return [];
  }, [data, filteredData]);

  const rowClickHandle = (d) => setSelectRowData(d);

  const getDataEmpty = useMemo(() => {
    if (loadingData) return "Loading...";
    if (data === null) return "Generate a search to see the data";
    return "No data found with filters applied";
  }, [data, loadingData]);

  const getDataDownloadExel = (getDataSource) =>
    getDataSource.map((el) => {
      return {
        Code: el.codigo,
        Description: el.descripcion,
        Type: el.tipoPromoPublicidad,
        Feed: el.feed,
        Date: el.fechaHoraInicio,
        Status: el.statusMedia,
        Motion: el.motion,
        South: el.ingestSur,
        North: el.ingestNorte,
        Edm: el.ingestEdm,
        Tedial: el.ingestTedial,
      };
    });

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
      headers.forEach((header) => {
        const obj = {
          value:
            header.value == "fechaHoraInicio"
              ? DateTime.fromISO(d[header.value]).toFormat("dd/MM/yyyy HH:mm")
              : header.value == "edition" || header.value == "delivery"
              ? edition(d[header.value])
              : d[header.value] !== null && d[header.value] !== undefined
              ? d[header.value]
              : "",
          style: rowStyles(),
        };
        rowArr.push(obj);
      });
      arr.push(rowArr);
    });
    return arr;
  };

  const exportExcelFile = () => {
    const data = getDataSource;
    setMultiDataSet([
      {
        columns: processColumns(),
        data: processTableData(data),
      },
    ]);
  };

  const roaldData = () => {
    setReloadData((prev) => ++prev);
  };

  const infoData = useMemo(() => {
    const promotion = getDataSource.filter(
      (d) => d.tipoMaterial === "Promotion"
    ).length;
    const commercial = getDataSource.filter(
      (d) => d.tipoMaterial == "Commercial"
    ).length;
    const program = getDataSource.filter(
      (d) => d.tipoMaterial == "program"
    ).length;
    return (
      <Box>
        <Containerinfo>
          <RowInfo isBorderRight>
            Total: <SpanInfo>{getDataSource.length}</SpanInfo>
          </RowInfo>
          <RowInfo isBorderRight>
            Promotion: <SpanInfo>{promotion || "-"}</SpanInfo>
          </RowInfo>
          <RowInfo isBorderRight>
            Commercial: <SpanInfo>{commercial || "-"}</SpanInfo>
          </RowInfo>
          <RowInfo>
            Program: <SpanInfo>{program || "-"}</SpanInfo>
          </RowInfo>
        </Containerinfo>
      </Box>
    );
  }, [getDataSource]);

  const table = useMemo(() => {
    return (
      <Table
        columns={columnsTableOrdered}
        data={getDataSource}
        dataEmpty={getDataEmpty}
        rowClickHandler={rowClickHandle}
        paginate={false}
      />
    );
  }, [columnsTableOrdered, getDataSource, getDataEmpty]);

  return (
    <Container>
      <Box>
        <TaskIngestEdmSearch
          data={data}
          setFilteredData={setFilteredData}
          setSelectedType={setSelectedType}
          selectedType={selectedType}
          getData={getData}
          setLoadingData={setLoadingData}
          reloadData={reloadData}
          setReloadData={setReloadData}
          setSaveSearchTempo={setSaveSearchTempo}
          saveSearchTempo={saveSearchTempo}
        />
      </Box>
      <Box>
        <TaskIngestEdmFilter
          data={data}
          setFilteredData={setFilteredData}
          setSelectedType={setSelectedType}
          selectedType={selectedType}
          getData={getData}
          setLoadingData={setLoadingData}
        />
      </Box>
      <ContainerTitle>
        <SectionHeader>
          <Title>Ingest EDM</Title>
          {infoData}
        </SectionHeader>
        <ContainerButtons>
          <ButtonStyled variant="primary" onClick={exportExcelFile}>
            Download Excel <BsDownload style={{ marginLeft: "5px" }} />
          </ButtonStyled>
          {multiDataSet && (
            <ExcelFile
              filename={`MediaTraker_ingestEdm_${generateDateReport()}`}
              hideElement
              element={
                <div className="button-container">
                  <div className={`button shadow-left-down`}>Export Excel</div>
                </div>
              }
            >
              <ExcelSheet dataSet={multiDataSet} name="IngestEdm" />
            </ExcelFile>
          )}
          <ButtonStyled variant="primary" onClick={roaldData}>
            Reload data <TfiReload style={{ marginLeft: "5px" }} />
          </ButtonStyled>
          <ButtonStyled variant="primary" onClick={() => setIsOpenDrawer(true)}>
            <TbSettingsPause style={{ marginLeft: "5px", fontSize: "20px" }} />
          </ButtonStyled>
        </ContainerButtons>
      </ContainerTitle>
      <Box>{table}</Box>
      {selectRowData && (
        <ModalPortal>
          <ModalBase
            openModal={selectRowData}
            onClose={() => setSelectRowData(null)}
            height="fit-content"
            width="1400px"
          >
            <ModalContent>
              <SimpleTable
                columns={columns(customHandleClick)}
                data={selectRowData.ingestItem || []}
              />
            </ModalContent>
          </ModalBase>
        </ModalPortal>
      )}
      {rowDelivery && (
        <Delivery
          openModal={rowDelivery}
          data={dataDelivery}
          rowDelivery={rowDelivery}
          setRowDelivery={setRowDelivery}
          roaldData={roaldData}
        />
      )}
      {isOpenDrawer && (
        <DrawerColumns
          isOpen={isOpenDrawer}
          onClose={() => setIsOpenDrawer(false)}
          columnsTable={columns(customHandleClick)}
          columnsOrdered={columnsOrdered}
          onSave={(items, cb) => postOrderColumnsData(items, cb)}
          loading={loading}
        />
      )}
    </Container>
  );
};

export default TaskIngestEdmView;
