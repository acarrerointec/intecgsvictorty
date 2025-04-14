import styled from "styled-components";
import ModalBase from "../../../../commons/Modal";
import ModalPortal from "../../../../commons/ModalWrapper";
import {
  ErrorMessage,
  HeaderModal,
  HeadingTitle,
} from "../ModalAdmin";
import { InputStyled } from "../../../../commons/Input";
import { ButtonStyled } from "../../../../commons/Button";
import { useEffect, useState } from "react";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../commons/snackbarConfig";
import CheckboxStyled from "../../../../commons/CheckboxStyled";
import Loader from "../../../../Loader/Loader";
import uuid from "react-uuid";
// import { useGlobalState, actionTypes } from '../contexts/GlobalConstext';
import { useGlobalState, actionTypes } from '../../../../contexts/GlobalConstext';
import { getTipoNameUnified, getTipoNameUnifiedCheck, revertTipoNameUnified } from "./dataHelper";
const CreateGroup = ({
  newGroup,
  setNewGroup,
  editGroup,
  setEditGroup,
  dataGroups,
  setReloadData = () => {},
  dataType,
}) => {
  const [state, dispatch] = useGlobalState();
  const defaultValues = { descrip: "", tipos: [] };
  const [formValues, setFormValues] = useState(defaultValues);
  const [loadingData, setLoadingData] = useState(false);
  const [openSnackSuccess] = useSnackbar(success);
  const [openSnackError] = useSnackbar(error);
  const [isError, setIsError] = useState(false);
  const [data,setData] = useState({})

  const nameGroup = dataGroups?.map((group) => group.descrip);
  const feedsEditGroup = editGroup?.deta?.map((tipo) => getTipoNameUnified(tipo));

  useEffect(() => {
    if (dataType) {
      const groupedData = dataType.reduce((acc, item) => {
        const { tipo } = item;
        if (!acc[tipo]) {
          acc[tipo] = [];
        }
        acc[tipo].push(item);
        return acc;
      }, {});

      setData(groupedData);
    }
  }, [dataType]);

  useEffect(() => {
    if (editGroup) {
      setFormValues((prev) => ({
        ...prev,
        descrip: editGroup.descrip,
        tipos: feedsEditGroup,
      }));
    }
  }, [editGroup]);

  const onCloseModalBase = () => {
    setNewGroup(false);
    setEditGroup(null);
  };

  const postData = async () => {
    setLoadingData(true);
    try {
      setLoadingData(true);
      const url = `ingest/grupos_types`;
      const api = await axiosApi();
      const obj = { ...formValues, deta: formValues.tipos.map(t => revertTipoNameUnified(t)), usua: state.globalUser.usuarioRed };
      // delete obj.tipos;
      const { data } = await api.post(url, obj);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Group created successfully.", 10000);
      setReloadData((prev) => ++prev);
      onCloseModalBase();
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error occurred while sending the information
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
    }
  };

  const editData = async () => {
    try {
      setLoadingData(true);
      const url = `ingest/grupos_types`;
      const api = await axiosApi();
      const obj = { ...formValues, deta: formValues.tipos.map(t => revertTipoNameUnified(t)), usua: "", grupoId: editGroup?.grupoId };
      // delete obj.tipos;
      const { data } = await api.put(url, obj);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Group modified successfully.", 10000);
      setReloadData((prev) => ++prev);
      onCloseModalBase();
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error occurred while sending the information
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
    }
  };

  const validateName = (descrip) => {
    const valueName = nameGroup.filter(
      (name) =>
        name.trim().toUpperCase() !==
        (newGroup ? "" : editGroup?.descrip?.trim().toUpperCase())
    );
    const valueDescrip = valueName.some(
      (name) => name.trim().toUpperCase() === descrip?.trim().toUpperCase()
    );
    if (valueDescrip) return setIsError(true);
    setIsError(false);
  };

  const disabledButtonSave = () => {
    function validateFeeds(arr1, arr2) {
      return (
        arr1.length === arr2.length &&
        arr1.every((value, index) => value === arr2[index])
      );
    }
    if (isError || loadingData) return true;
    if (
      (newGroup && !formValues?.descrip?.length > 0) ||
      !formValues.tipos.length > 0
    )
      return true;
    if (
      formValues?.descrip === editGroup?.descrip &&
      validateFeeds(feedsEditGroup, formValues.tipos)
    )
      return true;
    return false;
  };

  const handleCheckboxChange = (value) => {
    const currentValues = formValues.tipos;
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setFormValues({
      ...formValues,
      tipos: newValues,
    });
  };

  return (
    <ModalPortal>
      <ModalBase
        openModal={newGroup || editGroup}
        onClose={onCloseModalBase}
        height="fit-content"
        width="1500px"
        maxHeight={"100vh"}
        maxWidth={"100vw"}
      >
        <ContainModal>
          <HeaderModal>
            <HeadingTitle>{`${
              newGroup ? "Create" : "Edit"
            } group`}</HeadingTitle>
          </HeaderModal>
          <ContainForm>
            <Row>
              <Item>
                <Label>Description</Label>
                <InputStyled
                  variant={isError && "secondary"}
                  maxLength={60}
                  value={formValues.descrip}
                  style={{ flex: "6" }}
                  onChange={(e) => {
                    e.persist();
                    validateName(e.target.value);
                    setFormValues((pre) => ({
                      ...pre,
                      descrip: e.target.value,
                    }));
                  }}
                />
              </Item>
            </Row>
            {isError && (
              <ErrorMessage>
                There is already an group with that description
              </ErrorMessage>
            )}
            <Row>
              <Item>
                <Label style={{ flex: 0.5 }}>Network</Label>
              </Item>
            </Row>
            <Row alignItems="start" margin={"0 0 16px 0"}>
              <Label style={{ flex: 0.5 }} fontWeight="unset">
                Commercial
              </Label>
              <ContainerInputCheck>
                {data?.CO?.map((item) => {
                  return (
                    <ContainerCheckBox key={uuid()}>
                      <CheckboxStyled
                        label={item.descripcion}
                        checkLeft
                        type="checkbox"
                        isChecked={formValues.tipos?.includes(
                          getTipoNameUnifiedCheck(item)
                        )}
                        onChange={() =>
                          handleCheckboxChange(getTipoNameUnifiedCheck(item))
                        }
                      />
                    </ContainerCheckBox>
                  );
                })}
              </ContainerInputCheck>
            </Row>
            <Row alignItems="start" margin={"0 0 16px 0"}>
              <Label style={{ flex: 0.5 }} fontWeight="unset">
                Promotion
              </Label>
              <ContainerInputCheck>
                {data?.PR?.map((item) => {
                  return (
                    <ContainerCheckBox key={uuid()}>
                      <CheckboxStyled
                        label={item.descripcion}
                        checkLeft
                        type="checkbox"
                        isChecked={formValues.tipos?.includes(
                          getTipoNameUnifiedCheck(item)
                        )}
                        onChange={() =>
                          handleCheckboxChange(getTipoNameUnifiedCheck(item))
                        }
                      />
                    </ContainerCheckBox>
                  );
                })}
              </ContainerInputCheck>
            </Row>
            <Row alignItems="start" margin={"0 0 16px 0"}>
              <Label style={{ flex: 0.5 }} fontWeight="unset">
                Program
              </Label>
              <ContainerInputCheck>
                {data?.PRO?.map((item) => {
                  return (
                    <ContainerCheckBox key={uuid()}>
                      <CheckboxStyled
                        label={item.descripcion}
                        checkLeft
                        type="checkbox"
                        isChecked={formValues.tipos?.includes(
                          getTipoNameUnifiedCheck(item)
                        )}
                        onChange={() =>
                          handleCheckboxChange(getTipoNameUnifiedCheck(item))
                        }
                      />
                    </ContainerCheckBox>
                  );
                })}
              </ContainerInputCheck>
            </Row>
          </ContainForm>
          <ContainerButtons>
            <ButtonStyled variant="secondary" onClick={onCloseModalBase}>
              CANCEL
            </ButtonStyled>
            <ButtonStyled
              variant="primary"
              onClick={editGroup ? editData : postData}
              disabled={disabledButtonSave()}
            >
              <TextButton>
                {loadingData ? <Loader /> : editGroup ? "EDIT" : "SAVE"}
              </TextButton>
            </ButtonStyled>
          </ContainerButtons>
        </ContainModal>
      </ModalBase>
    </ModalPortal>
  );
};

