import styled, { css } from "styled-components";
import ModalBase from "../../../commons/Modal";
import { ButtonStyled } from "../../../commons/Button";
import { DateTime } from "luxon";
import ModalPortal from "../../../commons/ModalWrapper";

const ModalDelete = ({
  selectDelete,
  onCloseDelete = () => {},
  onClick=()=>{},
  isDisabled,
  deleting
}) => {

  const onClickDelete = (e) => {
    e.preventDefault();
    onClick()
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCloseDelete();
  };

  return (
    <ModalPortal>
      <ModalBase openModal={selectDelete} onClose={onCloseDelete}>
        <ContainModal>
          <TitleDelete>Attention</TitleDelete>
          <ContainerText>
            <Text>Are you sure you want to delete <strong>ID {selectDelete.id}</strong></Text>
            <Text textDecoration="true">
              {DateTime.fromISO(selectDelete.fechaInicio).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
              {" - "}
              {DateTime.fromISO(selectDelete.fechaFin).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
              ?
            </Text>
          </ContainerText>
          <ContainerButtons>
            <ButtonStyled onClick={onClickCancel} disabled={deleting}>Cancel</ButtonStyled>
            <ButtonStyled variant={"secondary"} onClick={onClickDelete} disabled={isDisabled || deleting}>
              Delete
            </ButtonStyled>
          </ContainerButtons>
        </ContainModal>
      </ModalBase>
    </ModalPortal>
  );
};
export { ModalDelete };

const ContainModal = styled.form`
  max-width: 1000px;
  padding: 0px 40px 30px 40px;
  display: flex;
  flex-direction: column;
`;

const ContainerButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 10px;
`;
const ContainerText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Text = styled.p`
  margin: 5px;
  ${({ textDecoration }) =>
    textDecoration &&
    css`
      font-weight: 500;
    `}
`;
const TitleDelete = styled.h2`
  text-decoration: underline;
`;
