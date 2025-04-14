import { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import styled from "styled-components";
import { GiExpand ,GiContract} from "react-icons/gi";

const ModalBase = ({
  onClose,
  children,
  title,
  show,
  withoutOutsideClose,
  width,
  height,
  minHeight,
  minWidth,
  maxHeight,
  maxWidth, 
  subHeader = false,
  resizeModalButton=false
}) => {
  const [resizeButton,setResizeButton]=useState(false)

  useEffect(() => {
    document.querySelector("body").style.overflow = "hidden";
    return () => {
      document.querySelector("body").style.overflow = "unset";
    };
  }, []);

  const outsideRef = useRef(null);
  const handleOutsideClick = (e) => {
    if (
      !outsideRef.current.contains(e.target) &&
      onClose &&
      !withoutOutsideClose
    )
      onClose();
  };

  return (
    <SubWrapper
      width={resizeButton ? "98vw" : width}
      height={resizeButton ? "98vh" : height}
      minHeight={ minHeight}
      maxHeight={resizeButton ? "98vh" :maxHeight}
      minWidth={ minWidth}
      maxWidth={resizeButton ? "98vw" : maxWidth}
      ref={outsideRef}
      onClick={handleOutsideClick}
    >
      <Header>
        <ContainerTitle>
          <Title>{title.toUpperCase()}</Title>
        </ContainerTitle>
        <ContainerButtons>
          {resizeModalButton && (
            <ResizeButton onClick={() => setResizeButton((prev) => !prev)}>
              {resizeButton ? <GiContract /> : <GiExpand />}
            </ResizeButton>
          )}
          <CloseButton onClick={onClose}>
            <CgClose fontSize={"26px"} />
          </CloseButton>
        </ContainerButtons>
      </Header>
      {subHeader && <SubHeader>{subHeader}</SubHeader>}
      <Content>{children}</Content>
    </SubWrapper>
  );
};

export default ModalBase;

const SubHeader = styled.div`
  background: white;
  padding: 12px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 500; /* Asegura que esté sobre el contenido desplazable */
`;

const SubWrapper = styled.div`
  // display: ${({ openModal }) => (openModal ? "flex" : "none")};
  display: flex;
  z-index: 500;
  position: fixed;
  background: white;
  border-radius: 8px;
  flex-direction: column;
  overflow: hidden;
  width: ${({ width }) => `${width}`};
  height: ${({ height }) => `${height}`};
  min-height: ${({ minHeight }) => `${minHeight}`};
  min-width: ${({ minWidth }) => `${minWidth}`};
  max-width: ${({ maxWidth }) => `${maxWidth ? maxWidth : "100vw"}`};
  max-height: ${({ maxHeight }) => `${maxHeight}`};
  transition: all 0.4s ease;
}
`;

const Header = styled.div`
  background-color: #f5f5f5;
  padding: 16px 16px 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const CloseButton = styled.button`
  display: flex;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 25px;
  cursor: pointer;
  z-index: 201;
  cursor: pointer;
  padding: 5px;
  :hover {
    background-color: #d7d7d7;
    border-radius: 50%;
  }
`;

const ResizeButton = styled.button`
  display: flex;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 25px;
  cursor: pointer;
  padding: 5px;
  :hover {
    background-color: #d7d7d7;
    border-radius: 50%;
  }
`;

const ContainerButtons=styled.div`
display:flex;
width:100%;
justify-content:end;
gap:4px;
padding:10px 6px 0 0
`

const Content = styled.div`
  padding: 0 16px 16px 16px;
  overflow-y: auto;
  flex-grow: 1;
`;

const ContainerTitle = styled.div`
  display: flex;
  justify-content: start;
  gap: 16px;
  width: 100%;
  margin: 10px 0 14px 0px;
`;
const Title = styled.p`
  font-size: 25px;
  padding: 4px;
  margin: 0;
`;
