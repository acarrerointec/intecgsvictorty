import React, { useState, useEffect } from "react";
import "./VersionadoMasivo.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import {
    useGlobalState,
    actionTypes,
    messageTypes,
} from "../../../contexts/GlobalConstext";
import Loader from "../../../Loader/Loader";
import moment from "moment";

const versionadoMasivo = {
    emi_desde: "",
    emi_hasta: "",
};

const VersionadoMasivo = ({ show, salirCBF, hasPermission }) => {
    const [state, dispatch] = useGlobalState();
    const [loadStatus, setLoadStatus] = useState({ completed: false });
    const [formData, setData] = useState(versionadoMasivo);
    const [sending, setSending] = useState(false);
    const [channelList, setChannelList] = useState(null);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [dateError, setDateError] = useState(false);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        let url = `combos/canal`;
        const api = await axiosApi()
        const { data } = await api.get(url);

        const hasError = !data.message.success;
        if (hasError) {
            return dispatch({
                type: actionTypes.globalMessage.SHOW_MESSAGE,
                payload: {
                    title: "Error",
                    message: data.message.message,
                    okCBF: () => {},
                    type: messageTypes.ERROR,
                },
            });
        }
        setChannelList(data.model);
        setLoadStatus({ completed: true });
    };

    useEffect(() => {
        validateDate();
    }, [formData]);

    const validateDate = async () => {
        if (formData.emi_hasta === "" || formData.emi_desde === "") return;
        const res = await moment(formData.emi_hasta).isSameOrAfter(
            formData.emi_desde,
            "day"
        );
        setDateError(!res);
    };

    function row(tag, data, className = "") {
        return (
            <div className={`versionado-masivo__row ${className}`}>
                <div className="versionado-masivo__tag">{tag}</div>
                <div className="versionado-masivo__data">{data}</div>
            </div>
        );
    }

    const validarObligatorios = () =>
        formData &&
        formData.emi_desde !== "" &&
        formData.emi_hasta !== "" &&
        selectedChannels.length > 0 &&
        !dateError;

    const handleSaveClick = async (e) => {
        if(!hasPermission) return;
        setSending(true);
        let url = `media-versiones`;
        const formatedData = {
            ...formData,
            canales: selectedChannels.join(","),
        };
        const api = await axiosApi()
        const { data } = await api.put(url, formatedData);
        setSending(false);

        const hasError = !data.message.success;
        if (hasError) {
            return dispatch({
                type: actionTypes.globalMessage.SHOW_MESSAGE,
                payload: {
                    title: "Error",
                    message: data.message.message,
                    okCBF: () => {},
                    type: messageTypes.ERROR,
                },
            });
        }
        dispatch({
            type: actionTypes.globalMessage.SHOW_MESSAGE,
            payload: {
                title: "Versionado masivo",
                message: "Se aplicaron los cambios a los canales seleccionados.",
                okCBF: salirCBF,
                type: messageTypes.INFO,
            },
        });
    };

    const handleChange = (e) => {
        const newId = e.target.value;
        const exist = selectedChannels.some((channelId) => channelId === newId);
        if (exist) {
            return setSelectedChannels((prev) => prev.filter((id) => newId !== id));
        }
        setSelectedChannels((prev) => [...prev, newId]);
    };

    const ChannelList = () => {
        return (
            <div className="channels-container">
                {channelList &&
                    channelList.map((c) => {
                        return (
                            <div key={c.codi}>
                                <input
                                    type="checkbox"
                                    name={c.codi}
                                    id={c.codi}
                                    value={c.codi}
                                    checked={selectedChannels.some(
                                        (channelId) => channelId === c.codi
                                    )}
                                    onChange={handleChange}
                                />
                                <label htmlFor={c.codi}>{c.descrip}</label>
                            </div>
                        );
                    })}
            </div>
        );
    };

    const onChangeDate = async (e, type) => {
        e.persist();
        setData((prev) => ({ ...prev, [type]: e.target.value }));
    };

    const formLayout = () => {
        return (
            <div className="versionado-masivo__wrapper">
                <div className="versionado-masivo__form">
                    <div className="versionado-masivo__form-body">
                        {row("Canales", <ChannelList />)}
                        {row(
                            "Desde",
                            <input
                                type="date"
                                id="desde"
                                value={formData.emi_desde}
                                onChange={(e) => onChangeDate(e, "emi_desde")}
                            />
                        )}
                        {row(
                            "Hasta",
                            <>
                                <input
                                    type="date"
                                    id="hasta"
                                    value={formData.emi_hasta}
                                    onChange={(e) => onChangeDate(e, "emi_hasta")}
                                />
                                {dateError && (
                                    <div className="date-error">
                                        Error: La fecha "Hasta" debe ser posterior a la fecha
                                        "Desde"
                                    </div>
                                )}
                            </>
                        )}
                        <div className="versionado-masivo__row-buttons">
                            <div>
                                <div
                                    className={`button shadow-left-down ${
                                        validarObligatorios() && hasPermission ? "" : "disabled"
                                    }`}
                                    onClick={
                                        !sending && validarObligatorios()
                                            ? handleSaveClick
                                            : () => {}
                                    }
                                >
                                    {sending ? <Loader /> : "GUARDAR"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <FormWindow
            title="Versionado masivo"
            show={show}
            salirCBF={salirCBF}
            loadStatus={loadStatus}
            addStyle={{ maxHeight: "53.1rem" }}
        >
            {formLayout()}
        </FormWindow>
    );
};

export default VersionadoMasivo;
