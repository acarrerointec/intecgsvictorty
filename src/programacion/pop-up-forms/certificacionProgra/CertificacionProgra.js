import React, { useState, useEffect } from "react";
import "./CertificacionProgra.scss";
import FormWindow from "../formWindow/FormWindow";
import axiosApi from "../../../../axiosApi";
import {
    useGlobalState,
    actionTypes,
    messageTypes,
} from "../../../contexts/GlobalConstext";
import Loader from "../../../Loader/Loader";
import moment from "moment";
import ReactExport from "react-data-export";
import { headerStyles, rowStyles } from "./excelStyles";
import ReportViewer from "./ReportViewer";
//import ExportPDF from "./CertificacionPdf";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const certificacionProgra = {
    emi_desde: "",
    emi_hasta: "",
};

const headers = [
    {
        label: "Canal",
        value: "canal",
        width: 40,
    },
    {
        label: "Señal",
        value: "senial",
        width: 40,
    },
    {
        label: "Tipo",
        value: "tipo",
        width: 30,
    },
    {
        label: "Descripción",
        value: "descripcion",
        width: 220,
    },
    {
        label: "Duración",
        value: "duracion",
        width: 50,
    },
    {
        label: "Emisión",
        value: "emision",
        width: 140,
    },
    {
        label: "Episodio",
        value: "episodio",
        width: 70,
    },
    {
        label: "Inicio",
        value: "fecha_Inicio",
        width: 140,
    },
    {
        label: "Fin",
        value: "fecha_Fin",
        width: 140,
    },
    {
        label: "Reporte",
        value: "reporte",
        width: 310,
    },
];

const CertificacionProgra = ({ show, salirCBF, hasPermission }) => {
    const [state, dispatch] = useGlobalState();
    const [loadStatus, setLoadStatus] = useState({ completed: false });
    const [formData, setData] = useState(certificacionProgra);
    const [sending, setSending] = useState(false);
    const [channelList, setChannelList] = useState(null);
    const [paisesList, setPaisesList] = useState([]);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [dateError, setDateError] = useState(false);
    const [paiseSeleccionado, setPaisSeleccionado] = useState(null)
    // estados para reporte
    const [makingReport, setMakingReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [multiDataSet, setMultiDataSet] = useState(null);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        let url = `combos/canal`;
        const api = await axiosApi()
        const { data } = await api.get(url);
        const resPaises = await api.get('paises');

        const hasError = !data.message.success || !resPaises.data.message.success;
        if (hasError) {
            return dispatch({
                type: actionTypes.globalMessage.SHOW_MESSAGE,
                payload: {
                    title: "Error",
                    message: data.message.message || !resPaises.data.message.message,
                    okCBF: () => {},
                    type: messageTypes.ERROR,
                },
            });
        }
        setChannelList(data.model);
        if(resPaises.data.model && resPaises.data.model.length > 0) {
            setPaisSeleccionado(resPaises.data.model[0].pais);
            setPaisesList(resPaises.data.model);
        }
        setLoadStatus({ completed: true });
    };

    const getReportData = async () => {
        if(!hasPermission) return;
        setMakingReport(true);
        const formatedChannels = selectedChannels.map((channel) => channel.trim());
        const formatedData = {
            ...formData,
            canales: formatedChannels.join(","),
        };
        let url = `/reporte-programacion-tecnico/${formatedData.canales}/${formatedData.emi_desde}/${formatedData.emi_hasta}/${paiseSeleccionado}`;
        const api = await axiosApi()
        const { data } = await api.get(url);
        setMakingReport(false);

        const hasError = !data.message.success;
        if (hasError) {
            setReportData(null);
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
        setReportData(data.model);
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
            <div className={`certificacion-progra__row ${className}`}>
                <div className="certificacion-progra__tag">{tag}</div>
                <div className="certificacion-progra__data">{data}</div>
            </div>
        );
    }

    const validarObligatorios = () =>
        formData &&
        formData.emi_desde !== "" &&
        formData.emi_hasta !== "" &&
        selectedChannels.length > 0 &&
        !dateError &&
        paiseSeleccionado;

    useEffect(() => {
        if (multiDataSet) {
            setMultiDataSet(null);
        }
    }, [multiDataSet]);

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

    const processColumns = () => {
        const arr = [];
        headers.forEach((header) => {
            const obj = {
                title: header.label,
                width: { wpx: header.width },
                style: headerStyles(),
            };
            arr.push(obj);
        });
        return arr;
    };

    const processTableData = (data) => {
        const arr = [];
        data.forEach((d) => {
            const rowArr = [];
            headers.forEach((header) => {
                const obj = {
                    value: d[header.value],
                    style: rowStyles(),
                };
                rowArr.push(obj);
            });
            arr.push(rowArr);
        });
        return arr;
    };

    const exportExcelFile = () => {
        setMultiDataSet([
            {
                columns: processColumns(),
                data: processTableData(reportData),
            },
        ]);
    };

    const formLayout = () => {
        return (
            <div className="certificacion-progra__wrapper">
                <div className="certificacion-progra__form">
                    <div className="certificacion-progra__form-body">
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
                        {row(
                            'Pais',
                            <select disabled={paisesList.length === 0} onChange={(e) => setPaisSeleccionado(e.target.value)}>
                                {paisesList.map((op)=>{
                                    return <option key={op.pais} value={op.pais}>{op.descrip}</option>
                                })}
                            </select>
                        )}
                        <div className="certificacion-progra__row-buttons">
                            {multiDataSet && (
                                <ExcelFile
                                    filename="Certificación de programación"
                                    hideElement
                                    element={
                                        <div className="button-container">
                                            <div className={`button shadow-left-down`}>
                                                Exportar Excel
                                            </div>
                                        </div>
                                    }
                                >
                                    <ExcelSheet dataSet={multiDataSet} name="Programas" />
                                </ExcelFile>
                            )}
                            <div className="button-container">
                                <div
                                    className={`button shadow-left-down ${
                                        validarObligatorios() && hasPermission ? "" : "disabled"
                                    }`}
                                    onClick={
                                        !makingReport && validarObligatorios()
                                            ? getReportData
                                            : () => {}
                                    }
                                >
                                    {makingReport ? <Loader /> : "Generar reporte"}
                                </div>
                            </div>
                            <div className="button-container">
                                <div
                                    className={`button shadow-left-down ${
                                        !makingReport && reportData ? "" : "disabled"
                                    }`}
                                    onClick={
                                        reportData && !makingReport ? exportExcelFile : () => {}
                                    }
                                >
                                    Exportar Excel
                                </div>
                            </div>
                        </div>
                        {reportData && (
                            <div className="certificacion-bloques__area">
                                <ReportViewer data={reportData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <FormWindow
            title="Certificación de programación"
            show={show}
            salirCBF={salirCBF}
            loadStatus={loadStatus}
            addStyle={{ maxHeight: "53.1rem" }}
        >
            {formLayout()}
        </FormWindow>
    );
};

export default CertificacionProgra;
