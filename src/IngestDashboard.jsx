/**
 * COMPONENTE: IngestDashboard
 * DESCRIPCIÓN: Dashboard para análisis de ingestión de contenido
 * FUNCIONALIDADES PRINCIPALES:
 * - Visualización de métricas clave
 * - Filtrado avanzado por fecha, tipo, estado, etc.
 * - Gráficos interactivos de distribución por tipo y estado
 * - Tabla resumen y vista detallada de contenido
 */

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
  FiXCircle, FiTv
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
 * Filtra los datos según los filtros aplicados y el rango de fechas.
 * @param {Array} data - Lista de contenidos a filtrar.
 * @param {Object} filters - Filtros aplicados (type, feed, status, search).
 * @param {Date} rangeStart - Fecha de inicio del rango.
 * @param {Date} rangeEnd - Fecha de fin del rango.
 * @returns {Array} - Lista de contenidos filtrados.
 */
const filterData = (data, filters, rangeStart, rangeEnd) => {
  return data.filter(item => {
    const matchesDate = item.start >= rangeStart && item.start <= rangeEnd;

    const matchesSearch = filters.search
      ? item.Code?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.Description?.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    const matchesType = filters.type
      ? item.Type?.toLowerCase() === filters.type.toLowerCase()
      : true;

    const matchesFeed = filters.feed
      ? item.Feed?.toString() === filters.feed
      : true;

    const matchesStatus = filters.status
      ? item.Status?.toLowerCase() === filters.status.toLowerCase()
      : true;

    return matchesDate && matchesSearch && matchesType && matchesFeed && matchesStatus;
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
    search: ''
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

  const toggleFilters = () => setShowFilters(!showFilters);

  const { filteredData, typeDistribution, statusDistribution } = useMemo(() => {
    const processed = data.map(item => ({
      ...item,
      start: processDate(item.Date)
    })).filter(item => !isNaN(item.start.getTime()));

    const rangeStart = new Date(dateRange[0].startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange[0].endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    const filtered = filterData(processed, filters, rangeStart, rangeEnd);

    const typeData = filtered.reduce((acc, item) => {
      acc[item.Type] = (acc[item.Type] || 0) + 1;
      return acc;
    }, {});

    const statusData = filtered.reduce((acc, item) => {
      acc[item.Status] = (acc[item.Status] || 0) + 1;
      return acc;
    }, {});

    return {
      filteredData: filtered,
      typeDistribution: Object.entries(typeData).map(([name, count]) => ({ name, count })),
      statusDistribution: Object.entries(statusData).map(([name, count]) => ({ name, count }))
    };
  }, [data, dateRange, filters]);

  const metrics = useMemo(() => ({
    total: filteredData.length,
    ready: filteredData.filter(d => d.Status === 'Ready for Distribution').length,
    placeholder: filteredData.filter(d => d.Status === 'PLACEHOLDER').length,
    motion: filteredData.filter(d => d.Motion).length,
    edmQc: filteredData.filter(d => d['Edm Qc']).length,
    tedial: filteredData.filter(d => d.Tedial).length
  }), [filteredData]);

  const handleApplyDate = () => {
    setDateRange([...tempDateRange]);
  };

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

                <Col xl={9} lg={7} md={12}>
                  <Row className="g-3 w-60">
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
                              {['A', 'B', 'C', 'D', 'E', 'U'].map(feed => (
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
                      <Row className="g-1 w-80 align-items-end">
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

                        <Col xs={9} md={4} lg={3}>
                          <Button
                            variant="outline-danger"
                            onClick={() => setFilters({
                              feed: '', network: '', status: '', ltsa: '', search: '', showCode: ''
                            })}
                            className="w-90 clear-all-btn"
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
          { title: 'Listos', value: metrics.ready, icon: <FiCheck />, color: 'danger' },
          { title: 'Placeholders', value: metrics.placeholder, icon: <FiX />, color: 'warning' },
          { title: 'Motion', value: metrics.motion, icon: <FiFilm />, color: 'info' },
          { title: 'EDM QC', value: metrics.edmQc, icon: <FiMonitor />, color: 'secondary' },
          { title: 'Tedial', value: metrics.tedial, icon: <FiBarChart2 />, color: 'danger' }
        ].map((metric, index) => (
          <Col xl={4} lg={6} key={index}>
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
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E86AB" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <PieChart className="me-2" />
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
                    label
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2E86AB' : '#FFBB28'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Feed</th>
                    <th>Fecha</th>
                    <th>Duración</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Code}</td>
                      <td>{item.Description}</td>
                      <td>{item.Type}</td>
                      <td>{item.Feed}</td>
                      <td>{new Date(item.Date).toLocaleString()}</td>
                      <td>{item.Duration}</td>
                      <td>{item.Status}</td>
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