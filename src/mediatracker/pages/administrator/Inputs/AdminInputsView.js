import { useEffect, useState } from "react";
import Box from "../../../../commons/Box";
import { Table } from "../../../../commons/Table";
import { InputsFilter } from "./InputsFilter";
import { Container, ContainerTitle, Title } from "./styles";
import { columnsInputs, columnsInputsChange } from "./config";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { ModalAdmin } from "../ModalAdmin";

const AdminInputsView = ({ setPageLoading }) => {
  const [filteredData, setFilteredData] = useState(null);
  const [dataInputs, setDataInputs] = useState([]);
  const [openSnackError] = useSnackbar(error);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const nameUrl = "vinculos"

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  useEffect(() => {
    getDataInputs(true);
  }, [reloadData]);

  const getDataInputs = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `vinculos`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataInputs(data.model || []);
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
    if (dataInputs) return dataInputs;
    return [];
  };

  const rowClickHandle = (d) => setSelectRowData(d);

  return (
    <Container>
      <Box>
        <InputsFilter
          data={dataInputs}
          setFilteredData={setFilteredData}
          setSelectedRowIndex={setSelectedRowIndex}
          selectedRowIndex={selectedRowIndex}
          setSelectRowData={setSelectRowData}
        />
      </Box>
      <ContainerTitle>
        <Title>Inputs</Title>
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
          columns={columnsInputs}
          dataEmpty={"There are no results with the filters applied"}
          rowClickHandler={rowClickHandle}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          selectRowData={selectRowData}
          pageSizeTable={10}
        />
      </Box>
      {selectRowData && (
        <ModalAdmin
          // data={selectRowData}
          selectRowData = {selectRowData}
          setSelectRowData={setSelectRowData}
          title={"Inputs"}
          columnsTable={columnsInputsChange}
          nameUrl={nameUrl}
          setReloadData={setReloadData}
        />
      )}
    </Container>
  );
};

export { AdminInputsView };
