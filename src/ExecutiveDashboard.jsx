/**
 * COMPONENTE: ExecutiveDashboard
 * DESCRIPCIÓN: Dashboard ejecutivo para análisis de programación televisiva
 * FUNCIONALIDADES PRINCIPALES:
 * - Visualización de métricas clave
 * - Filtrado avanzado por fecha, red, tipo de programa, etc.
 * - Gráficos interactivos de distribución horaria y por redes
 * - Tabla resumen y vista detallada de programas
 * - Detección de programas duplicados
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Row, Col, Card, Form,
  Button, Badge, Accordion, Stack, Collapse, Table, Tabs, Tab
} from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';
import {
  FiDownload, FiRefreshCw, FiEye, FiEyeOff, FiSearch,
  FiCalendar, FiSliders, FiMonitor, FiClock,
  FiTv, FiFilm, FiType, FiInfo, FiBarChart2, FiCopy, FiX, FiCheck,
  FiXCircle, FiAirplay, FiUpload, FiFile
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';
import data from './data/programacion01al29abril.json';
import './ExecutiveDashboard.css';

/**
 * Convierte una fecha en formato `DD-MM-YYYY` a un objeto `Date`.
 * Si la conversión falla, devuelve la fecha actual.
 * @param {string} dateString - Fecha en formato `DD-MM-YYYY`.
 * @returns {Date} - Objeto `Date` correspondiente o la fecha actual si ocurre un error.
 */
const processDate = (dateString) => {
  try {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  } catch (error) {
    console.error('Error procesando fecha:', dateString);
    return new Date();
  }
};

/**
 * Filtra los datos según los filtros aplicados y el rango de fechas.
 * @param {Array} data - Lista de programas a filtrar.
 * @param {Object} filters - Filtros aplicados (feed, network, status, ltsa, search, showCode).
 * @param {Date} rangeStart - Fecha de inicio del rango.
 * @param {Date} rangeEnd - Fecha de fin del rango.
 * @returns {Array} - Lista de programas filtrados.
 */
const filterData = (data, filters, rangeStart, rangeEnd) => {
  return data.filter(item => {
    const matchesDate = item.start >= rangeStart && item.start <= rangeEnd;

    const matchesSearch = filters.search
      ? searchMatches(item, filters.search)
      : true;

    const matchesNetwork = filters.network
      ? item.Network?.toString() === filters.network
      : true;

    const matchesShowCode = filters.showCode
      ? item["Show Code"]?.toString().toLowerCase() === filters.showCode.toLowerCase()
      : true;

    const matchesFeed = filters.feed
      ? item.Feed?.toString() === filters.feed
      : true;

    const matchesStatus = filters.status
      ? item.Status?.includes(filters.status)
      : true;

    const matchesLTSA = filters.ltsa
      ? item.LTSA?.toString() === filters.ltsa
      : true;

    const isSingleBroadcast = filters.ltsa === 'single'
      ? data.filter(d => d["Show Code"] === item["Show Code"]).length === 1
      : true;


    return (
      matchesDate &&
      matchesSearch &&
      matchesNetwork &&
      matchesShowCode &&
      matchesFeed &&
      matchesStatus &&
      matchesLTSA &&
      isSingleBroadcast
    );
  });
};

/**
 * Verifica si un programa coincide con un término de búsqueda.
 * @param {Object} program - Programa a verificar.
 * @param {string} searchTerm - Término de búsqueda.
 * @returns {boolean} - Verdadero si el programa coincide con el término de búsqueda.
 */
