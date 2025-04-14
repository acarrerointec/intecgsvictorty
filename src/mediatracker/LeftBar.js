import React, { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Bookmark from "../commons/PageBookmark";
import { useHistory } from "react-router-dom";
import AccordionWrapper from "../commons/Accordion";
import {
  menuOptionsConfig,
  menuOptionsConfigAdmin,
  menuOptionsConfigScheduling
} from "../../utils/menuOptionsConfig";
import { useGlobalState } from "../contexts/GlobalConstext";

const LeftBar = ({ isOpen, setIsOpen }) => {
  const history = useHistory();
  const [{ permissions }] = useGlobalState();
  const redirectHandler = (path) => {
    history.replace(path);
  };
  

  return (
    <Container isOpen={isOpen}>
      <Bookmark
        left={false}
        top={30}
        isOpen={isOpen}
        handleClick={() => setIsOpen((prev) => !prev)}
      />
      <ContinaerAcordions>
        <AccordionContainer>
          <AccordionWrapper
            data={menuOptionsConfigScheduling(redirectHandler, permissions)}
          />
        </AccordionContainer>
        <AccordionContainer>
          <AccordionWrapper
            data={menuOptionsConfig(redirectHandler, permissions)}
          />
        </AccordionContainer>
        <AccordionContainer>
          <AccordionWrapper
            data={menuOptionsConfigAdmin(redirectHandler, permissions)}
          />
        </AccordionContainer>
      </ContinaerAcordions>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  position: absolute;
  background-color: rgb(68 68 68);
  width: 300px;
  left: ${({ isOpen }) => (isOpen ? 0 : -240)}px;
  animation-name: ${({ isOpen }) => (isOpen ? show : hide)};
  animation-duration: 0.7s;
  animation-fill-mode: fowards;
  height: 100%;
`;

const ContinaerAcordions = styled.div`
  width: 97%;
  display: flex;
  flex-direction: column;
  padding-right: 8px;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow-y: overlay;
  /* width */
  ::-webkit-scrollbar {
    width: 8px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 2px black; 
    border-radius: 10px;
    background: rgb(68 68 68); 
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    
    background: darkgrey; 
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: darkgrey; 
  }
`;

const AccordionContainer = styled.div`
  width: 100%;
`;

const hide = keyframes`
    from {
        left: 0px;
    }
  to {
    left: -245px;
  }
`;

const show = keyframes`
    from {
        left: -245px;
    }
  to {
    left: 0px;
  }
`;

export default LeftBar;
