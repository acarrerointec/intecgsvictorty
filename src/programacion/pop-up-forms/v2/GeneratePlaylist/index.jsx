import React, { useState, useEffect } from "react";
import "../../generarPlaylist/GenerarPlaylist.scss";
import moment from "moment";
import NewFormWindow from "../NewFormWindow";
import axiosApi from "../../../../../axiosApi";
import { ButtonStyled } from "../../../../commons/Button";
import { ContainerInput, Label, Row, RowItem } from "../styles";
import { Select } from "../../../../commons/Select";
import { InputStyled } from "../../../../commons/Input";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../commons/snackbarConfig";
import { ModalAlert } from "../../../../commons/ModalAlert";

const generarPLaylist = {
  canal: "",
  senial: "",
  fecha_emi: "",
};

const GeneratePlaylist = ({ show, onClose, hasPermission, isOpen }) => {
  const [loadStatus, setLoadStatus] = useState(true);
  const [formData, setData] = useState(generarPLaylist);
  const [sending, setSending] = useState(false);
  const [channelList, setChannelList] = useState(null);
  const [senialList, setSenialList] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedSenial, setSelectedSenial] = useState(null);
  const [isValidDate, setIsValidDate] = useState(false);
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);
  const [isAlertSave, setIsAlertSave] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    let url = `canales-combo-diario`;
    const api = await axiosApi();
    const { data } = await api.get(url);

    const hasError = !data.message.success;
    if (hasError) {
      return openSnackError(data.message.message, 600000);
    }
    setChannelList(adaptarDatosAOpciones(data.model));
    if (data.model) {
      setSelectedChannel(data.model[0].codi.trim());
    }
    setLoadStatus(false);
  };

  const getSenialList = async () => {
    let url = `combos/senial/${selectedChannel}`;
    const api = await axiosApi();
    const { data } = await api.get(url);

    const hasError = !data.message.success;
    if (hasError) {
      return openSnackError(data.message.message, 600000);
    }
    setSenialList(data.model);
    if (data.model) {
      setSelectedSenial(data.model[0].codi.trim());
    }
  };

  useEffect(() => {
    selectedChannel && getSenialList();
  }, [selectedChannel]);

  const validarObligatorios = () =>
    formData &&
    formData.fecha_emi !== "" &&
    selectedSenial.length > 0 &&
    selectedChannel.length > 0;

  const handleSaveClick = async (e) => {
    if (!hasPermission) return;
    setSending(true);
    let url = `play-list-genera-diario`;
    const formatedData = {
      ...formData,
      canal: selectedChannel,
      senial: selectedSenial,
    };
    const api = await axiosApi();
    const { data } = await api.post(url, formatedData);
    setSending(false);

    const hasError = !data.message.success;
    if (hasError) {
      return openSnackError(data.message.message, 600000);
    }
    onClose();
    openSnackSuccess("The playlist was generated correctly.", 60000);
  };

  const handleChange = (e) => {
    setSelectedChannel(e.target.value);
  };

  const handleChangeSenial = (e) => {
    setSelectedSenial(e.target.value);
  };

  const onChangeDate = async (e, type) => {
    const selectDate = moment(e.target.value);
    const hoy = moment();
    if (selectDate) {
      const diff =
        hoy.isBefore(selectDate, "day") || hoy.isSame(selectDate, "day");
      setIsValidDate(diff);
    } else {
      setIsValidDate(false);
    }
    e.persist();
    setData((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const handleConfirm = () => {
    setIsAlertSave(true);
  };

  const getMinDate = () => {
    const currentDate = new Date();
    return currentDate.toISOString().split("T")[0];
  };

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
      opciones.push({ value: d.codi.trim(), label: d.descrip })
    );

    return opciones.sort((a, b) => {
      return a.value - b.value;
    });
  };

  const formLayout = () => {
    return (
      <div
        style={{
          maxWidth: "1000px",
          // minWidth: "500px",
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
              <div style={{ width: "80px" }}>
                <Label>Network</Label>
              </div>
              <ContainerInput>
                <Select
                  withoutDefault
                  onChange={handleChange}
                  options={channelList || []}
                  maxWidth={"100%"}
                />
              </ContainerInput>
            </RowItem>
          </Row>
          <Row>
            <RowItem>
              <div style={{ width: "80px" }}>
                <Label>Feed</Label>
              </div>
              <ContainerInput>
                <Select
                  withoutDefault
                  onChange={handleChangeSenial}
                  options={senialList ? adaptarDatosAOpciones(senialList) : []}
                  maxWidth={"100%"}
                />
              </ContainerInput>
            </RowItem>
          </Row>
          <Row>
            <RowItem>
              <div style={{ width: "80px" }}>
                <Label>From</Label>
              </div>
              <InputStyled
                id="start-input"
                type="date"
                value={formData.fecha_emi}
                onChange={(e) => onChangeDate(e, "fecha_emi")}
                min={getMinDate()}
              />
            </RowItem>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <>
      <NewFormWindow
        title="Generate Playlist"
        show={show}
        isOpen={isOpen}
        onClose={onClose}
        loading={loadStatus}
        buttons={
          <ButtonStyled
            disabled={
              validarObligatorios() && hasPermission && isValidDate
                ? ""
                : "disabled"
            }
            onClick={
              !sending && validarObligatorios() && hasPermission && isValidDate
                ? handleConfirm
                : () => {}
            }
          >
            {"Save"}
          </ButtonStyled>
        }
      >
        {formLayout()}
      </NewFormWindow>
      {isAlertSave && (
        <ModalAlert
          openModal={isAlertSave}
          onClick={handleSaveClick}
          onClose={() => setIsAlertSave(false)}
          loading={sending}
          text={
            <>
              <div>Are you sure you want to generate this playlist?</div>
              <div>
                Please understand that changes made CANNOT be undone once
                generated.
              </div>
            </>
          }
        ></ModalAlert>
      )}
    </>
  );
};

export default GeneratePlaylist;
