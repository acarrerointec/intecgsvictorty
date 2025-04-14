import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  ContentLayout,
  Header,
  Body,
  Row,
  RowItem,
  Label,
  LoadingMask,
  Footer,
} from "./styles";
import ModalPortal from "../../../../../commons/ModalWrapper";
import ModalBase from "../../../../../commons/Modal";
import Loader from "../../../../../commons/Loader";
import { MultiSelect } from "react-multi-select-component";
import { ButtonStyled } from "../../../../../commons/Button";
import { InputStyled } from "../../../../../commons/Input";
import axiosApi from "../../../../../../axiosApi";
import { obtenerValoresUnicos } from "../../../../../../utils/arraysUtils";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../../commons/snackbarConfig";
import styled from "styled-components";

const defaultForm = {
  emi_desde: "",
  emi_hasta: "",
  equipos: [],
};

const ReportePlaylist = ({
  setReportPlayList,
  isOpen,
}) => {

const [loading, setLoading] = useState(false);
const [formValues, setFormValues] = useState(defaultForm);
const [isCompleted, setIsCompleted] = useState(false);
const [dateErrorFecha, setDateErrorFecha] = useState(false);
const [dataEquipment,setDataEquipment]=useState([])
const [equipment,setEquipment] = useState([])
const [openSnackError] = useSnackbar(error);
const [openSnackSuccess] = useSnackbar(success);

useEffect(()=>{
  getDataEquipment()
},[])

useEffect(() => {
  if (dataEquipment) {
    setEquipment(adaptarDatosAOpciones(obtenerValoresUnicos(dataEquipment, "descrip")));
  }
}, [dataEquipment]);

  useEffect(() => {
    validateDate();
    validateCompleteForm(formValues);
  }, [formValues]);

  const validateDate = async () => {
    if (formValues.emi_hasta === "" || formValues.emi_desde === "") return;
    const res = await moment(formValues.emi_hasta).isSameOrAfter(
      formValues.emi_desde,
      "day"
    );
    setDateErrorFecha(!res);
  };
  
  const validateCompleteForm = (formValues) => {
    const completados = Object.values(formValues).every(value => {
      return Array.isArray(value) ? value.length > 0 : value.trim() !== '';
    });
    setIsCompleted(completados);
  }; 

  const adaptarDatosAOpciones = (dataEquipment) => {
    const opciones = [];
    dataEquipment.forEach((d) => opciones.push({ value: d, label: d }));
    return opciones;
  };

  const getDataEquipment = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoading(true);
      const url = `equipos`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoading(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataEquipment(data.model || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 600000);
      setLoading(false);
      console.log(error);
    }
  };

  const sendData = async (withLoading) => {
    try {
      withLoading && setLoading(true);
      const url = `grabaciones-versiones`;
      const api = await axiosApi();
      const valuesItems = formValues.equipos.map((e)=>e.value).join(",")
      const objet = {...formValues,equipos: valuesItems}
      const { data } = await api.post(url,objet);
      setLoading(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Send successfully.",600000)
      onCloseModal()
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 600000);
      setLoading(false);
      console.log(error);
    }
  };

  const onCloseModal=()=>{
    setReportPlayList(false)
  }

  return (
    <ModalPortal>
      <ModalBase
        openModal={isOpen}
        onClose={onCloseModal}
        height="fit-content"
      >
        <ContentLayout>
          {loading && (
            <LoadingMask>
              <Loader />
            </LoadingMask>
          )}
          <Header>Generate Playlist</Header>
          <Body>
            <Row>
              <RowItem>
                <Label flex={1}>Equipment</Label>
                <div style={{ flex: 5, maxWidth: "444px" }}>
                  <MultiSelect
                    value={formValues.equipos}
                    className="select-multiple"
                    labelledBy="Select"
                    overrideStrings={{
                      selectSomeItems: "Select options",
                    }}
                    id="select-equipos"
                    hasSelectAll={false}
                    disableSearch
                    onChange={(items) => {
                      setFormValues((prev) => ({
                        ...prev,
                        equipos: items,
                      }));
                    }}
                    options={equipment || []}
                  />
                </div>
              </RowItem>
            </Row>
            <Row>
              <RowItem>
                <Label>Date From</Label>
                <InputStyled
                  type="date"
                  id="dateFrom"
                  value={formValues.emi_desde}
                  onChange={(e) => {
                    e.persist();
                    setFormValues((prev) => ({
                      ...prev,
                      emi_desde: e.target.value,
                    }));
                  }}
                />
              </RowItem>
              <RowItem>
                <Label>Date To</Label>
                <InputStyled
                  type="date"
                  id="dateTo"
                  value={formValues.emi_hasta}
                  onChange={(e) => {
                    e.persist();
                    setFormValues((prev) => ({
                      ...prev,
                      emi_hasta: e.target.value,
                    }));
                  }}
                />
              </RowItem>
            </Row>
            {dateErrorFecha && (
              <ErrorMessage>
                The To date must be after the date From
              </ErrorMessage>
            )}
          </Body>
          <Footer>
            <ButtonStyled
              variant="terciary"
              onClick={onCloseModal}
            >
              Cancel
            </ButtonStyled>
            <ButtonStyled
              disabled={!isCompleted || dateErrorFecha}
              onClick={sendData}
            >
              Generate
            </ButtonStyled>
          </Footer>
        </ContentLayout>
      </ModalBase>
    </ModalPortal>
  );
};

export  {ReportePlaylist};

const ErrorMessage = styled.div`
  color: red;
  font-size: 16px;
  left: 9%;
`;