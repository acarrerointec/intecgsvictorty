import Loader from "../../../../commons/Loader";
import ModalBase from "../../../../commons/Modal";
import ModalPortal from "../../../../commons/ModalWrapper";
import { Body, ContentLayout, Footer, Header, LoadingMask } from "../styles";

const NewFormWindow = ({
  children,
  title,
  buttons,
  isOpen,
  onClose,
  loading,
  isBlur,
  maxHeight,
  minWidth,
  width
}) => {
  return (
    <ModalPortal isBlur={isBlur}>
      {/* en lo anteriores estaba { maxHeight: "53.1rem" } */}
      <ModalBase
        minWidth={minWidth ? minWidth : "600px"}
        withoutOutsideClose
        openModal={isOpen}
        onClose={onClose}
        height="fit-content"
        width={width ? width : "fit-content"}
        maxHeight={maxHeight}
      >
        <ContentLayout>
          {loading && (
            <LoadingMask>
              <Loader />
            </LoadingMask>
          )}
          <Header>{title}</Header>
          <Body>{children}</Body>
          <Footer>{buttons}</Footer>
        </ContentLayout>
      </ModalBase>
    </ModalPortal>
  );
};

export default NewFormWindow;
