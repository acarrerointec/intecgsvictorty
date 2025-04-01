import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Row, Col, Card, Form,
  Button, Badge, Accordion, InputGroup, Stack
} from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';
import {
  FiDownload, FiRefreshCw, FiEye, FiEyeOff, FiSearch,
  FiCalendar, FiSliders, FiMonitor, FiClock,
  FiTv, FiFilm, FiType, FiInfo, FiBarChart2
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';
import data from './data/csvjson.json';
import './ExecutiveDashboard.css';

const ProgramCard = ({ program }) => (
  <Card className="program-card h-100">
    <Card.Body>
      <Stack gap={2}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="program-title">
              {program["Episode Title"]}
              <Badge bg="dark" className="ms-2">{program["Show Code"]}</Badge>
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
              <span>{program.Status.split('- ')[1]}</span>
            </div>
          </Stack>
        </div>

        <div className="program-footer">
          <Stack direction="horizontal" className="justify-content-between">
            <Badge bg={program.EMISION === 'PLATAFORMA' ? 'primary' : 'dark'}>
              {program.EMISION}
            </Badge>
            <small className="text-muted">
              {new Date(program["Start Date"]).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short'
              })}
            </small>
          </Stack>
        </div>
      </Stack>
    </Card.Body>
  </Card>
);

