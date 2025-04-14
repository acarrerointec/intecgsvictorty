import ModalPortal from "../../commons/ModalWrapper";
import ModalBase from "./ModalBase";

export const ModalContextMenu = ({
  onCloseModal,
  contenido,
  title,
  show,
  width,
  subHeader,
  resizeModalButton
}) => {
  return (
    <ModalPortal>
      <ModalBase
        onClose={onCloseModal}
        width={width}
        height="530px"
        title={title}
        subHeader={subHeader}
        resizeModalButton={resizeModalButton}
      >
        {contenido}
      </ModalBase>
    </ModalPortal>
  );
};
