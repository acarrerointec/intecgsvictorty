import styled, { css } from "styled-components";

export const ViewRutina = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px 20px;
`;
export const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const FlexGroup = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
`;

export const FlexItem = styled.div`
  display: flex;
  width: 120px;
  justify-content: start;
`;

export const ContainerInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyContent }) => (justifyContent ? justifyContent : "space-between")};
  padding: 10px 0;
  gap: 12px;
  width: 100%;
  color:${({color})=>(color)}
`;

export const ContainerRows = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;


export const RowInfo = styled.div`
  padding: 0 10px 0 0;
  color: grey;
  ${({ isBorderRight }) =>
    isBorderRight &&
    css`
      border-right: 1px solid #dcd6d6;
    `}
`;

export const SpanInfo = styled.span`
  color: black;
  font-weight: bold;
`;

export const CointeinerTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
`;

export const ContainerRowTable = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 20px;
  border-bottom: 2px solid black;
  padding: 0px 15px;
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 2px solid #c8c8c8;
      border-radius: 5px;
    `}
`;

export const ContainerButtons = styled.div`
  display: flex;
  gap: 10px;
`;

export const ConteinerText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 24px;
  align-items: center;
  margin-top: 50px;
  border: 2px solid black;
  padding: 10px;
  border-radius: 10px;
`;