ProgramCard.propTypes = {
  program: PropTypes.object.isRequired
};

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
  const [filters, setFilters] = useState({
    feed: '',
    network: '',
    status: '',
    ltsa: '',
    search: ''
  });

  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  const [showDetails, setShowDetails] = useState(true);

  const { filteredData, timeSlots } = useMemo(() => {
    const processed = data.map(item => ({
      ...item,
      start: new Date(item["Start Date"].split('-').reverse().join('-')),
      end: new Date(item["End Date"].split('-').reverse().join('-'))
    }));

    const filtered = processed.filter(item => {
      const { startDate, endDate } = dateRange[0];
      const itemDate = item.start;

      const matchesDate = itemDate >= startDate && itemDate <= endDate;
      const matchesSearch = item["Episode Title"].toLowerCase().includes(filters.search.toLowerCase()) ||
        item["Show Code"].toLowerCase().includes(filters.search.toLowerCase());

      return matchesDate && matchesSearch &&
        (!filters.feed || item.Feed === filters.feed) &&
        (!filters.network || item.Network === filters.network) &&
        (!filters.status || item.Status.includes(filters.status)) &&
        (!filters.ltsa || item.LTSA === filters.ltsa);
    });

    const slots = Array(8).fill().map((_, i) => ({
      hour: `${i * 3}:00 - ${i * 3 + 3}:00`,
      Live: 0,
      Tape: 0,
      Short: 0
    }));

    filtered.forEach(item => {
      const hour = parseInt(item["Start Time"].split(':')[0]);
      const slot = Math.floor(hour / 3);
      if (slot < 8) slots[slot][item.LTSA === 'Short Turnaround' ? 'Short' : item.LTSA]++;
    });

    return { filteredData: filtered, timeSlots: slots };
  }, [data, dateRange, filters]);

  const metrics = useMemo(() => ({
    total: filteredData.length,
    live: filteredData.filter(d => d.LTSA === 'Live').length,
    tape: filteredData.filter(d => d.LTSA === 'Tape').length,
    short: filteredData.filter(d => d.LTSA === 'Short Turnaround').length,
    platform: filteredData.filter(d => d.EMISION === 'PLATAFORMA').length,
    linear: filteredData.filter(d => d.EMISION === 'LINEAL').length

  }), [filteredData]);

  return (
    <Container fluid className="executive-dashboard">
      {/* Header */}
      <Row className="dashboard-header align-items-center mb-4">
        <Col md={8}>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <div>
              <h1 className="mb-1">Graphic Programming Report</h1>
              <div className="date-display">
                <FiCalendar className="me-3" />
                {dateRange[0].startDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </Stack>
        </Col>

        <Col md={4} className="text-end">
          <Button
            variant="outline-primary"
            onClick={() => setShowDetails(!showDetails)}
            aria-label={showDetails ? "Ocultar detalles" : "Mostrar detalles"}
            className="me-2"
          >
            {showDetails ? <FiEyeOff /> : <FiEye />}
          </Button>
          <Button variant="primary">
            <FiDownload className="me-2" /> Exportar
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="main-filters mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col xl={4} lg={4}>
              <FilterControl label="Date" icon={<FiCalendar />}>
                <DateRangePicker
                  ranges={dateRange}
                  onChange={ranges => setDateRange([ranges.selection])}
                  locale={es}
                  rangeColors={['#2E86AB']}
                  showPreview={false}
                  showDateDisplay={false}
                  editableDateInputs
                  moveRangeOnFirstSelection={false}
                />
              </FilterControl>
            </Col>

            <Col xl={2} lg={6}>
              <FilterControl label="Type content" icon={<FiSliders />}>
                <Form.Select
                  value={filters.ltsa}
                  onChange={e => setFilters(prev => ({ ...prev, ltsa: e.target.value }))}
                >
                  <option value="">All options</option>
                  <option value="Live">Live</option>
                  <option value="Tape">Taped</option>
                  <option value="Short Turnaround">Short Turnaround</option>
                </Form.Select>
              </FilterControl>
            </Col>

            {/* Nuevo filtro Feed */}
            <Col xl={2} lg={6}>
              <FilterControl label="Feed" icon={<FiType />}>
                <Form.Select
                  value={filters.feed}
                  onChange={e => setFilters(prev => ({ ...prev, feed: e.target.value }))}
                >
                  <option value="">All Feeds</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="U">U</option>
                </Form.Select>
              </FilterControl>
            </Col>

            {/* Nuevo filtro Network */}
            <Col xl={2} lg={6}>
              <FilterControl label="Network" icon={<FiTv />}>
                <Form.Select
                  value={filters.network}
                  onChange={e => setFilters(prev => ({ ...prev, network: e.target.value }))}
                >
                  <option value="">All Networks</option>
                  <option value="9">9</option>
                  <option value="14">14</option>
                  <option value="17">17</option>
                  <option value="53">53</option>
                  <option value="93">93</option>
                  <option value="109">109</option>
                  <option value="171">171</option>
                  <option value="173">173</option>
                  <option value="177">177</option>
                  <option value="178">178</option>
                  <option value="179">179</option>
                  <option value="193">193</option>
                  <option value="214">214</option>
                  <option value="314">314</option>
                  <option value="315">315</option>
                  <option value="417">417</option>
                  <option value="418">418</option>
                  <option value="426">426</option>
                  <option value="428">428</option>
                  <option value="651">651</option>
                  <option value="653">653</option>
                  <option value="654">654</option>
                  <option value="691">691</option>
                  <option value="692">692</option>
                  <option value="693">693</option>
                </Form.Select>
              </FilterControl>
            </Col>

            <Col xl={3} lg={8}>
              <FilterControl label="Search" icon={<FiSearch />}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search for program or code..."
                    value={filters.search}
                    onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    disabled={!filters.search}
                  >
                    ×
                  </Button>
                </InputGroup>
              </FilterControl>
            </Col>

            <Col xl={2} lg={4} className="d-flex align-items-end">
              <Button
                variant="outline-danger"
                onClick={() => setFilters({
                  feed: '', network: '', status: '', ltsa: '', search: ''
                })}
                className="w-100"
              >
                <FiRefreshCw className="me-2" /> Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas */}
      <Row className="metrics-grid g-4 mb-5">
        {[
          { title: 'Total programs', value: metrics.total, icon: <FiTv />, color: 'primary' },
          { title: 'Live broadcasts', value: metrics.live, icon: <FiBarChart2 />, color: 'danger' },
          { title: 'Taped', value: metrics.tape, icon: <FiBarChart2 />, color: 'secondary' },
          { title: 'Short Turnaround', value: metrics.short, icon: <FiBarChart2 />, color: 'third' },
          { title: 'Plataforma', value: metrics.platform, icon: <FiMonitor />, color: 'info' },
          { title: 'Lineal', value: metrics.linear, icon: <FiFilm />, color: 'warning' }
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

      {/* Gráficos */}
      <Row className="g-4 mb-5">
        <Col xl={8}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FiBarChart2 className="me-2" />
              Programming Schedule
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="90%" height="90%">
                  <BarChart data={timeSlots}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Live" fill="#dc3545" name="Live" />
                    <Bar dataKey="Tape" fill="#69df83" name="Taped" />
                    <Bar dataKey="Short" fill="#fae824" name="Short Turnaround" />
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
              Distribución de plataformas
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas de Programación */}
      <Accordion activeKey={showDetails ? 'details' : null}>
        <Card className="programs-accordion">
          <Accordion.Item eventKey="details">
            <Card.Header className="details-header">
              <Stack direction="horizontal" className="justify-content-between w-100">
                <Stack direction="horizontal" gap={3} className="align-items-center">
                  <h5 className="mb-0">Programación detallada</h5>
                  <Badge bg="dark" pill>{filteredData.length}</Badge>
                </Stack>
                <small className="text-muted">
                  {dateRange[0].startDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long'
                  })}
                </small>
              </Stack>
            </Card.Header>

            <Accordion.Body>
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredData.map(program => (
                  <Col key={`${program["Show Code"]}-${program["Start Date"]}`}>
                    <ProgramCard program={program} />
                  </Col>
                ))}
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      </Accordion>
    </Container>
  );
};

export default ExecutiveDashboard;