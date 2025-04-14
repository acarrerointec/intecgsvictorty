import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { InputStyled } from "../../../../commons/Input";
import { ButtonStyled } from "../../../../commons/Button";
import { FaChevronDown } from "react-icons/fa";
import Pill from "../../../../commons/Pill";
import { MdCancel } from "react-icons/md";
//import CheckboxStyled from "../../../../commons/CheckboxStyled";
import {
  statusMediaOptions,
  ingestOptions,
  defaultValues,
  timeInput,
  SELECT_OPTIONS,
  multiSelectFilter,
  booleanFilters,
  originOptions,
} from "./config";
import uuid from "react-uuid";
import { MultiSelect } from "react-multi-select-component";
import { Select } from "../../../../commons/Select";

const TaskIngestFilter = ({
  setFilteredData = () => {},
  data = [],
  setSelectedType = () => {},
  selectedType,
}) => {
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [formValues, setFormValues] = useState(defaultValues);
  const [showFilters, setShowFilters] = useState(true);

  const saveSearch = JSON.parse(localStorage.getItem("saveSearch"));

  useEffect(() => {
    if (saveSearch) {
      setFormValues((prev) => ({
        ...prev,
        emptyIngest: saveSearch?.emptyIngest ? saveSearch.emptyIngest : [],
        ingest: saveSearch?.ingest ? saveSearch.ingest : [],
        statusMedia: saveSearch?.statusMedia ? saveSearch.statusMedia : [],
      }));
      const appliedFilters2 = saveSearch?.appliedFilters;
      if (appliedFilters2) {
        setAppliedFilters((prev) => [...prev, ...appliedFilters2]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
     "saveSearch",
     JSON.stringify({
       ...saveSearch,
       emptyIngest: formValues.emptyIngest,
       ingest: formValues.ingest,
       statusMedia: formValues.statusMedia,
       appliedFilters: appliedFilters,
     })
   );
  }, [appliedFilters]);

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

  useEffect(() => {
    if (appliedFilters.length > 0 && data) {
      let tempArr = [...data];
      appliedFilters.forEach((f) => {
        tempArr = tempArr.filter((d) => {
          //tratamiento especial para evitar filtro por tipo ( MAterial )
          if (f.filterKey === "tipo") {
            return true;
          }
          // tratamiento especial para selector multiple de booleans (ingest)
          if (f.filterKey === "ingest") {
            const resArray = [];
            f.value.forEach((ingestName) => resArray.push(d[ingestName]));
            return !resArray.some((res) => !res);
          }
          // tratamiento especial para selector multiple de nulos
          if (f.filterKey === "emptyIngest") {
            const resArray = [];
            f.value.forEach((ingestName) => resArray.push(d[ingestName]));
            return !resArray.some((res) => res !== false );
          }
          if (multiSelectFilter.includes(f.filterKey)) {
            const valor=d[f.filterKey].toLowerCase()
            const newArray=f.value.map((v)=>v.toLowerCase())
            return newArray.includes(valor);
          }
          //tratamiento especial para booleanos
          if (booleanFilters.includes(f.filterKey)) {
            return d[f.filterKey] == f.value;
          }
          //tratamiento especial fechas
          if (timeInput.includes(f.filterKey)) {
            // const dt = DateTime.fromISO(d[f.filterKey]);
            // let dtDesde = null;
            // if (f.value[0]) {
            //   dtDesde = DateTime.fromFormat(f.value[0], "dd/MM/yyyy");
            // }
            // let dtHasta = null;
            // if (f.value[1]) {
            //   dtHasta = DateTime.fromFormat(f.value[1], "dd/MM/yyyy").plus({
            //     minutes: 24 * 60 - 1,
            //   });
            // }
            // if (dtDesde && dtHasta) {
            //   return dt >= dtDesde && dt <= dtHasta;
            // }
            // return (
            //   (dtDesde ? dt >= dtDesde : false) ||
            //   (dtHasta ? dt <= dtHasta : false)
            // );
            return true;
          }
          //tratamiento especial para readyQcValue
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
      if (filter.value.length == 0) return deleteFilter(filter.filterKey);
    }
    // veo si es un filtro booleano y lo limpio en caso de false
    if (
      !multiSelectFilter.includes(filter.filterKey) &&
      booleanFilters.includes(filter.filterKey) &&
      !filter.value
    ) {
      return deleteFilter(filter.filterKey);
    }
    // si el value del filtro es vacio o Select option lo elimina (reinicializo)
    if (
      !multiSelectFilter.includes(filter.filterKey) &&
      !booleanFilters.includes(filter.filterKey) &&
      !timeInput.includes(filter.filterKey) &&
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

  const deleteAllFilters = () => {
    setAppliedFilters([]);
    setFilteredData(null);
  };

  return (
    <Container show={showFilters}>
      <Row>
        <TitleContainer>Filters</TitleContainer>
        <ImgContainer
          onClick={() => setShowFilters((p) => !p)}
          show={showFilters}
        >
          <FaChevronDown color={"white"} />
        </ImgContainer>
      </Row>
      <Row>
        <FilterOption>
          <LabelFlex>Code:</LabelFlex>
          <ContainerInput>
            <InputStyled
              placeholder="Enter a code"
              onChange={(e) => {
                e.persist();
                updateFilter({
                  filterKey: "codigo",
                  filterName: "Code",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  codigo: e.target.value,
                }));
              }}
              value={formValues.codigo}
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
                  filterKey: "descripcion",
                  filterName: "Description",
                  value: e.target.value,
                  valueLabel: e.target.value,
                });
                setFormValues((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }));
              }}
              value={formValues.descripcion}
            />
          </ContainerInput>
        </FilterOption>
      <FilterOption>
          <LabelFlex>Status:</LabelFlex>
          {/* <Select
            id="select-statusMedia"
            onChange={(e) => {
              e.persist();
              updateFilter({
                filterKey: "statusMedia",
                filterName: "Status",
                value: e.target.value,
                valueLabel: e.target.value,
              });
              setFormValues((prev) => ({
                ...prev,
                statusMedia: e.target.value,
              }));
            }}
            options={statusMediaOptions}
          /> */}
          <ContainerInput>
            <MultiSelect
              value={formValues.statusMedia}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-statusMedia"
              hasSelectAll={false}
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "statusMedia",
                  filterName: "Status",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.value).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  statusMedia: items,
                }));
              }}
              options={statusMediaOptions || []}
            />
          </ContainerInput>
        </FilterOption>
      </Row>
      {/* <Row>
        <ContainerCheckBox>
          <CheckboxStyled
            isChecked={formValues.ingestSur}
            label={"Ingest South"}
            onChange={(e) => {
              updateFilter({
                filterKey: "ingestSur",
                filterName: "Ingest South",
                value: e.target.checked,
                valueLabel: "ok",
              });
              setFormValues((prev) => ({
                ...prev,
                ingestSur: e.target.checked,
              }));
            }}
          />
          <CheckboxStyled
            isChecked={formValues.ingestNorte}
            label={"Ingest North"}
            onChange={(e) => {
              updateFilter({
                filterKey: "ingestNorte",
                filterName: "Ingest North",
                value: e.target.checked,
                valueLabel: "ok",
              });
              setFormValues((prev) => ({
                ...prev,
                ingestNorte: e.target.checked,
              }));
            }}
          />
          <CheckboxStyled
            isChecked={formValues.ingestEdm}
            label={"Ingest Edm"}
            onChange={(e) => {
              updateFilter({
                filterKey: "ingestEdm",
                filterName: "Ingest Edm",
                value: e.target.checked,
                valueLabel: "ok",
              });
              setFormValues((prev) => ({
                ...prev,
                ingestEdm: e.target.checked,
              }));
            }}
          />
          <CheckboxStyled
            isChecked={formValues.ingestTedial}
            label={"Ingest Tedial"}
            onChange={(e) => {
              updateFilter({
                filterKey: "ingestTedial",
                filterName: "Ingest Tedial",
                value: e.target.checked,
                valueLabel: "ok",
              });
              setFormValues((prev) => ({
                ...prev,
                ingestTedial: e.target.checked,
              }));
            }}
          />
        </ContainerCheckBox>
      </Row> */}
      <Row>
        <FilterOption>
          <LabelFlex>Ingest:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.ingest}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-ingest"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "ingest",
                  filterName: "Ingest",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.label).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  ingest: items,
                }));
              }}
              options={ingestOptions || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Empty Ingest:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.emptyIngest}
              className="select-multiple"
              labelledBy="Select"
              overrideStrings={{
                selectSomeItems: "Select options",
              }}
              id="select-emptyIngest"
              disableSearch
              onChange={(items) => {
                updateFilter({
                  filterKey: "emptyIngest",
                  filterName: "Empty Ingest",
                  value: items.map((i) => i.value),
                  valueLabel: items.map((i) => i.label).join(", "),
                });
                setFormValues((prev) => ({
                  ...prev,
                  emptyIngest: items,
                }));
              }}
              options={ingestOptions || []}
            />
          </ContainerInput>
        </FilterOption>
        <FilterOption>
          <LabelFlex>Origin:</LabelFlex>
          <ContainerInput>
              <Select
            id="select-ingestTmk"
            defaultValue={formValues.ingestTmk}
            onChange={(e) => {
              e.persist();
              updateFilter({
                filterKey: "ingestTmk",
                filterName: "Origin",
                value: e.target.value,
                valueLabel: e.target.value,
              });
              setFormValues((prev) => ({
                ...prev,
                ingestTmk: e.target.value,
              }));
            }}
            options={originOptions}
          />
          </ContainerInput>
        </FilterOption>
      </Row>
      <Row>
        {appliedFilters &&
          appliedFilters.map((filter) => {
            // evito que se muestren pills para los booleans
            return booleanFilters.includes(filter.filterKey) ? null : (
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
                    //hace que el input regrese a su valor inicial y se renderize
                    if (filter.filterKey === "tipo") {
                      setSelectedType(["todos"]);
                    }
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
      </Row>
      <Row flexEnd>
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
      </Row>
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

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  flex:1;
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
  height:32px;
`;

const ContainerCheckBox = styled.div`
  // margin-left: 9%;
  margin-top: 3px;
  display: flex;
  flex: 1;
  gap: 16px;
`;

const Label = styled.div`
  font-size: 16px;
  white-space: nowrap;
`;

const LabelFlex = styled(Label)`
  text-align: right;
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  ${({ flexEnd }) =>
    flexEnd &&
    css`
      justify-content: flex-end;
    `}
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

const TitleContainer = styled.div`
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
export default TaskIngestFilter;