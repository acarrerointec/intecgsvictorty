
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

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  FiXCircle
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';
import './ExecutiveDashboard.css';
import data from './data/csvjson.json';
/**
 * Convierte una fecha en formato `DD-MM-YYYY` a un objeto `Date`.
 * Si la conversión falla, devuelve la fecha actual.
 * @param {string} dateString - Fecha en formato `DD-MM-YYYY`.
 * @returns {Date} - Objeto `Date` correspondiente o la fecha actual si ocurre un error.
 */
const processDate = (dateString) => {
  if (!dateString) return new Date();
  
  try {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  } catch (error) {
    console.error('Error procesando fecha:', dateString);
    return new Date();
  }
};

/**
 * Comprueba si una fecha está dentro de un rango dado.
 * @param {Date} date - Fecha a comprobar.
 * @param {Date} rangeStart - Inicio del rango.
 * @param {Date} rangeEnd - Fin del rango.
 * @returns {boolean} - True si la fecha está dentro del rango.
 */
const isDateInRange = (date, rangeStart, rangeEnd) => {
  const dateTime = date.getTime();
  return dateTime >= rangeStart.getTime() && dateTime <= rangeEnd.getTime();
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
    // Asegurarse de que las fechas sean objetos Date
    const startDate = item.start instanceof Date ? item.start : processDate(item["Start Date"]);
    
    const matchesDate = isDateInRange(startDate, rangeStart, rangeEnd);

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

    return (
      matchesDate &&
      matchesSearch &&
      matchesNetwork &&
      matchesShowCode &&
      matchesFeed &&
      matchesStatus &&
      matchesLTSA
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
    (program["Episode Title"]?.toLowerCase() || "").includes(lowerSearchTerm) ||
    (program["Show Code"]?.toLowerCase() || "").includes(lowerSearchTerm) ||
    (program.Network?.toString().toLowerCase() || "").includes(lowerSearchTerm) ||
    (program.Feed?.toLowerCase() || "").includes(lowerSearchTerm)
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
          <Badge pill bg={program.LTSA === 'Live' ? 'danger' : program.LTSA === 'Short Turnaround' ? 'warning' : 'secondary'} className="text-capitalize">
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

const ExecutiveDashboard = ({ initialData = [] }) => {
  const [data, setData] = useState(initialData);
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [availableFeeds, setAvailableFeeds] = useState([]);

  const [filters, setFilters] = useState({
    feed: '',
    network: '',
    status: '',
    ltsa: '',
    search: '',
    showCode: ''
  });
  
  // Inicializar con la fecha actual para fechas por defecto
  const today = new Date();
  const [tempDateRange, setTempDateRange] = useState([{
    startDate: today,
    endDate: today,
    key: 'selection'
  }]);
  const [dateRange, setDateRange] = useState([{
    startDate: today,
    endDate: today,
    key: 'selection'
  }]);

  // Efecto para procesar datos iniciales y extraer valores únicos para filtros
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      // Extraer redes únicas
      const networks = [...new Set(initialData.map(item => item.Network?.toString()))].filter(Boolean).sort();
      setAvailableNetworks(networks);
      
      // Extraer feeds únicos
      const feeds = [...new Set(initialData.map(item => item.Feed))].filter(Boolean).sort();
      setAvailableFeeds(feeds);
      
      // Procesar fechas
      const processedData = initialData.map(item => ({
        ...item,
        start: processDate(item["Start Date"]),
        end: processDate(item["End Date"])
      }));
      
      setData(processedData);
      
      // Establecer fecha inicial al primer día del conjunto de datos
      if (processedData.length > 0) {
        const firstDate = new Date(Math.min(...processedData.map(item => item.start.getTime())));
        setTempDateRange([{
          startDate: firstDate,
          endDate: firstDate,
          key: 'selection'
        }]);
        setDateRange([{
          startDate: firstDate,
          endDate: firstDate,
          key: 'selection'
        }]);
      }
    }
  }, [initialData]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const { filteredData, timeSlots, duplicates, networkDistribution, filteredByTimeSlot } = useMemo(() => {
    setIsFiltering(true);
    
    // Procesar rango de fechas
    const rangeStart = new Date(dateRange[0].startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange[0].endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    // Filtrar datos según los criterios seleccionados
    const filtered = filterData(data, filters, rangeStart, rangeEnd);

    // Identificar programas duplicados
    const programMap = new Map();
    filtered.forEach(program => {
      const key = `${program["Show Code"]}-${program["Start Date"]}-${program["Start Time"]}`;
      const existing = programMap.get(key) || { count: 0, networks: new Set() };
      existing.count += 1;
      existing.networks.add(program.Network?.toString());
      programMap.set(key, existing);
    });

    // Crear slots horarios (8 slots de 3 horas cada uno)
    const slots = Array(8).fill().map((_, i) => ({
      hour: `${i * 3}:00 - ${i * 3 + 3}:00`,
      Live: 0,
      Tape: 0,
      Short: 0,
      originalHour: i * 3
    }));

    // Distribuir programas en slots horarios
    filtered.forEach(item => {
      const hourStr = item["Start Time"]?.split(':')[0] || "0";
      const hour = parseInt(hourStr, 10);
      const slotIndex = Math.floor(hour / 3);
      
      if (slotIndex >= 0 && slotIndex < slots.length) {
        const type = item.LTSA === 'Short Turnaround' ? 'Short' : 
                    item.LTSA === 'Live' ? 'Live' : 'Tape';
        slots[slotIndex][type]++;
      }
    });

    // Calcular distribución por networks
    const networkData = filtered.reduce((acc, program) => {
      const network = program.Network?.toString() || 'Sin Red';
      acc[network] = (acc[network] || 0) + 1;
      return acc;
    }, {});

    // Convertir a formato esperado por el gráfico
    const networkDistribution = Object.entries(networkData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Si se ha seleccionado un slot de tiempo, filtrar programas en ese rango
    let filteredByTimeSlot = filtered;
    if (selectedSlot) {
      const startHour = selectedSlot.originalHour;
      const endHour = startHour + 3;
      
      filteredByTimeSlot = filtered.filter(program => {
        if (!program["Start Time"]) return false;
        
        const programHour = parseInt(program["Start Time"].split(':')[0], 10);
        return programHour >= startHour && programHour < endHour;
      });
    }

    setIsFiltering(false);
    return {
      filteredData: filtered,
      timeSlots: slots,
      duplicates: programMap,
      networkDistribution,
      filteredByTimeSlot
    };
  }, [data, dateRange, filters, selectedSlot]);

  // Calcular métricas generales
  const metrics = useMemo(() => ({
    total: filteredData.length,
    live: filteredData.filter(d => d.LTSA === 'Live').length,
    tape: filteredData.filter(d => d.LTSA === 'Tape').length,
    short: filteredData.filter(d => d.LTSA === 'Short Turnaround').length,
    platform: filteredData.filter(d => d.EMISION === 'PLATAFORMA').length,
    linear: filteredData.filter(d => d.EMISION === 'LINEAL').length,
    duplicates: Array.from(duplicates.values()).filter(v => v.count > 1).length
  }), [filteredData, duplicates]);

  // Manejar clic en una barra del gráfico de horarios
  const handleBarClick = useCallback((data, index) => {
    if (!timeSlots || index === undefined) return;
    const clickedSlot = timeSlots[index];
    setSelectedSlot(prev => prev?.hour === clickedSlot.hour ? null : clickedSlot);
  }, [timeSlots]);

  // Aplicar rango de fechas seleccionado
  const handleApplyDate = () => {
    setDateRange([...tempDateRange]);
  };

  // Exportar datos a CSV
  const handleExportData = () => {
    const headers = [
      'Red', 'Feed', 'Código', 'Título', 'Fecha', 'Hora', 'Duración', 'Tipo', 'Estado', 'Emisión'
    ].join(',');
    
    const rows = filteredData.map(item => [
      item.Network,
      item.Feed,
      item["Show Code"],
      `"${item["Episode Title"]?.replace(/"/g, '""') || ''}"`,
      item["Start Date"],
      item["Start Time"],
      item.Duration,
      item.LTSA,
      item.Status,
      item.EMISION
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_programacion_${formatDateShort(dateRange[0].startDate)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Formatea una fecha para el nombre del archivo de exportación.
   * @param {Date} date - Fecha a formatear.
   * @returns {string} - Fecha formateada.
   */
  const formatDateShort = (date) => {
    try {
      const d = new Date(date);
      return `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
    } catch {
      return 'export';
    }
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
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Fecha inválida';

      const options = { day: '2-digit', month: 'short' };
      return startDate.toLocaleDateString('es-ES', options) +
        (startDate.getTime() === endDate.getTime()
          ? ` ${startDate.getFullYear()}`
          : ` - ${endDate.toLocaleDateString('es-ES', options)} ${endDate.getFullYear()}`);
    } catch {
      return 'Fecha inválida';
    }
  }, []);

  // Colores para el gráfico de redes
  const getNetworkColor = (index) => {
    const baseColor = '#2E86AB';
    const opacity = Math.max(30, 90 - index * 3); // Disminuir opacidad con el índice
    return `${baseColor}${opacity.toString(16).padStart(2, '0')}`;
  };

  return (
    <Container fluid className="executive-dashboard">
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
                  Filtros
                </>
              ) : (
                <>
                  <FiEye className="me-2" />
                  Mostrar Filtros
                </>
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={() => setShowDetails(!showDetails)}
              className="d-flex align-items-center"
            >
              {showDetails ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Programas
            </Button>

            <Button 
              variant="primary" 
              className="d-flex align-items-center"
              onClick={handleExportData}
            >
              <FiDownload className="me-2" />
              Exportar
            </Button>
          </Stack>
        </Col>
      </Row>

      {/* Sección de filtros */}
      <Collapse in={showFilters}>
        <div>
          <Card className="main-filters mb-5">
            <Card.Body>
              <Row className="g-3">
                <Col xl={4} lg={5} md={12} className="d-flex flex-column">
                  <FilterControl label="Fecha" icon={<FiCalendar />}>
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
                        <FiCheck className="me-2" /> Aplicar Fecha
                      </Button>
                    </div>
                  </FilterControl>
                </Col>

                <Col xl={8} lg={7} md={12}>
                  <Row className="g-3">
                    <Col md={12} className="filter-group">
                      <Row className="g-3">
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Tipo" icon={<FiSliders />}>
                            <Form.Select
                              value={filters.ltsa}
                              onChange={e => setFilters(prev => ({ ...prev, ltsa: e.target.value }))}
                            >
                              <option value="">Todos</option>
                              <option value="Live">En vivo</option>
                              <option value="Tape">Grabado</option>
                              <option value="Short Turnaround">Short</option>
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
                              {availableFeeds.map(feed => (
                                <option key={feed} value={feed}>{feed}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Red" icon={<FiTv />}>
                            <Form.Select
                              value={filters.network}
                              onChange={e => setFilters(prev => ({ ...prev, network: e.target.value }))}
                            >
                              <option value="">Todas</option>
                              {availableNetworks.map(network => (
                                <option key={network} value={network}>{network}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>
                      </Row>
                    </Col>

                    <Col md={12}>
                      <Row className="g-3 align-items-end">
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Búsqueda" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Búsqueda general..."
                              value={filters.search}
                              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>
                        
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Código de Show" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Programa o código..."
                              value={filters.showCode}
                              onChange={e => setFilters(prev => ({ ...prev, showCode: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} md={4} lg={4}>
                          <Button
                            variant="outline-danger"
                            onClick={() => setFilters({
                              feed: '', network: '', status: '', ltsa: '', search: '', showCode: ''
                            })}
                            className="w-100 clear-all-btn"
                          >
                            <FiRefreshCw className="me-2" /> Limpiar filtros
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
      {/* Tarjetas de métricas */}
<Row className="metrics-grid g-4 mb-5">
  {[
    { title: 'Total', value: metrics.total, icon: <FiTv />, color: 'primary' },
    { title: 'En vivo', value: metrics.live, icon: <FiBarChart2 />, color: 'danger' },
    { title: 'Grabados', value: metrics.tape, icon: <FiBarChart2 />, color: 'secondary' },
    { title: 'Short', value: metrics.short, icon: <FiBarChart2 />, color: 'warning' },
    { title: 'Plataforma', value: metrics.platform, icon: <FiMonitor />, color: 'info' },
    { title: 'Lineal', value: metrics.linear, icon: <FiFilm />, color: 'warning' },
    { title: 'Duplicados', value: metrics.duplicates, icon: <FiCopy />, color: 'danger' }
  ].map((metric, index) => (
    <Col key={index} xs={6} md={4} lg={3} xl="auto">
      <Card className={`metric-card border-${metric.color}`}>
        <Card.Body>
          <div className={`metric-icon text-${metric.color}`}>
            {metric.icon}
          </div>
          <div className="metric-data">
            <h3 className="metric-value">{metric.value}</h3>
            <div className="metric-title">{metric.title}</div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

{/* Gráficos y Tablas */}
<Tabs defaultActiveKey="charts" className="mb-4">
  <Tab eventKey="charts" title="Visualizaciones">
    <Row className="g-4 mb-4">
      <Col xl={6}>
        <Card className="h-100">
          <Card.Header>
            <FiClock className="me-2" /> Distribución Horaria
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={timeSlots}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="Live"
                  stackId="a"
                  fill="#ff6b6b"
                  name="En Vivo"
                />
                <Bar
                  dataKey="Tape"
                  stackId="a"
                  fill="#4ecdc4"
                  name="Grabado"
                />
                <Bar
                  dataKey="Short"
                  stackId="a"
                  fill="#ffe66d"
                  name="Short Turnaround"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col xl={6}>
        <Card className="h-100">
          <Card.Header>
            <FiTv className="me-2" /> Distribución por Redes
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={7}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={networkDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {networkDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getNetworkColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col md={5}>
                <div className="network-table-container">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Red</th>
                        <th>Programas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networkDistribution.map((network, index) => (
                        <tr
                          key={network.name}
                          className={index < 3 ? "top-network" : ""}
                        >
                          <td>{network.name}</td>
                          <td className="text-end">{network.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Tab>

  {/* Tabla de Programas */}
  <Tab eventKey="programs" title="Listado de Programas">
    <Card className="mt-4">
      <Card.Header>
        <FiFilm className="me-2" /> Programas Filtrados ({filteredByTimeSlot.length})
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          {filteredByTimeSlot.map((program, index) => {
            const duplicateInfo = duplicates.get(
              `${program["Show Code"]}-${program["Start Date"]}-${program["Start Time"]}`
            );
            return (
              <Col key={index} xs={12} md={6} lg={4} xl={3}>
                <ProgramCard
                  program={program}
                  isDuplicate={duplicateInfo?.count > 1}
                  networks={Array.from(duplicateInfo?.networks || [])}
                />
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  </Tab>
</Tabs>

{/* Estilos adicionales */}
<style>{`
  .network-table-container {
    max-height: 300px;
    overflow-y: auto;
  }
  .top-network {
    background-color: #f8f9fa;
    font-weight: 500;
  }
  .metric-card {
    min-width: 180px;
    transition: transform 0.2s;
  }
  .metric-card:hover {
    transform: translateY(-3px);
  }
  .metric-icon {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  .metric-value {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }
`}</style>
</Container>
);
};

ExecutiveDashboard.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.object)
};

export default ExecutiveDashboard;

