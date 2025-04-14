import { useEffect, useMemo, useState } from "react";
import Box from "../../../../commons/Box";
import { Table } from "../../../../commons/Table";
import { Container, ContainerTitle, Title } from "./styles";
import axiosApi from "../../../../../axiosApi";
import { useSnackbar } from "react-simple-snackbar";
import { error } from "../../../../commons/snackbarConfig";
import { ButtonStyled } from "../../../../commons/Button";
import { TfiReload } from "react-icons/tfi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { CreateGroup } from "./CreateGroup";
import uuid from "react-uuid";
import { FiEdit } from "react-icons/fi";
import { columnsGroupsTypes } from "./config";
import { RiDeleteBinLine } from "react-icons/ri";
import DeleteGroup from "./DeleteGroup";

const AdminGroupsView = ({ setPageLoading }) => {
  const [dataGroupsTypes, setDataGroupsTypes] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadData, setReloadData] = useState(0);
  const [selectRowData, setSelectRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [newGroup, setNewGroup] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [deleteGroup, setDeleteGroup] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [openSnackError, closeSnackbar] = useSnackbar(error);

  const handleReloadClick = async () => {
    closeSnackbar();
    setLoadingData(true);
    await getDataFeed();
    setLoadingData(false);
  };

  useEffect(()=>{
    return ()=>closeSnackbar()
  },[])
  
  const getDataFeed = async () => {
    try {
      const api = await axiosApi();
      const url = `ingest/tiposPromoPublicidad`;
      const { data } = await api.get(url);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setDataType(data.model);
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
      console.log(error);
    }
  };

  useEffect(() => {
    getDataFeed();
  }, []);

  useEffect(() => {
    setPageLoading(loadingData);
  }, [loadingData]);

  useEffect(() => {
    getDataGroupsTypes(true);
  }, [reloadData]);

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
      setDataGroupsTypes(data.model || []);
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

  const rowClickHandle = (d) => setSelectRowData(d);

  const handlerEditGroup = (editGroup) => {
    setEditGroup(editGroup);
  };

  const handlerDeleteGroup = (deleteGroup) => {
    setDeleteGroup(deleteGroup);
  };

  const table = useMemo(() => {
    return (
      <Table
        data={dataGroupsTypes}
        columns={columnsGroupsTypes}
        dataEmpty={"There are no groups"}
        rowClickHandler={rowClickHandle}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={setSelectedRowIndex}
        selectRowData={selectRowData}
        paginate={false}
        actions={[
          {
            key: uuid(),
            icon: <FiEdit fontSize={"15px"} />,
            handler: handlerEditGroup,
            colorHover: "#61a5c3",
          },
          {
            key: uuid(),
            icon: <RiDeleteBinLine fontSize={"15px"} />,
            handler: handlerDeleteGroup,
            colorHover: "#fe1515",
          },
        ]}
      />
    );
  }, [dataGroupsTypes]);

  return (
    <Container>
      <ContainerTitle>
        <Title>Groups</Title>
        <div style={{ display: "flex", gap: "20px" }}>
          <ButtonStyled
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={() => setNewGroup(true)}
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
      <Box>{table}</Box>
      {newGroup || editGroup ? (
        <CreateGroup
          dataGroups={dataGroupsTypes}
          newGroup={newGroup}
          setNewGroup={setNewGroup}
          editGroup={editGroup}
          setEditGroup={setEditGroup}
          setReloadData={setReloadData}
          dataType={dataType}
        />
      ) : null}
      {deleteGroup && (
        <DeleteGroup
          deleteDataGroup={deleteGroup}
          setDeleteDataGroup={setDeleteGroup}
          setReloadData={setReloadData}
        />
      )}
    </Container>
  );
};

export { AdminGroupsView };
