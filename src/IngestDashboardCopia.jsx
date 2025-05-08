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
  FiFilm, FiType, FiInfo, FiBarChart2, FiCopy, FiX, FiCheck,
  FiXCircle, FiTv, FiList
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';
import data from './data/DataMediaTraker.json';
import './IngestDashboard.css';

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
 * Identifica tapes que no son producto de grabaciones en vivo y que tienen más de dos semanas
 * @param {Array} filteredData - Datos filtrados según criterios de búsqueda
 * @returns {Object} - Datos procesados para tapes originales y lista completa de tapes
 */
const processTapeData = (filteredData) => {
  // Extraer códigos de eventos en vivo
  const liveCodes = filteredData
    .filter(item => item.Type === 'Program - Live')
    .map(item => item.Code);

  // Calcular la fecha límite (dos semanas atrás)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Filtrar tapes que no tengan un código correspondiente en vivo y sean de hace más de dos semanas
  const originalTapes = filteredData.filter(item => {
    if (!item.Type?.includes('Program - Tape')) return false;
    if (liveCodes.includes(item.Code)) return false;

    // Verificar la antigüedad del tape
    const tapeDate = processDate(item.Date);
    return tapeDate => twoWeeksAgo;
  });

  // Agrupar por fecha y hora
  const groupedByHourAndFeed = originalTapes.reduce((acc, item) => {
    if (!item.Date) return acc;

    const date = processDate(item.Date);
    const hour = date.getHours();
    const feed = item.Feed || 'Sin Feed';

    // Crear clave para hora y feed
    if (!acc[hour]) {
      acc[hour] = {};
    }

    if (!acc[hour][feed]) {
      acc[hour][feed] = [];
    }

    acc[hour][feed].push(item);
    return acc;
  }, {});

  // Formatear para gráfico
  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourData = { hour: `${hour}:00` };

    if (groupedByHourAndFeed[hour]) {
      Object.entries(groupedByHourAndFeed[hour]).forEach(([feed, items]) => {
        hourData[feed] = items.length;
      });
    }

    hourlyData.push(hourData);
  }

  return {
    hourlyData,
    tapesList: originalTapes,
    feedList: [...new Set(originalTapes.map(item => item.Feed || 'Sin Feed'))]
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

    const matchesProgramType = filters.programType
      ? (item.Type?.includes('Program - ') &&
        item.Type?.includes(filters.programType))
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

    return matchesDate && matchesSearch && matchesType && matchesProgramType &&
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

  // Estado para controlar la visibilidad de los filtros y detalles
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    programType: '',
    feed: '',
    status: '',
    search: '',
    showCode: ''
  });
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



  // Estado para controlar las pestañas de los tapes originales
  const [tapeTabKey, setTapeTabKey] = useState('chart');

  // Estados para el control del rango horario y feeds seleccionados
  const [hourRange, setHourRange] = useState({ start: 0, end: 23 });
  const [selectedFeeds, setSelectedFeeds] = useState([]);

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

  // Función para aplicar el rango de fechas
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

  // Extraer tipos de programas únicos para el nuevo selector
  const uniqueProgramTypes = useMemo(() => {
    const programTypes = new Set();
    data.forEach(item => {
      if (item.Type && item.Type.startsWith('Program - ')) {
        const subType = item.Type.split('Program - ')[1];
        programTypes.add(subType);
      }
    });
    return Array.from(programTypes);
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

  const { filteredData, typeDistribution, statusDistribution, tapeData, tapesList, tapeFeeds } = useMemo(() => {
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

      // Para los programas, mantener el tipo específico completo (Live, Tape, Short Turnaround)
      if (item.Type.startsWith('Program - ')) {
        acc[item.Type] = (acc[item.Type] || 0) + 1;
      } else {
        // Para otros tipos, extraer el tipo principal (antes del primer guion)
        const mainType = item.Type.split(' - ')[0];
        acc[mainType] = (acc[mainType] || 0) + 1;
      }
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
    const { hourlyData, tapesList: originalTapes, feedList } = processTapeData(filtered);

    // Ordenar los tipos para agrupar los programas juntos
    const sortedTypeData = Object.entries(typeData).sort((a, b) => {
      // Si ambos son programas, ordenarlos por su subtipo
      if (a[0].startsWith('Program - ') && b[0].startsWith('Program - ')) {
        return a[0].localeCompare(b[0]);
      }
      // Si sólo uno es programa, ese va primero
      else if (a[0].startsWith('Program - ')) return -1;
      else if (b[0].startsWith('Program - ')) return 1;
      // Para otros tipos, orden alfabético
      else return a[0].localeCompare(b[0]);
    });

    return {
      filteredData: filtered,
      // Distribución por tipo
      typeDistributionProgram: Object.entries(typeData).map(([name, count]) => ({ name, count })),

      // Distribución por estado
      statusDistributionProgram: Object.entries(statusData).map(([name, count]) => ({ name, count })),
      // Distribución por estado
      typeDistribution: Object.entries(typeData).map(([name, count]) => ({ name, count })),
      statusDistribution: Object.entries(statusData).map(([name, count]) => ({ name, count })),
      tapeData: hourlyData,
      tapesList: originalTapes,
      tapeFeeds: feedList
    };
  }, [data, dateRange, filters]);

  // Filtrar datos según el rango horario y feeds seleccionados
  const filteredTapeData = useMemo(() => {
    return tapeData
      .filter(item => {
        const hour = parseInt(item.hour);
        return hour >= hourRange.start && hour <= hourRange.end;
      })
      .map(item => {
        // Si hay feeds seleccionados, solo incluir esos feeds en el gráfico
        if (selectedFeeds.length > 0) {
          const filteredItem = { hour: item.hour };
          selectedFeeds.forEach(feed => {
            if (item[feed] !== undefined) {
              filteredItem[feed] = item[feed];
            }
          });
          return filteredItem;
        }
        return item;
      });
  }, [tapeData, hourRange, selectedFeeds]);


  const metrics = useMemo(() => ({
    total: filteredData.length,
    ready: filteredData.filter(d => d.Status === 'Ready for Distribution').length,
    placeholder: filteredData.filter(d =>
      d.Status?.toLowerCase().includes('placeholder')).length,
    readyForQC: filteredData.filter(d => d.Status === 'Ready for QC').length,
    motion: filteredData.filter(d => d.Motion).length,
    edmQc: filteredData.filter(d => d['Edm Qc']).length,
    tedial: filteredData.filter(d => d.Tedial).length,
    tapes: tapesList.length,
    live: filteredData.filter(d => d.Type === 'Program - Live').length,
    shortTurnaround: filteredData.filter(d => d.Type === 'Program - Short Turnaround').length,
    feed: filteredData.filter(d => d.Feed).length

  }), [filteredData, tapesList]);

  const handleApplyDate = () => {
    setDateRange([...tempDateRange]);
  };

  // Colores para los gráficos  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B5249', '#59A5D8'];
  const COLORS = ['#979a9a', '#ffc107', '#3399f3', '#bb33ff', '#3B5249', '#59A5D8'];

  return (
    <Container fluid className="ingest-dashboard" ref={pdfRef}>
      <Row className="dashboard-header align-items-center mb-4">
        <Col md={8}>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <div>
              <h3 className="mb-1">Ingest Report Graphic</h3>
              <div className="date-display">
                <FiCalendar className="me-20" />
                {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
              </div>
            </div>
          </Stack>
        </Col>
        <Col md={4} className="text-end">
          <Stack direction="horizontal" gap={4} className="justify-content-end align-items-center">
            <Button variant="outline-primary" onClick={toggleFilters}>
              {showFilters ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Filtres
            </Button>
            <Button variant="outline-secondary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Table
            </Button>
            <Button variant="danger" onClick={handleExportPDF}>
              <FiDownload className="me-2" />
              Export PDF
            </Button>
          </Stack>
        </Col>
      </Row>

      <Collapse in={showFilters}>
        <div>
          <Card className="main-filters mb-5">
            <Card.Body>
              <Row className="g-5">
                <Col xl={4} lg={6} md={18} className="d-flex align-items-center">
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
                          direction="horizontal" />
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={handleApplyDate}

                        className="mt-2 w-60 apply-date-btn"
                      >
                        <FiCheck className="me-2" /> Apply Date
                      </Button>
                    </div>
                  </FilterControl>
                </Col>

                <Col xl={9} lg={7} md={12}>
                  <Row className="g-3">
                    <Col md={12} className="filter-group">
                      <Row className="g-3">
                        <Col xs={12} sm={6} lg={3}>
                          <FilterControl label="Type" icon={<FiSliders />}>
                            <Form.Select
                              value={filters.type}
                              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            >
                              <option value="">All</option>
                              {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <FilterControl label="Type program" icon={<FiFilm />}>
                            <Form.Select
                              value={filters.programType}
                              onChange={e => setFilters(prev => ({ ...prev, programType: e.target.value }))}
                            >
                              <option value="">All</option>
                              {uniqueProgramTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <FilterControl label="Feed" icon={<FiType />}>
                            <Form.Select
                              value={filters.feed}
                              onChange={e => setFilters(prev => ({ ...prev, feed: e.target.value }))}
                            >
                              <option value="">All</option>
                              {uniqueFeeds.map(feed => (
                                <option key={feed} value={feed}>{feed}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <FilterControl label="Status" icon={<FiInfo />}>
                            <Form.Select
                              value={filters.status}
                              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                              <option value="">All</option>
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
                          <FilterControl label="Show Code" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Search Show code..."
                              value={filters.showCode}
                              onChange={e => setFilters(prev => ({ ...prev, showCode: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Episode Title" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Search Episode Title..."
                              value={filters.search}
                              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={4} lg={3}>
                          <Button
                            variant="outline-danger"


                            onClick={() => setFilters({
                              type: '', programType: '', feed: '', status: '', search: '', showCode: ''
                            })}
                            className="w-80 clear-all-btn"
                          >
                            <FiRefreshCw className="me-2" /> Clean filters
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
          { title: 'Total Content', value: metrics.total, icon: <FiTv />, color: 'totalContent' },
          { title: 'Program - Live', value: metrics.live, icon: <FiFilm />, color: 'programLive' },
          { title: 'Program - Short Turnaround', value: metrics.shortTurnaround, icon: <FiClock />, color: 'programSt' },
          { title: 'Program - Tape', value: metrics.tapes, icon: <FiFilm />, color: 'info' },
          { title: 'Ready for Distribution', value: metrics.ready, icon: <FiCheck />, color: 'readyForDistribution' },
          { title: 'Placeholders', value: metrics.placeholder, icon: <FiX />, color: 'warning' },
          { title: 'Ready for QC', value: metrics.readyForQC, icon: <FiInfo />, color: 'info' },
          { title: 'EDM QC', value: metrics.edmQc, icon: <FiMonitor />, color: 'secondary' }

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
              Type Program (Live, Tape, Short Turnaround) - Commercial - Promotion
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300} className="chart-container">
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [`${value} contenidos`, props.payload.name]} />
                  <Bar
                    dataKey="count"
                    name="Contenidos"
                    fill="#e74c3c"
                    fillOpacity={1}
                  >
                    {typeDistribution.map((entry, index) => {
                      let color = "#2E86AB";
                      if (entry.name === "Promotion") color = "#f39c12";
                      if (entry.name === "Commercial") color = "#8e44ad";
                      if (entry.name === "Program - Live") color = "#e74c3c";
                      if (entry.name === "Program - Tape") color = "#3399ff";
                      if (entry.name === "Program - Short Turnaround") color = "#33d1ff";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Leyenda personalizada debajo del gráfico */}
              <div className="custom-legend mt-3">
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <div className="legend-item d-flex align-items-center">
                    <span className="legend-color" style={{ backgroundColor: "#e74c3c" }}></span>
                    <span className="ms-2">Program - Live</span>
                  </div>
                  <div className="legend-item d-flex align-items-center">
                    <span className="legend-color" style={{ backgroundColor: "#3399ff" }}></span>
                    <span className="ms-2">Program - Tape</span>
                  </div>
                  <div className="legend-item d-flex align-items-center">
                    <span className="legend-color" style={{ backgroundColor: "#33d1ff" }}></span>
                    <span className="ms-2">Program - Short Turnaround</span>
                  </div>
                  <div className="legend-item d-flex align-items-center">
                    <span className="legend-color" style={{ backgroundColor: "#8e44ad" }}></span>
                    <span className="ms-2">Commercial</span>
                  </div>
                  <div className="legend-item d-flex align-items-center">
                    <span className="legend-color" style={{ backgroundColor: "#f39c12" }}></span>
                    <span className="ms-2">Promotion</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

        </Col>
        <Col xl={4} lg={6} md={12}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FiInfo className="me-2" />
              Distribution by Status
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

      {tapeData.length > 0 && (
        <Row className="g-4 mb-5">
          <Col xl={12}>
            <Card className="chart-card">
              <Card.Header className="chart-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <FiFilm className="me-2" />
                    Program Tapes
                  </div>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="d-flex align-items-center">
                      <small className="me-2">Time range:</small>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Select
                          size="sm"
                          value={hourRange.start}
                          onChange={(e) => setHourRange({ ...hourRange, start: parseInt(e.target.value) })}
                          style={{ width: '80px' }}
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={`start-${i}`} value={i}>{`${i}:00`}</option>
                          ))}
                        </Form.Select>
                        <span>-</span>
                        <Form.Select
                          size="sm"
                          value={hourRange.end}
                          onChange={(e) => setHourRange({ ...hourRange, end: parseInt(e.target.value) })}
                          style={{ width: '80px' }}
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={`end-${i}`} value={i}>{`${i}:00`}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </div>

                    <div className="d-flex align-items-center feed-filter">
                      <small className="me-2">Feeds:</small>
                      <div className="d-flex flex-wrap gap-1 feed-badges">
                        {tapeFeeds.map(feed => (
                          <Badge
                            key={feed}
                            bg={selectedFeeds.includes(feed) ? "primary" : "secondary"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (selectedFeeds.includes(feed)) {
                                setSelectedFeeds(selectedFeeds.filter(f => f !== feed));
                              } else {
                                setSelectedFeeds([...selectedFeeds, feed]);
                              }
                            }}
                          >
                            {feed}
                          </Badge>
                        ))}
                        {selectedFeeds.length > 0 && (
                          <Badge
                            bg="danger"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedFeeds([])}
                          >
                            <FiX size={12} />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <Tabs
                  activeKey={tapeTabKey}
                  onSelect={(k) => setTapeTabKey(k)}
                  className="mb-3"
                >
                  <Tab eventKey="chart" title={<span><FiBarChart2 className="me-2" />Graphic</span>}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={filteredTapeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="hour"
                          label={{
                            value: 'Hora del día',
                            position: 'insideBottom',
                            offset: -5
                          }}
                        />
                        <YAxis
                          label={{
                            value: 'Number of Tapes',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -5
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => [`${value} Tapes`, name]}
                          itemSorter={(item) => -item.value}
                        />
                        <Legend />
                        {(selectedFeeds.length > 0 ? selectedFeeds : tapeFeeds).map((feed, index) => (
                          <Bar
                            key={feed}
                            dataKey={feed}
                            name={feed}
                            stackId="stack"
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Display {filteredTapeData.length} hours from the selected time range
                        Total progam tape: {tapesList.length}
                      </small>
                    </div>
                  </Tab>
                  <Tab eventKey="details" title={<span><FiList className="me-2" />Table</span>}>
                    <Row className="g-4">
                      <Col md={12}>
                        <div className="mb-4">
                          <h6 className="mb-3">Distribution by Feed</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {tapeFeeds.map((feed, index) => {
                              const count = tapesList.filter(tape => (tape.Feed || 'Sin Feed') === feed).length;
                              return (
                                <Badge
                                  key={feed}
                                  bg="light"
                                  text="dark"
                                  className="p-2"
                                  style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                                >
                                  {feed}: {count} tapes
                                </Badge>
                              );
                            })}
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
                            <p className="text-muted">No program tapes were found with the current filters</p>
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
                <h5 className="mb-0">Table of Contents</h5>
                <Badge bg="dark" pill>{filteredData.length}</Badge>
              </Stack>
            </Card.Header>
            <Accordion.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Feed</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>EDM QC</th>
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

                          {item['Edm Qc'] && <Badge bg="danger" title="EDM QC">QC</Badge>}

                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {!filteredData.length && (
                <div className="text-center py-4">
                  <FiXCircle className="display-6 text-muted mb-3" />
                  <p className="text-muted">No content found with current filters</p>
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