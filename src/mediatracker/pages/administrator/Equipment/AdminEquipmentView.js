import { useEffect, useState } from "react";
import Box from "../../../../commons/Box";
import { Table } from "../../../../commons/Table";
import { EquipmentFilter } from "./EquipmentFilter";
import { Container, ContainerTitle, Title } from "./styles";
import { columnsEquipment, columnsEquipmentChange } from "./config";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { ModalAdmin } from "../ModalAdmin";

const AdminEquipmentView = ({ setPageLoading }) => {
  const [filteredData, setFilteredData] = useState(null);
  const [dataEquipment, setDataEquipment] = useState([]);
  const [openSnackError] = useSnackbar(error);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [mockArrayEquipment, setMockArrayEuipment] = useState([]);
  const nameUrl = "equipos"

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  useEffect(() => {
    getDataEquipment(true);
  }, [reloadData]);

  const getDataEquipment = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `equipos`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataEquipment(data.model || []);
      setFilteredData(null);
    } catch (error) {
      const message = (
        <p style={{ color: "white", fontSize: "16px" }}>
          An unexpected error has occurred obtaining the information
        </p>
      );
      openSnackError(message, 600000);
      setLoadingData(false);
      console.log(error);
    }
  };

  const getDataSource = () => {
    if (filteredData) return filteredData;
    if (dataEquipment) return dataEquipment;
    return [];
  };

  const rowClickHandle = (d) => setSelectRowData(d);

  return (
    <Container>
      <Box>
        <EquipmentFilter
          data={dataEquipment}
          setFilteredData={setFilteredData}
          setSelectedRowIndex={setSelectedRowIndex}
          selectedRowIndex={selectedRowIndex}
          setSelectRowData={setSelectRowData}
        />
      </Box>
      <ContainerTitle>
        <Title>Equipment</Title>
        <ButtonStyled
          variant="primary"
          onClick={() => setReloadData((prev) => ++prev)}
        >
          Reload data <TfiReload style={{ marginLeft: "5px" }} />
        </ButtonStyled>
      </ContainerTitle>
      <Box>
        <Table
          data={getDataSource()}
          columns={columnsEquipment}
          dataEmpty={"There are no results with the filters applied"}
          rowClickHandler={rowClickHandle}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          selectRowData={selectRowData}
        />
      </Box>
      {selectRowData && (
        <ModalAdmin
          selectRowData = {selectRowData}
          setSelectRowData={setSelectRowData}
          title={"Equipment"}
          mockArray={mockArrayEquipment}
          setMockArray={setMockArrayEuipment}
          columnsTable={columnsEquipmentChange}
          nameUrl={nameUrl}
          setReloadData={setReloadData}
        />
      )}
    </Container>
  );
};

export { AdminEquipmentView };
