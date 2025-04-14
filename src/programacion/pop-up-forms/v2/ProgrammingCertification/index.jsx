import React, { useState, useEffect } from "react";
import ReactExport from "react-data-export";
import { headerStyles, rowStyles } from "../../certificacionProgra/excelStyles";
import axiosApi from "../../../../../axiosApi";
import NewFormWindow from "../NewFormWindow";
import "../../certificacionProgra/CertificacionProgra.scss";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { ContainerInput, ErrorMessage, Label, Row, RowItem } from "../styles";
import { MultiSelect } from "react-multi-select-component";
import { InputStyled } from "../../../../commons/Input";
import { DateTime } from "luxon";
import { Select } from "../../../../commons/Select";
import Loader from "../../../../Loader/Loader";
import TableReportViewer from "./TableReportViewer";
import styled, { css } from "styled-components";
import ModalPortal from "../../../../commons/ModalWrapper";
import ModalBase from "../../../../commons/Modal";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const defaultValues = {
  canales: [],
  emi_desde: "",
  emi_hasta: "",
};

const headers = [
  {
    label: "Channel",
    value: "canal",
    width: 40,
  },
  {
    label: "Signal",
    value: "senial",
    width: 40,
  },
  {
    label: "Type",
    value: "tipo",
    width: 30,
  },
  {
    label: "Description",
    value: "descripcion",
    width: 220,
  },
  {
    label: "Duration",
    value: "duracion",
    width: 50,
  },
  {
    label: "Emission",
    value: "emision",
    width: 140,
  },
  {
    label: "Episode",
    value: "episodio",
    width: 70,
  },
  {
    label: "Start",
    value: "fecha_Inicio",
    width: 140,
  },
  {
    label: "End",
    value: "fecha_Fin",
    width: 140,
  },
  {
    label: "Report",
    value: "reporte",
    width: 310,
  },
];

