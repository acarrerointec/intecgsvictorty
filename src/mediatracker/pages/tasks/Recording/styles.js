import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
`;

const ContainerTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  // padding: 0px 20px;
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

export { Container, Title, ContainerTitle, ModalContent };
