import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { ButtonStyled } from "../../../../commons/Button";
import DatePickerComponent from "../../../../commons/DatePicker";
import { formatDate, getCurrentDate } from "../../../../../utils/dates";
import { DateTime } from "luxon";
import { typeOptions, defaultValuesSearch, typeOptionsValue } from "./config";
import { MultiSelect } from "react-multi-select-component";
import axiosApi from "../../../../../axiosApi";
import { error } from "../../../../commons/snackbarConfig";
import { useSnackbar } from "react-simple-snackbar";
import { getTipoNameUnified, getTipoNameUnifiedList, revertTipoNameUnified } from "../../administrator/Groups/dataHelper";

const TaskIngestEdmSearch = ({
  setFilteredData = () => {},
  data = [],
  setSelectedType = () => {},
  selectedType,
  getData = () => {},
  setLoadingData = () => {},
  reloadData,
  setSaveSearchTempo = () => {},
  saveSearchTempo,
}) => {
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [formValues, setFormValues] = useState(defaultValuesSearch);
  const [showFilters, setShowFilters] = useState(true);
  const [refreshSavedFilters, setRefreshSavedFilters] = useState(0);
  const [feedOptions, setFeedOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [openSnackError, closeSnackbar] = useSnackbar(error);
  const [initialCharge, setInitialCharge] = useState(true);
  const [changeType, setChangeType] = useState(false);
  const [searchChange, setSearchChange] = useState(false);
  const [dataType, setDataType] = useState(null);
  const [dataGroupsChannels, setDataGroupsChannels] = useState(null);
  const [dataGroupsTypes, setDataGroupsTypes] = useState(null);
  const [isLoadingDatagroup, setIsLoadingDataGroup] = useState(false);

  const [tipoPromoPublicidadOp, setTipoPromoPublicidadOp] = useState([]);

  const saveSearch = JSON.parse(localStorage.getItem("saveSearchIngestEdm"));

  const adaptarGroupsChannels = (datos) => {
    const opciones = [];
    const numberOrder = (op) =>
      op.sort(function (a, b) {
        return a - b;
      });
    datos.forEach((d) =>
      opciones.push({disabled:false, value: numberOrder(d.feeds).join(","), label: d.descrip })
    );
    return opciones;
  };

  const adaptarGroupsTypes = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
    opciones.push({ value: d.grupoId, label: d.descrip, groupData: d.deta?.map(t => getTipoNameUnified(t)) })
    );
    return opciones;
  };

  const getDataType = async (withLoading) => {
    try {
      withLoading && setLoadingData(true);
      const url = `ingest/tiposPromoPublicidad`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataType(data.model || []);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
          <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            onClick={handleReloadClick}
          >
            try again
          </strong>
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataGroupsChannels = async (withLoading) => {
    try {
      withLoading && setLoadingData(true);
      setIsLoadingDataGroup(true);
      const url = `Programacion/gruposCanales`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataGroupsChannels(adaptarGroupsChannels(data.model) || []);
      setIsLoadingDataGroup(false);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
          <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            onClick={handleReloadClick}
          >
            try again
          </strong>
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      setIsLoadingDataGroup(false);
      console.log(error);
    }
  };

  const getDataGroupsTypes = async (withLoading) => {
    try {
      withLoading && setLoadingData(true);
      const url = `ingest/grupos_types`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataGroupsTypes(adaptarGroupsTypes(data.model) || []);
    } catch (error) {
      setLoadingData(false);
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
          {/* <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            onClick={handleReloadClick}
          >
            try again
          </strong> */}
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getDataType(true);
    getDataGroupsChannels(true);
    getDataGroupsTypes(true);
  }, []);

  useEffect(() => {
    setSaveSearchTempo((prev) => ({
      ...prev,
      feed: formValues.feed,
      tipo: formValues.tipo,
      groups: formValues.groups,
      tiposPromoPublicidad: formValues.tiposPromoPublicidad,
    }));
  }, [formValues]);

  const adaptarDatosAOpciones = (datos) => {
    const opciones = [];
    datos.forEach((d) => opciones.push({ value: d.trim(), label: d.trim() }));
    return opciones;
  };

  const getDataFeed = async (feeds, dateFrom, dateTo) => {
    setInitialCharge(false);
    try {
      setChangeType(true);
      const api = await axiosApi();
      const url = `feeds`;
      const { data } = await api.get(url);
      setChangeType(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      const numberOrder = data.model.sort(function (a, b) {
        return a - b;
      });
      setFeedOptions(adaptarDatosAOpciones(numberOrder));
      return numberOrder;
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information,
          <strong
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
            onClick={handleReloadClick}
          >
            try again
          </strong>
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const handleReloadClick = async () => {
    closeSnackbar();
    setLoadingData(true);
    await getDataFeed();
    setLoadingData(false);
  };

  const getDataWrapper = (withLoading = true) => {
    getData(
      selectedType,
      withLoading,
      formValues.feed.length == 0
        ? feedOptions.map((el) => el.value)
        : formValues.feed.map((el) => el.value),
      formValues.fechaHoraInicio[0]
        ? DateTime.fromFormat(formValues.fechaHoraInicio[0], "dd/MM/yyyy")
        : DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
      formValues.fechaHoraInicio[1]
        ? DateTime.fromFormat(formValues.fechaHoraInicio[1], "dd/MM/yyyy").plus(
            {
              minutes: 24 * 60 - 1,
            }
          )
        : null,
      formValues.tiposPromoPublicidad.length == 0
      ? tipoPromoPublicidadOp.map((el) => ({codigo: el.codigo, tipoMaterial: el.tipo}))
        : formValues.tiposPromoPublicidad.map((el) => ({codigo: el.codigo, tipoMaterial: el.tipo}))
    );
  };

  const adaptarDatosAOpcionesType = (datos) => {
    const opciones = [];
    datos.forEach((d) =>
    opciones.push({ codigo: d.codigo, label: d.descripcion, tipo: d.tipo, value: d.id })
    );
    return opciones;
  };

  useEffect(() => {
    if (dataType) {
      // fin tratamiento especial
      const filterTypes = adaptarDatosAOpcionesType(dataType);
      const transformarArray = (array) => {
        // Si el array contiene "todos", retornar ["todos"]
        if (array.includes("todos")) {
          return ["todos"];
        }
        return array.reduce((acc, item) => {
          if (typeOptionsValue[item]) {
            acc.push(typeOptionsValue[item]);
          }
          return acc;
        }, []);
      };

      const filterItemsTypeGroups = () => {
        const mappedTypes = transformarArray(selectedType);
        if (mappedTypes.includes("todos")) {
          return dataGroupsTypes?.map((d) => ({ ...d, disabled: false }));
        }
        const arrTemp = dataGroupsTypes?.map((d) => {
          const resultadoDeDataArray = d?.groupData?.map((item) => {
            return revertTipoNameUnified(item)?.codigo;
          });
          const groupsFiltered = resultadoDeDataArray?.every((item) =>
            mappedTypes.includes(item)
          );
          return { ...d, disabled: !groupsFiltered };
        });
        return arrTemp;
      };

      setDataGroupsTypes(filterItemsTypeGroups);

      const filterItems = () => {
        const mappedTypes = transformarArray(selectedType);
        if (mappedTypes.includes("todos")) {
          return filterTypes;
        }
        return filterTypes.filter((item) => mappedTypes.includes(item.tipo));
      };
      setTipoPromoPublicidadOp(filterItems);
    }
  }, [dataType, selectedType]);

  // useInterval(() => getDataWrapper(false), 60000);

  useEffect(() => {
    if (reloadData) getDataWrapper();
  }, [reloadData]);

  useEffect(() => {
    if (!initialCharge) getDataFeed();
  }, [selectedType]);

  useEffect(() => {
    setInitialDate();

    if (saveSearch) {
      setFormValues((prev) => ({
        ...prev,
        tipo: saveSearch?.tipo || [],
        groups: saveSearch?.groups || [
          { value: "651,652,653,654,656,691,692,693", label: "EDM" },
        ],
        tiposPromoPublicidad: saveSearch?.tiposPromoPublicidad || [],
      }));
      setSearchChange(true);
    } else {
      setFormValues((prev) => ({
        ...prev,
        groups: [{ value: "651,652,653,654,656,691,692,693", label: "EDM" }],
      }));
    }
    getDataFeed();
  }, []);

  useEffect(() => {
    if (selectedType) {
      const hasFeedsSaved = saveSearch?.feed && saveSearch?.feed?.length;
      setFormValues((p) => ({
        ...p,
        feed: hasFeedsSaved ? saveSearch?.feed : defaultValuesSearch["feed"],
        groupsTypes:[],
        tiposPromoPublicidad: [],
      }));
      deletePartialSearch(["tiposPromoPublicidad", "feed"]);
    }
  }, [selectedType]);

  const deletePartialSearch = (deleteSearch) => {
    setAppliedFilters((p) => {
      const filters = p.filter(
        (filter) => !deleteSearch.includes(filter.filterKey)
      );
      return filters;
    });
    setFilteredData(null);
  };

  const setInitialDate = () => {
    setFormValues((prev) => ({
      ...prev,
      fechaHoraInicio: [
        getCurrentDate(),
        DateTime.now().plus({ days: 1 }).toFormat("dd/MM/yyyy"),
      ],
    }));
  };

  const applySearch = () => {
    setLoadingOptions(true);
    getDataWrapper();
    setSearchChange(false);
    setLoadingOptions(false);
    setRefreshSavedFilters((prev) => prev + 1);
  };

  useEffect(() => {
    localStorage.setItem(
      "saveSearchIngestEdm",
      JSON.stringify(saveSearchTempo)
    );
  }, [refreshSavedFilters]);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      feed: formatGroup(prev.groups, prev.prevGroups, prev.feed),
    }));
  }, [formValues.groups]);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      tiposPromoPublicidad: formatGroupTypes(prev.groupsTypes, prev.prevGroupsTypes, prev.tiposPromoPublicidad),
    }));
  }, [formValues.groupsTypes]);

  const formatGroup = (group, prevGroups, feed) => {
     //TODO:  replicar formatGroupTypes usando groupData en vez values
    let arrayFeed = [...feed];
    const groupsToDelete = prevGroups?.filter(
      (pg) => !group.some((g) => g.label == pg.label)
    );
    if (group) {
      group.forEach((item) => {
        const values = item?.value.split(",");
        values.forEach((value) => {
          if (!arrayFeed.some((feed) => feed.value == value)) {
            arrayFeed.push({
              value: value,
              label: value,
            });
          }
        });
      });
    }
    if (groupsToDelete && groupsToDelete.length != 0) {
      groupsToDelete.forEach((gtd) => {
        const values = gtd?.value.split(",");
        values.forEach((v) => {
          const arrTemp = arrayFeed.filter((feed) => feed.value != v);
          arrayFeed = arrTemp;
        });
      });
    }
    return arrayFeed;
  };

  const formatGroupTypes = (groupTypes, prevGroupsTypes, tiposPromoPublicidad) => {
    let tempOptions = [...tipoPromoPublicidadOp];
    let arrayTipos = [...tiposPromoPublicidad];
    const groupsToDelete = prevGroupsTypes?.filter((pg) => !groupTypes.some(g => g.label == pg.label));
    if (groupTypes) {
      groupTypes.forEach((item) => {
        const groupDataClean = item.groupData
        groupDataClean?.forEach((value) => {
          if(!arrayTipos?.some(tipo => getTipoNameUnifiedList(tipo) == value)){
            const [op] = tempOptions.filter(to => getTipoNameUnifiedList(to) == value);
            arrayTipos.push(op);
          }
        });
      });
    }
    if (groupsToDelete && groupsToDelete.length != 0) {
      groupsToDelete.forEach((gtd) => {
        const values = gtd?.groupData;
        values.forEach((v) => {
          // Verificar si el tipo (v) sigue existiendo en otros grupos seleccionados
          const stillExists = groupTypes.some((g) =>
          g.groupData?.includes(v)
          );
          // Si no existe en otros grupos, eliminarlo
          if (!stillExists) {
            arrayTipos = arrayTipos.filter(
              (tipo) => getTipoNameUnifiedList(tipo) != v
            );
          }
        });
      });
    }
    return arrayTipos;
  };

  return (
    <Container show={showFilters}>
      <Row>
        <TitleContainer>Search</TitleContainer>
        <ButtonStyled
          // disabled={!searchChange}
          variant="primary"
          onClick={applySearch}
        >
          Apply
        </ButtonStyled>
      </Row>
      <Row>
        <SearchOption>
          <LabelFlex>Material:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.tipo}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: "All materials selected",
              }}
              id="select-tipo"
              hasSelectAll={false}
              disableSearch
              onChange={(items) => {
                setSelectedType(
                  items.length == 0 ? ["todos"] : items.map((i) => i.value)
                );
                setFormValues((prev) => ({
                  ...prev,
                  tipo: items,
                }));
                setSearchChange(true);
              }}
              options={typeOptions || []}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Type Groups:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.groupsTypes}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: `${"Select options"}`,
              }}
              id="select-groups"
              disableSearch
              onChange={(items) => {
                const filteredItems = items.filter(
                  (item) => !(dataGroupsTypes.find((opt) => opt.value === item.value)?.disabled)
                );
                setFormValues((prev) => ({
                  ...prev,
                  groupsTypes: filteredItems,
                  prevGroupsTypes: prev.groupsTypes,
                }));
                setSearchChange(true);
              }}
              options={dataGroupsTypes || []}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Type:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.tiposPromoPublicidad}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: `${"All Types selected"}`,
              }}
              id="select-tiposPromoPublicidad"
              // disableSearch
              onChange={(items) => {
                setFormValues((prev) => ({
                  ...prev,
                  tiposPromoPublicidad: items,
                }));
                setSearchChange(true);
              }}
              options={tipoPromoPublicidadOp || []}
            />
          </ContainerInput>
        </SearchOption>
      </Row>
      <Row>
      <SearchOption>
          <LabelFlex>Network Groups:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              value={formValues.groups}
              className="select-multiple"
              labelledBy="SelectMultiple"
              overrideStrings={{
                selectSomeItems: `${"Select options"}`,
              }}
              id="select-groups"
              disableSearch
              onChange={(items) => {
                setFormValues((prev) => ({
                  ...prev,
                  groups: items,
                  prevGroups: prev.groups,
                }));
                setSearchChange(true);
              }}
              options={dataGroupsChannels || []}
              disabled={isLoadingDatagroup}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption>
          <LabelFlex>Network:</LabelFlex>
          <ContainerInput>
            <MultiSelect
              disabled={loadingOptions || !feedOptions || changeType}
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
                setSearchChange(true);
                if (items.length === 0) {
                  setFormValues((prev) => ({
                    ...prev,
                    groups: [],
                  }));
                }
              }}
              options={feedOptions || []}
            />
          </ContainerInput>
        </SearchOption>
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
                    formatDate(e.target.value),
                    formValues.fechaHoraInicio[1],
                  ],
                }));
                setSearchChange(true);
              }}
            />
          </ContainerInput>
        </SearchOption>
      </Row>
      <Row>
      <SearchOption>
          <LabelFlex>Date to:</LabelFlex>
          <ContainerInput>
            <DatePickerComponent
              id="date-input-hasta-ini"
              defaultValue={DateTime.now()
                .plus({ days: 1 })
                .toFormat("yyyy-MM-dd")}
              handleChange={(e) => {
                e.persist();
                setFormValues((prev) => ({
                  ...prev,
                  fechaHoraInicio: [
                    formValues.fechaHoraInicio[0],
                    formatDate(e.target.value),
                  ],
                }));
                setSearchChange(true);
              }}
            />
          </ContainerInput>
        </SearchOption>
        <SearchOption></SearchOption>
        <SearchOption></SearchOption>
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

const SearchOption = styled.div`
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
    max-width: 500px;
    font-size: 16px;
    border-radius: 6px !important;
    width: 100%;
    cursor: pointer !important;
    @media (max-width: 1600px) {
    max-width: 310px;
  }
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
  width: 100%;
  align-items: center;
  gap: 12px;
  ${({ flexEnd }) =>
    flexEnd &&
    css`
      justify-content: flex-end;
    `}
`;

const TitleContainer = styled.div`
  font-weight: 500;
  flex: 1;
  text-align: start;
`;

export { TaskIngestEdmSearch };
