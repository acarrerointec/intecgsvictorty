import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import styled, { css } from "styled-components";
import { defaultValues, priorityOptions, statusOptions } from "../config";
import Pill from "../../../../../commons/Pill";
import uuid from "react-uuid";
import { MdCancel } from "react-icons/md";
import { ButtonStyled } from "../../../../../commons/Button";
import { MultiSelect } from "react-multi-select-component";
import { InputStyled } from "../../../../../commons/Input";
import { typeOptions, multiSelectFilter, SELECT_OPTIONS } from "../config";
import { obtenerValoresUnicos } from "../../../../../../utils/arraysUtils";
import { DateTime } from "luxon";

const TaskRecordsFilter = ({
  setFilteredData = () => {},
  data = [],
  setSelectedRowIndex = () => {},
  selectedRowIndex,
  setSelectRowData = () => {},
  selectTabRecording = false
}) => {
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [formValues, setFormValues] = useState(defaultValues);
  const [feed, setFeed] = useState([]);
  const [input, setInput] = useState([]);
  const [operator, setOperator] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) => opciones.push({ value: d, label: d }));
    return opciones.sort((a, b) => {
      return a.value - b.value;
    });
  };

  useEffect(() => {
    if (data) {
      setFeed(adaptarDatosAOpciones(obtenerValoresUnicos(data, "feed")));
      setInput(adaptarDatosAOpciones(obtenerValoresUnicos(data, "input")));
      setOperator(
        adaptarDatosAOpciones(obtenerValoresUnicos(data, "operador"))
      );
      setEquipment(
        adaptarDatosAOpciones(obtenerValoresUnicos(data, "equipment"))
      );
    }
  }, [data]);

  useEffect(() => {
    if (appliedFilters.length > 0 || selectedRowIndex !== null) {
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
          if (f.filterKey === "readyQcValue") {
            return !!d[f.filterKey];
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
    <ContainerRecordsFilters show={showFilters} selectTabRecording={selectTabRecording}>
      <RowRecords>
        <TitleContainerRecords>Filters</TitleContainerRecords>
        <ImgContainer
          onClick={() => selectTabRecording && setShowFilters((p) => !p)}
          show={showFilters}
          selectTabRecording={selectTabRecording}
        >
          <FaChevronDown color={"white"} />
        </ImgContainer>
      </RowRecords>
      <RowRecords>
        <FilterOption>
          <LabelFlex>Code:</LabelFlex>
          <ContainerInput>
            <InputStyled
              placeholder="Enter a code"
              onChange={(e) => {
                e.persist();
                updateFilter({
                  filterKey: "code",
                  filterName: "Code",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  code: e.target.value,
                }));
              }}
              value={formValues.code}
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
                  filterKey: "description",
                  filterName: "Description",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              value={formValues.description}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Epi:</LabelFlex>
          <ContainerInput>
            <InputStyled
              placeholder="Enter a epi"
              onChange={(e) => {
                e.persist();
                updateFilter({
                  filterKey: "epi",
                  filterName: "epi",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  epi: e.target.value,
                }));
              }}
              value={formValues.epi}
            />
          </ContainerInput>
        </FilterOption>
      </RowRecords>
      <RowRecords>
        <FilterOption>
          <LabelFlex>Type:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.type}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-type"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "type",
                  filterName: "Type",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  type: items,
                }));
              }}
              options={typeOptions || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Date deferred:</LabelFlex>
          <ContainerInput>
            <InputStyled
              type="date"
              id="dateDiferido"
              value={formValues.dateDiferido}
              onChange={(e) => {
                e.persist();
                updateFilter({
                  filterKey: "dateDiferido",
                  filterName: "Date deferred",
                  value: e.target.value,
                  valueLabel: DateTime.fromISO(e.target.value).toFormat(
                    "dd/MM/yyyy"
                  ),
                });
                setFormValues((prev) => ({
                  ...prev,
                  dateDiferido: e.target.value,
                }));
              }}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Status:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.status}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-status"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "status",
                  filterName: "status",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  status: items,
                }));
              }}
              options={statusOptions || []}
            />
          </ContainerInput>
        </FilterOption>
      </RowRecords>
      <RowRecords>
        <FilterOption>
          <LabelFlex>Input:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.input}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-input"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "input",
                  filterName: "input",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  input: items,
                }));
              }}
              options={input || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Equipment:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.equipment}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-equipment"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "equipment",
                  filterName: "equipment",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  equipment: items,
                }));
              }}
              options={equipment || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Operator:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.operator}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-operator"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "operator",
                  filterName: "operator",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  operator: items,
                }));
              }}
              options={operator || []}
            />
          </ContainerInput>
        </FilterOption>
      </RowRecords>
      <RowRecords>
        <FilterOption>
          <LabelFlex>Priority:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.priority}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-priority"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "priority",
                  filterName: "priority",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  priority: items,
                }));
              }}
              options={priorityOptions || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          {/* <LabelFlex>Feed:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.feed}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-feed"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "feed",
                  filterName: "network",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  feed: items,
                }));
              }}
              options={feed || []}
            />
          </ContainerInput> */}
        </FilterOption>
        <FilterOption />
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
                    //reseteo para campos de fecha
                    // if (timeInput.includes(filter.filterKey)) resetDateInputs();
                    deleteFilter(filter.filterKey);
                    //reseteo los valores inciales para vaciar los inputs
                    setFormValues((prev) => ({
                      ...prev,
                      [filter.filterKey]: defaultValues[filter.filterKey],
                    }));
                    //reseteo especial para los selectores
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
            // se evita el reseteo del valor de tipo
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
  ${({ selectTabRecording }) => (!selectTabRecording && css`height: 30px; overflow: hidden;`)};
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
  ${({ selectTabRecording }) => (!selectTabRecording && css`background-color: lightgrey; cursor: not-allowed;`)};
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

export { TaskRecordsFilter };
