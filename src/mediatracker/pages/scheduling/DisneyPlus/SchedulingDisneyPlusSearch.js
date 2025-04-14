import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { ButtonStyled } from "../../../../commons/Button";
import DatePickerComponent from "../../../../commons/DatePicker";
import { DateTime } from "luxon";
import useInterval from "../../../../hooks/useInterval";
import { formatDateCommon } from "../../../../../utils/dates";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";

import { error } from "../../../../commons/snackbarConfig";
import { MultiSelect } from "react-multi-select-component";


export const defaultValuesSearch = {
  feed: [],
  fechaHoraInicio: null,
  network: [],
};

const SchedulingDisneyPlusSearch = ({
  getData = () => {},
  getDataTimeLine=()=>{},
  reloadData,
  reloadDataWithoutReload,
  setLoadingData = () => {},
  loadingData,
  setSearchDate
}) => {
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [formValues, setFormValues] = useState(defaultValuesSearch);
  const [showFilters] = useState(true);
  const [feedsOptions, setFeedsOptions] = useState([]);
  const [networksOptions, setNetworksOptions] = useState([]);
  const [initialCharge, setInitialCharge] = useState(true);
  const [changeType, setChangeType] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  // const [errorHoras, setErrorHoras] = useState(false);
  
  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) => opciones.push({ value: d.trim(), label: d.trim() }));
    return opciones;
  };

  const getDataFeeds = async () => {
    setInitialCharge(false);
    try {
      setChangeType(true);
      const api = await axiosApi();
      const url = `disneyplus/feeds`;
      const { data } = await api.get(url);
      setChangeType(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      const numberOrder = data.model.sort(function (a, b) {
        return a - b;
      });
      setFeedsOptions(adaptarDatosAOpciones(numberOrder));
      return numberOrder;
    } catch (error) {
      openSnackError("An unexpected error has occurred obtaining the information", 600000);
      setLoadingOptions(false);
      console.log(error);
    }
  };
  
  const getDataNetworks = async () => {
    setInitialCharge(false);
    try {
      setChangeType(true);
      const api = await axiosApi();
      const url = `disneyplus/networks`;
      const { data } = await api.get(url);
      setChangeType(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      const numberOrder = data.model.sort(function (a, b) {
        return a - b;
      });
      setNetworksOptions(adaptarDatosAOpciones(numberOrder));
      return numberOrder;
    } catch (error) {
      openSnackError("An unexpected error has occurred obtaining the information", 600000);
      setLoadingOptions(false);
      console.log(error);
    }
  };
  const getDataWrapper = (withLoading = true) => {
    setSearchDate(formValues.fechaHoraInicio)
    getData(
      withLoading,
      formValues.feed.length == 0
      ? feedsOptions.map((el) => el.value)
      : formValues.feed.map((el) => el.value),
      formValues.fechaHoraInicio
        ? DateTime.fromFormat(
            formValues.fechaHoraInicio,
            "dd-MM-yyyy"
          ).toISO()
        : DateTime.now().toISO(),
      formValues.network.length == 0
      ? networksOptions.map((el) => el.value)
      : formValues.network.map((el) => el.value),
    );
    getDataTimeLine(
      withLoading,
      formValues.feed.length == 0
        ? feedsOptions.map((el) => el.value)
        : formValues.feed.map((el) => el.value),
      formValues.fechaHoraInicio
        ? DateTime.fromFormat(
            formValues.fechaHoraInicio,
            "dd-MM-yyyy"
          ).toISO()
        : DateTime.now().toISO(),
      formValues.network.length == 0
        ? networksOptions.map((el) => el.value)
        : formValues.network.map((el) => el.value)
    );
  };


  useEffect(() => {
     if (reloadData) getDataWrapper();
  }, [reloadData]);

  useEffect(() => {
    if (reloadDataWithoutReload) getDataWrapper(false);
  }, [reloadDataWithoutReload]);

  useEffect(() => {
    getDataFeeds(true);
    getDataNetworks(true);
    //TODO:quitar cuando sean mas canales
    setFormValues((prev) => ({
      ...prev,
      feed: [ {value: "706", label: "706"} ],
      network: [{ value: "A", label: "A" }],
      fechaHoraInicio: DateTime.now().toFormat('dd-MM-yyyy')
    }));
  }, []);

  const applySearch = () => {
    setLoadingOptions(true);
    setLoadingData(true)
    getDataWrapper();
    setLoadingOptions(false);
  };

  return (
    <Container show={showFilters}>
      <Row>
        <TitleContainer>Search</TitleContainer>
        <ButtonContainer>
          <ButtonStyled
            disabled={
              formValues.feed.length === 0 ||
              formValues.network.length === 0 ||
              loadingData
            }
            variant="primary"
            onClick={applySearch}
          >
            Apply
          </ButtonStyled>
        </ButtonContainer>
      </Row>
      <Row>
        <SearchOption>
          <LabelFlex>Start Date:</LabelFlex>
          <ContainerInput>
            <DatePickerComponent
              id="date-input-desde-ini"
              defaultValue={DateTime.now().toFormat("yyyy-MM-dd")}
              handleChange={(e) => {
                e.persist();
                setFormValues((prev) => ({
                  ...prev,
                  fechaHoraInicio: formatDateCommon(e.target.value),
                }));
              }}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Network:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              disabled={loadingOptions || !feedsOptions || changeType}
              value={formValues.feed}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: `${
                  changeType ? "Loading options..." : "Select options"
                }`,
              }}
              id="select-feed"
              disableSearch
              onChange={(items) => {
                setFormValues((prev) => ({
                  ...prev,
                  feed: items,
                }));
                if (items.length === 0) {
                  setFormValues((prev) => ({
                    ...prev,
                    feed: [],
                  }));
                }
              }}
              options={feedsOptions || []}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Feed:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              disabled={loadingOptions || !networksOptions || changeType}
              value={formValues.network}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: `${
                  changeType ? "Loading options..." : "Select options"
                }`,
              }}
              id="select-networks"
              disableSearch
              onChange={(items) => {
                setFormValues((prev) => ({
                  ...prev,
                  network: items,
                }));
                if (items.length === 0) {
                  setFormValues((prev) => ({
                    ...prev,
                    network: [],
                  }));
                }
              }}
              options={networksOptions || []}
            />
          </ContainerInput>
        </SearchOption>
      </Row>
      {/* {errorHoras && (
        <Row>
          <ErrorMessage>
            The date to cannot be less than {formValues.fechaHoraInicio[0]}
          </ErrorMessage>
        </Row>
      )} */}
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
  width:100%;
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

export { SchedulingDisneyPlusSearch };
