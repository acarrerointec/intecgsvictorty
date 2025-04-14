import styled, { css } from "styled-components";

export const ContextMenuWrapper =styled.div`
position: absolute;
z-index: 999;
transition: 0.5s;
transform: scale(1);
overflow: visible;
min-width: 20rem;
left:${({left})=>left};
top:${({top})=>top}
`
export const ContextMenuItem = styled.div`
  position: relative;
  flex: 0 0 3rem;
  width: 100%;
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 0.1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  white-space: nowrap;
  :hover {
    background-color: #7cb7d1;
    transition: 0.2s;
    color:white;
    background-color: rgba(#fff, 0.1);
  }
`;


export const ContextMenuBody = styled.div`
  background-color: white;
  color: black;
  border-radius: 5px;
  font-size: 1.6rem;
  transition: 0.5s;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  padding-top: ${({ notPaddingTop }) => (notPaddingTop ? 0 : "0.3rem")};
  padding-bottom: 0.3rem;
  box-shadow: 3px 2px 10px 0px rgba(0, 0, 0, 0.39);
`;

export const ContextMenuProgra = styled.div`
  padding:2px;
  font-size: 1.2rem;
  font-weight: bold;
  flex: 1 0 auto;
  justify-content: center;
  width: 100%;
  background: #cfcfcfbd;
  color: #000;
  margin: 0;
`;
export const ContextMenuItemDescrip =styled.div`
transition: 0.2s;
text-indent: 0.5rem;
flex: 0 0 90%;
text-align: left;
border-radius: 1rem 0 0 1rem;
${({ isDisabled }) =>
isDisabled &&
css`
color: gray;
cursor: no-drop;
`}
`

export const ContextMenuSubmenuContainer=styled.div`
position: absolute;
background-color: white;
color: black;
border-radius: 0 0.5rem 0.5rem 0.5rem;
box-shadow: 3px 2px 10px 0px rgba(0, 0, 0, 0.39);
font-size: 1.6rem;
transition: 0.5s;
display: flex;
flex-flow: column nowrap;
align-items: flex-start;
padding-top: 0.0rem;
padding-bottom: 0.3rem;
padding-right: 0rem;
height: fit-content;
overflow: hidden;

top: 0;
${({ isLeft }) =>
isLeft &&
css`
left:100%;
`};
${({ isRight }) =>
isRight &&
css`
right: 100%;
border-radius:0.5rem 0rem 0.5rem 0.5rem;
`}
`

export const ContextMenuSubmenuOption=styled.div`
flex: 0 0 3rem;
padding-right: 1rem;
width: 100%;
cursor: pointer;
display: flex;
// justify-content: center;
align-items: center;
white-space: nowrap;
:hover {
  background-color: #7cb7d1;
  color:white;
  transition: 0.2s;
  background-color: rgba(#fff, 0.1);
}
`

export const ContextMenuSubmenuDescrip = styled.div`
  transition: 0.2s;
  text-indent: 0.5rem;
  text-align: left;
  border-radius: 1rem 0 0 1rem;
  height: 3rem;
  display: flex;
  padding: 5px;
  align-items: center;
  width: fit-content;
  ${({ isDisabled }) =>
    isDisabled &&
    css`
      color: gray;
      cursor: no-drop;
    `}
`;