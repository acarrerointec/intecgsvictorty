import React, { useState, useEffect } from "react";
import axiosApi from "../../../../axiosApi";
import ListingWindow from "../listingWindow/ListingWindow";
import useMessageBox from "../../../hooks/useMessageBox";
import { useColumnFilter, Filter } from "../filter/useColumnFilter";
import chevron from "../../../../images/icons/chevron.png";

const ListadoRutina = ({ show, salirCBF, onMediaTraker = false }) => {
  const [contenidoJSX, setContenidoJSX] = useState();
  const [loadStatus, setLoadStatus] = useState({ completed: true });
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [data, setData, filters, setFilters, hasChanged, setHasChanged] =
    useColumnFilter();
  const [groupsOpen, setGroupsOpen] = useState([]);
  const [totalDuration, setTotalDuration] = useState({
    tanda: 0,
    artistica: 0,
  });
  const [showChannel, setShowChannel] = useState(show);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => (mounted = false);
  }, [showChannel.epi]);

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

  const allGroupsVisibilityToggle = (value) => {
    if (!data) return;
    const dataValue =
      value === "expandir"
        ? getGroupedTime(data).map((group) => group.groupId)
        : [];
    setGroupsOpen(dataValue);
  };

  const handleRowVisibility = (corteId) => {
    let groupArray = [...groupsOpen];
    const index = groupsOpen.indexOf(corteId);
    if (index !== -1) {
      groupArray.splice(index, 1);
    } else {
      groupArray.push(corteId);
    }

    setGroupsOpen(groupArray);
  };

  const getFormatedTime = (time) => {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    return `${minutes}M ${seconds}"`;
  };

  useEffect(() => {
    let mounted = true;
    if (!data) return;
    const groupedData = getGroupedTime(data);
    if (mounted) {
      const content = [];
      groupedData.forEach((group) => {
        group.data[0].nombre =
          group.groupDescrip +
          " N°" +
          group.groupId +
          " Duracion total: " +
          getFormatedTime(group.totalCount);
        group.data[0].corte = group.groupId;
        group.data.map((el, i) => {
          let pass = true;
          const isHeader = !el.orden;

          if (filters.size > 0) {
            if (i !== 0) {
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
            } else {
              pass = false;
            }
          } else if (i !== 0 && !group.showRow) {
            pass = false;
          }

          if (pass) {
            content.push(
              <tr
                key={`material-row-${content.length}`}
                className={`listing-window__row${isHeader ? " header" : ""}`}
                onClick={isHeader ? () => handleRowVisibility(el.corte) : null}
              >
                <td
                  style={{
                    gridArea: "corte",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-beetwen",
                    width: "100%",
                  }}
                >
                  {el.corte}
                  {isHeader && (
                    <img
                      alt="flecha"
                      src={chevron}
                      style={{
                        marginLeft: "8px",
                        transform: `rotate(${group.showRow ? -90 : 90}deg)`,
                      }}
                    />
                  )}
                  <wbr />
                </td>
                <td style={{ gridArea: "orden" }}>
                  {el.orden}
                  <wbr />
                </td>
                <td style={{ gridArea: "avail" }}>
                  {el.avail}
                  <wbr />
                </td>
                <td style={{ gridArea: "tipo_publi" }}>
                  {el.tipo_publi}
                  <wbr />
                </td>
                <td style={{ gridArea: "dura_real" }}>
                  {el.dura_real}
                  <wbr />
                </td>
                <td style={{ gridArea: "mate_tmk" }}>
                  {el.mate_tmk}
                  <wbr />
                </td>
                <td style={{ gridArea: "mate" }}>
                  {el.mate}
                  <wbr />
                </td>
                <td style={{ gridArea: "nombre" ,minWidth: "250px", whiteSpace: "nowrap"}}>
                  {el.nombre}
                  <wbr />
                </td>
                <td style={{ gridArea: "observacion",width:"200px",whiteSpace: "normal"}}>
                  {el.observacion}
                  <wbr />
                </td>
                <td style={{ gridArea: "cliente_razon" }}>
                  {el.cliente_razon}
                  <wbr />
                </td>
                <td style={{ gridArea: "rubro_descrip" }}>
                  {el.rubro_descrip}
                  <wbr />
                </td>
                <td style={{ gridArea: "sr" }}>
                  {el.selling_rota_descrip}
                  <wbr />
                </td>
                <td style={{ gridArea: "op" }}>
                  {el.op}
                  <wbr />
                </td>
                <td style={{ gridArea: "ncs_prp_id" }}>
                  {el.ncs_prp_id}
                  <wbr />
                </td>
                <td style={{ gridArea: "ncs_pob_id" }}>
                  {el.ncs_pob_id}
                  <wbr />
                </td>
                <td style={{ gridArea: "id_version" }}>
                  {el.id_version}
                  <wbr />
                </td>
                <td style={{ gridArea: "spot" }}>
                  {el.spot}
                  <wbr />
                </td>
                <td style={{ gridArea: "ncs_ut_id" }}>
                  {el.ncs_ut_id}
                  <wbr />
                </td>
                <td style={{ gridArea: "ncs_epi_id" }}>
                  {el.ncs_epi_id}
                  <wbr />
                </td>
                <td style={{ gridArea: "conci" }}>
                  {el.conci}
                  <wbr />
                </td>
              </tr>
            );
          }
        });
      });
      setContenidoJSX(content);
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hasChanged, groupsOpen]);

  const getGroupedTime = (data) => {
    let tandaTotal = 0;
    let artisticaTotal = 0;
    const corteGrupos = [];
    data.forEach((com) => {
      com.posi === "T"
        ? (tandaTotal += com.dura_real)
        : (artisticaTotal += com.dura_real);
      if (
        corteGrupos.length === 0 ||
        !corteGrupos.some((item) => item.groupId === com.corte)
      ) {
        corteGrupos.push({
          showRow: groupsOpen.includes(com.corte),
          totalCount: com.dura_real,
          groupId: com.corte,
          groupDescrip: com.corte_descrip,
          data: [{}, com],
        });
      } else {
        corteGrupos.forEach((item) => {
          if (item.groupId === com.corte) {
            item.data.push(com);
            item.totalCount += com.dura_real;
          }
        });
      }
    });

    setTotalDuration({
      tanda: getFormatedTime(tandaTotal),
      artistica: getFormatedTime(artisticaTotal),
    });
    return corteGrupos;
  };

  const getData = async () => {
    let url = "rutina/" + showChannel.epi.toString();
    const api = await axiosApi();
    const result = await api.get(url);
    const { data } = await result;
    const { model, message } = data;
    if (!message.success) {
      return showMessage({
        title: "Error",
        message: data.message.message,
        okCBF: () => {},
        type: messageTypes.ERROR,
      });
    }
    setData(model);
  };
  return (
    <>
      <ListingWindow
      onMediaTraker={onMediaTraker}
        headers={
          <tr className="listing-window__row__cabecera">
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "corte" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Corte</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "orden" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Ord </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "avail" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Avail</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "tipo_publi" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">TP</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "dura_real" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Dur
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate_tmk" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Material TMK
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "mate",maxWidth:"50px" }}
            >
              <Filter
                fieldName="mate"
                display="Material"
                onChange={handleFilters}
                value={filters.get("mate")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "nombre",whiteSpace:"nowrap"}}
            >
              <Filter
                fieldName="nombre"
                display="Nombre"
                onChange={handleFilters}
                value={filters.get("nombre")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "observacion" ,width:"200px"}}
            >
              <Filter
                fieldName="observacion"
                display="Observación"
                onChange={handleFilters}
                value={filters.get("observacion")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "cliente_razon" }}
            >
              <Filter
                fieldName="cliente_razon"
                display="Cliente"
                onChange={handleFilters}
                value={filters.get("cliente_razon")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "rubro_descrip" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Rubro</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>    <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "selling_rota_descrip" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">SR</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "op" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">OP</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ncs_prp_id" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  NCS PRP
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ncs_pob_id" ,maxWidth:"50px" }}
            >
              <Filter
                fieldName="ncs_pob_id"
                display="NCS POB"
                onChange={handleFilters}
                value={filters.get("ncs_pob_id")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "id_version" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">Ver</div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "spot",maxWidth:"50px"  }}
            >
              <Filter
                fieldName="spot"
                display="Spot"
                onChange={handleFilters}
                value={filters.get("spot")}
              />
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ncs_ut_id" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  NCS UT ID
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "ncs_epi_id" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  NCS EPI
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
            <td
              className="listing-window__cell__cabecera"
              style={{ gridArea: "conci" }}
            >
              <div className="listing-window__cell__cabecera__filler">
                <div className="listing-window__cell__cabecera__top">
                  Estado
                </div>
                <div className="listing-window__cell__cabecera__bottom">
                  <wbr />
                </div>
              </div>
            </td>
          </tr>
        }
        title="Rutina"
        show={showChannel}
        rows={contenidoJSX}
        salirCBF={salirCBF}
        loadStatus={loadStatus}
        totalDuration={totalDuration}
        actions={[
          {
            label: "Expandir todos",
            onClick: () => allGroupsVisibilityToggle("expandir"),
          },
          {
            label: "Contraer todos",
            onClick: () => allGroupsVisibilityToggle("contraer"),
          },
        ]}
        channelCommands
        setShow={setShowChannel}
      />
    </>
  );
};

export default ListadoRutina;
