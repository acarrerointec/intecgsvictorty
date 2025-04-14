import { useState } from "react";
import ModalPortal from "../../../../commons/ModalWrapper";
import ModalBase from "../../../../commons/Modal";
import { ModalContent, Title } from "./styles";
import { Select } from "../../../../commons/Select";
import { ButtonStyled } from "../../../../commons/Button";
import axiosApi from "../../../../../axiosApi";
import { error, success } from "../../../../commons/snackbarConfig";
import { useSnackbar } from "react-simple-snackbar";

export const Delivery = ({
  openModal,
  data,
  rowDelivery,
  setRowDelivery,
  roaldData,
}) => {
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);
  const [toggleValueDelivery, setToggleValueDelivery] = useState(
    rowDelivery.deli_id
  );
  const [loading, setLoading] = useState(false);

  const onClickAddDelivery = async (withLoading) => {
    try {
      withLoading && setLoading(true);
      let url = `delivery`;
      const api = await axiosApi();
      const result = await api.put(url, {
        depor: rowDelivery.depor,
        progra: rowDelivery.progra,
        show: rowDelivery.show,
        media_deli_id: Number(toggleValueDelivery),
      });
      const data = await result.data;
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      roaldData();
      setRowDelivery(null);
      openSnackSuccess("Modified successfully", 10000);
    } catch (error) {
      const message =
        "An unexpected error has occurred obtaining the information";
      openSnackError(message, 600000);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <ModalPortal>
      <ModalBase
        openModal={openModal}
        onClose={() => {
          setRowDelivery(null);
        }}
        height="fit-content"
        width="600px"
      >
        <ModalContent>
          <div
            style={{
              color: "#565656",
              fontSize: "22px",
              padding: "0",
              marginBottom: "10px",
            }}
          >
            <Title style={{ color: "black", fontSize: "22px" }}>
              Delivery
              <Title
                style={{
                  color: "black",
                  fontSize: "18px",
                  fontWeight: "normal",
                  whiteSpace: "break-spaces",
                }}
              >
                {rowDelivery.codigo + " - " + rowDelivery.descripcion}
              </Title>
            </Title>
          </div>
          <Select
            options={data?.map((d) => {
              return { value: d.deli_id, label: d.descrip };
            })}
            onChange={(e) => setToggleValueDelivery(e.target.value)}
            defaultValue={rowDelivery.deli_id}
          />
          <ButtonStyled
            disabled={loading || toggleValueDelivery == rowDelivery.deli_id}
            onClick={() => onClickAddDelivery(true)}
          >
            Save
          </ButtonStyled>
        </ModalContent>
      </ModalBase>
    </ModalPortal>
  );
};
