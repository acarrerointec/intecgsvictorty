import { useSnackbar } from "react-simple-snackbar";
import { ModalDeleteCommons } from "../../../../commons/ModalDeleteCommons";
import { Text, Container } from "./styles";
import { error, success } from "../../../../commons/snackbarConfig";
import { useState } from "react";
import axiosApi from "../../../../../axiosApi";
import { getTipoNameUnified } from "./dataHelper";

const DeleteGroup = ({
  deleteDataGroup,
  setDeleteDataGroup,
  setReloadData,
}) => {
  const [openSnackError, openSnackSuccess] = useSnackbar(success, error);
  const [deleting, setDeleting] = useState(false);

  const deleteGroup = async () => {
    setDeleting(true);
    try {
      const url = `ingest/grupos_types/${deleteDataGroup.grupoId}`;
      const api = await axiosApi();
      const { data } = await api.delete(url);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("The group has been deleted", 10000);
      setReloadData((prev) => ++prev);
      setDeleting(false);
      setDeleteDataGroup(null);
    } catch (error) {
      openSnackError("An error occurred when trying to delete", 600000);
      setDeleteDataGroup(null);
      setDeleting(false);
      console.log(error);
    }
  };

  return (
    <ModalDeleteCommons
      openModal={deleteDataGroup}
      onCloseDelete={() => setDeleteDataGroup(false)}
      onClick={deleteGroup}
      loading={deleting}
    >
      <Container>
        <Text>Group: {deleteDataGroup.descrip}</Text>
        <Text>
          {"Network: "}
          {deleteDataGroup.deta
            .map((v) => getTipoNameUnified(v))
            .join(", ")}
        </Text>
      </Container>
    </ModalDeleteCommons>
  );
};

export default DeleteGroup;
