import React, { useEffect } from "react";
import styled from "styled-components";
import Loader from "../commons/Loader";

const LoadingMask = () => {
  useEffect(() => {
    document.getElementById("main-container").style.overflow = "hidden";
    return () => {
      document.getElementById("main-container").style.overflow = "auto";
    };
  }, []);
  return (
    <Layout>
      <Loader />
    </Layout>
  );
};

const Layout = styled.div`
  background-color: #ffffff94;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 62px;
  left: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default LoadingMask;
