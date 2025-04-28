import { useState, useMemo, useCallback } from 'react';
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
  FiFilm, FiType, FiInfo, FiBarChart2, FiCopy, FiX, FiCheck,
  FiXCircle, FiTv, FiList
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';
import data from './data/DataMediaTraker.json'; // Asegúrate de que este archivo contenga los datos JSON proporcionados
import './IngestDashboard.css'; // Asegúrate de que este archivo contenga los estilos CSS necesarios

/**
 * Convierte una fecha en formato `DD/MM/YYYY HH:mm` a un objeto `Date`.
 * Si la conversión falla, devuelve la fecha actual.
 * @param {string} dateString - Fecha en formato `DD/MM/YYYY HH:mm`.
 * @returns {Date} - Objeto `Date` correspondiente o la fecha actual si ocurre un error.
 */
const processDate = (dateString) => {
  if (!dateString) return new Date();
  
  try {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}`);
  } catch (error) {
    console.error('Error procesando fecha:', dateString);
    return new Date();
  }
};

/**
 * Identifica tapes que no son producto de grabaciones en vivo
 * @param {Array} filteredData - Datos filtrados según criterios de búsqueda
 * @returns {Object} - Datos procesados para tapes originales y lista completa de tapes
 */
const processTapeData = (filteredData) => {
  // Extraer códigos de eventos en vivo
  const liveCodes = filteredData
    .filter(item => item.Type === 'Program - Live')
    .map(item => item.Code);
  
  // Filtrar tapes que no tengan un código correspondiente en vivo
  const originalTapes = filteredData.filter(item => 
    item.Type?.includes('Program - Tape') && 
    !liveCodes.includes(item.Code)
  );

  // Agrupar por fecha
  const grouped = originalTapes.reduce((acc, item) => {
    if (!item.Date) return acc;
    
    const date = processDate(item.Date).toLocaleDateString('es-ES');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Formatear para gráfico
  return {
    chartData: Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    })),
    tapesList: originalTapes
  };
};

/**
 * Filtra los datos según los filtros aplicados y el rango de fechas.
 * @param {Array} data - Lista de contenidos a filtrar.
 * @param {Object} filters - Filtros aplicados (type, feed, status, search).
 * @param {Date} rangeStart - Fecha de inicio del rango.
 * @param {Date} rangeEnd - Fecha de fin del rango.
 * @returns {Array} - Lista de contenidos filtrados.
 */
const filterData = (data, filters, rangeStart, rangeEnd) => {
  return data.filter(item => {
    const itemDate = item.start;
    const matchesDate = itemDate >= rangeStart && itemDate <= rangeEnd;

    const matchesSearch = filters.search
      ? (item.Code?.toLowerCase().includes(filters.search.toLowerCase()) ||
         item[" Description"]?.toLowerCase().includes(filters.search.toLowerCase()))
      : true;

    const matchesType = filters.type
      ? item.Type?.toLowerCase().includes(filters.type.toLowerCase())
      : true;

    const matchesFeed = filters.feed
      ? item.Feed?.toString() === filters.feed
      : true;

    const matchesStatus = filters.status
      ? item.Status?.toLowerCase().includes(filters.status.toLowerCase())
      : true;

    const matchesShowCode = filters.showCode
      ? item.Code?.toLowerCase().includes(filters.showCode.toLowerCase())
      : true;

    return matchesDate && matchesSearch && matchesType && 
           matchesFeed && matchesStatus && matchesShowCode;
  });
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

const IngestDashboard = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    feed: '',
    status: '',
    search: '',
    showCode: ''
  });
  
  // Estado para controlar las pestañas de los tapes originales
  const [tapeTabKey, setTapeTabKey] = useState('chart');

  // Obtener la fecha inicial (un mes atrás) y final (actual)
  const initialStartDate = new Date();
  initialStartDate.setMonth(initialStartDate.getMonth() - 1);
  
  const [tempDateRange, setTempDateRange] = useState([{
    startDate: initialStartDate,
    endDate: new Date(),
    key: 'selection'
  }]);
  
  const [dateRange, setDateRange] = useState([{
    startDate: initialStartDate,
    endDate: new Date(),
    key: 'selection'
  }]);

  const toggleFilters = () => setShowFilters(!showFilters);

  // Extraer tipos únicos para el selector
  const uniqueTypes = useMemo(() => {
    const types = new Set();
    data.forEach(item => {
      if (item.Type) {
        const mainType = item.Type.split(' - ')[0];
        types.add(mainType);
      }
    });
    return Array.from(types);
  }, [data]);

  // Extraer feeds únicos para el selector
  const uniqueFeeds = useMemo(() => {
    const feeds = new Set();
    data.forEach(item => {
      if (item.Feed) {
        feeds.add(item.Feed.toString());
      }
    });
    return Array.from(feeds).sort();
  }, [data]);

  // Extraer estados únicos para el selector
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set();
    data.forEach(item => {
      if (item.Status) {
        statuses.add(item.Status);
      }
    });
    return Array.from(statuses);
  }, [data]);

  // Extraer canales únicos de los tapes
  const uniqueChannels = useMemo(() => {
    const channels = new Set();
    data.forEach(item => {
      if (item.Channel) {
        channels.add(item.Channel);
      }
    });
    return Array.from(channels);
  }, [data]);

  const { filteredData, typeDistribution, statusDistribution, tapeData, tapesList } = useMemo(() => {
    const processed = data.map(item => ({
      ...item,
      start: processDate(item.Date)
    })).filter(item => !isNaN(item.start.getTime()));

    const rangeStart = new Date(dateRange[0].startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange[0].endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    const filtered = filterData(processed, filters, rangeStart, rangeEnd);

    // Agrupar por tipo principal (Program, Commercial, etc.)
    const typeData = filtered.reduce((acc, item) => {
      if (!item.Type) return acc;
      
      // Extraer el tipo principal (antes del primer guion)
      const mainType = item.Type.split(' - ')[0];
      acc[mainType] = (acc[mainType] || 0) + 1;
      return acc;
    }, {});

    // Normalizamos los estados para el gráfico (unificando placeholder/PLACEHOLDER)
    const statusData = filtered.reduce((acc, item) => {
      if (!item.Status) return acc;
      
      const normalizedStatus = item.Status.toLowerCase().includes('placeholder') 
        ? 'Placeholder' 
        : item.Status;
      
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {});

    // Procesar los datos de tapes usando los datos ya filtrados
    const { chartData: tapeChartData, tapesList: originalTapes } = processTapeData(filtered);

    return {
      filteredData: filtered,
      typeDistribution: Object.entries(typeData).map(([name, count]) => ({ name, count })),
      statusDistribution: Object.entries(statusData).map(([name, count]) => ({ name, count })),
      tapeData: tapeChartData,
      tapesList: originalTapes
    };
  }, [data, dateRange, filters]);

  const metrics = useMemo(() => ({
    total: filteredData.length,
    ready: filteredData.filter(d => d.Status === 'Ready for Distribution').length,
    placeholder: filteredData.filter(d => 
      d.Status?.toLowerCase().includes('placeholder')).length,
    readyForQC: filteredData.filter(d => d.Status === 'Ready for QC').length,
    motion: filteredData.filter(d => d.Motion).length,
    edmQc: filteredData.filter(d => d['Edm Qc']).length,
    tedial: filteredData.filter(d => d.Tedial).length,
    tapes: tapesList.length
  }), [filteredData, tapesList]);

  const handleApplyDate = () => {
    setDateRange([...tempDateRange]);
  };

  // Agrupar tapes por canal
  const tapesByChannel = useMemo(() => {
    const channelData = tapesList.reduce((acc, item) => {
      const channel = item.Channel || 'Sin Canal';
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(item);
      return acc;
    }, {});
    
    return Object.entries(channelData).map(([channel, tapes]) => ({
      channel,
      count: tapes.length,
      tapes
    }));
  }, [tapesList]);

  // Colores para los gráficos
  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B5249', '#59A5D8'];

  return (
    <Container fluid className="ingest-dashboard">
      <Row className="dashboard-header align-items-center mb-4">
        <Col md={8}>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <div>
              <h3 className="mb-1">Ingest Report Graphic</h3>
              <div className="date-display">
                <FiCalendar className="me-3" />
                {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
              </div>
            </div>
          </Stack>
        </Col>
        <Col md={4} className="text-end">
          <Stack direction="horizontal" gap={3} className="justify-content-end align-items-center">
            <Button variant="outline-primary" onClick={toggleFilters}>
              {showFilters ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Filtros
            </Button>
            <Button variant="outline-secondary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Detalles
            </Button>
            <Button variant="primary">
              <FiDownload className="me-2" />
              Exportar
            </Button>
          </Stack>
        </Col>
      </Row>

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
                              value={filters.type}
                              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            >
                              <option value="">Todos</option>
                              {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
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
                              {uniqueFeeds.map(feed => (
                                <option key={feed} value={feed}>{feed}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Estado" icon={<FiInfo />}>
                            <Form.Select
                              value={filters.status}
                              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                              <option value="">Todos</option>
                              {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>
                      </Row>
                    </Col>

                    <Col md={12}>
                      <Row className="g-3 align-items-end">
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Código" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Buscar por código..."
                              value={filters.showCode}
                              onChange={e => setFilters(prev => ({ ...prev, showCode: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Descripción" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Buscar en descripción..."
                              value={filters.search}
                              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <Button
                            variant="outline-danger"
                            onClick={() => setFilters({
                              type: '', feed: '', status: '', search: '', showCode: ''
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

      <Row className="metrics-grid g-4 mb-5">
        {[
          { title: 'Total', value: metrics.total, icon: <FiTv />, color: 'primary' },
          { title: 'Ready for Distribution', value: metrics.ready, icon: <FiCheck />, color: 'danger' },
          { title: 'Placeholders', value: metrics.placeholder, icon: <FiX />, color: 'warning' },
          { title: 'Ready for QC', value: metrics.readyForQC, icon: <FiInfo />, color: 'info' },
          { title: 'Motion', value: metrics.motion, icon: <FiFilm />, color: 'secondary' },
          { title: 'EDM QC', value: metrics.edmQc, icon: <FiMonitor />, color: 'danger' },
          { title: 'Tapes Originales', value: metrics.tapes, icon: <FiFilm />, color: 'danger' }
        ].map((metric, index) => (
          <Col xl={3} lg={4} md={6} key={index}>
            <Card className={`metric-card metric-${metric.color}`}>
              <Card.Body>
                <Stack direction="horizontal" className="align-items-center">
                  <div className="metric-icon">{metric.icon}</div>
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
              <FiBarChart2 className="me-2" />
              Distribución por Tipo
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [`${value} contenidos`, props.payload.name]} />
                  <Legend />
                  <Bar dataKey="count" name="Cantidad" fill="#2E86AB" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FiInfo className="me-2" />
              Distribución por Estado
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} contenidos`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>


{/* Mostrar gráfico de tapes originales si hay datos disponibles */}

      {tapeData.length > 0 && (
  <Row className="g-4 mb-5">
    <Col xl={12}>
      <Card className="chart-card">
        <Card.Header className="chart-header">
          <FiFilm className="me-2" />
          Tapes Originales (No derivados de eventos en vivo)
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={tapeTabKey}
            onSelect={(k) => setTapeTabKey(k)}
            className="mb-3"
          >
            <Tab eventKey="chart" title={<span><FiBarChart2 className="me-2" />Gráfico</span>}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tapesByChannel}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis 
                    dataKey="Feed" 
                    label={{ 
                      value: 'Feed', 
                      position: 'bottom',
                      offset: 0 
                    }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Cantidad de Tapes', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cccccc',
                      borderRadius: '4px'
                    }}
                    formatter={(value) => [`${value} Tapes`, '']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Tapes por Feed" 
                    fill="#2E86AB" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

            </Tab>
            <Tab eventKey="details" title={<span><FiList className="me-2" />Detalle</span>}>
              <Row className="g-4">
                <Col md={12}>
                  <div className="mb-4">
                    <h6 className="mb-3">Distribución por Canal</h6>
                    <div className="d-flex flex-wrap gap-2">
                     
                    </div>
                  </div>
                  <Table striped bordered responsive className="tape-details-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Duración</th>
                        <th>Feed</th>
                        <th>Estado</th>
                        <th>Motion</th>
                        <th>Edm Qc</th>
                        <th>Tedial</th>
                        <th>Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tapesList.map((tape, idx) => (
                        <tr key={idx}>
                          <td>{tape.Code}</td>
                          <td>{tape[" Description"]}</td>
                          <td>{tape.Type}</td>
                          <td>{tape.Date}</td>
                          <td>{tape.Duration}</td>
                          <td>{tape.Feed}</td>
                          <td>
                            <Badge bg={
                              tape.Status === "Ready for Distribution" ? "success" : 
                              tape.Status === "Ready for QC" ? "info" : 
                              tape.Status?.toLowerCase().includes("placeholder") ? "warning" : "secondary"
                            }>
                              {tape.Status}
                            </Badge>
                          </td>
                          <td>{tape.Motion ? <FiCheck /> : <FiX />}</td>
                          <td>{tape['Edm Qc'] ? <FiCheck /> : <FiX />}</td> 
                          <td>{tape.Tedial ? <FiCheck /> : <FiX />}</td>  
                          <td>{tape.Origin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {tapesList.length === 0 && (
                    <div className="text-center py-4">
                      <FiXCircle className="display-6 text-muted mb-3" />
                      <p className="text-muted">No se encontraron tapes originales con los filtros actuales</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Col>
  </Row>
)}

      <Accordion activeKey={showDetails ? 'details' : null}>
        <Card className="programs-accordion">
          <Accordion.Item eventKey="details">
            <Card.Header className="details-header">
              <Stack direction="horizontal" className="justify-content-between align-items-center w-100 flex-wrap">
                <h5 className="mb-0">Contenido Detallado</h5>
                <Badge bg="dark" pill>{filteredData.length}</Badge>
              </Stack>
            </Card.Header>
            <Accordion.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Feed</th>
                    <th>Fecha</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Atributos</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Code}</td>
                      <td>{item[" Description"]}</td>
                      <td>{item.Type}</td>
                      <td>{item.Feed}</td>
                      <td>{item.Date}</td>
                      <td>{item.Duration}</td>
                      <td>
                        <Badge bg={
                          item.Status === "Ready for Distribution" ? "success" : 
                          item.Status === "Ready for QC" ? "info" : 
                          item.Status?.toLowerCase().includes("placeholder") ? "warning" : "secondary"
                        }>
                          {item.Status}
                        </Badge>
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2}>
                          {item.Motion && <Badge bg="secondary" title="Con Motion">M</Badge>}
                          {item['Edm Qc'] && <Badge bg="info" title="EDM QC">QC</Badge>}
                          {item.Tedial && <Badge bg="danger" title="En Tedial">T</Badge>}
                          {item.Origin && <Badge bg="primary" title="Origen">{item.Origin}</Badge>}
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {!filteredData.length && (
                <div className="text-center py-4">
                  <FiXCircle className="display-6 text-muted mb-3" />
                  <p className="text-muted">No se encontraron contenidos con los filtros actuales</p>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      </Accordion>
    </Container>
  );
};

export default IngestDashboard;