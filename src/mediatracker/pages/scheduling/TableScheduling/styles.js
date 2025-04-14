import styled, { css } from "styled-components";

export const EmptyComponent = styled.div`
  width: 100%;
  display: flex;
  font-size: 20px;
  color: grey;
  font-weight: 500;
  justify-content: center;
  font-weight: 500;
  padding: 30px;
`;

export const TableContainer = styled.div`
  display: block;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  box-sizing: border-box;
`;

export const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  margin: 0px;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
`;

export const StyledTableRow = styled.tr`
  border-bottom: 1px solid white;
  background-color: ${(props) =>
    props.isHeader ? "none" : props.isEven ? "#eaeaea" : "white"};
  ${(props) =>
    props.isSelected &&
    css`
      background-color: #61a5c3;
      color: white;
    `};
  :hover {
    background-color: ${(props) =>
      props.isHeader || props.isSelected ? "none" : "#d2d0d0"};
  }
  ${({ hasClickHandler }) =>
    hasClickHandler &&
    css`
      cursor: pointer;
    `}
`;

export const StyledTableCell = styled.td`
  padding: 6px;
  text-align: left;
  // border-bottom: 2px solid #b9b9b9;
  margin-bottom: 5px;
  ${({ isActionColumn }) =>
    isActionColumn &&
    css`
      text-align: center;
      font-size: 20px;
    `}
  ${({ color }) =>
    color &&
    css`
      background-color: ${color};
      color: black;
      font-weight: 500;
      text-transform: uppercase;
    `}
`;

export const StyledTableHeaderCell = styled.th`
  padding: 6px;
  border: ${({ isBorder }) => (isBorder ? "1px solid #3a687c" : 0)};
  text-align: left;
  font-size: 16px;
  color: #61a5c3;
  ${({ isActionColumn }) =>
    isActionColumn &&
    css`
      width: 2rem;
      padding: 12px;
    `}
`;

export const Thead = styled.thead`
  border-bottom: 2px solid #61a5c3;
  margin-bottom: 5px;
  border-collapse: collapse;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  height: 40px;
`;

export const TableConteiner = styled.div`
  display: flex;
  overflow: ${({ notOverflow }) => (notOverflow ? "hidden" : "auto")};;
  flex-direction: column;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  max-height: 642px;
`;

export const Boxstyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  gap: 20px;
  margin-top: 15px;
  z-index: 1;
  position: sticky;
  bottom: 0;
  background-color: white;
  padding-top:10px
`;

export const Menu = styled.div`
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  top: ${({ x }) => x}px;
  left: ${({ x }) => x}px;
  border-radius: 4px;
`;

export const MenuItem = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;