import { useEffect, useState } from "react";
import { useSnackbar } from "react-simple-snackbar";
import { error, success } from "../commons/snackbarConfig";
import axiosApi from "../../axiosApi";

export const useOrderColumns = (defaultTotalColumns, pageId) => {
  const [columnsTableOrdered, setColumnsTableOrdered] = useState([]);
  const [columnsOrdered, setColumnsOrdered] = useState([]);
  const [columnsOrderedID, setColumnsOrderedID] = useState(null);
  const [openSnackError] = useSnackbar(error);
  const [openSnackSuccess] = useSnackbar(success);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const arrTemp = [
      ...defaultTotalColumns.filter((c) => !c.hasOwnProperty("Header")),
    ];
    columnsOrdered.forEach((co) => {
      const value = defaultTotalColumns.filter((c) => c.Header == co)[0];
      if (value) {
        arrTemp.push(value);
      }
    });
    setColumnsTableOrdered(arrTemp);
  }, [columnsOrdered]);

  const getOrderColumnsData = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const api = await axiosApi();
      const url = `preferencesUser/table/${pageId}`;
      const { data } = await api.get(url);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      setLoading(false);
      const latestData = data.model.length - 1;
      if (data && data.model.length > 0) {
        setColumnsOrderedID(data.model[latestData].prefe_colu_id);
        setColumnsOrdered(data.model[latestData].deta.map((d) => d.columnName));
      } else {
        setColumnsOrdered(
          defaultTotalColumns
            ?.filter((c) => c.hasOwnProperty("Header"))
            .map((el) => el.Header)
        );
      }
      setLoading(false);
    } catch (error) {
      openSnackError(
        "An unexpected error has occurred obtaining the information",
        600000
      );
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderColumnsData();
  }, []);

  const postOrderColumnsData = async (items, onSuccess, onError) => {
    try {
      setLoading(true);
      const url = `preferencesUser/table`;
      const api = await axiosApi();
      const metodo = columnsOrderedID ? "put" : "post";
      const { data } = await api[metodo](url, {
        deta: items.map((i) => ({
          columnName: i,
        })),
        pantalla: pageId,
        prefe_colu_id: columnsOrderedID,
        usua: "",
      });
      setLoading(false);
      if (!data.message.success) {
        return openSnackError(data.message.message, 600000);
      }
      openSnackSuccess("Configuration has been saved successfully");
      setColumnsOrdered(items);
      getOrderColumnsData();
      onSuccess();
    } catch (error) {
      openSnackError(
        "An unexpected error has occurred obtaining the information",
        600000
      );
      setLoading(false);
      console.log(error);
    }
  };

  return {
    columnsTableOrdered,
    columnsOrdered,
    loading,
    postOrderColumnsData,
  };
};