export { CreateGroup };

const ContainModal = styled.div`
  max-width: 1500px;
  height: 100%;
  padding: 0px 40px 30px 40px;
  display: flex;
  flex-direction: column;
`;

const ContainForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 16px;
  margin: 46px auto;
`;

const ContainerButtons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
  margin-top: 40px;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 20px;
`;

const ContainerCheckBox = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 350px;
`;

const ContainerInputCheck=styled.div`
display: flex;
flex-wrap: wrap;
gap: 12px;
flex: 6;
`
const TextButton = styled.div`
  width: 80px;
  display:flex;
  justify-content:center;
  align-items:center
`;

export const Item = styled.div`
  display: flex;
  font-size: 18px;
  gap: 10px;
  align-items: start;
  color: #565656;
  width: 100%;
  flex: 1;
`;

export const Label = styled.div`
  white-space: nowrap;
  text-align: left;
  font-size: 16px;
  font-weight:  ${({ fontWeight }) => (fontWeight ? fontWeight : "bold")};
  flex:0.5;
  color: black
`;

export const Row = styled.div`
  display: flex;
  align-items:  ${({ alignItems }) => (alignItems ? alignItems : "center")};
  gap: 12px;
  margin: ${({ margin }) => (margin ? margin : "unset")};
  ${({ position }) => position && `position: ${position};`}
  ${({ flexCenter }) => flexCenter && `justify-content: center;`}
`;