import styled from "styled-components";

export const ContentLayout = styled.div`
  width: 100%;
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
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: ${({ justifyContent }) =>
    justifyContent ? justifyContent : null};
  gap: 12px;
  text-wrap: nowrap;
  .rmsc .dropdown-container:focus-within {
    border: 2px solid #61a5c3 !important;
    box-shadow: none !important;
  }
  .select-multiple {
    max-width: ${({ maxWidth }) => maxWidth ? maxWidth : "500px"};
    font-size: 16px;
    border-radius: 6px !important;
    width: 100%;
    cursor: pointer !important;
    .dropdown-container {
      height: 32px;
      border: 1px solid lightgrey;
      border-radius: 6px;
    }

    .dropdown-heading {
      height: 26px;
      padding: 0 0 0 16px;
    }
    .dropdown-heading-value {
      text-align: start;
    }
    .gray {
      color: black !important;
    }
    .dropdown-content {
      .selected {
        border: none !important;
      }
    }
  }
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
  left: 9%;
  background-color: #f9d0d0;
  border: 2px solid #ea8080;
  padding: 5px 10px;
  border-radius: 6px;
`;

export const ContainerInput = styled.div`
  display: flex;
  flex: 3;
`;

export const ContainerInputVersions = styled.div`
  display: flex;
  flex: 3;
  max-width: ${({ maxWidth }) => maxWidth ? maxWidth : "380px"};
`;
