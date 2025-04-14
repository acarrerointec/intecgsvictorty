import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { InputStyled } from "../../../../../commons/Input";
import { columnsEpiConfig } from "../config";
import axiosApi from "../../../../../../axiosApi";
import { error, success } from "../../../../../commons/snackbarConfig";
import { useSnackbar } from "react-simple-snackbar";
import { Select } from "../../../../../commons/Select";
import { Table } from "../../../../../commons/Table";
import LoadingMask from "../../../../LoadingMask";
import {
  formatTimeInSeconds,
  sumarHorarioAFecha,
} from "../../../../../../utils/durationHelper";
import { ButtonStyled } from "../../../../../commons/Button";
import { useGlobalState } from "../../../../../contexts/GlobalConstext";
import TimeInputRecording from "./TimeInputRecording";
import { Alerts } from "../../../../../commons/Alerts";
import CheckboxStyled from "../../../../../commons/CheckboxStyled";
import { DateTime } from "luxon";
import { ModalDeleteCommons } from "../../../../../commons/ModalDeleteCommons";

const defaultValueDate = {
  airStarDate: "",
  airEndDate: "",
};

function TaskConfiguration({
  selectRowData,
  setSelectRowData = () => {},
  rowClickHandler,
  reloadData = () => {},
  resetIsInConfig,
  roaldDataSchedule
}) {
  const [loadingData, setLoadingData] = useState(false);
  const [validForm, setValidForm] = useState(false);
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [openSnackSucces] = useSnackbar(success);
  const [dataVinculos, setDataVinculos] = useState([]);
  const [dataEquipment, setDataEquipment] = useState([]);
  const [dataOperator, setDataOperator] = useState([]);
  const [dataModifEpi, setDataModifEpi] = useState([]);
  const [formData, setFormData] = useState({
    equi_graba: selectRowData.id_equipo || null,
    vincu: selectRowData.id_vinculo || null,
    id_ope: selectRowData.id_operador || null,
  });
  const [state] = useGlobalState();
  const [formValuesDate, setFormValuesDate] = useState(defaultValueDate);
  const [errorHoras, setErrorHoras] = useState(false);
  const [disabledApplyBtn, setDisabledApplyBtn] = useState(true);
  const [duration, setDuration] = useState("");
  const [disableDuration, setDisableDuration] = useState(true);
  const [needRecording, setNeedRecording] = useState(
    selectRowData.reqGrabacion
  );
  const [clearRecording, setClearReacording] = useState(null);
  const [inputIsError, setInputIsError] = useState({
    equi_graba: selectRowData.needChangeEquipo || false,
    vincu: selectRowData.needChangeVinculo || false,
    id_ope: selectRowData.needChangeOperador || false,
  });
  const [existeCambio,setExisteCambio]= useState(false)

  const disabledSelects =
    selectRowData.date === null || needRecording === false;

    
  useEffect(() => {
    if (needRecording) {
      setValidForm(false);
    }
  }, [needRecording]);

  const checkApplyFn = () => {
    const keys = Object.keys(formValuesDate);
    let isComplete = true;
    keys.forEach((k) => {
      if (formValuesDate[k] == "" || errorHoras) {
        isComplete = false;
      }
    });
    return isComplete;
  };

  useEffect(() => {
    setDisableDuration(!formValuesDate.airStarDate);
    setDisabledApplyBtn(!checkApplyFn());
    // if (formValuesDate.airStarDate && formValuesDate.airEndDate) {
    //   calculateDuration(formValuesDate.airStarDate, formValuesDate.airEndDate);
    // }
  }, [formValuesDate]);

  useEffect(() => {
    getCombosData();
    if (selectRowData.duration) {
      setDuration(selectRowData.duration);
    }
    return () => {
      resetIsInConfig();
    };
  }, []);

  const getCombosData = () => {
    const fechaDesde = selectRowData.date;
    const fechaHasta = sumarHorarioAFecha(fechaDesde, selectRowData.duration);
    getDataModificationsEpi(true, selectRowData.epi);
    if (selectRowData.date !== null) {
      getDataOperator(true, fechaDesde, fechaHasta);
      getDataEquipment(true, fechaDesde, fechaHasta);
      getDataVinculos(true, fechaDesde, fechaHasta);
    }
  };

  useEffect(() => {
    if (duration) {
      handleChangeDate(
        "airEndDate",
        sumarHorarioAFecha(formValuesDate.airStarDate, duration)
      );
    }
  }, [duration]);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
      opciones.push({
        value: d.id,
        label: d.descrip,
        disabled: d.disabled,
      })
    );
    return opciones;
  };

  const getDataVinculos = async (withLoading = true, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `vinculos/${dateFrom}/${dateTo}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 30000);
      }
      setDataVinculos(adaptarDatosAOpciones(data.model) || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 30000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataEquipment = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `equipos/${dateFrom}/${dateTo}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 30000);
      }
      setDataEquipment(adaptarDatosAOpciones(data.model) || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 30000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataOperator = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `operadores/${dateFrom}/${dateTo}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 30000);
      }
      setDataOperator(adaptarDatosAOpciones(data.model) || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 30000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataModificationsEpi = async (withLoading = true, epi) => {
    try {
      withLoading && setLoadingData(true);
      const url = `modifications/${epi}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 30000);
      }
      setDataModifEpi(data.model || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 30000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const postDataGrabaciones = async (withLoading = true, clearData = false) => {
    closeSnackbar();
    withLoading && setLoadingData(true);
    const url = `grabaciones-alta`;
    const api = await axiosApi();
    const duraSeg = formatTimeInSeconds(selectRowData.duration);
    const obj = {
      epi: selectRowData.epi,
      fecha_hora_ini: selectRowData.date,
      dura: duraSeg,
      usuario: state.globalUser.usuarioRed,
    };
    if (formData.equi_graba) {
      obj.equi_graba = Number(formData.equi_graba);
    }
    if (formData.id_ope) {
      obj.id_ope = Number(formData.id_ope);
    }
    if (formData.vincu) {
      obj.vincu = Number(formData.vincu);
    }
    if (clearData) {
      obj.equi_graba = null;
      obj.id_ope = null;
      obj.vincu = null;
    }
    const { data } = await api.post(url, obj);
    setLoadingData(false);
    if (!data.message.success) {
      getCombosData();
      return openSnackError(data.message.message, 30000);
    }
    setSelectRowData({
      ...selectRowData,
      id_equipo: clearData ? "" :  Number(formData.equi_graba),
      id_operador: clearData ? "" : Number(formData.id_ope),
      id_vinculo: clearData ? "" : Number(formData.vincu),
      reqGrabacion: needRecording
    });
    reloadData();
    roaldDataSchedule()
    getDataModificationsEpi(true, selectRowData.epi);
    setValidForm(false);
    getCombosData();
    setClearReacording(null)
    if (clearData) {
      openSnackSucces("Recording deleted succefully", 10000);
    } else {
      openSnackSucces("Recording modified succefully", 10000);
    }
  };
  useEffect(() => {
      const valuesInputsIsError = Object.values(inputIsError).some(
        (i) => i === true
      );
      if (valuesInputsIsError ) {
        setExisteCambio(false);
      } else {
        setExisteCambio(true);
      }
  }, [inputIsError]);

  const disabledSave=()=>{
    if(existeCambio && validForm){
      return false
    }
    return true
  }

  const handleChange = (v, k) => {
    if (inputIsError[k]) {
      if (formData[k] !== v)
        setInputIsError((prev) => {
          return { ...prev, [k]: false };
        });
    }
    setFormData((prev) => {
      return { ...prev, [k]: v };
    });
    setValidForm(true);
  };

  const initialDateTimeValue = (date) => {
    const today = DateTime.local().set({ minute: 0 });
    return date || today.toFormat("yyyy-MM-dd'T'HH:mm");
  };

  const calcularDates = (dateUser, dateDiferido) => {
    const dateUserCheck = dateUser != "Invalid DateTime" ? dateUser : null;
    setErrorHoras(false);
    if (dateUserCheck > dateDiferido) {
      setErrorHoras(true);
    }
  };

  const handleChangeDate = (k, v) => {
    const formartValue = DateTime.fromISO(v).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    calcularDates(formartValue, selectRowData.dateDiferido);
    setFormValuesDate((prev) => {
      return { ...prev, [k]: formartValue };
    });
  };

  const handleChangeDuration = (v) => {
    setDuration(v);
  };

  const onBlurAirStartDate = () => {
    handleChangeDate(
      "airEndDate",
      sumarHorarioAFecha(formValuesDate.airStarDate, duration)
    );
  };

  const onBlurDuration = () => {
    handleChangeDate(
      "airEndDate",
      sumarHorarioAFecha(formValuesDate.airStarDate, duration)
    );
  };

  const onSubmitDate = () => {
    getDataOperator(
      true,
      formValuesDate.airStarDate,
      formValuesDate.airEndDate
    );
    getDataEquipment(
      true,
      formValuesDate.airStarDate,
      formValuesDate.airEndDate
    );
    getDataVinculos(
      true,
      formValuesDate.airStarDate,
      formValuesDate.airEndDate
    );
    setSelectRowData({
      ...selectRowData,
      date: formValuesDate.airStarDate,
      duration: duration,
    });
  };

  const disabledClearRecording = () => {
    // if (!selectRowData.id_grabacion) {
    //   return true;
    // }
    if (
      !selectRowData.id_equipo &&
      !selectRowData.id_ope &&
      !selectRowData.id_vinculo
    ) {
      return true;
    }
  };

  return (
    <div>
      {loadingData && <LoadingMask />}
      <Container>
        {selectRowData.type === "Diferido" && (
          <div>
            <Row margin={"0 0 20px 0"} position="relative">
              <FormOption>
                <LabelFlex>Air Date</LabelFlex>
                <ContainerInput>
                  <InputStyled
                    id="start-input"
                    type="datetime-local"
                    value={formValuesDate.airStarDate}
                    onFocus={() =>
                      handleChangeDate(
                        "airStarDate",
                        initialDateTimeValue(formValuesDate.airStarDate)
                      )
                    }
                    onBlur={() => onBlurAirStartDate()}
                    onChange={(e) =>
                      handleChangeDate("airStarDate", e.target.value)
                    }
                  />
                </ContainerInput>
              </FormOption>
              <FormOption>
                <LabelFlex>Duration</LabelFlex>
                <ContainerInput>
                  <TimeInputRecording
                    handleChange={(time) => handleChangeDuration(time)}
                    onBlur={onBlurDuration}
                    initialValue={selectRowData.duration}
                    disabled={!formValuesDate.airStarDate}
                  />
                </ContainerInput>
              </FormOption>
              <FormOption>
                <ButtonStyled
                  onClick={onSubmitDate}
                  disabled={disabledApplyBtn}
                >
                  Apply
                </ButtonStyled>
              </FormOption>
              {errorHoras ? (
                <ErrorMessage>
                  Error: The air date must be less than the deferred date:{" "}
                  {DateTime.fromISO(selectRowData.dateDiferido).toFormat(
                    "dd/MM/yyyy HH:mm"
                  )}
                </ErrorMessage>
              ) : null}
            </Row>
            <Line />
          </div>
        )}
        {selectRowData.isEventChange && (
          <Row>
            <Alerts variant={"warning"}>
              There was a schedule change in the program. Check Input and
              Equipment
            </Alerts>
          </Row>
        )}
        {!selectRowData.reqGrabacion && (
          <Row>
            <Alerts variant={"warning"}>
              The selected show does not need recording. If you also want to
              generate a recording, check the option below: "Need file"
            </Alerts>
          </Row>
        )}
        <Row>
          <FormOption>
            <LabelFlex>Code:</LabelFlex>
            <ContainerInput>
              <InputStyled value={selectRowData.code} disabled />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <LabelFlex>Description:</LabelFlex>
            <ContainerInput>
              <InputStyled value={selectRowData.description} disabled />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <LabelFlex>Feed:</LabelFlex>
            <ContainerInput>
              <InputStyled value={selectRowData.feed} disabled />
            </ContainerInput>
          </FormOption>
        </Row>
        <Row>
          <FormOption>
            <LabelFlex>Inputs:</LabelFlex>
            <ContainerInput>
              <Select
                isError={formData.vincu === selectRowData.id_vinculo ? selectRowData.needChangeVinculo : false}
                key={`${selectRowData.id_vinculo}-vinculo`}
                isDisabled={disabledSelects}
                options={dataVinculos}
                onChange={(e) => handleChange(e.target.value, "vincu")}
                defaultValue={
                  !selectRowData.isEventChange && selectRowData.id_vinculo
                }
                maxWidth={true}
                withoutDefault={formData.vincu}
              />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <LabelFlex>Equipment:</LabelFlex>
            <ContainerInput>
              <Select
                isError={formData.equi_graba === selectRowData.id_equipo ?  selectRowData.needChangeEquipo : false}
                key={`${selectRowData.id_equipo}-equipo`}
                isDisabled={disabledSelects}
                options={dataEquipment}
                onChange={(e) => handleChange(e.target.value, "equi_graba")}
                defaultValue={
                  !selectRowData.isEventChange && selectRowData.id_equipo
                }
                maxWidth={true}
                withoutDefault={formData.equi_graba}
              />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <LabelFlex>Operator:</LabelFlex>
            <ContainerInput>
              <Select 
                isError={formData.id_ope === selectRowData.id_operador ? selectRowData.needChangeOperador : false}
                key={`${selectRowData.id_operador}-ope`}
                isDisabled={disabledSelects}
                options={dataOperator}
                onChange={(e) => handleChange(e.target.value, "id_ope")}
                defaultValue={selectRowData.id_operador}
                maxWidth={true}
                withoutDefault={formData.id_ope}
              />
            </ContainerInput>
          </FormOption>
        </Row>
        <Row>
          <FormOption>
            <LabelFlex>Date:</LabelFlex>
            <ContainerInput>
              <InputStyled value={selectRowData.date} disabled />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <LabelFlex>Duration:</LabelFlex>
            <ContainerInput>
              <InputStyled value={selectRowData.duration} disabled />
            </ContainerInput>
          </FormOption>
          <FormOption>
            <CheckboxStyled
              label={"Need file"}
              onChange={() => setNeedRecording(!needRecording)}
              isChecked={needRecording}
              paddingLeft={true}
            />
          </FormOption>
        </Row>
        <Row flexEnd>
          <ButtonStyled
            disabled={disabledClearRecording()}
            onClick={()=>setClearReacording(selectRowData)}
            width={"200px"}
            variant={"secondary"}
          >
            Clear recording
          </ButtonStyled>
          <ButtonStyled
            disabled={disabledSave()}
            onClick={postDataGrabaciones}
            width={"200px"}
          >
            Save
          </ButtonStyled>
        </Row>
      </Container>
      <Table
        columns={columnsEpiConfig}
        data={dataModifEpi}
        dataEmpty={"There are no modifications for the selected episode"}
        rowClickHandler={rowClickHandler}
      />
      {clearRecording &&
      <ModalDeleteCommons 
      openModal={clearRecording}
      loading={loadingData}
      onClick={() => postDataGrabaciones(true, true)}
      onCloseDelete={()=>setClearReacording(null)}
      text={ <>
          <p>Input: {selectRowData.id_vinculo ? dataVinculos.filter((d)=>d.value === selectRowData.id_vinculo)[0].label : "-"}</p>
          <p>Equipment: {selectRowData.equipment ? selectRowData.equipment : "-"}</p>
          <p>Operator: {selectRowData.id_operador ? dataOperator.filter((d)=>d.value === selectRowData.id_operador)[0].label : "-"}</p>
      </>}
     >
      </ModalDeleteCommons>}
    </div>
  );
}

