import styled from "styled-components";
import ModalBase from "../../../commons/Modal";
import ModalPortal from "../../../commons/ModalWrapper";
import { InputStyled } from "../../../commons/Input";
import { useState } from "react";
import { ButtonStyled } from "../../../commons/Button";
import { LuHash } from "react-icons/lu";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../commons/snackbarConfig";
import { Table } from "../../../commons/Table";
import { ModalDelete } from "./ModalDelete";
import { useEffect } from "react";
import { DateTime } from "luxon";
import axiosApi from "../../../../axiosApi";
import Loader from "../../../commons/Loader";

const ModalAdmin = ({
  // data,
  selectRowData,
  setSelectRowData = () => {},
  title,
  columnsTable = [],
  nameUrl,
  setReloadData=()=>{}
}) => {
  const [formValues, setFormValues] = useState({
    fechaIni: "",
    fechaFin: "",
  });
  const [selectDelete, setSelectDelete] = useState(null);
  const [errorHoras, setErrorHoras] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openSnackError] = useSnackbar(error);
  const [dataTable, setDataTable] = useState([]);

  useEffect(() => {
    getDataTable(nameUrl, selectRowData.id);
    //agrego key de id a formValues
    if (nameUrl === "equipos")
      return setFormValues((prev) => ({
        ...prev,
        equi_graba: selectRowData.id,
      }));
    if (nameUrl === "vinculos")
      return setFormValues((prev) => ({ ...prev, vincu: selectRowData.id }));
    if (nameUrl === "operadores")
      return setFormValues((prev) => ({ ...prev, id_ope: selectRowData.id }));
  }, []);

  const getDataTable = async (name, id) => {
    try {
      setLoadingData(true);
      const url = `${name}-dates/${id}`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataTable(data.model || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const postData = async (name) => {
    try {
      setLoadingData(true);
      const url = `${name}-alta`;
      const api = await axiosApi();
      const { data } = await api.post(url, formValues);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      resetValues();
      getDataTable(nameUrl, selectRowData.id);
      setReloadData((prev) => ++prev)
      // openSnackbar("Recording succefully", 10000);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };
  const deleteData = async (name) => {
    setDeleting(true)
    try {
      const url = `${name}-baja/${selectDelete.id}`;
      const api = await axiosApi();
      const { data } = await api.delete(url);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      onCloseDelete();
      getDataTable(nameUrl, selectRowData.id);
      // openSnackbar("Recording succefully", 10000);
      setDeleting(false)
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An error occurred when trying to delete
        </p>
      );
      openSnackError(message, 600000);
      console.log(error);
      setDeleting(false)
    }
  };

  const initialDateTimeValue = (date) => {
    const today = DateTime.local().set({ minute: 0 });
    return date || today.toFormat("yyyy-MM-dd'T'HH:mm");
  };

  const calcularDates = (fechaIni, fechaFin) => {
    if (fechaFin < fechaIni) {
      setErrorHoras(true);
    } else {
      setErrorHoras(false);
    }
  };

  const handleChange = (key, v) => {
    if (key === "fechaFin") {
      calcularDates(formValues.fechaIni, v);
    }
    if (key === "fechaIni" && formValues.fechaFin) {
      calcularDates(v, formValues.fechaFin);
    }
    setFormValues((prev) => ({ ...prev, [key]: v }));
  };

  const resetValues = () => {
    setFormValues((prev) => ({
      ...prev,
      fechaIni: "",
      fechaFin: "",
    }));
  };

  const disabledButtonSave = () => {
    if (
      formValues.fechaIni === "" ||
      formValues.fechaFin === "" ||
      errorHoras
      // formValues.description === ""
    ) {
      return true;
    } else {
      return false;
    }
  };

  // const dateFilter = mockArray.filter(
  //   (i) => i.idInput == selectRowData.id && i.delete === false
  // );

  const handleDeleteRow = (data) => {
    setSelectDelete(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postData(nameUrl);
  };

  const onCloseDelete = () => {
    setSelectDelete(null);
  };

  const onCloseModalBase = () => {
    setSelectRowData(null);
  };

  return (
    <ModalPortal>
      <ModalBase
        openModal={selectRowData}
        onClose={onCloseModalBase}
        height="530px"
      >
        <></>
        <ContainModal>
          <HeaderModal>
            <HeadingTitle>{title}</HeadingTitle>
          </HeaderModal>
          <ContainerTitle>
            <Title>
              <LuHash fontSize={"14px"} /> {selectRowData.id} -{" "}
              {selectRowData.descrip}
            </Title>
          </ContainerTitle>
          <ContainForm>
            <Row>
              <Item>
                <Label>Date from </Label>
                <InputStyled
                  style={{ flex: "4" }}
                  id="start-input"
                  type="datetime-local"
                  value={formValues.fechaIni}
                  onFocus={() =>
                    handleChange(
                      "fechaIni",
                      initialDateTimeValue(formValues.fechaIni)
                    )
                  }
                  onChange={(e) => handleChange("fechaIni", e.target.value)}
                />
              </Item>
              <Item>
                <Label>Date to</Label>
                <InputStyled
                  style={{ flex: "4" }}
                  id="end-input"
                  type="datetime-local"
                  value={formValues.fechaFin}
                  onFocus={() =>
                    handleChange(
                      "fechaFin",
                      initialDateTimeValue(formValues.fechaFin)
                    )
                  }
                  onChange={(e) => handleChange("fechaFin", e.target.value)}
                  min={formValues.fechaIni}
                  disabled={!formValues.fechaIni}
                />
              </Item>
              <ButtonStyled
                onClick={handleSubmit}
                disabled={disabledButtonSave() || loadingData}
              >
                Save
              </ButtonStyled>
            </Row>
            <Row>
              {errorHoras && (
                <ErrorMessage>
                  The date to must be greater than{" "}
                  {DateTime.fromISO(formValues.fechaIni).toFormat(
                    "dd/MM/yyyy HH:mm"
                  )}
                </ErrorMessage>
              )}
            </Row>
            {/* <Row>
              <Item>
                <Label>Description</Label>
                <InputStyled
                  style={{ flex: "6" }}
                  id="description"
                  type="text"
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={!formValues.fechaFin}
                />
              </Item>
            </Row> */}
          </ContainForm>
          {loadingData ? (
            <div style={{ textAlign: "center" }}>
              <Loader />
            </div>
          ) : (
            <Table
              columns={columnsTable.map((column) => ({
                ...column,
                deleteHandler: handleDeleteRow,
              }))}
              data={dataTable}
              dataEmpty={"There are no modifications"}
              pageSizeTable={5}
              withoutSelection
            />
          )}
        </ContainModal>
      </ModalBase>
      {selectDelete && (
        <ModalDelete
          selectDelete={selectDelete}
          onCloseDelete={onCloseDelete}
          onClick={() => {
            deleteData(nameUrl);
          }}
          deleting={deleting}
        />
      )}
    </ModalPortal>
  );
};

export { ModalAdmin };

const ContainModal = styled.div`
  max-width: 1000px;
  padding: 0px 40px 30px 40px;
  display: flex;
  flex-direction: column;
`;

export const Item = styled.div`
  flex: 1;
  display: flex;
  font-size: 18px;
  gap: 10px;
  align-items: center;
  color: #565656;
`;

export const Label = styled.div`
  white-space: nowrap;
  text-align: left;
  flex: 1;
  font-size: 16px;
`;

export const ContainForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 16px;
  margin-bottom: 25px;
`;

export const ContainerTitle = styled.div`
  display: flex;
  justify-content: start;
  gap: 16px;
  width: 100%;
  margin: 10px 0 14px 0px;
`;
export const Title = styled.p`
  fontsize: 16px;
  padding: 4px;
  margin: 0;
`;

export const HeaderModal = styled.div`
  display: flex;
  justify-content: start;
  fontsize: 18px;
  margin: 10px 0px;
`;

export const HeadingTitle = styled.h2`
  margin: 0;
  padding-top: 10px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: ${({ margin }) => (margin ? margin : "unset")};
  ${({ position }) => position && `position: ${position};`}
  ${({ flexCenter }) => flexCenter && `justify-content: center;`}
`;

export const ErrorMessage = styled.div`
  color: red;
  font-size: 16px;
  left: 9%;
`;
