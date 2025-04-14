import { useState, useEffect } from "react";
import ReactExport from "react-data-export";
import { headerStyles, rowStyles } from "../../certificacionProgra/excelStyles";
import axiosApi from "../../../../../axiosApi";
import "../../certificacionProgra/CertificacionProgra.scss";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { ContainerInput, ContainerInputVersions, ErrorMessage, Label, Row, RowItem } from "../styles"; 
import { MultiSelect } from "react-multi-select-component";
import { InputStyled } from "../../../../commons/Input";
import { DateTime } from "luxon";
import Loader from "../../../../Loader/Loader";
import TableReportViewer from "./TableReportViewer";
import { Select } from "../../../../commons/Select";
import "../styles"
import ModalDragAndDrop from "../../../../commons/ModalDragAndDrop";
import styled from "styled-components";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const defaultValues = {
  canales: [],
  fechaDesde: "",
  fechaHasta: "",
};

const headers = [
  {
    label: "STATION",
    value: "station",
    width: 140,
  },
  {
    label: "SCHEDULE DATE",
    value: "schedule_date",
    width: 110,
  },
  {
    label: "SCHEDULE TIME",
    value: "schedule_time",
    width: 110,
  },
  {
    label: "SCHEDULE END DATE",
    value: "schedule_end_date",
    width: 140,
  },
  {
    label: "SCHEDULE END TIME",
    value: "schedule_end_time",
    width: 140,
  },
  {
    label: "EPISODE TITLE",
    value: "episode_title",
    width: 400,
  },
  {
    label: "PROGRAM TITLE",
    value: "program_title",
    width: 160,
  },
  {
    label: "PRODUCTION EPISODE",
    value: "production_episode",
    width: 160,
  },
  {
    label: "SHOW CODE",
    value: "show_code",
    width: 90,
  },
  {
    label: "BOX NUMBER",
    value: "box_number",
    width: 90,
  },
  {
    label: "COUNT SEGMENTS",
    value: "count_segments",
    width: 120,
  },
  {
    label: "FORMATTING",
    value: "segment_detail",
    width: 400,
  },
  {
    label: "EDITION",
    value: "edition",
    width: 70,
  },
 {
  label: "PROGRAM TYPE",
  value: "lts",
  width: 140,
},
];

const senialList = [
  {
    label: "A",
    value: "99",
  },
  {
    label: "B",
    value: "98",
  },
  {
    label: "C",
    value: "97",
  },
];

