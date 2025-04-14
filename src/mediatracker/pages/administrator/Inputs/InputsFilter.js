import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import styled, { css } from "styled-components";
import { SELECT_OPTIONS, defaultValues, multiSelectFilter } from "./config";
import Pill from "../../../../commons/Pill";
import uuid from "react-uuid";
import { MdCancel } from "react-icons/md";
import { MultiSelect } from "react-multi-select-component";
import { ButtonStyled } from "../../../../commons/Button";
import { obtenerValoresUnicos } from "../../../../../utils/arraysUtils";
import { InputStyled } from "../../../../commons/Input";

const InputsFilter = ({
  setFilteredData = () => {},
  data = [],
  setSelectRowData = () => {},
  setSelectedRowIndex = () => {},
}) => {
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [formValues, setFormValues] = useState(defaultValues);
  const [idOptions, setIdOptions] = useState(null);
  const [descriptionOptions, setDescriptionOptions] = useState(null);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) => opciones.push({ value: d, label: d }));
    return opciones.sort((a, b) => {
      return a.value - b.value;
    });
  };

  useEffect(() => {
    if (data) {
      setIdOptions(adaptarDatosAOpciones(obtenerValoresUnicos(data, "id")));
      setDescriptionOptions(
        adaptarDatosAOpciones(obtenerValoresUnicos(data, "descrip"))
      );
    }
  }, [data]);

  useEffect(() => {
    if (appliedFilters.length > 0) {
      setSelectRowData(null);
      setSelectedRowIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  useEffect(() => {
    if (appliedFilters.length > 0 && data) {
      let tempArr = [...data];
      appliedFilters.forEach((f) => {
        tempArr = tempArr.filter((d) => {
          if (multiSelectFilter.includes(f.filterKey)) {
            return f.value.includes(d[f.filterKey]);
          }
          return d[f.filterKey]
            .toString()
            .toLowerCase()
            .includes(f.value.toLowerCase());
        });
      });
      setFilteredData(tempArr);
    } else {
      setFilteredData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, data]);

  const updateFilter = (filter) => {
    if (multiSelectFilter.includes(filter.filterKey)) {
      if (filter.value.length === 0) return deleteFilter(filter.filterKey);
    }
    // si el value del filtro es vacio o Select option lo elimina (reinicializo)
    if (
      !multiSelectFilter.includes(filter.filterKey) &&
      (filter.value.trim() === "" || filter.value === "Select option")
    ) {
      return deleteFilter(filter.filterKey);
    }
    const tempArr = [...appliedFilters];
    const filterIndex = tempArr
      .map((f) => f.filterKey)
      .indexOf(filter.filterKey);
    if (filterIndex > -1) {
      tempArr.splice(filterIndex, 1, filter);
    } else {
      tempArr.push(filter);
    }
    setAppliedFilters(tempArr);
  };

  const deleteFilter = (filterKey) => {
    const tempArr = [...appliedFilters];
    let index = -1;
    tempArr.forEach((f, i) => {
      if (f.filterKey === filterKey) {
        index = i;
      }
    });
    if (index > -1) {
      tempArr.splice(index, 1);
    }
    setAppliedFilters(tempArr);
  };

  const deleteAllFilters = () => {
    setAppliedFilters([]);
    setFilteredData(null);
  };

  return (
    <ContainerRecordsFilters show={showFilters}>
      <RowRecords>
        <TitleContainerRecords>Filters</TitleContainerRecords>
        <ImgContainer
          onClick={() => setShowFilters((p) => !p)}
          show={showFilters}
        >
          <FaChevronDown color={"white"} />
        </ImgContainer>
      </RowRecords>
      <RowRecords>
        <FilterOption>
          <LabelFlex>Id:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.id}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-id"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "id",
                  filterName: "id",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  id: items,
                }));
              }}
              options={idOptions || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Description:</LabelFlex>
          <ContainerInput>
            <InputStyled
              placeholder="Enter a description"
              onChange={(e) => {
                e.persist();
                updateFilter({
                  filterKey: "descrip",
                  filterName: "Description",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  descrip: e.target.value,
                }));
              }}
              value={formValues.descrip}
            />
          </ContainerInput>
        </FilterOption>
      </RowRecords>
      <RowRecords>
        {appliedFilters &&
          appliedFilters.map((filter) => {
            return (
              <Pill key={uuid()}>
                <strong>{filter.filterName + ": "}</strong>
                {filter.valueLabel}
                <CancelIcon
                  onClick={() => {
                    deleteFilter(filter.filterKey);
                    setFormValues((prev) => ({
                      ...prev,
                      [filter.filterKey]: defaultValues[filter.filterKey],
                    }));
                    const element = document.getElementById(
                      `select-${filter.filterKey}`
                    );
                    if (element) {
                      element.value = SELECT_OPTIONS;
                    }
                  }}
                >
                  <MdCancel />
                </CancelIcon>
              </Pill>
            );
          })}
      </RowRecords>
      <RowRecords flexEnd>
        <ButtonStyled
          variant="secondary"
          onClick={() => {
            setFormValues((p) => ({ ...defaultValues }));
            deleteAllFilters();
          }}
          disabled={appliedFilters.length === 0}
        >
          Clean filters
        </ButtonStyled>
      </RowRecords>
    </ContainerRecordsFilters>
  );
};

const ContainerRecordsFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: ${({ show }) => (show ? "unset" : "hidden")};
  height: ${({ show }) => (show ? "fit-content" : "30px")};
`;

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
  text-wrap: nowrap;
  font-size: 16px;
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

const RowRecords = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  ${({ flexEnd }) =>
    flexEnd &&
    css`
      justify-content: flex-end;
    `}
`;

const LabelFlex = styled.label`
  text-align: right;
  flex: 1;
`;

const ContainerInput = styled.div`
  display: flex;
  flex: 3;
`;

const ImgContainer = styled.div`
  //box-shadow: 1px 1px 4px 0px rgba(0,0,0,0.20);
  background-color: #61a5c3;
  padding: 5px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  width: fit-content;
  height: fit-content;
  box-sizing: border-box;
  cursor: pointer;
  :hover {
  }
  ${({ show }) =>
    show &&
    css`
      transform: rotate(180deg);
    `}
`;

const TitleContainerRecords = styled.div`
  font-weight: 500;
  flex: 1;
  text-align: start;
`;

const CancelIcon = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #d53737;
`;

export { InputsFilter };
