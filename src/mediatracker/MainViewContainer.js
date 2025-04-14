import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../commons/Breadcrumbs";
import { getPageByPath } from "../../utils/pageHelper";
import LoadingMask from "./LoadingMask";

const MainViewContainer = ({ isOpen,viewScheduling }) => {
  const { section, subsection } = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setBreadcrumbs([section, subsection]);
    setPageLoading(false);
  }, [section, subsection]);

  return (
    <Container viewScheduling={viewScheduling} isOpen={isOpen} id="main-container">
      {pageLoading && <LoadingMask />}
      <BreadcrumbsLayout>
        <Breadcrumbs breads={breadcrumbs} />
      </BreadcrumbsLayout>
      <PageContent >
        {getPageByPath(section, subsection, setPageLoading,isOpen)}
      </PageContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  background-color: #ededed;
  padding: 20px;
  width: calc(100vw - ${({ isOpen }) => (isOpen ? 300 : 58)}px);
  animation-name: ${({ isOpen }) => (isOpen ? show : hide)};
  animation-duration: 0.7s;
  animation-fill-mode: fowards;
  height: 100%;
  flex-direction: column;
  overflow: auto;
  padding-bottom: ${({viewScheduling})=> viewScheduling ?"500px" :"100px"};
`;

const PageContent = styled.div``;

const BreadcrumbsLayout = styled.div`
  display: flex;
  height: fit-content;
  width: 100%;
  padding: 15px 30px;
`;

const hide = keyframes`
    from {
        width: calc(100vw - 300px);
    }
  to {
    width: calc(100vw - 58px);
  }
`;

const show = keyframes`
    from {
      width: calc(100vw - 58px)
    }
  to {
    width: calc(100vw - 300px);
  }
`;

export default MainViewContainer;