export { TaskConfiguration };

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: fit-content;
  margin-top: 30px;
  margin-bottom: 30px;
  font-size: 16px;
`;

const Line = styled.div`
  width: 100%;
  height: 2px;
  margin-bottom: 21px;
  background-color: #dadada;
`;

const FormOption = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
  text-wrap: nowrap;
  .rmsc .dropdown-container:focus-within {
    border: 2px solid #61a5c3 !important;
    box-shadow: none !important;
  }
  .select-multiple {
    max-width: 500px;
    font-size: 16px;
    border-radius: 6px !important;
    width: 100%;
    cursor: pointer !important;
    .dropdown-container {
      height: 32px;
      border: 1px solid lightgrey;
      border-radius: 6px;
    }

    .dropdown-heading {
      height: 26px;
      padding: 0 0 0 16px;
    }
    .dropdown-heading-value {
      text-align: start;
    }
    .gray {
      color: black !important;
    }
    .dropdown-content {
      .selected {
        border: none !important;
      }
    }
  }
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  ${({ flexEnd }) => {
    return (
      flexEnd &&
      css`
        justify-content: flex-end;
      `
    );
  }}
  margin : ${({ margin }) => (margin ? margin : "unset")};
  ${({ position }) =>
    position &&
    css`
      position: ${position};
    `};
`;

const LabelFlex = styled.label`
  text-align: right;
  flex: 1;
`;
const ContainerInput = styled.div`
  display: flex;
  flex: 3;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 18px;
  position: absolute;
  bottom: -22px;
  left: 9%;
`;