const Versions = ({ show, onClose, hasPermission, isOpen }) => {
  const [loadStatus, setLoadStatus] = useState(true);
  const [channelList, setChannelList] = useState(null);
  const [makingVersions, setMakingVersions] = useState(false);
  const [versionsData, setVersionsData] = useState(null);
  const [multiDataSet, setMultiDataSet] = useState(null);
  const [openSnackError] = useSnackbar(error);
  const [formValues, setFormValues] = useState(defaultValues);
  const [newChannelList, setNewChannelList] = useState([]);
  const [errorHoras, setErrorHoras] = useState(false);
  const [selectedSenial, setSelectedSenial] = useState(senialList[0].value);
  
  const handleChangeSenial = (e) => {
    setSelectedSenial(e.target.value);
  };

  const postData = async () => {
   if (!hasPermission) return;
    try {
      setMakingVersions(true)
      const url = `versiones-list`;
      const api = await axiosApi();
      const formatedData = {
        ...formValues,
        canales: formValues.canales.map((el) => `${selectedSenial}${el.value}`).join(","),
      };
      const { data } = await api.post(url, formatedData);
      setMakingVersions(false)
      const hasError = !data.message.success;
      if (hasError) {
        setVersionsData(null);
        return openSnackError(data.message.message, 600000);
      }
      setVersionsData(data.model);
    }  catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };
  
  useEffect(() => {
    getData();
  }, []);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
      opciones.push({ value: d.codi , label: d.descrip })
    );

    return opciones.sort((a, b) => {
      return a.value - b.value;
    });
  };

  useEffect(() => {
    if (channelList) {
      setNewChannelList(adaptarDatosAOpciones(channelList));
    }
  }, [channelList]);

  const initialDateTimeValue = (date) => {
    const today = DateTime.local();
    return date || today.toFormat("yyyy-MM-dd");
  };

  const calcularDates = (fechaIni, fechaFin) => {
    if (fechaFin < fechaIni) {
      setErrorHoras(true);
    } else {
      setErrorHoras(false);
    }
  };

  const getData = async () => {
    try {
      let url = `combos/canal`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      const hasError = !data.message.success
      if (hasError) {
        return openSnackError(
          data.message.message,
          600000
        );
      }
      setChannelList(data.model);
      setLoadStatus(false);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const validarObligatorios = () =>
    formValues &&
    formValues.fechaDesde !== "" &&
    formValues.fechaHasta !== "" &&
    formValues.canales.length > 0 &&
    !errorHoras 

  useEffect(() => {
    if (multiDataSet) {
      setMultiDataSet(null);
    }
  }, [multiDataSet]);

  const handleChange = (key, v) => {
    if (key === "fechaHasta") {
      calcularDates(formValues.fechaDesde, v);
    }
    if (key === "fechaDesde" && formValues.fechaHasta) {
      calcularDates(v, formValues.fechaHasta);
    }
    setFormValues((prev) => ({ ...prev, [key]: v }));
  };

  const processColumns = () => {
    const arr = [];
    headers.forEach((header) => {
      const obj = {
        title: header.label,
        width: { wpx: header.width },
        style: headerStyles("center"),
      };
      arr.push(obj);
    });
    return arr;
  };

  const processTableData = (data) => {
    const arr = [];
    data.forEach((d) => {
      const rowArr = [];
      headers.forEach((header) => {
        const obj = {
          value:
            header.value == "schedule_date"
              ? DateTime.fromISO(d[header.value]).toFormat("dd/MM/yyyy")
              : header.value == "schedule_end_date"
              ? DateTime.fromISO(d[header.value]).toFormat("dd/MM/yyyy")
              : d[header.value],
          style: rowStyles("center"),
        };
        rowArr.push(obj);
      });
      arr.push(rowArr);
    });
    return arr;
  };

  const exportExcelFile = () => {
    setMultiDataSet([
      {
        columns: processColumns(),
        data: processTableData(versionsData),
      },
    ]);
  };

  const getDataSource = () => {
    if (versionsData) {
      const dataOrdenCode = versionsData.sort(function (a, b) {
        if (a.canal > b.canal) {
          return 1;
        }
        if (a.canal < b.canal) {
          return -1;
        }
        return 0;
      });
      return dataOrdenCode;
    }
    return [];
  };

  const formLayout = () => {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minWidth: "800px",
          height: "100%",
          maxHeight: "95%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Row>
            <RowItem maxWidth={"792px"}>
              <div style={{ width: "80px" }}>
                <Label>Network</Label>
              </div>
              <ContainerInputVersions maxWidth={versionsData && "100%"}>
                <MultiSelect
                  value={formValues.canales}
                  className="select-multiple"
                  labelledBy="Select"
                  overrideStrings={{
                    selectSomeItems: "Select options",
                  }}
                  id="select-canales"
                  disableSearch
                  onChange={(items) => {
                    setFormValues((prev) => ({
                      ...prev,
                      canales: items,
                    }));
                  }}
                  options={newChannelList || []}
                />
              </ContainerInputVersions>
            </RowItem>
            <RowItem>
              <div style={{ width: "80px" }}>
                <Label>Feed</Label>
              </div>
              <ContainerInput>
                <Select
                  withoutDefault
                  onChange={handleChangeSenial}
                  options={senialList || []}
                  maxWidth={"100%"}
                />
              </ContainerInput>
            </RowItem>
          </Row>
          <Row>
            <RowItem>
              <Label style={{ paddingRight: "12px" }}>Air Date</Label>
              <InputStyled
                id="start-input"
                type="date"
                value={formValues.fechaDesde}
                onFocus={() =>
                  handleChange(
                    "fechaDesde",
                    initialDateTimeValue(formValues.fechaDesde)
                  )
                }
                onChange={(e) => handleChange("fechaDesde", e.target.value)}
              />
            </RowItem>
            <RowItem>
              <Label>End Date</Label>
              <InputStyled
                id="end-input"
                type="date"
                value={formValues.fechaHasta}
                onFocus={() =>
                  handleChange(
                    "fechaHasta",
                    initialDateTimeValue(formValues.fechaHasta)
                  )
                }
                onChange={(e) => handleChange("fechaHasta", e.target.value)}
                disabled={!show && !formValues.fechaDesde}
                min={formValues.fechaDesde}
              />
            </RowItem>
          </Row>
          {errorHoras && (
            <Row>
              <ErrorMessage>
                The end date must be greater than{" "}
                {DateTime.fromISO(formValues.fechaDesde).toFormat("dd/MM/yyyy")}
              </ErrorMessage>
            </Row>
          )}
        </div>
        {multiDataSet && (
          <div className="certificacion-progra__row-buttons">
            <ExcelFile
              filename={`Versions ${formValues.fechaDesde}_${formValues.fechaHasta}`}
              hideElement
              element={
                <div className="button-container">
                  <div className={`button shadow-left-down`}>Export Excel</div>
                </div>
              }
            >
              <ExcelSheet dataSet={multiDataSet} name="Programas" />
            </ExcelFile>
          </div>
        )}
        {versionsData && (
          <TableReportViewer data={getDataSource()} showReport={versionsData} />
        )}
      </div>
    );
  };

  const fnButtons = () => {
    return (
      <>
        <ButtonStyled
          disabled={validarObligatorios() && hasPermission ? "" : "disabled"}
          onClick={
            !makingVersions && validarObligatorios() ? postData : () => {}
          }
        >
          {makingVersions ? <Loader /> : "Generate versions"}
        </ButtonStyled>
        <ButtonStyled
          disabled={!makingVersions && versionsData ? "" : "disabled"}
          onClick={versionsData && !makingVersions ? exportExcelFile : () => {}}
        >
          Export Excel
        </ButtonStyled>
      </>
    );
  };

  return (
    <>
      <ModalDragAndDrop
        onClose={onClose}
        loading={loadStatus}
        isOpen={isOpen}
        isBlur
        minWidth="900px"
        minHeight="210px"
        width={versionsData ? "90%" : "900px"}
        height={versionsData ? "80%" : "210px"}
      >
        <ContenidoModal
          title={"Versions"}
          body={formLayout()}
          footer={fnButtons()}
          overflowBody={!versionsData  && "unset"}
        />
      </ModalDragAndDrop>
    </>
  );
};

export default Versions;


const ContenidoModal=({title,body,footer,overflowBody})=>{
  return (
    <>
      <Header>
        <p>{title}</p>
      </Header>
      <Body overflow={overflowBody}>{body}</Body>
      <Footer>{footer}</Footer>
    </>
  );
}

const Header = styled.div`
  padding: 10px 20px;
  background: #e0e0e0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: flex-start;
  height: 50px;
  color: #565656;
  border-radius: 8px 8px 0 0;
  font-size: 22px;
  align-items: center;
`;

const Body = styled.div`
  padding: 20px;
  flex: 1;
  overflow:${({ overflow }) => (overflow || "auto")}
`;

const Footer = styled.div`
  background-color: #e0e0e0;
  height: 50px;
  border-radius: 0 0 8px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;