import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import ListingWindow from "../listingWindow/ListingWindow";
import ItemArtistica from "./ItemArtistica";
import { useColumnFilter, Filter } from "../filter/useColumnFilter";
import plus from "../../../../images/icons/plus.svg";
import arrowBack from "../../../../images/icons/arrow-back.svg";
import ArtisticaForm from "./ArtisticaForm";
import useMessageBox from "../../../hooks/useMessageBox";
import uuid from "react-uuid";

const ListadoArtistica = ({ show, salirCBF, hasPermission ,onMediaTraker = false}) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [contenidoJSX, setContenidoJSX] = useState();
  const [loadStatus, setLoadStatus] = useState({ completed: false });
  const [data, setData, filters, setFilters, hasChanged, setHasChanged] =
    useColumnFilter();
  const op1 = "Agregar artística";
  const op2 = "Volver al listado";
  const [toggleChargeAction, setToggleChargeAction] = useState(op1);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isDuplicated, setIsDuplicated] = useState(false);

  useEffect(() => {
    if (toggleChargeAction === op1 && initialFormData) {
      setInitialFormData(null);
    }
  }, [toggleChargeAction]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => (mounted = false);
  }, [show.epi]);

  const addHandler = (data, isDuplicated) => {
    setIsDuplicated(isDuplicated);
    if (data) {
      setInitialFormData(data);
    }
    setToggleChargeAction(toggleChargeAction === op2 ? op1 : op2);
  };

  const deleteItem = async (id_artis) => {
    try {
      let url = "artistica-programa/" + id_artis;
      const api = await axiosApi();
      const result = await api.delete(url);
      if (!result.data.message.success) {
        return showMessage({
          title: "Borrar ítem",
          message: result.data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        });
      }
      getData();
      showMessage({
        title: "Borrar ítem",
        message: "Ítem eliminado correctamente",
        okCBF: () => {},
        type: messageTypes.INFO,
      });
    } catch (err) {
      console.log("Error ListadoArtistica", err);
    }
  };

  const updateItemData = (itemData) => {
    const index = data.map((e) => e.id_artis).indexOf(itemData.id_artis);
    const dataCopy = [...data];
    dataCopy.splice(index, 1, itemData);
    setData(dataCopy);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setContenidoJSX(() =>
        data.map((el, i) => {
          let pass = true;

          if (filters.size > 0) {
            let mapIter = filters.entries();
            for (let i = 0; i < filters.size; ++i) {
              let pair = mapIter.next().value;
              let key = pair[0]; // key
              let textoFiltro = pair[1]; // Value
              if (textoFiltro === "") pass &= true;
              else {
                pass &= filter(el[key], textoFiltro);
              }
            }
          }
          if (pass) {
            return (
              <ItemArtistica
                item={el}
                key={uuid()}
                hasPermission={hasPermission}
                addHandler={(data) => addHandler(data, true)}
                deleteItem={deleteItem}
                validate={validateHoursMinutes}
                updateItemData={updateItemData}
              />
            );
          }
        })
      );
    }
    return () => (mounted = false);
  }, [data, hasChanged]);

  const validateFn = (hora, spotId) => {
    const valid = validateHoursMinutes(hora, spotId);
    if (!valid) {
      return showMessage({
        title: "Error de horario",
        message: "Ya existe un spot para el horario ingresado.",
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }
    return valid;
  };

  const getData = async () => {
    try {
      let url = "artistica-lista/" + show.epi.toString();
      const api = await axiosApi();
      const result = await api.get(url);
      const rawData = await result.data.model;
      setLoadStatus(() => {
        return { completed: true };
      });
      setData(() => rawData);
    } catch (err) {
      console.log("Error ListadoArtistica", err);
    }
  };

  function filter(hay, needle) {
    if (!hay) return false;
    return (
      hay.toString().toLowerCase().indexOf(needle.toString().toLowerCase()) !==
      -1
    );
  }

  const handleFilters = (fieldName, value) => {
    if (value.trim() == "") filters.delete(fieldName);
    else filters.set(fieldName, value);

    setFilters(() => filters);
    setHasChanged((prev) => !prev);
  };

  const actions = hasPermission
    ? [
        {
          label: toggleChargeAction,
          onClick: () => addHandler(null, false),
          icon: toggleChargeAction === op1 ? plus : arrowBack,
        },
      ]
    : [];

  const validateHoursMinutes = (hoursAndMinutes, spotId) => {
    // se formatea el dato por si viene un valor en formato: ""
    const formatedTimeInput = hoursAndMinutes == "" ? null : hoursAndMinutes;
    let validHour = true;
    data.forEach((d) => {
      // se formatea el dato por si viene un valor en formato: hh:mm
      let formatedDTime = d.hora
      if(formatedDTime && formatedDTime.length == 5){
        formatedDTime = formatedDTime + ':00'
      }
      if(spotId !== d.spot){
        if (formatedDTime == formatedTimeInput) validHour = false;
      }
    });
    return validHour;
  };

  return (
    <>
      {/*  */}
      <ListingWindow
        onMediaTraker={onMediaTraker}
        headers={
          <tr className="listing-window__row__cabecera">
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Canal</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Pos</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <Filter
                fieldName="mate"
                display="Mate"
                onChange={handleFilters}
                value={filters.get("mate")}
              />
            </td>
            <td className="listing-window__cell__cabecera">
              <Filter
                fieldName="tipo"
                display="Tipo Publi"
                onChange={handleFilters}
                value={filters.get("tipo")}
              />
            </td>
            <td className="listing-window__cell__cabecera">
              <Filter
                fieldName="nombre"
                display="Nombre"
                onChange={handleFilters}
                value={filters.get("nombre")}
              />
            </td>
            <td className="listing-window__cell__cabecera">
              <Filter
                fieldName="cliente"
                display="Cliente"
                onChange={handleFilters}
                value={filters.get("cliente")}
              />
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Observaciones
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">ISCI</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Duracion
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Emitido
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Hora</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <Filter
                fieldName="spot"
                display="Spot"
                onChange={handleFilters}
                value={filters.get("spot")}
              />
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Horario Emisión
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td className="listing-window__cell__cabecera">
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Acciones
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
          </tr>
        }
        title="Artística del Programa"
        show={show}
        rows={contenidoJSX}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        helpUrlJson="artistica"
        actions={actions}
        toggleView={toggleChargeAction === op1}
        secondaryComponent={
          <ArtisticaForm
            isDuplicated={isDuplicated}
            initialFormData={initialFormData}
            show={show}
            getData={getData}
            backToListView={() => setToggleChargeAction(op1)}
            validate={validateFn}
          />
        }
      />
    </>
  );
};

export default ListadoArtistica;
