import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Containerinfo = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;

const RowInfo = styled.div`
  padding: 0 10px 0 0;
  color: grey;
  ${({ isBorderRight }) =>
    isBorderRight &&
    css`
      border-right: 1px solid #dcd6d6;
    `}
`;

const SpanInfo = styled.span`
  color: black;
  font-weight: bold;
`;

const SectionHeader = styled.div`
  display: flex;
  gap: 34px;
  align-items: center;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
  white-space:nowrap
`;

const ContainerTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 20px;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: inherit;
  gap: 10px;
  max-height: 500px;
  overflow: auto;
`;

const ContainerButtons =  styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
padding: 0px 20px;
gap:12px
`;

export { Container, Title, ContainerTitle, ModalContent, ContainerButtons,Containerinfo,RowInfo,SpanInfo,SectionHeader};
