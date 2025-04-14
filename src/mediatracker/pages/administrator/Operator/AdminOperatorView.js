import { useEffect, useState } from "react";
import Box from "../../../../commons/Box";
import { Table } from "../../../../commons/Table";
import { OperatorFilter } from "./OperatorFilter";
import { Container, ContainerTitle, Title } from "./styles";
import { columnsOperator, columnsOperatorChange } from "./config";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { ModalAdmin } from "../ModalAdmin";
import { IoMdAddCircleOutline } from "react-icons/io";
import { CreateOperator } from "./CreateOperator";
import uuid from "react-uuid";
import { FiEdit } from "react-icons/fi";

const AdminOperatorView = ({ setPageLoading }) => {
  const [filteredData, setFilteredData] = useState(null);
  const [dataOperator, setDataOperator] = useState([]);
  const [openSnackError] = useSnackbar(error);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [mockArrayOperator, setMockArrayOperator] = useState([]);
  const [newOperator, setNewOperator] = useState(false);
  const [editOperator, setEditOperator] = useState(null);

  const nameUrl = "operadores";


  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  useEffect(() => {
    getDataOperator(true);
  }, [reloadData]);

  const getDataOperator = async (withLoading, dateFrom, dateTo) => {
    try {
      withLoading && setLoadingData(true);
      const url = `operadores`;
      const api = await axiosApi();
      const { data } = await api.get(url);
      setLoadingData(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataOperator(data.model || []);
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
    if (dataOperator) return dataOperator;
    return [];
  };

  const rowClickHandle = (d) => setSelectRowData(d);

  const handlerEditOperator = (editOperator) => {
    setEditOperator(editOperator);
  };

  return (
    <Container>
      <Box>
        <OperatorFilter
          data={dataOperator}
          setFilteredData={setFilteredData}
          setSelectedRowIndex={setSelectedRowIndex}
          selectedRowIndex={selectedRowIndex}
          setSelectRowData={setSelectRowData}
        />
      </Box>
      <ContainerTitle>
        <Title>Operators</Title>
        <div style={{ display: "flex", gap: "20px" }}>
          <ButtonStyled
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={() => setNewOperator(true)}
          >
            Add <IoMdAddCircleOutline fontSize={"25px"} />
          </ButtonStyled>
          <ButtonStyled
            variant="primary"
            onClick={() => setReloadData((prev) => ++prev)}
          >
            Reload data <TfiReload style={{ marginLeft: "5px" }} />
          </ButtonStyled>
        </div>
      </ContainerTitle>
      <Box>
        <Table
          data={getDataSource()}
          columns={columnsOperator}
          dataEmpty={"There are no results with the filters applied"}
          rowClickHandler={rowClickHandle}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          selectRowData={selectRowData}
          actions={[
            {
              key: uuid(),
              icon: <FiEdit fontSize={"15px"} />,
              handler: handlerEditOperator,
            },
          ]}
        />
      </Box>
      {selectRowData && (
        <ModalAdmin
          // data={selectRowData}
          selectRowData={selectRowData}
          setSelectRowData={setSelectRowData}
          title={"Operator"}
          mockArray={mockArrayOperator}
          setMockArray={setMockArrayOperator}
          columnsTable={columnsOperatorChange}
          nameUrl={nameUrl}
          setReloadData={setReloadData}
        />
      )}
      {newOperator || editOperator ? (
        <CreateOperator
          dataOperator={dataOperator}
          newOperator={newOperator}
          setNewOperator={setNewOperator}
          editOperator={editOperator}
          setEditOperator={setEditOperator}
          setReloadData={setReloadData}
        />
      ) : null}
    </Container>
  );
};

export { AdminOperatorView };
