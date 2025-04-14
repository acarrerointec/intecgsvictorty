import styled from "styled-components";
import ModalBase from "../../../../commons/Modal";
import ModalPortal from "../../../../commons/ModalWrapper";
import { ErrorMessage, HeaderModal, HeadingTitle, Item, Label, Row } from "../ModalAdmin";
import { InputStyled } from "../../../../commons/Input";
import { ButtonStyled } from "../../../../commons/Button";
import { useEffect, useState } from "react";
// import CheckboxStyled from "../../../../commons/CheckboxStyled";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../../../../commons/snackbarConfig";
 
const CreateOperator = ({ newOperator, setNewOperator,editOperator,setEditOperator,dataOperator, setReloadData=()=>{}}) => {
  const defaultValues = { descrip: "", habi:1 };
  const [formValues, setFormValues] = useState(defaultValues);
  const [loadingData, setLoadingData] = useState(false);
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);
  const [isError,setIsError]= useState(false)

   const nameOperators= dataOperator.map((operator)=> operator.descrip)

  useEffect(() => {
    if (editOperator) {
      setFormValues((prev) => ({
        ...prev,
        descrip: editOperator.descrip,
        // habi: !editOperator.disabled,
      }));
    }
  }, [editOperator]);

  const onCloseModalBase = () => {
    setNewOperator(false);
    setEditOperator(null)
  };

  const disabledButtonSave = () => {
    if (newOperator && !formValues.descrip.length > 0) return true;
    if (
      formValues.descrip === editOperator?.descrip
    )
      return true;
    return false;
  };

  const postData = async () => {
    setLoadingData(true);
    try {
      setLoadingData(true);
      const url = `operadores-alta-body`;
      const api = await axiosApi();
      // const objTemp = {...formValues,habi:formValues.habi ? 1 : 0}
      const { data } = await api.post(url, formValues);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Operator created successfully.",10000)
      setReloadData((prev) => ++prev)
      onCloseModalBase()
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

  const editData = async () => {
    try {
      setLoadingData(true);
      const url = `operadores-modi-body`;
      const api = await axiosApi();
      const obj={...formValues,id_ope:editOperator.id}
      const { data } = await api.put(url,obj);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Operator modified successfully.",10000)
      setReloadData((prev) => ++prev)
      onCloseModalBase()
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information.
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const validateName = (descrip) => {
    const valueName = nameOperators.filter(
      (name) => name.trim().toUpperCase() !== ""
    );
    const valueDescrip = valueName.some(
      (name) => name.trim().toUpperCase() === descrip.trim().toUpperCase()
    );
    if (valueDescrip) return setIsError(true);
    setIsError(false);
  };

  return (
    <ModalPortal>
      <ModalBase
        openModal={newOperator || editOperator}
        onClose={onCloseModalBase}
        height="250px"
        width="550px"
      >
        <ContainModal>
          <HeaderModal>
            <HeadingTitle>{`${newOperator ? "Create" : "Edit"} operator`}</HeadingTitle>
          </HeaderModal>
          <ContainForm>
            <Row>
              <Item>
                <Label>Description</Label>
                <InputStyled 
                variant ={isError && "secondary"}
                maxLength={60}
                value={formValues.descrip}
                style={{ flex: "4"}} 
                onChange={(e) =>{
                  e.persist();
                  validateName(e.target.value)
                  setFormValues((pre) => ({
                    ...pre,
                    descrip: e.target.value,
                  }))
                }}
                />
              </Item>
            </Row>
            {isError && <ErrorMessage>There is already an operator with that description</ErrorMessage>}
            {/* <Row>
            <Item>
            <Label style={{flex:0 ,paddingRight:"7px"}}>Enabled</Label>
            <CheckboxStyled
                 onChange={() => setFormValues((pre) => ({
                  ...pre,
                  habi: !pre.habi,
                }))}
                 isChecked={formValues.habi}
                 paddingLeft={true}
                 />
            </Item>
            </Row> */}
          </ContainForm>
          <ContainerButtons>
            <ButtonStyled
              variant="secondary"
              onClick={onCloseModalBase}
            >
              Cancel
            </ButtonStyled>
            <ButtonStyled
              variant="primary"
              onClick={editOperator ? editData : postData }
              disabled={disabledButtonSave() || loadingData || isError}
            >
            {editOperator ? "Edit" : "Save"} 
            </ButtonStyled>
          </ContainerButtons>
        </ContainModal>
      </ModalBase>
    </ModalPortal>
  );
};

export { CreateOperator };

const ContainModal = styled.div`
  max-width: 1000px;
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
  margin-top: 40px;
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
