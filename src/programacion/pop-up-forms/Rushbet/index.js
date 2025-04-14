import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FormWindow from "../formWindow/FormWindow";
import uuid from "react-uuid";
import { useGlobalState, actionTypes } from "../../../contexts/GlobalConstext";
import useMessageBox from "../../../hooks/useMessageBox";
import axiosApi from "../../../../axiosApi";
import Loader from "../../../Loader/Loader";

const Rushbet = ({ show, salirCBF, hasPermission,onMediaTraker = false }) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] =
    useMessageBox();
  const [state, dispatch] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const getDataApi = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    const api = await axiosApi();
    const res = await api.get(`getReshbet/${eventId}`);
    setLoading(false);
    const hasError = !res.data.message.success;
    if (hasError) {
      return dispatch({
        type: actionTypes.globalMessage.SHOW_MESSAGE,
        payload: {
          title: "Error",
          message: res.data.message.message,
          okCBF: () => {},
          type: messageTypes.ERROR,
        },
      });
    }
    setData(res.data.model);
  };

  useEffect(() => {
    getDataApi(show.exter_codi);
  }, []);
  
  return (
    <FormWindow
      title="Final of the Match"
      show={show}
      salirCBF={salirCBF}
      loadStatus={{ completed: true }}
      helpUrlJson={null}
      addStyle={{ maxHeight: "25rem" }}
      onMediaTraker={onMediaTraker}
    >
      {data ? (
        <Body>
          <Row>
            {data.outcomes &&
              data.outcomes.map((i) => {
                return (
                  <RowItem key={uuid()}>
                    <Label>
                      {i.participant === "" ? "Tie" : i.participant}
                    </Label>
                    <OddsNumber>{i.odds}</OddsNumber>
                  </RowItem>
                );
              })}
          </Row>
        </Body>
      ) : loading ? (
        <Content>
          <Loader />
        </Content>
      ) : (
        <Content>There is no data for the selected show</Content>
      )}
    </FormWindow>
  );
};

export default Rushbet;

const Content = styled.div`
  margin-top: 20px;
  font-size: 24px;
  color: #4c4c4c;
`;

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RowItem = styled.div`
  flex: 1;
  display: flex;
  font-size: 18px;
  gap: 10px;
  align-items: center;
  color: #565656;
  background-color: #bad4ff;
  padding: 8px;
  border-radius: 10px;
`;

const Label = styled.div`
  white-space: nowrap;
`;

const OddsNumber = styled.div`
font-weight: 500;
color:black;
}
`;