const searchMatches = (program, searchTerm) => {
  if (!searchTerm) return true;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return (
    program["Episode Title"]?.toLowerCase().includes(lowerSearchTerm) ||
    program["Show Code"]?.toLowerCase().includes(lowerSearchTerm) ||
    program.Network?.toLowerCase().includes(lowerSearchTerm) ||
    program.Feed?.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Componente personalizado para mostrar información en los tooltips de los gráficos.
 * @param {boolean} active - Indica si el tooltip está activo.
 * @param {Array} payload - Datos del tooltip.
 * @param {string} label - Etiqueta del tooltip.
 * @returns {JSX.Element|null} - Contenido del tooltip o `null` si no está activo.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataItem = payload[0]?.payload || {};
  const isNetworkChart = 'name' in dataItem && 'count' in dataItem;
  const isTimeSlotChart = 'hour' in dataItem;
  const isPieChart = payload[0]?.type === 'pie';

  return (
    <div className="custom-tooltip">
      <div className="tooltip-header">
        {isNetworkChart && <FiTv className="me-2" />}
        {isTimeSlotChart && <FiClock className="me-2" />}
        {isNetworkChart ? dataItem.name :
          isTimeSlotChart ? dataItem.hour :
            isPieChart ? payload[0]?.name :
              label}
      </div>
      <div className="tooltip-body">
        {isNetworkChart && (
          <div style={{ color: payload[0].color }}>
            Programas: <strong>{dataItem.count}</strong>
          </div>
        )}
        {isTimeSlotChart && payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </div>
        ))}
        {isPieChart && (
          <div style={{ color: payload[0].color }}>
            {payload[0]?.name}: <strong>{payload[0]?.value}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente para mostrar información detallada de un programa.
 * @param {Object} program - Datos del programa.
 * @param {boolean} isDuplicate - Indica si el programa está duplicado.
 * @param {Array} networks - Lista de redes asociadas al programa.
 * @returns {JSX.Element} - Tarjeta con la información del programa.
 */
const ProgramCard = ({ program, isDuplicate, networks }) => (
  <Card className={`program-card h-100 ${isDuplicate ? 'duplicate-program' : ''}`}>
    <Card.Body>
      <Stack gap={2}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="program-title">
              {program["Episode Title"]}
              <Badge bg="dark" className="ms-2">{program["Show Code"]}</Badge>
              {isDuplicate && (
                <Badge bg="danger" className="ms-2">
                  <FiCopy className="me-1" />
                  {networks.length > 1 ? `${networks.length} redes` : 'Duplicado'}
                </Badge>
              )}
            </Card.Title>
            <div className="program-meta">
              <small className="text-muted">
                <FiClock className="me-1" />
                {program["Start time redondeo"]} - {program.Duration}
              </small>
            </div>
          </div>
          <Badge pill bg={program.LTSA === 'Live' ? 'danger' : 'warning'} className="text-capitalize">
            {program.LTSA}
          </Badge>
        </div>
        <div className="program-details">
          <Stack direction="horizontal" gap={2} className="flex-wrap">
            <div className="detail-item">
              <FiTv className="me-1" />
              <span>{program.Network}</span>
            </div>
            <div className="detail-item">
              <FiFilm className="me-1" />
              <span>{program.Feed}</span>
            </div>
            <div className="detail-item">
              <FiInfo className="me-1" />
              <span>{program.Status?.split('- ')[1] || program.Status}</span>
            </div>
          </Stack>
        </div>
        <div className="program-footer">
          <Stack direction="horizontal" className="justify-content-between">
            <Badge bg={program.EMISION === 'PLATAFORMA' ? 'primary' : 'dark'}>
              {program.EMISION}
            </Badge>
            <small className="text-muted">
              {program["Start Date"]
                ? new Date(program["Start Date"].split('-').reverse().join('-')).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short'
                })
                : 'Fecha inválida'}
            </small>
          </Stack>
        </div>
      </Stack>
    </Card.Body>
  </Card>
);

ProgramCard.propTypes = {
  program: PropTypes.object.isRequired,
  isDuplicate: PropTypes.bool,
  networks: PropTypes.arrayOf(PropTypes.string)
};

ProgramCard.defaultProps = {
  isDuplicate: false,
  networks: []
};

/**
 * Componente para mostrar un control de filtro con etiqueta e ícono.
 * @param {string} label - Etiqueta del filtro.
 * @param {JSX.Element} icon - Ícono del filtro.
 * @param {JSX.Element} children - Contenido del filtro.
 * @returns {JSX.Element} - Control de filtro.
 */
const FilterControl = ({ label, icon, children }) => (
  <div className="filter-control">
    <div className="filter-label">
      {icon} {label}
    </div>
    {children}
  </div>
);

FilterControl.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired
};

