import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ButtonStyled } from "../../../../../commons/Button";
import DatePickerComponent from "../../../../../commons/DatePicker";
import { formatDateCommon } from "../../../../../../utils/dates";
import { DateTime } from "luxon";
import { defaultValuesSearch } from "../config";
import useInterval from "../../../../../hooks/useInterval";
import CheckboxStyled from "../../../../../commons/CheckboxStyled";

const TaskRecordingSearch = ({
  getData = () => {},
  reloadData,
  resetTable = () => {},
  reloadDataWithoutReload,
}) => {
  const [formValues, setFormValues] = useState(defaultValuesSearch);
  const [showFilters] = useState(true);
  // const [searchChange, setSearchChange] = useState(false);
  const [searchAllShows, setSearchAllShows] = useState(false);
  const [errorHoras, setErrorHoras] = useState(false);

  const calcularDates = (fechaIni, fechaFin) => {
    const fechaInicioLuxon = DateTime.fromFormat(fechaIni, "yyyy-MM-dd");
    const fechaFinLuxon = DateTime.fromFormat(fechaFin, "dd-MM-yyyy");
    if (fechaFinLuxon < fechaInicioLuxon) {
      setErrorHoras(true);
    } else {
      setErrorHoras(false);
    }
  };

  const getDataWrapper = (withLoading = true) => {
    getData(
      withLoading,
      formValues.fechaHoraInicio[0]
        ? DateTime.fromFormat(
            formValues.fechaHoraInicio[0],
            "dd-MM-yyyy"
          ).toISO()
        : null,
      searchAllShows
        ? null
        : DateTime.fromFormat(formValues.fechaHoraInicio[1], "dd-MM-yyyy")
            .plus({
              minutes: 24 * 60 - 1,
            })
            .toISO()
    );
  };

  useInterval(() => getDataWrapper(false), 120000);

  useEffect(() => {
    if (reloadData) getDataWrapper();
  }, [reloadData]);

  useEffect(() => {
    if (reloadDataWithoutReload) getDataWrapper(false);
  }, [reloadDataWithoutReload]);

  // useEffect(() => {
  //   const fn = async () => {
  //     getData(true, setInitialDate());
  //   };
  //   fn();
  // }, []);

  // const setInitialDate = () => {
  //   const initialDateFrom = DateTime.fromFormat(
  //     formValues.fechaHoraInicio[0],
  //     "dd-MM-yyyy"
  //   ).toISO();
  //   return initialDateFrom;
  // };

  const applySearch = () => {
    getDataWrapper();
    resetTable();
  };

  return (
    <Container show={showFilters}>
      <Row>
        <TitleContainer>Search</TitleContainer>
        <SearchOption>
          <LabelFlex>Date from:</LabelFlex>
          <ContainerInput>
            <DatePickerComponent
              id="date-input-desde-ini"
              defaultValue={DateTime.now().toFormat("yyyy-MM-dd")}
              handleChange={(e) => {
                e.persist();
                setFormValues((prev) => ({
                  ...prev,
                  fechaHoraInicio: [
                    formatDateCommon(e.target.value),
                    formValues.fechaHoraInicio[1],
                  ],
                }));
                calcularDates(e.target.value, formValues.fechaHoraInicio[1]);
              }}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Date to:</LabelFlex>
          <ContainerInput>
            <DatePickerComponent
              variant={errorHoras && !searchAllShows && "secondary"}
              disabled={searchAllShows}
              id="date-input-hasta-ini"
              defaultValue={DateTime.fromFormat(
                formValues.fechaHoraInicio[0],
                "dd-MM-yyyy"
              ).toFormat("yyyy-MM-dd")}
              min={DateTime.fromFormat(
                formValues.fechaHoraInicio[0],
                "dd-MM-yyyy"
              ).toFormat("yyyy-MM-dd")}
              handleChange={(e) => {
                e.persist();
                setFormValues((prev) => ({
                  ...prev,
                  fechaHoraInicio: [
                    formValues.fechaHoraInicio[0],
                    formatDateCommon(e.target.value),
                  ],
                }));
                calcularDates(formValues.fechaHoraInicio[0], e.target.value);
              }}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <CheckboxStyled
            label={"Search all future shows"}
            onChange={() => setSearchAllShows(!searchAllShows)}
            isChecked={searchAllShows}
          />
        </SearchOption>
        <ButtonContainer>
          <ButtonStyled
            disabled={errorHoras && !searchAllShows}
            variant="primary"
            onClick={applySearch}
          >
            Apply
          </ButtonStyled>
        </ButtonContainer>
      </Row>
      {errorHoras && !searchAllShows && (<Row>
        
          <ErrorMessage>
            The date to cannot be less than {formValues.fechaHoraInicio[0]}
          </ErrorMessage>
        
      </Row>)}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: ${({ show }) => (show ? "unset" : "hidden")};
  height: ${({ show }) => (show ? "fit-content" : "30px")};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const SearchOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ justifyContent }) =>
    justifyContent ? justifyContent : null};
  gap: 12px;
  text-wrap: nowrap;
  .rmsc .dropdown-container:focus-within {
    border: 2px solid #61a5c3 !important;
    box-shadow: none !important;
  }
  .select-multiple {
    max-width: 500px;
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

const ContainerInput = styled.div`
  display: flex;
  flex: 3;
  height: 32px;
  width: 250px;
`;

const Label = styled.div`
  font-size: 16px;
  white-space: nowrap;
`;

const LabelFlex = styled(Label)`
  text-align: right;
  flex: 1;
`;

const TitleContainer = styled.div`
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ErrorMessage = styled.div`
  color: red;
  font-size: 16px;
  left: 20%;
  margin-left:80px
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: ${({ margin }) => (margin ? margin : "unset")};
  ${({ position }) => position && `position: ${position};`}
  ${({ flexCenter }) => flexCenter && `justify-content: center;`}
`;

export { TaskRecordingSearch };
