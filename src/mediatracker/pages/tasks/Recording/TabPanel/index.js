import React, { useEffect,useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { ContainerTitle } from "../styles";
import { ButtonStyled } from "../../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import styled from "styled-components";
import { BsSendExclamation } from "react-icons/bs";
import { BsArrowReturnRight,BsArrowReturnLeft } from "react-icons/bs";
import { TbSettingsPause } from "react-icons/tb";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Typography>{children}</Typography>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledTabs = styled(Tabs)`
    & button{
      font-style:italic;
       &.Mui-disabled{
         background-color: #b0c4cd !important;
       }
      &.Mui-selected{
        font-style:normal
      }
    }
    & span{
      &.MuiTab-wrapper{
        font-size: 16px;
      }
      &.MuiTabs-indicator{
      background-color: #61A5C3;
      height:3px;
    }
  }
  }
`;

function SimpleTabs({
  data,
  setReloadData,
  setSelectedTabRecording,
  isInConfig,
  setIsInConfig,
  setReportPlayList = ()=>{},
  setIsOpenDrawer = () =>{}
}) {
  const [value, setValue] = useState(0);
  const isCurrentTabConfig = value == 1;
  const isCurrentTabRecording = value == 0;
  const [previousTab,setPreviousTab] = useState(null)

  useEffect(() => {
    if (isInConfig) {
      setPreviousTab(value)
      setValue(1);
    }
  }, [isInConfig]);

  useEffect(() => {
    if (value !== 0) {
      setSelectedTabRecording(false); 
    } else {
      setSelectedTabRecording(true);
      setIsInConfig(false);
    }
  }, [value]);

  const handleChange = (event, newValue) => {
    setPreviousTab(value)
    setValue(newValue);
  };

  const styleTitle = {
    backgroundColor: "#c4e8f8",
    borderRadius: "8px 8px 0px 0px",
    fontSize: "12px",
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
    textTransform: "none",
  };

  return (
    <>
      <ContainerTitle>
        <StyledTabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          {data.map((d) => (
            <Tab
              key={d.titleTabs}
              label={d.titleTabs}
              {...a11yProps(0)}
              style={styleTitle}
              disabled={d.disabledTitle}
            />
          ))}
        </StyledTabs>

        {isCurrentTabRecording ? (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ButtonStyled
              variant="primary"
              onClick={() => {
                setReportPlayList(true);
              }}
            >
              <ButtonContent>
                Generate Playlist{" "}
                <BsSendExclamation style={{ marginLeft: "5px" }} />
              </ButtonContent>
            </ButtonStyled>
            <ButtonStyled
              variant="primary"
              onClick={() => setReloadData((prev) => ++prev)}
            >
              <ButtonContent>
                Reload data <TfiReload style={{ marginLeft: "5px" }} />
              </ButtonContent>
            </ButtonStyled>
            <ButtonStyled variant="primary" onClick={() => setIsOpenDrawer(true)}>
            <TbSettingsPause style={{ marginLeft: "5px", fontSize: "20px" }} />
          </ButtonStyled>
          </div>
        ) : null}
        {isCurrentTabConfig ? (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ButtonStyled
              variant="primary"
              onClick={() => {
                setValue(previousTab)
              }}
            >
              <ButtonContent>
                {previousTab === 0
                  ? "Go back to Recording"
                  : previousTab === 2
                  ? "Go back to Schedule"
                  : null}
                {previousTab === 0 ? (
                  <BsArrowReturnLeft
                  style={{ marginLeft: "5px", fontSize: "20px" }}
                />
                ) : previousTab === 2 ? (
                  <BsArrowReturnRight
                    style={{ marginLeft: "5px", fontSize: "20px" }}
                  />
                ) : null}
              </ButtonContent>
            </ButtonStyled>
          </div>
        ) : null}
      </ContainerTitle>
      {data[value].contenidoTab}
    </>
  );
}

export default SimpleTabs;


const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;
