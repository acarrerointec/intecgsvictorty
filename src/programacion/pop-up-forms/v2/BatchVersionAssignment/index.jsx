import { useEffect, useState } from "react";
import axiosApi from "../../../../../axiosApi";
import { ButtonStyled } from "../../../../commons/Button";
import NewFormWindow from "../NewFormWindow";
import { ContainerInput, ErrorMessage, Label, Row, RowItem } from "../styles";
import { MultiSelect } from "react-multi-select-component";
import { InputStyled } from "../../../../commons/Input";
import { DateTime } from "luxon";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../commons/snackbarConfig";
import "../StylesGlobals.scss";
import Loader from "../../../../Loader/Loader";

const defaultValues = {
  canales: [],
  emi_desde: "",
  emi_hasta: "",
};

const BatchVersionAssignment = ({ show, onClose, hasPermission, isOpen }) => {
  const [loadStatus, setLoadStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [channelList, setChannelList] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [newChannelList, setNewChannelList] = useState([]);
  const [errorHoras, setErrorHoras] = useState(false);
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);

  useEffect(() => {
    getData();
  }, []);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) => opciones.push({ value: d.codi, label: d.descrip }));

    return opciones.sort((a, b) => {
      return a.value - b.value;
    });
  };

  useEffect(() => {
    if (channelList) {
      setNewChannelList(adaptarDatosAOpciones(channelList));
    }
  }, [channelList]);

  const handleChange = (key, v) => {
    if (key === "emi_hasta") {
      calcularDates(formValues.emi_desde, v);
    }
    if (key === "emi_desde" && formValues.emi_hasta) {
      calcularDates(v, formValues.emi_hasta);
    }
    setFormValues((prev) => ({ ...prev, [key]: v }));
  };

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
    setLoadStatus(true);
    let url = `combos/canal`;
    const api = await axiosApi();
    const { data } = await api.get(url);
    const hasError = !data.message.success;
    if (hasError) {
      return openSnackError(data.message.message, 600000);
    }
    setChannelList(data.model);
    setLoadStatus(false);
  };

  const validarObligatorios = () =>
    formValues &&
    formValues.emi_desde !== "" &&
    formValues.emi_hasta !== "" &&
    formValues.canales.length > 0 &&
    !errorHoras;

  const handleSaveClick = async (e) => {
    if (!hasPermission) return;
    try {
      setSending(true);
      let url = `media-versiones`;
      const formatedData = {
        ...formValues,
        canales: formValues.canales.map((el) => el.value).join(","),
      };
      const api = await axiosApi();
      const { data } = await api.put(url, formatedData);
      setSending(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      onClose();
      openSnackSuccess("Changes applied to selected channels.", 60000);
    } catch (error) {
      openSnackError("An unexpected error has occurred.", 600000);
    }
  };

  const formLayout = () => {
    return (
      <>
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
            <Label>Air Date</Label>
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
      </>
    );
  };

  return (
    <NewFormWindow
      isBlur
      title="Batch Version Assignment"
      isOpen={isOpen}
      onClose={onClose}
      loading={loadStatus}
      buttons={
        <ButtonStyled
          disabled={validarObligatorios() && hasPermission ? "" : "disabled"}
          onClick={
            !sending && validarObligatorios() ? handleSaveClick : () => {}
          }
        >
        {sending ? <Loader /> :"Save"}
        </ButtonStyled>
      }
    >
      {formLayout()}
    </NewFormWindow>
  );
};

export default BatchVersionAssignment;
