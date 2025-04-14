import React, { useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { ContainerTitle } from "../styles";
import styled from "styled-components";

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
}) {
  const [value, setValue] = useState(0);
  const [previousTab,setPreviousTab] = useState(null)

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
      <ContainerTitle style={{padding:0}}>
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
