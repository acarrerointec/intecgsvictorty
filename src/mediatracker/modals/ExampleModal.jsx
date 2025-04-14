import React from "react";
import styled from "styled-components";

const ExampleModal = () => {
  return <ModalContent>Example</ModalContent>;
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: inherit;
  gap: 10px;
  max-height: 500px;
  overflow: auto;
`;

const ModalHeader = styled.h3`
  margin: 10px 0px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ModalRow = styled.div`
  font-weight: 500;
`;

export default ExampleModal;
