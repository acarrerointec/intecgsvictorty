/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { Row, RowItem, Label, ErrorMessage } from "../styles";
import { Select } from "../../../../commons/Select";
import InputWithSuggestions from "../../../../commons/InputWithSuggestions";
import { InputStyled } from "../../../../commons/Input";
import { ButtonStyled } from "../../../../commons/Button";
import axiosApi from "../../../../../axiosApi";
import { DateTime } from "luxon";
import moment from "moment";
import {
  useGrillaData,
  grillaDataTypes,
} from "../../../../contexts/grilla-data-context";
import CheckboxStyled from "../../../../commons/CheckboxStyled";
import NewFormWindow from "../NewFormWindow";
import { ModalDeleteCommons } from "../../../../commons/ModalDeleteCommons";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../commons/snackbarConfig";
import { ModalAlert } from "../../../../commons/ModalAlert";

const defaultValues = {
  airStarDate: "",
  airEndDate: "",
  depor: "",
  progra: "",
  show: null,
  canal: "",
  ltsa: "",
  descrip: "",
  alterSimulcastCreateAction: 0,
};

const obligatorios = [
  "airStarDate",
  "airEndDate",
  "depor",
  "progra",
  "canal",
  "ltsa",
  "descrip",
];

const ProgramChange = ({ onClose = () => {}, isOpen = false, show }) => {
  const inputSugRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);
  const [duration, setDuration] = useState("");
  const [errorHoras, setErrorHoras] = useState(false);
  const [errorHoraStart, setErrorHoraStart] = useState(false);
  const [errorHoraEndUpdateBetween,setErrorHoraEndUpdateBetween]=useState(false)
  const [updateMode, setUpdateMode] = useState(false);
  const [isMerge, setIsMerge] = useState(false);
  // networks data
  const [networks, setNetworks] = useState([]);
  const [loadignNetworks, setLoadingNetworks] = useState(false);
  const [dataChangeNetwork, setDataChangeNetwork] = useState(null);
  const [replicateInParent, setReplicateInParent] = useState(true);
  // programs data
  const [programs, setPrograms] = useState([]);
  const [formatedPrograms, setFormatedPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [showProgram, setShowProgram] = useState(null);
  // LTSA
  const [ltsa, setLtsa] = useState([]);
  const [loadingLtsa, setLoadingLtsa] = useState(false);
  // title
  const [titles, setTitles] = useState([]);
  const [formatedTitles, setFormatedTitles] = useState([]);
  const [showTitle, setShowTitle] = useState(null);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [isNewTitle,setIsNewTitle] = useState(false)
  const [currentPrograDepor, setCurrentPrograDepor] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);
  const [isClickCancel, setIsClickCancel] = useState(false);
  const [solapamientoError, setSolapamientoError] = useState(false);
  const isUpdateable =
    show?.progra_ori == 2 || (show?.progra_ori == 1 && show?.esta_progra == 6);
  const withoutSaveButton = updateMode && !isUpdateable;
  const loading =
    loadignNetworks ||
    sending ||
    loadingPrograms ||
    loadingLtsa ||
    loadingTitles;
  const grillaData = useGrillaData();
  const hasNewCheck = isMerge || !updateMode;

  const momentTimeZone = require("moment-timezone");

  useEffect(() => {
    if (formValues.canal.length > 0) {
      getNewtworksChild(formValues.canal);
    }
  }, [formValues.canal]);

  useEffect(()=>{
    if((!updateMode || isMerge) && !isNewTitle){
      setFormValues(prev => ({...prev, show: null}))
    }
  },[isNewTitle])

  const getNewtworksChild = async (parent) => {
    try {
      const api = axiosApi();
      if (parent) {
        const { data } = await api.get(`/programChange/child/${parent}`);
        if (!data.message.success) {
          return openSnackError(data.message.message, 600000);
        }
        setDataChangeNetwork(data.model);
        setReplicateInParent(true);
        if (data.model.length > 0) {
          return setFormValues((prev) => ({
            ...prev,
            alterSimulcastCreateAction: replicateInParent ? 1 : 0,
          }));
        }
      }
      setDataChangeNetwork(null);
      setFormValues((prev) => ({
        ...prev,
        alterSimulcastCreateAction: 0,
      }));
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const checkAvailable = async (callback) => {
    setSolapamientoError(false);
    // let newFormValues = formatDates(formValues);
    try {
      const api = axiosApi();
      const { data } = await api.get(
        `/programChange/programacion_en_horario/${formValues.canal}/${"A"}/${
          formValues.airStarDate
        }/${formValues.airEndDate}${show?.epi ? "/" + show?.epi : "/-1"}`
      );
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      if (data.model) {
        callback();
      } else {
        setSolapamientoError(true);
      }
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  useEffect(() => {
    if (dataChangeNetwork) {
      setFormValues((prev) => ({
        ...prev,
        alterSimulcastCreateAction: replicateInParent ? 1 : 0,
      }));
    }
  }, [replicateInParent]);

  useEffect(() => {
    if (show) {
      setUpdateMode(true);
      setShowTitle({
        label: show.show + " - " + show.show_descrip,
        value: show.show,
      });
      const prograPrefix = `${show.depor.trim()}${show.progra.trim()}-`;
      setShowProgram({
        label: show.progra_descrip.includes(prograPrefix)
          ? show.progra_descrip
          : `${prograPrefix}${show.progra_descrip}`,
        value: show.depor + " - " + show.progra,
      });
      setFormValues((prev) => ({
        ...prev,
        airStarDate: show.fecha_hora_ini,
        airEndDate: show.fecha_hora_fin,
        depor: show.depor,
        progra: show.progra,
        canal: show.canal,
        ltsa: show.tipo_emi,
        descrip: show.progra_descrip,
        show: show.show,
      }));
      setCurrentPrograDepor(`${show.depor}-${show.progra}`);
    }
  }, []);

  useEffect(() => {
    getNewtworks();
    getPrograms();
    getLtsa();
  }, []);

  useEffect(() => {
    if (formValues.depor && formValues.progra) {
      const { depor, progra } = formValues;
      if (`${depor}-${progra}` !== currentPrograDepor) {
        getTitle(depor, progra);
        setCurrentPrograDepor(`${depor}-${progra}`);
        handleChange("show", null);
      }
    }
    validateCompletedFields(formValues);
    if (formValues.airStarDate && formValues.airEndDate) {
      calculateDuration(formValues.airStarDate, formValues.airEndDate);
    }
    if (formValues.airStarDate) {
      const today = moment(new Date())
        .set({ minute: 0 })
        .format("yyyy-MM-DDTHH:mm");
      setErrorHoraStart(formValues.airStarDate < today);
    }
    if (formValues.airEndDate && hasProgrammingInProgress() && updateMode) {
      const today = moment(new Date()).format("yyyy-MM-DDTHH:mm");
      setErrorHoraEndUpdateBetween(formValues.airEndDate < today);
    }
  }, [formValues]);

  const validateCompletedFields = (fields) => {
    let completed = true;
    obligatorios.forEach((key) => {
      if (!fields[key]) {
        completed = false;
      }
    });
    setIsCompleted(completed);
  };

  const calculateDuration = (fecha1, fecha2) => {
    setErrorHoras(false);
    const fechaInicio = DateTime.fromISO(fecha1);
    const fechaFin = DateTime.fromISO(fecha2);
    const diferenciaEnMinutos = fechaFin
      .diff(fechaInicio, "minutes")
      .toObject();
    const horas = Math.abs(Math.floor(diferenciaEnMinutos.minutes / 60));
    const minutos = Math.abs(diferenciaEnMinutos.minutes % 60);
    const signo = fechaFin >= fechaInicio ? "" : "-";
    if (signo === "-" || fechaFin <= fechaInicio) {
      setErrorHoras(true);
    }
    const diferenciaFormateada = `${signo}${horas
      .toString()
      .padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
    setDuration(diferenciaFormateada);
  };

  useEffect(() => {
    if (programs) {
      setFormatedPrograms(
        programs.map((n) => ({
          label: n.composeDescrip,
          value: n.depor + " - " + n.progra,
        }))
      );
    }
  }, [programs]);

  useEffect(() => {
    if (titles) {
      setFormatedTitles(
        titles.map((n) => {
          return {
            label: n.show + " - " + n.descrip,
            value: n.show,
          };
        })
      );
    }
  }, [titles]);

  const getNewtworks = async () => {
    try {
      setLoadingNetworks(true);
      const api = axiosApi();
      const { data } = await api.get("/programChange/network");
      setLoadingNetworks(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setNetworks(data.model);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const getPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const api = axiosApi();
      const { data } = await api.get("/programChange/program");
      setLoadingPrograms(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setPrograms(data.model);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const getLtsa = async () => {
    try {
      setLoadingLtsa(true);
      const api = axiosApi();
      const { data } = await api.get("/programChange/ltsa");
      setLoadingLtsa(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setLtsa(data.model);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const getTitle = async (depor, progra) => {
    if (!depor || !progra) return;
    try {
      setLoadingTitles(true);
      const api = axiosApi();
      const { data } = await api.get(
        `/programChange/title/${depor.trim()}/${progra.trim()}`
      );
      setLoadingTitles(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      const listReverted = data.model?.reverse();
      setTitles(listReverted);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const formatDates = (formValues) => {
    // aca hay que  modificar las fechas
    const newFormValues = {
      ...formValues,
      airStarDate: momentTimeZone(formValues.airStarDate)
        .tz("America/Argentina/Buenos_Aires")
        .format(),
      airEndDate: momentTimeZone(formValues.airEndDate)
        .tz("America/Argentina/Buenos_Aires")
        .format(),
    };
    return newFormValues;
  };

  const sendData = async (callback) => {
    try {
      setSending(true);
      const api = axiosApi();
      let newFormValues = formatDates(formValues);
      if (updateMode && show) {
        newFormValues.ncs_epi_id = show.ncs_epi_id;
      }
      const res = await api.post(
        `/programChange/${updateMode ? "update" : "send"}`,
        newFormValues
      );
      setSending(false);
      if (!res.data.message.success) {
        return openSnackError(res.data.message.message, 600000);
      }
      openSnackSuccess("The program was loaded successfully.", 60000);
      callback();
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const initialDateTimeValue = (date) => {
    const today = moment(new Date())
      .set({ minute: 0 })
      .format("yyyy-MM-DDTHH:mm");
    return date || today;
  };

  const handleChange = (key, v) => {
    setHasChanges(true);
    // esto lo hacemos para resetear el campo de title cuando cambia el program
    if (key === "depor") {
      if (show?.depor?.trim() !== v?.trim()) {
        setShowTitle("");
        handleChange("show", null);
      }
    }
    setFormValues((prev) => ({ ...prev, [key]: v }));
  };

  const dateInputsIds = ["start-input", "end-input"];

  const resetValues = () => {
    dateInputsIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = "";
      }
    });
    handleChange("airStarDate", "");
    handleChange("airEndDate", "");
    setDuration("00:00");
  };

  const handleCancel = () => {
    if (hasChanges) {
      setIsClickCancel(true);
    } else {
      onClose();
    }
  };

  const onDelete = async () => {
    try {
      setSending(true);
      const api = axiosApi();
      const res = await api.delete(`/programChange/${show.ncs_epi_id}`);
      setSending(false);
      if (!res.data.message.success) {
        return openSnackError(res.data.message.message, 600000);
      }
      openSnackSuccess("The program was delete successfully.", 60000);
      setIsDelete(false);
      onClose();
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const onApplyFormat = async () => {
    try {
      setSending(true);
      const api = axiosApi();
      const res = await api.post(`/programChange/pauta_senial_u/${show.epi}`);
      setSending(false);
      if (!res.data.message.success) {
        return openSnackError(
          res.data.message.message || "Error applying format",
          600000
        );
      }
      openSnackSuccess("Format successfully applied", 60000);
      grillaData.dispatch({
        type: grillaDataTypes.GLOBAL_RELOAD_DATA,
      });
      onClose();
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const onApplyMerge = () => {
    setIsMerge(true);
  };

  useEffect(() => {
    isMerge && inputSugRef.current && inputSugRef.current.focus();
  }, [isMerge]);

  const sendDataMerge = async (callback) => {
    try {
      setSending(true);
      const api = axiosApi();
      const res = await api.post(
        `/programChange/merge/${show.ncs_epi_id}/${formValues.show}/${isNewTitle ? 0 : 1}`
      );
      setSending(false);
      if (!res.data.message.success) {
        return openSnackError(
          res.data.message.message || "An unexpected error has occurred.",
          600000
        );
      }
      openSnackSuccess("The merge was loaded successfully.", 60000);
      callback();
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };
  
    
  const hasProgrammingInProgress = () => {
    const fechaInicio = moment(show?.fecha_hora_ini);
    const fechaFin = moment(show?.fecha_hora_fin);
    const fechaActual = momentTimeZone(new Date()).tz(
      "America/Argentina/Buenos_Aires"
    );
    if (updateMode) {
      return fechaActual.isBetween(fechaInicio, fechaFin, undefined, "[]");
    }
  };


  const formLayout = () => {
    return (
      <>
        <Row>
          <RowItem>
            <Label>Network</Label>
            <Select
              defaultValue={formValues.canal}
              options={
                networks
                  ? networks.map((n) => ({
                      label: n.canal + " - " + n.descrip,
                      value: n.canal,
                    }))
                  : []
              }
              onChange={(e) => {
                handleChange("canal", e.target.value);
              }}
              maxWidth="530px"
              isDisabled={updateMode}
            />
          </RowItem>
          <RowItem>
            <Label>Program</Label>
            <InputWithSuggestions
              show={showProgram}
              key={formatedPrograms.length}
              suggestions={formatedPrograms}
              callback={(e) => {
                if (e) {
                  const [depor, progra] = e.value.split("-");
                  handleChange("depor", depor);
                  handleChange("progra", progra);
                  handleChange("descrip", e.label.split("-")[1]);
                }
              }}
              isDisabled={updateMode}
            />
          </RowItem>
        </Row>
        <Row>
          <RowItem>
            <Label style={{ marginRight: "35px" }}>Title</Label>
            {!isNewTitle ? (
              <InputWithSuggestions
                ref={inputSugRef}
                key={formatedTitles.length}
                suggestions={formatedTitles}
                show={showTitle}
                callback={(e) => {
                  if (e) {
                    handleChange("show", e.value);
                  }
                }}
                isDisabled={updateMode && !isMerge}
              />
            ): (
              <InputStyled
                type="number"
                pattern="^[1-9]\d*$"
                min={0}
                placeholder="Episode show id"
                onChange={(e) => {
                  e.persist();
                  handleChange("show", Number(e.target.value));
                }}
              />
            )}
          </RowItem>
          {hasNewCheck && (
            <RowItem>
              <CheckboxStyled
                fontSize={"2rem"}
                label={"New Title"}
                isChecked={isNewTitle}
                onChange={() => {
                  setIsNewTitle(!isNewTitle);
                }}
              />
            </RowItem>
          )}
        </Row>
        <Row>
          <RowItem>
            <Label>Air Date</Label>
            <InputStyled
              id="start-input"
              type="datetime-local"
              value={formValues.airStarDate}
              onFocus={() =>
                handleChange(
                  "airStarDate",
                  initialDateTimeValue(formValues.airStarDate)
                )
              }
              onChange={(e) => handleChange("airStarDate", e.target.value)}
              disabled={isMerge || hasProgrammingInProgress()}
              min={moment(new Date())
                .set({ minute: 0 })
                .format("yyyy-MM-DDTHH:mm")}
            />
          </RowItem>
          <RowItem>
            <Label>End Date</Label>
            <InputStyled
              id="end-input"
              type="datetime-local"
              value={formValues.airEndDate}
              onFocus={() =>
                handleChange(
                  "airEndDate",
                  initialDateTimeValue(formValues.airEndDate)
                )
              }
              onChange={(e) => handleChange("airEndDate", e.target.value)}
              disabled={(!show && !formValues.airStarDate) || isMerge}
              min={formValues.airStarDate}
            />
          </RowItem>
          <RowItem>
            <Label>Duration</Label>
            <InputStyled disabled placeholder="00:00" value={duration} />
          </RowItem>
          <RowItem>
            <Label>LTSA</Label>
            <Select
              defaultValue={formValues.ltsa}
              options={
                ltsa
                  ? ltsa.map((l) => ({
                      label: l.tipo_emi + " - " + l.descrip,
                      value: l.tipo_emi,
                    }))
                  : []
              }
              onChange={(e) => {
                handleChange("ltsa", e.target.value);
              }}
              isDisabled={isMerge}
            />
          </RowItem>
        </Row>
        {dataChangeNetwork && !updateMode && (
          <Row>
            <RowItem>
              <CheckboxStyled
                label={"Replicate in child"}
                isChecked={replicateInParent}
                onChange={() => {
                  setReplicateInParent(!replicateInParent);
                }}
              />
            </RowItem>
          </Row>
        )}
        {errorHoras && !hasProgrammingInProgress() ? (
          <ErrorMessage>
            Error: End Date/Time cannot be prior than Start Date/Time.
          </ErrorMessage>
        ) : null}
        {errorHoraEndUpdateBetween ? (
          <ErrorMessage>
            Error: End date/time cannot be before today's date/time.
          </ErrorMessage>
        ) : null}
        {errorHoraStart && !hasProgrammingInProgress() ? (
          <ErrorMessage>
            Error: The start Date/Time cannot be less than the current
            Date/Time.
          </ErrorMessage>
        ) : null}
        {solapamientoError ? (
          <ErrorMessage>
            Error: Unable to save program, there is a program at the entered
            time.
          </ErrorMessage>
        ) : null}
      </>
    );
  };

  const enableDeleteButton =
    show?.progra_ori == 2 || show?.esta_progra?.trim() == 6;

  const fnButtons = () => {
    return (
      <>
        <ButtonStyled variant="terciary" onClick={handleCancel}>
          Cancel
        </ButtonStyled>
        {isMerge && (
          <ButtonStyled
            onClick={() => checkAvailable(() => sendDataMerge(onClose))}
            disabled={
              formValues?.show == "" || formValues?.show == showTitle?.value
            }
          >
            Save Merge and Close
          </ButtonStyled>
        )}
        {hasProgrammingInProgress() ? (
          <ButtonStyled
            disabled={!isCompleted || errorHoraEndUpdateBetween}
            onClick={() => checkAvailable(() => sendData(onClose))}
          >
            Save
          </ButtonStyled>
        ) : (
          <ButtonStyled
            disabled={!isCompleted || errorHoras || withoutSaveButton}
            onClick={() => checkAvailable(() => sendData(onClose))}
          >
            Save and Close
          </ButtonStyled>
        )}
        <ButtonStyled
          variant="secondary"
          onClick={() => setIsDelete(true)}
          disabled={!enableDeleteButton}
        >
          Delete
        </ButtonStyled>
        <ButtonStyled
          variant="primary"
          onClick={onApplyFormat}
          // disabled={show?.esta_progra >= 6 && show?.progra_ori != 2}
          disabled={show?.progra_ori != 2}
        >
          Apply Format
        </ButtonStyled>
        {!updateMode && (
          <ButtonStyled
            disabled={!isCompleted || errorHoras || withoutSaveButton}
            onClick={() => checkAvailable(() => sendData(() => resetValues()))}
          >
            Save and Create Another
          </ButtonStyled>
        )}
        {updateMode && (
          <ButtonStyled disabled={withoutSaveButton} onClick={onApplyMerge}>
            Merge
          </ButtonStyled>
        )}
      </>
    );
  };
  return (
    <>
      <NewFormWindow
        title={
          updateMode ? "Programming Change - Update" : "Programming Change"
        }
        isOpen={isOpen}
        onClose={onClose}
        loading={loading}
        buttons={fnButtons()}
        isBlur
      >
        {formLayout()}
      </NewFormWindow>
      {isDelete && (
        <ModalDeleteCommons
          onClick={onDelete}
          onCloseDelete={() => {
            setIsDelete(false);
          }}
          openModal={isDelete}
          loading={sending}
        >
          <div>
            Channel: <strong> {show?.canal}</strong>
          </div>
          <div>
            Signal:<strong> {show?.senial}</strong>
          </div>
          <div>
            Program:<strong> {show?.progra_codi}</strong>
          </div>
          <div style={{ margin: "16px 0px", color: "red", fontSize: "18px" }}>
            Warning: Program data will be permanently lost.
          </div>
        </ModalDeleteCommons>
      )}
      {isClickCancel && (
        <ModalAlert
          text={
            "Are you sure you want to go out? The data entered will be lost."
          }
          openModal={isClickCancel}
          onClose={() => setIsClickCancel(false)}
          onClick={onClose}
        />
      )}
    </>
  );
};

export default ProgramChange;