const ExecutiveDashboard = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const [filters, setFilters] = useState({
    feed: '',
    network: '',
    status: '',
    ltsa: '',
    search: '',
    showCode: ''
  });
  const [tempDateRange, setTempDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  // Estado para almacenar los datos subidos
  const [uploadedData, setUploadedData] = useState(data); // Usar los datos iniciales por defecto
  const [fileName, setFileName] = useState('programacion01al29abril.json'); // Nombre del archivo actual

  const toggleFilters = () => setShowFilters(!showFilters);

  const { filteredData, timeSlots, duplicates, networkDistribution, showCodeNetworkMap } = useMemo(() => {
    setIsFiltering(true);
    const processed = uploadedData
      .map(item => ({
        ...item,
        start: processDate(item["Start Date"]),
        end: processDate(item["End Date"])
      }))
      .filter(item => !isNaN(item.start.getTime()) && !isNaN(item.end.getTime()));

    const rangeStart = new Date(dateRange[0].startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange[0].endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    const filtered = filterData(processed, filters, rangeStart, rangeEnd);

    // Calcular programas únicos por network
    const uniqueProgramsByNetwork = {};
    const showCodeNetworkMap = {};

    // Mapeamos todos los show codes a sus networks
    processed.forEach(program => {
      if (!showCodeNetworkMap[program["Show Code"]]) {
        showCodeNetworkMap[program["Show Code"]] = new Set();
      }
      showCodeNetworkMap[program["Show Code"]].add(program.Network);
    });

    // Para el filtro 'single', contamos solo los programas que aparecen en una sola network
    if (filters.ltsa === 'single') {
      filtered.forEach(program => {
        const networksForShow = showCodeNetworkMap[program["Show Code"]];
        if (networksForShow && networksForShow.size === 1) {
          const network = Array.from(networksForShow)[0];
          uniqueProgramsByNetwork[network] = (uniqueProgramsByNetwork[network] || 0) + 1;
        }
      });
    }

    const programMap = new Map();
    filtered.forEach(program => {
      const key = `${program["Show Code"]}-${program["Start Date"]}-${program["Start Time"]}`;
      const existing = programMap.get(key) || { count: 0, networks: new Set() };
      programMap.set(key, {
        count: existing.count + 1,
        networks: existing.networks.add(program.Network)
      });
    });

    const slots = Array(8).fill().map((_, i) => ({
      hour: `${i * 3}:00 - ${i * 3 + 3}:00`,
      Live: 0,
      Tape: 0,
      Short: 0,
      originalHour: i * 3
    }));

    filtered.forEach(item => {
      const hour = parseInt(item["Start Time"]?.split(':')[0] || 0);
      const slotIndex = slots.findIndex(slot =>
        hour >= slot.originalHour && hour < slot.originalHour + 3
      );
      if (slotIndex !== -1) {
        const type = item.LTSA === 'Short Turnaround' ? 'Short' : item.LTSA;
        slots[slotIndex][type]++;
      }
    });

    const networkData = filters.ltsa === 'single'
      ? uniqueProgramsByNetwork
      : filtered.reduce((acc, program) => {
        const network = program.Network;
        acc[network] = (acc[network] || 0) + 1;
        return acc;
      }, {});

    const networkDistribution = filters.network
      ? [{ name: filters.network, count: filtered.length }]
      : Object.entries(networkData)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    setIsFiltering(false);
    return {
      filteredData: filtered,
      timeSlots: slots,
      duplicates: programMap,
      networkDistribution,
      showCodeNetworkMap
    };
  }, [data, dateRange, filters]);

  const metrics = useMemo(() => ({
    total: filteredData.length,
    live: filteredData.filter(d => d.LTSA === 'Live').length,
    tape: filteredData.filter(d => d.LTSA === 'Tape').length,
    short: filteredData.filter(d => d.LTSA === 'Short Turnaround').length,
    platform: filteredData.filter(d => d.EMISION === 'PLATAFORMA').length,
    linear: filteredData.filter(d => d.EMISION === 'LINEAL').length,
    duplicates: Array.from(duplicates.values()).filter(v => v.count > 1).length,
    programsSingles: showCodeNetworkMap
      ? Object.values(showCodeNetworkMap).filter(networks => networks.size === 1).length
      : 0
  }), [filteredData, duplicates, showCodeNetworkMap]);

  const handleBarClick = useCallback((data, index) => {
    if (!timeSlots || index === undefined) return;
    const clickedSlot = timeSlots[index];
    setSelectedSlot(prev => prev?.hour === clickedSlot.hour ? null : clickedSlot);
  }, [timeSlots]);

  const filteredPrograms = useMemo(() => {
    if (!selectedSlot) return filteredData;
    const [startHour] = selectedSlot.hour.split(' - ')[0].split(':');
    return filteredData.filter(program => {
      const programHour = parseInt(program["Start Time"]?.split(':')[0] || 0);
      return programHour >= startHour && programHour < startHour + 3;
    });
  }, [filteredData, selectedSlot]);

  const handleApplyDate = () => {
    setDateRange([...tempDateRange]);
  };

  /**
   * Formatea un rango de fechas para mostrarlo en el encabezado.
   * @param {Date} start - Fecha de inicio.
   * @param {Date} end - Fecha de fin.
   * @returns {string} - Rango de fechas formateado.
   */
  const formatDateRange = useCallback((start, end) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate) || isNaN(endDate)) return 'Fecha inválida';

      const options = { day: '2-digit', month: 'short' };
      return startDate.toLocaleDateString('es-ES', options) +
        (startDate.getTime() === endDate.getTime()
          ? ` ${startDate.getFullYear()}`
          : ` - ${endDate.toLocaleDateString('es-ES', options)} ${endDate.getFullYear()}`);
    } catch {
      return 'Fecha inválida';
    }
  }, []);

  // Estado para controlar la visibilidad del PDF
  const pdfRef = useRef();

  // Función para generar el PDF
  const handleExportPDF = async () => {
    try {
      // Mostrar mensaje de carga
      const loadingMessage = document.createElement('div');
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      loadingMessage.style.color = 'white';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.borderRadius = '5px';
      loadingMessage.style.zIndex = '1000';
      loadingMessage.textContent = 'Generando PDF...';
      document.body.appendChild(loadingMessage);

      // Capturar el contenido
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;


      // Calcular cuántas páginas se necesitan
      const totalPages = Math.ceil(pdfHeight / pdf.internal.pageSize.getHeight());

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          imgData,
          'PNG',
          0,
          -(pdf.internal.pageSize.getHeight() * i),
          pdfWidth,
          pdfHeight
        );
      }

      // Eliminar mensaje de carga
      document.body.removeChild(loadingMessage);

      // Descargar PDF
      pdf.save(`ingest-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    }
  };
  //Funcion de carga de excel

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Procesar los datos como lo haces actualmente
      const processed = jsonData.map(item => ({
        ...item,
        start: processDate(item["Start Date"]),
        end: processDate(item["End Date"])
      })).filter(item => !isNaN(item.start.getTime()) && !isNaN(item.end.getTime()));

      setUploadedData(processed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Programación");
    XLSX.writeFile(workbook, `programacion_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // Agregar estas funciones helper
  const getFeedColor = (feed) => {
    switch (feed) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'danger';
      case 'E': return 'primary';
      case 'U': return 'secondary';
      default: return 'light';
    }
  };

  const getDuplicateColor = (count) => {

    if (count >= 5) return 'danger';
    if (count >= 4) return 'primary';
    if (count >= 3) return 'warning';
    if (count >= 2) return 'success';
    return 'info';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // Formato HH:mm
  };

  return (
    <Container fluid className="executive-dashboard" ref={pdfRef}>
      <Row className="dashboard-header align-items-center mb-4">
        <Col md={8}>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <div>
              <h3 className="mb-1">Graphic Report Program</h3>
              <div className="date-display">
                <FiCalendar className="me-3" />
                {formatDateRange(dateRange[0].startDate, dateRange[0].endDate)}
              </div>
            </div>
          </Stack>
        </Col>

        <Col md={4} className="text-end">
          <Stack direction="horizontal" gap={3} className="justify-content-end align-items-center">
            <Button
              variant="outline-primary"
              onClick={toggleFilters}
              className="d-flex align-items-center"
            >
              {showFilters ? (
                <>
                  <FiEyeOff className="me-2" />
                  Filtres
                </>
              ) : (
                <>
                  <FiEye className="me-2" />
                  Filtres
                </>
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={() => setShowDetails(!showDetails)}
              className="d-flex align-items-center"
            >
              {showDetails ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Table
            </Button>

            <Button
              variant="outline-success"
              className="d-flex align-items-center"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <FiUpload className="me-2" />
              Upload Excel
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Button>

            <Button variant="danger" className="d-flex align-items-center" onClick={handleExportPDF}>
              <FiDownload className="me-2" />
              Export PDF
            </Button>
          </Stack>
        </Col>


      </Row>



              <div className="date-display">
  <FiCalendar className="me-3" />
  {formatDateRange(dateRange[0].startDate, dateRange[0].endDate)}
  <span className="ms-3 text-muted">
    <FiFile className="me-1" />
    {fileName}
  </span>
</div>
      <Collapse in={showFilters}>
        <div>
          <Card className="main-filters mb-5">
            <Card.Body>
              <Row className="g-3">
                <Col xl={4} lg={5} md={12} className="d-flex flex-column">
                  <FilterControl label="Date" icon={<FiCalendar />}>
                    <div className="date-picker-container">
                      <div className="responsive-datepicker">
                        <DateRangePicker
                          ranges={tempDateRange}
                          onChange={ranges => setTempDateRange([ranges.selection])}
                          locale={es}
                          rangeColors={['#2E86AB']}
                          showPreview={false}
                          showDateDisplay={false}
                          editableDateInputs
                          moveRangeOnFirstSelection={false}
                          direction="horizontal"
                        />
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleApplyDate}
                        className="mt-2 w-90 apply-date-btn"
                      >
                        <FiCheck className="me-2" /> Apply Date
                      </Button>
                    </div>
                  </FilterControl>
                </Col>

                <Col xl={9} lg={7} md={12}>
                  <Row className="g-3 w-60" >
                    <Col md={12} className="filter-group">
                      <Row className="g-3">
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Type" icon={<FiSliders />}>
                            <Form.Select
                              value={filters.ltsa}
                              onChange={e => setFilters(prev => ({ ...prev, ltsa: e.target.value }))}
                            >
                              <option value="">All</option>
                              <option value="single">Single broadcast programs</option>
                              <option value="Live">Live</option>
                              <option value="Tape">Tape</option>
                              <option value="Short Turnaround">Short Turnaround</option>
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Feed" icon={<FiType />}>
                            <Form.Select
                              value={filters.feed}
                              onChange={e => setFilters(prev => ({ ...prev, feed: e.target.value }))}
                            >
                              <option value="">Todos</option>
                              {['A', 'B', 'C', 'D', 'E', 'U'].map(feed => (
                                <option key={feed} value={feed}>{feed}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Network" icon={<FiTv />}>
                            <Form.Select
                              value={filters.network}
                              onChange={e => setFilters(prev => ({ ...prev, network: e.target.value }))}
                            >
                              <option value="">All</option>
                              {['9', '14', '17', '53', '93', '109', '171', '173', '177', '178', '179', '193', '214', '314', '315', '417', '418', '426', '428', '651', '653', '654', '691', '692', '693']
                                .map(network => (
                                  <option key={network} value={network}>{network}</option>
                                ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>
                      </Row>
                    </Col>

                    <Col md={9}>
                      <Row className="g-1  w-80  align-items-end">


                        {/* Nuevo campo para show code */}
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Show code" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Search by show code"
                              value={filters.showCode}
                              onChange={e => setFilters(prev => ({ ...prev, showCode: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={9} md={4} lg={3}>
                          <Button
                            variant="outline-danger"
                            onClick={() => setFilters({
                              feed: '', network: '', status: '', ltsa: '', search: ''
                            })}
                            className="w-90 clear-all-btn"
                          >
                            <FiRefreshCw className="me-2" /> Clean filtres
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Collapse>
      {/* ... (Mantener las secciones de métricas, gráficos y programación detallada) ... */}
      <Row className="metrics-grid g-4 mb-5">
        {[
          { title: 'Total Content', value: metrics.total, icon: <FiTv />, color: 'drark' },
          { title: 'Live', value: metrics.live, icon: <FiBarChart2 />, color: 'danger' },
          { title: 'Tape', value: metrics.tape, icon: <FiBarChart2 />, color: 'secondary' },
          { title: 'Short Turnaroud', value: metrics.short, icon: <FiBarChart2 />, color: 'warning' },
          { title: 'Plataforma', value: metrics.platform, icon: <FiMonitor />, color: 'info' },
          { title: 'Lineal', value: metrics.linear, icon: <FiFilm />, color: 'warning' },
          { title: 'Duplicate Show Code network', value: metrics.duplicates, icon: <FiCopy />, color: 'duplicados' }

        ].map((metric, index) => (
          <Col xl={3} lg={6} key={index}>
            <Card className={`metric-card metric-${metric.color}`}>
              <Card.Body>
                <Stack direction="horizontal" className="align-items-center">
                  <div className="metric-icon">
                    {metric.icon}
                  </div>
                  <div className="ms-3">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label">{metric.title}</div>
                  </div>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-5">





        <Col xl={8}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <Stack direction="horizontal" className="justify-content-between align-items-center">
                <div>
                  <FiBarChart2 className="me-2" />
                  Programación por Horario
                </div>
                {selectedSlot && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSelectedSlot(null)}
                    className="text-danger"
                  >
                    <FiX className="me-1" /> Limpiar filtro
                  </Button>
                )}
              </Stack>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeSlots}
                    onClick={handleBarClick}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: '#6c757d' }}
                    />
                    <YAxis
                      label={{
                        value: 'Cantidad',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#6c757d'
                      }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value) => (
                        <span className="text-secondary">{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="Live"
                      name="En vivo"
                      fill="#dc3545"
                      fillOpacity={selectedSlot ? 0.5 : 1}
                    />
                    <Bar
                      dataKey="Tape"
                      name="Grabado"
                      fill="#69df83"
                      fillOpacity={selectedSlot ? 0.5 : 1}
                    />
                    <Bar
                      dataKey="Short"
                      name="Short Turnaround"
                      fill="#fae824"
                      fillOpacity={selectedSlot ? 0.5 : 1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <PieChart className="me-2" />
              Distribución de Plataformas
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Plataforma', value: metrics.platform },
                        { name: 'Lineal', value: metrics.linear }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell key="Plataforma" fill="#17a2b8" />
                      <Cell key="Lineal" fill="#ffc107" />
                    </Pie>
                    <Tooltip />
                    <Legend
                      formatter={(value) => (
                        <span className="text-secondary">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      <Row className="g-4 mb-5">
        <Col xl={12}>
          <Card className="chart-card">
            <Tabs defaultActiveKey="grafico" className="mb-3">
              {/* Pestaña del Gráfico */}
              <Tab eventKey="grafico" title={
                <span><FiBarChart2 className="me-1" />Graphic</span>
              }>
                <Card.Header className="chart-header">
                  Distribution of programs by Network
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">

                      <BarChart
                        layout="vertical"
                        data={networkDistribution}
                        margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: '#6c757d' }}
                          domain={[0, 'auto']} // Asegura que siempre muestre desde 0
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          tick={{ fill: '#6c757d' }}
                          interval={0}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Bar
                          dataKey="count"
                          name="Programas por Red"
                          fill="#2E86AB"
                          radius={[0, 3, 3, 0]}
                        >
                          {networkDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`#2E86AB${Math.min(50 + index * 20, 90)}`} // Mayor opacidad base
                            />
                          ))}
                        </Bar>
                      </BarChart>

                    </ResponsiveContainer>
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted">
                  <small>
                    {filters.network
                      ? `Showing results for the network ${filters.network}`
                      : 'Program distribution by television network'}
                  </small>
                </Card.Footer>
              </Tab>

              {/* Pestaña de la Tabla */}
              <Tab eventKey="tabla" title={
                <span><FiMonitor className="me-1" />Table <Badge bg="dark" pill>{filteredPrograms.length}</Badge></span>
              }>

                <Card.Header className="details-header">
                  <Stack direction="horizontal" className="justify-content-between align-items-center w-100 flex-wrap">
                    <h5 className="mb-0">Table of Contents</h5>
                    <Badge bg="dark" pill>{filteredData.length}</Badge>
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">

                    <Table striped bordered hover responsive >
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Show Code</th>
                          <th>Network</th>
                          <th>Feed</th>
                          <th>Duration</th>
                          <th>Type</th>
                          <th>Plataforma</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrograms.map((program) => (
                          <tr key={`${program["Show Code"]}-${program.Network}`}>
                            <td className="text-nowrap">{program["Episode Title"]}</td>
                            <td>
                              <Badge bg="secondary">{program["Show Code"]}</Badge>
                            </td>
                            <td>{program.Network}</td>
                            <td>{program.Feed}</td>
                            <td>
                              {program.Duration}

                            </td>
                            <td>
                              <Badge pill bg={program.LTSA === 'Live' ? 'danger' : 'warning'}>
                                {program.LTSA}
                              </Badge>
                            </td>
                            <td>{program.EMISION}</td>
                            <td>
                              {program["Start Date"]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  {/* Mensaje cuando no hay resultados */}
                  {!filteredPrograms.length && (
                    <div className="text-center py-4">
                      <FiXCircle className="display-6 text-muted mb-3" />
                      <p className="text-muted">No programs found with current filters</p>
                    </div>
                  )}
                </Card.Body>
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Accordion activeKey={showDetails ? 'details' : null}>
        <Row className="g-4 mb-5">
          <Col xl={12}>
            <Card className="chart-card">
              <Tabs defaultActiveKey="grafico" className="mb-3">
                {/* Pestaña del Gráfico */}
                <Tab eventKey="grafico" title={<span><FiBarChart2 className="me-1" />Graphic</span>}>
                  <Card.Header className="chart-header">
                    <h5>Distribution of Duplicate Programs</h5>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: '400px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={Array.from(duplicates.entries())
                            .filter(([_, info]) => info.count > 1)
                            .map(([key, info]) => ({
                              name: key.split('-')[0], // Show Code
                              count: info.count,
                              networks: Array.from(info.networks).join(', ')
                            }))}
                          margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                          <XAxis
                            type="number"
                            tick={{ fill: '#495057', fontSize: 12 }}
                            domain={[0, 'auto']}
                            axisLine={{ stroke: '#dee2e6' }}
                            tickLine={{ stroke: '#dee2e6' }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={140}
                            tick={{ fill: '#495057', fontSize: 12, fontWeight: 500 }}
                            axisLine={{ stroke: '#dee2e6' }}
                            tickLine={{ stroke: '#dee2e6' }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="custom-tooltip" style={{
                                    backgroundColor: '#fff',
                                    padding: '10px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}>
                                    <p style={{
                                      margin: '0 0 5px',
                                      fontWeight: 'bold',
                                      color: '#495057'
                                    }}>
                                      Show Code: {label}
                                    </p>
                                    <p style={{
                                      margin: '0 0 5px',
                                      color: '#6c757d'
                                    }}>
                                      Duplicados: {payload[0].value}
                                    </p>
                                    <p style={{
                                      margin: '0',
                                      color: '#6c757d',
                                      fontSize: '12px'
                                    }}>
                                      Networks: {payload[0].payload.networks}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          />
                          <Bar
                            dataKey="count"
                            name="Duplicados"
                          >
                            {Array.from(duplicates.entries())
                              .filter(([_, info]) => info.count > 1)
                              .map((entry, index) => {
                                const count = entry[1].count;
                                let color;
                                // Escala de colores basada en la cantidad de duplicados
                                if (count > 4) {
                                  color = '#dc3545'; // Rojo - Crítico
                                } else if (count > 3) {
                                  color = '#000fff'; // Azul - Alto
                                } else if (count > 2) {
                                  color = '#ffc107'; // Amarillo - Medio
                                } else {
                                  color = '#20c997'; // Verde - Bajo
                                }
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={color}
                                    style={{
                                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
                                      cursor: 'pointer'
                                    }}
                                  />
                                );
                              })}
                          </Bar>
                          <Legend
                            content={({ payload }) => (
                              <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '10px'
                              }}>
                                {[
                                  { color: '#20c997', label: '2 Network' },
                                  { color: '#ffc107', label: '3 Network' },
                                  { color: '#000fff', label: '4 Network' },
                                  { color: '#dc3545', label: '5+ Network' }
                                ].map((item, index) => (
                                  <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '20px'
                                  }}>
                                    <div style={{
                                      width: '12px',
                                      height: '12px',
                                      backgroundColor: item.color,
                                      marginRight: '5px',
                                      borderRadius: '2px'
                                    }} />
                                    <span style={{
                                      color: '#6c757d',
                                      fontSize: '12px'
                                    }}>
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-muted">
                    <small>The colors indicate the severity of the duplication: Green (2), Yellow (3), Blue (4), Red (5+)</small>
                  </Card.Footer>
                </Tab>

                {/* Pestaña de la Tabla */}
                <Tab eventKey="tabla" title={<span><FiMonitor className="me-1" />Table
                  <Badge bg="dark" pill>{Array.from(duplicates.entries()).filter(([_, info]) => info.count > 1).length}</Badge>
                </span>}>
                  <Card.Header className="details-header">
                    <h5>Table Distribution of Duplicate Programs</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Show Code</th>
                            <th>Title</th>
                            <th>Network</th>
                            <th>Feed</th>


                            <th>Duplicates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(duplicates.entries())
                            .filter(([_, info]) => info.count > 1)
                            .map(([key, info]) => {
                              const [showCode, date, time] = key.split('-');
                              return (
                                <tr key={key}>
                                  <td>
                                    <Badge bg="primary" className="fw-normal">
                                      {showCode}
                                    </Badge>
                                  </td>
                                  <td className="text-nowrap">
                                    {filteredPrograms.find(p => p["Show Code"] === showCode)?.["Episode Title"] || 'N/A'}
                                  </td>
                                  <td>
                                    {Array.from(info.networks).map((network, idx) => (
                                      <Badge
                                        key={idx}
                                        bg="secondary"
                                        className="me-1"
                                        style={{ opacity: 0.8 }}
                                      >
                                        {network}
                                      </Badge>
                                    ))}
                                  </td>
                                  <td>
                                    <Badge
                                      bg={getFeedColor(filteredPrograms.find(p => p["Show Code"] === showCode)?.Feed)}
                                      className="fw-normal"
                                    >
                                      {filteredPrograms.find(p => p["Show Code"] === showCode)?.Feed || 'N/A'}
                                    </Badge>
                                  </td>


                                  <td>
                                    <Badge
                                      bg={getDuplicateColor(info.count)}
                                      pill
                                    >
                                      {info.count}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </Table>
                    </div>
                    {Array.from(duplicates.values()).filter(v => v.count > 1).length === 0 && (
                      <div className="empty-state">
                        <FiXCircle className="empty-icon" />
                        <h5>No hay resultados</h5>
                        <p className="text-muted">No duplicate programs were found with the current filters.</p>
                      </div>
                    )}
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>


      </Accordion>


    </Container>
  );
};

export default ExecutiveDashboard;