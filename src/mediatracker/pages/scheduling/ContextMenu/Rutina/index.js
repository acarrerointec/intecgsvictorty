import { useEffect, useState } from "react";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";
import { columnsTableRutina } from "../../config";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { ButtonStyled } from "../../../../../commons/Button";
import { TableScheduling } from "../../TableScheduling";
import {
  CointeinerTable,
  Container,
  ContainerButtons,
  ContainerRowTable,
  ContainerInfo,
  FlexGroup,
  FlexItem,
  ViewRutina,
  ConteinerText,
  ContainerRows,
  RowInfo,
  SpanInfo,
} from "./styles";
import { ModalContextMenu } from "../../../../modals/ModalContextMenu";
import axiosApi from "../../../../../../axiosApi";
import useMessageBox from "../../../../../hooks/useMessageBox";
import Loader from "../../../../../commons/Loader";
import { LoadingMask } from "../../../tasks/Recording/ReportePlaylist/styles";
import Box from "../../../../../commons/Box";
import { nextPrevious } from "../../../../../../utils/helperNextPrevious";

const Rutina = ({ dataTable,show, onCloseModal }) => {
  const [totalDuration, setTotalDuration] = useState({
    tanda: 0,
    artistica: 0,
  });
  const [showChannel, setShowChannel] = useState(show);
  const [groupsOpen, setGroupsOpen] = useState([]);
  const [dataRutina, setDataRutina] = useState(null);
  const [sortedData, setSortedData] = useState(null);
  const [showMessage, messageTypes] = useMessageBox();
  const [objNextPrevious,setObjNextPrevious] = useState(null)
  const [loading, setLoading] = useState(false);

  const informacionAMostrar=[showChannel?.fecha_hora_fin,`${showChannel?.canal}-${showChannel?.senial}`,`${showChannel?.iniHHMM}-${showChannel?.finHHMM}`,showChannel?.progra_codi]
  const getFormatedTime = (time) => {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    return `${minutes}M ${seconds}"`;
  };
  const allGroupsVisibilityToggle = (value) => {
    if (!sortedData) return;
    const dataValue =
      value === "expandir"
        ? getGroupedTime(dataRutina).map((group) => group.groupId)
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

  useEffect(() => {
    if (showChannel.epi) {
      const af = async () => {
        await getData();
      };
      af();
    }
    return () => setLoading(false);
  }, [showChannel.epi]);

  const getData = async () => {
    setLoading(true);
    let url = "rutina/" + showChannel?.epi?.toString();
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
    setDataRutina(model);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    if (!dataRutina) return;
    const groupedData = getGroupedTime(dataRutina);
    if (mounted && dataRutina) {
      groupedData.forEach((group) => {
        group.data[0].nombre =
          group.groupDescrip +
          " N°" +
          group.groupId +
          " Total duration: " +
          getFormatedTime(group.totalCount);
        group.data[0].corte = group.groupId;
      });
      setSortedData(groupedData);
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRutina, groupsOpen]);

  const ConteinerTitleRow = ({ data }) => {
    const ArrowIcon = ({ showRow }) =>
      showRow ? (
        <IoIosArrowDropupCircle fontSize="25px" color="#61A5C3" />
      ) : (
        <IoIosArrowDropdownCircle fontSize="25px" color="#61A5C3" />
      );

    return (
      <Container
        onClick={() => {
          handleRowVisibility(data.data[0].corte);
        }}
      >
        <FlexGroup>
          <FlexItem>Cut: {data?.data[0]?.corte}</FlexItem>
          <div>|</div>
          <div>{data?.data[0]?.nombre}</div>
        </FlexGroup>
        <ArrowIcon showRow={data.showRow} />
      </Container>
    );
  };

useEffect(() => {
 if (showChannel, dataTable) {
   setObjNextPrevious(
     nextPrevious(
      dataTable?.map((d) => d.data_menu),
       showChannel,
       "epi"
     )
   );
 }
}, [showChannel]);

  const contenidoRutina = () => {
    return (
      <ViewRutina>
        <ContainerInfo>
          <div>
            <Box boxShadow={"0px 0px 6px 0px rgba(0,0,0,0.39)"}>
              <ContainerRows>
                {informacionAMostrar.map((i) => (
                  <RowInfo key={i} isBorderRight>
                    {i}
                  </RowInfo>
                ))}
                <RowInfo isBorderRight>
                  Tanda: <SpanInfo>{totalDuration.tanda}</SpanInfo>
                </RowInfo>
                <RowInfo>
                  Artistica: <SpanInfo>{totalDuration.artistica}</SpanInfo>
                </RowInfo>
              </ContainerRows>
            </Box>
          </div>
          <ContainerButtons>
            <ButtonStyled
              variant="primary"
              onClick={() => allGroupsVisibilityToggle("expandir")}
            >
              Expand all <MdExpandMore />
            </ButtonStyled>
            <ButtonStyled
              variant="primary"
              onClick={() => allGroupsVisibilityToggle("contraer")}
            >
              Collapse all <MdExpandLess />
            </ButtonStyled>
            <ButtonStyled
              disabled={!objNextPrevious?.previous}
              onClick={() => setShowChannel(objNextPrevious?.previous)}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Previous
            </ButtonStyled>
            <ButtonStyled
              onClick={() => setShowChannel(objNextPrevious?.next)}
              disabled={!objNextPrevious?.next}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              Next
            </ButtonStyled>
          </ContainerButtons>
        </ContainerInfo>
        <CointeinerTable>
          {loading && (
            <LoadingMask>
              <Loader />
            </LoadingMask>
          )}
          {!sortedData ||
            loading ||
            (sortedData.length === 0 && (
              <ConteinerText>
                There are no results for the search.
              </ConteinerText>
            ))}
          {sortedData?.map((data) => {
            //el primer elemento de data siempre es el nombre
            return (
              <ContainerRowTable isSelected  key={data?.data[0]?.corte}>
                <ConteinerTitleRow data={data} />
                {data?.showRow && (
                  <div style={{ overflow: "auto" }} key={data.data[0].corte}>
                    <TableScheduling
                      paginate={false}
                      columns={columnsTableRutina}
                      data={data.data.splice(1) || []}
                      dataEmpty={"There are no results for the search."}
                    />
                  </div>
                )}
              </ContainerRowTable>
            );
          })}
        </CointeinerTable>
      </ViewRutina>
    );
  };

  return (
    <>
      <ModalContextMenu
        onCloseModal={onCloseModal}
        contenido={contenidoRutina()}
        title={"Rutina"}
        width={"96vw"}
        resizeModalButton
      />
    </>
  );
};

export { Rutina };
