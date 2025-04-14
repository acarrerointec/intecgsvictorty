import styled from "styled-components";

export const ContentLayout = styled.div`
  width: fit-content;
  position: relative;
`;

export const Header = styled.div`
  background-color: #e0e0e0;
  height: 50px;
  display: flex;
  padding: 0 20px;
  color: #565656;
  align-items: center;
  border-radius: 8px 8px 0 0;
  margin-bottom: 20px;
  font-size: 22px;
`;

export const Body = styled.div`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const RowItem = styled.div`
  flex: 1;
  display: flex;
  font-size: 18px;
  gap: 10px;
  align-items: center;
  color: #565656;
`;

export const Label = styled.div`
  white-space: nowrap;
`;

export const Footer = styled.div`
  background-color: #e0e0e0;
  height: 50px;
  border-radius: 0 0 8px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

export const LoadingMask = styled.div`
  background-color: #ffffff94;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

export const ErrorMessage = styled.div`
  color: red;
  font-size: 18px;
`;
