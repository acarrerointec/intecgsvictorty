import { useEffect, useState } from "react";
import { Select } from "../../../../../commons/Select";
import { TableTimeLine } from "./TableTimeLine";
import { InputStyled } from "../../../../../commons/Input";
import { DateTime } from "luxon";
import styled from "styled-components";
import { ButtonStyled } from "../../../../../commons/Button";
import CheckboxStyled from "../../../../../commons/CheckboxStyled";
import ModalBase from "../../../../../commons/Modal";
import ModalPortal from "../../../../../commons/ModalWrapper";
import { TableShows } from "./TableShow";
import { CircularProgress } from "@material-ui/core";
import { Alerts } from "../../../../../commons/Alerts";

const TimeLine = ({
  setSelectShowSchedule = () => {},
  dataTimeLine,
  dataShow,
  getDataShows=()=>{},
  getTimeLine=()=>{},
  loadingData,
  tableData,
  setTableData=()=>{},
  setAlertTimeLine=()=>{},
  alertTimeLine,
  dataSelectInput,
  setDataSelectInput=()=>{},
  formValuesTimeLine,
  setFormValuesTimeLine=()=>{}
}) => {
  const [disabledApplyBtn, setDisabledApplyBtn] = useState(true);
  const [isCheck, setIsCheck] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState([]);
  const [nameClickEjeY, setNameClickEjeY] = useState(null);
  const [idInputSelect, setIdInputSelect] = useState(null);

  useEffect(() => {
    if (dataSelectInput === "vinculo") {
      setIdInputSelect("id_vinculo");
    }
    if (dataSelectInput === "operator") {
      setIdInputSelect("id_operador");
    }
    if (dataSelectInput === "equipment") {
      setIdInputSelect("id_equi_graba");
    }
    if (dataSelectInput === "allShows") {
      setIdInputSelect("allShows");
    }
    if (dataSelectInput === "allAssignedShows") {
      setIdInputSelect("allAssignedShows");
    }
  }, [dataSelectInput]);
  
  useEffect(() => {
    if (idInputSelect === "allShows") {
      setTableData(dataTimeLine);
    } else if (idInputSelect === "allAssignedShows") {
      setTableData(dataTimeLine?.filter((d) => d.status !== "No action"));
    } else {
      setTableData(dataTimeLine?.filter((d) => d[idInputSelect] != null));
    }
  }, [dataTimeLine, idInputSelect]);

  useEffect(() => {
    if (dataSelectInput?.length > 0 && formValuesTimeLine.date.length > 0) {
      setDisabledApplyBtn(false);
    }
  }, [formValuesTimeLine, dataSelectInput]);

  useEffect(() => {
    if (nameClickEjeY) setDataModal(dataArrayPersonalizado(nameClickEjeY));
  }, [nameClickEjeY]);

  const handleChange = (key, v) => {
    setFormValuesTimeLine((prev) => ({ ...prev, [key]: v }));
  };

  const dataArrayPersonalizado = (nameClickEjeY) => {
    const dataAMostrar = tableData?.filter(
      (d) => d[idInputSelect] === nameClickEjeY.id
    );
    return dataAMostrar;
  };

  const initialDateTimeValue = (date) => {
    const today = DateTime.local();
    return date || today.toFormat("yyyy-MM-dd");
  };

  const nameTitle = () => {
    if (dataSelectInput === "vinculo") {
      return `${dataModal[0].vinculo}`;
    }
    if (dataSelectInput === "operator") {
      return `${dataModal[0].operador}`;
    }
    if (dataSelectInput === "equipment") {
      return `${dataModal[0].equi_graba}`;
    }
    if (dataSelectInput === "allShows") {
      return `${dataModal[0].code}`;
    }
    if (dataSelectInput === "allAssignedShows") {
      return `${dataModal[0].code}`;
    }
  };
  return (
    <>
      <Row margin={"10px 0px"}>
        <Item padding={"0 30px 0 0"}>
          <Select
            options={[
              { value: "vinculo", label: "Inputs" },
              { value: "equipment", label: "Equipment" },
              { value: "operator", label: "Operator" },
              { value: "allShows", label: "All shows" },
              { value: "allAssignedShows", label: "All assigned shows" },
            ]}
            defaultValue={dataSelectInput}
            onChange={(e) => {
              setDataSelectInput(e.target.value);
            }}
          />
        </Item>
        <Item>
          <Label>Date</Label>
          <InputStyled
            style={{ flex: "4" }}
            id="start-input"
            type="date"
            value={formValuesTimeLine.date}
            onFocus={() =>
              handleChange(
                "date",
                initialDateTimeValue(formValuesTimeLine.date)
              )
            }
            onChange={(e) => {
              handleChange("date", e.target.value);
            }}
          />
        </Item>
        <ButtonStyled
          disabled={disabledApplyBtn || loadingData}
          variant="primary"
          onClick={() => {
            getDataShows(formValuesTimeLine);
            getTimeLine(true, formValuesTimeLine);
            setAlertTimeLine(false);
          }}
        >
          {loadingData ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Apply"
          )}
        </ButtonStyled>
      </Row>
      {tableData?.length > 0 &&
        !alertTimeLine &&
        dataSelectInput !== "allShows" &&
        dataSelectInput !== "allAssignedShows" && (
          <Row>
            <CheckboxStyled
              label="Overlapping"
              onChange={() => setIsCheck(!isCheck)}
              isChecked={isCheck}
            ></CheckboxStyled>
          </Row>
        )}
        <TableTimeLine
          isCheckSuperposition={isCheck}
          setOpenModal={setOpenModal}
          dataSelect={dataSelectInput}
          dataArray={tableData}
          setNameClickEjeY={setNameClickEjeY}
          idInputSelect={idInputSelect}
          setAlert={setAlertTimeLine}
          setSelectShowSchedule={setSelectShowSchedule}
          dataShow={dataShow}
        />
      {alertTimeLine && (
        <Alerts variant="warning">
          No results found, perform a new search
        </Alerts>
      )}
      {openModal && (
        <ModalPortal>
          <ModalBase
            openModal={openModal}
            onClose={() => setOpenModal(false)}
            height={"80vh"}
            width={"80%"}
            minHeight={"30%"}
          >
            <div style={{ width: "100%", height: "100%",overflow:"auto" ,paddingTop:"46px"}}>
              <div style={{ paddingLeft: "20px" }}>{nameTitle()}</div>
                <TableShows
                  dataArray={dataModal}
                  dateSelect={formValuesTimeLine.date}
                />
            </div>
          </ModalBase>
        </ModalPortal>
      )}
    </>
  );
};

export { TimeLine };

const Item = styled.div`
  ${({ flex }) => flex && `flex: ${flex};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  display: flex;
  font-size: 18px;
  gap: 10px;
  align-items: center;
  color: #565656;
`;
const Label = styled.div`
  white-space: nowrap;
  text-align: left;
  flex: 1;
  font-size: 16px;
`;

const Row = styled.div`
  display: flex;
  padding: 10px;
  align-items: center;
  gap: 12px;
  margin: ${({ margin }) => (margin ? margin : "unset")};
  ${({ position }) => position && `position: ${position};`}
  ${({ flexCenter }) => flexCenter && `justify-content: center;`}
`;