const ProgrammingCertification = ({ show, onClose, hasPermission, isOpen }) => {
  const [loadStatus, setLoadStatus] = useState(true);
  const [channelList, setChannelList] = useState(null);
  const [paisesList, setPaisesList] = useState([]);
  const [paiseSeleccionado, setPaisSeleccionado] = useState(null);
  // estados para reporte
  const [makingReport, setMakingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [multiDataSet, setMultiDataSet] = useState(null);
  const [openSnackError] = useSnackbar(error);
  const [formValues, setFormValues] = useState(defaultValues);
  const [newChannelList, setNewChannelList] = useState([]);
  const [errorHoras, setErrorHoras] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [markerOpenReport, setMarkerOpenReport] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
      opciones.push({ value: d.codi ? d.codi : d.pais, label: d.descrip })
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
      const resPaises = await api.get("paises");
      const hasError = !data.message.success || !resPaises.data.message.success;
      if (hasError) {
        return openSnackError(
          data.message.message || !resPaises.data.message.message,
          600000
        );
      }
      setChannelList(data.model);
      if (resPaises.data.model && resPaises.data.model.length > 0) {
        setPaisSeleccionado(resPaises.data.model[0].pais);
        setPaisesList(adaptarDatosAOpciones(resPaises.data.model));
      }
      setLoadStatus(false);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const getReportData = async () => {
    if (!hasPermission) return;
    try {
      setMakingReport(true);
      const formatedData = {
        ...formValues,
        canales: formValues.canales.map((el) => el.value).join(","),
      };
      let url = `/reporte-programacion-tecnico/${formatedData.canales}/${formatedData.emi_desde}/${formatedData.emi_hasta}/${paiseSeleccionado}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setMakingReport(false);

      const hasError = !data.message.success;
      if (hasError) {
        setReportData(null);
        return openSnackError(data.message.message, 600000);
      }
      setReportData(data.model);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const validarObligatorios = () =>
    formValues &&
    formValues.emi_desde !== "" &&
    formValues.emi_hasta !== "" &&
    formValues.canales.length > 0 &&
    !errorHoras &&
    paiseSeleccionado;

  useEffect(() => {
    if (multiDataSet) {
      setMultiDataSet(null);
    }
  }, [multiDataSet]);

  const handleChange = (key, v) => {
    if (key === "emi_hasta") {
      calcularDates(formValues.emi_desde, v);
    }
    if (key === "emi_desde" && formValues.emi_hasta) {
      calcularDates(v, formValues.emi_hasta);
    }
    setFormValues((prev) => ({ ...prev, [key]: v }));
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
    const arr = [];
    data.forEach((d) => {
      const rowArr = [];
      headers.forEach((header) => {
        const obj = {
          value: d[header.value],
          style: rowStyles(),
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
        data: processTableData(reportData),
      },
    ]);
  };

  const showReport = (data, epi) => {
    setCurrentReport(data);
    setMarkerOpenReport(epi);
  };

  const onCloseTextViewer = () => {
    setCurrentReport(null);
    setMarkerOpenReport(null);
  };

  const getDataSource = () => {
    if (reportData) {
      const dataOrdenCode = reportData.sort(function (a, b) {
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
          maxWidth: "1000px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
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
            <RowItem>
              <Label>Network</Label>
              <ContainerInput>
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
              </ContainerInput>
            </RowItem>
          </Row>
          <Row>
            <RowItem>
              <Label style={{ paddingRight: "12px" }}>Air Date</Label>
              <InputStyled
                id="start-input"
                type="date"
                value={formValues.emi_desde}
                onFocus={() =>
                  handleChange(
                    "emi_desde",
                    initialDateTimeValue(formValues.emi_desde)
                  )
                }
                onChange={(e) => handleChange("emi_desde", e.target.value)}
              />
            </RowItem>
            <RowItem>
              <Label>End Date</Label>
              <InputStyled
                id="end-input"
                type="date"
                value={formValues.emi_hasta}
                onFocus={() =>
                  handleChange(
                    "emi_hasta",
                    initialDateTimeValue(formValues.emi_hasta)
                  )
                }
                onChange={(e) => handleChange("emi_hasta", e.target.value)}
                disabled={!show && !formValues.emi_desde}
                min={formValues.emi_desde}
              />
            </RowItem>
          </Row>
          {errorHoras && (
            <Row>
              <ErrorMessage>
                The end date must be greater than{" "}
                {DateTime.fromISO(formValues.emi_desde).toFormat("dd/MM/yyyy")}
              </ErrorMessage>
            </Row>
          )}
          <Row>
            <RowItem>
              <Label style={{ paddingRight: "12px" }}>Country</Label>
              <ContainerInput>
                <Select
                  withoutDefault
                  isDisabled={paisesList.length === 0}
                  onChange={(e) => {
                    setPaisSeleccionado(e.target.value);
                  }}
                  options={paisesList || []}
                  defaultValue={paiseSeleccionado}
                  maxWidth={"100%"}
                />
              </ContainerInput>
            </RowItem>
          </Row>
        </div>
        {multiDataSet && (
          <div className="certificacion-progra__row-buttons">
            <ExcelFile
              filename="Certificación de programación"
              hideElement
              element={
                <div className="button-container">
                  <div className={`button shadow-left-down`}>
                    Export Excel
                  </div>
                </div>
              }
            >
              <ExcelSheet dataSet={multiDataSet} name="Programas" />
            </ExcelFile>
          </div>
        )}
        {reportData && (
            <TableReportViewer data={getDataSource()} showReport={showReport} />
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
            !makingReport && validarObligatorios() ? getReportData : () => {}
          }
        >
          {makingReport ? <Loader /> : "Generate report"}
        </ButtonStyled>
        <ButtonStyled
          disabled={!makingReport && reportData ? "" : "disabled"}
          onClick={reportData && !makingReport ? exportExcelFile : () => {}}
        >
          Export Excel
        </ButtonStyled>
      </>
    );
  };
  return (
    <>
      <NewFormWindow
        title="Programming certification"
        show={show}
        onClose={onClose}
        loading={loadStatus}
        buttons={fnButtons()}
        isOpen={isOpen}
        isBlur
        maxHeight={"700px"}
      >
        {formLayout()}
      </NewFormWindow>
      {currentReport && (
        <ModalPortal>
          <ModalBase openModal={currentReport} withoutOutsideClose onClose={onCloseTextViewer}>
            <ContainModal>
              <Text>{currentReport}</Text>
            </ContainModal>
          </ModalBase>
        </ModalPortal>
      )}
    </>
  );
};

export default ProgrammingCertification;

const ContainModal = styled.form`
  max-width: 1000px;
  padding: 0px 40px 30px 40px;
  display: flex;
  flex-direction: column;
  padding: 50px;
`;

const Text = styled.div`
  width: 328px;
  font-size: 16px;
  margin: 5px;
  ${({ textDecoration }) =>
    textDecoration &&
    css`
      font-weight: 500;
    `}
`;
