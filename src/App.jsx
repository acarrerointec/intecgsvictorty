import { useState, useMemo } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip, VictoryLegend } from 'victory';
import { Container, Card, Form, Button, Tabs, Tab, Table, Row, Col, ButtonGroup } from 'react-bootstrap';

// Configuración de colores
const COLOR_CONFIG = {
  emission: {
    vivo: '#ff0000',
    grabado: '#00ff00',
    repeticion: '#0000ff',
    diferido: '#ffff00',
    'short-turnaround': '#00ffff'
  },
  status: {
    cancelado: '#ff0000',
    borrador: '#808080',
    aprobado: '#ffff00',
    publicado: '#00ff00'
  }
};

// Datos de ejemplo
const sampleData = [
  {
    id: 1,
    fecha: '2024-08-26 09:00',
    network: 'ESPN',
    feed: 'A',
    tipoEmision: 'vivo',
    estadoPrograma: 'publicado',
    duracion: 120,
    reportes: 3
  },
  {
    id: 2,
    fecha: '2024-08-26 14:30',
    network: 'FOX',
    feed: 'B',
    tipoEmision: 'grabado',
    estadoPrograma: 'aprobado',
    duracion: 90,
    reportes: 1
  },
  {
    id: 3,
    fecha: '2024-08-26 18:15',
    network: 'ESPN 2',
    feed: 'C',
    tipoEmision: 'repeticion',
    estadoPrograma: 'borrador',
    duracion: 45,
    reportes: 5
  },
  {
    id: 4,
    fecha: '2024-08-26 21:00',
    network: 'ESPN PREMIUM',
    feed: 'D',
    tipoEmision: 'diferido',
    estadoPrograma: 'cancelado',
    duracion: 60,
    reportes: 8
  },
  {
    id: 5,
    fecha: '2024-08-27 07:30',
    network: 'SUR',
    feed: 'E',
    tipoEmision: 'short-turnaround',
    estadoPrograma: 'publicado',
    duracion: 30,
    reportes: 0
  },
  {
    id: 6,
    fecha: '2024-08-27 12:45',
    network: 'NORTE',
    feed: 'U',
    tipoEmision: 'vivo',
    estadoPrograma: 'aprobado',
    duracion: 150,
    reportes: 2
  },
  {
    id: 7,
    fecha: '2024-08-27 16:20',
    network: 'TMK',
    feed: 'A',
    tipoEmision: 'grabado',
    estadoPrograma: 'publicado',
    duracion: 85,
    reportes: 4
  },
  {
    id: 8,
    fecha: '2024-08-27 19:10',
    network: 'EDM',
    feed: 'B',
    tipoEmision: 'repeticion',
    estadoPrograma: 'borrador',
    duracion: 95,
    reportes: 7
  },
  {
    id: 9,
    fecha: '2024-08-28 08:00',
    network: 'ESPN 3',
    feed: 'C',
    tipoEmision: 'diferido',
    estadoPrograma: 'cancelado',
    duracion: 40,
    reportes: 10
  },
  {
    id: 10,
    fecha: '2024-08-28 15:30',
    network: 'ESPN 4',
    feed: 'D',
    tipoEmision: 'short-turnaround',
    estadoPrograma: 'aprobado',
    duracion: 110,
    reportes: 1
  },
  {
    id: 11,
    fecha: '2024-08-28 22:45',
    network: 'ESPN EXTRA',
    feed: 'E',
    tipoEmision: 'vivo',
    estadoPrograma: 'publicado',
    duracion: 75,
    reportes: 6
  }

  // ... más datos de ejemplo
];

const ReportesProgramacion = () => {
  const [activeTab, setActiveTab] = useState('tabla');
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    network: '',
    feed: '',
    tipoEmision: '',
    estadoPrograma: ''
  });

  const [chartType, setChartType] = useState('reportes');

  // Procesamiento de datos
  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      return (
        (!filters.fechaDesde || item.fecha >= filters.fechaDesde) &&
        (!filters.fechaHasta || item.fecha <= filters.fechaHasta) &&
        (!filters.network || item.network === filters.network) &&
        (!filters.feed || item.feed === filters.feed) &&
        (!filters.tipoEmision || item.tipoEmision === filters.tipoEmision) &&
        (!filters.estadoPrograma || item.estadoPrograma === filters.estadoPrograma)
      );
    });
  }, [filters]);

  // Datos para gráficos
  const hourlyReports = useMemo(() => {
    const reportsByHour = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
    
    filteredData.forEach(item => {
      const hour = new Date(item.fecha).getHours();
      reportsByHour[hour].count += item.reportes;
    });
    
    return reportsByHour.map(h => ({
      x: `${h.hour}:00`,
      y: h.count,
      label: `Hora: ${h.hour}:00\nReportes: ${h.count}`
    }));
  }, [filteredData]);

  return (
    <Container fluid className="p-4 bg-light">
      <Card className="mb-4 shadow">
        <Card.Body>
          <h5 className="mb-4">Filtros de Búsqueda</h5>
          <Form>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.fechaDesde}
                    onChange={e => setFilters({...filters, fechaDesde: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.fechaHasta}
                    onChange={e => setFilters({...filters, fechaHasta: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Network</Form.Label>
                  <Form.Select
                    value={filters.network}
                    onChange={e => setFilters({...filters, network: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {['ESPN', 'ESPN 2', 'ESPN 3', 'ESPN 4', 'ESPN EXTRA', 'FOX', 'ESPN PREMIUM', 'SUR', 'NORTE', 'TMK', 'EDM'].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Feed</Form.Label>
                  <Form.Select
                    value={filters.feed}
                    onChange={e => setFilters({...filters, feed: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {['A', 'B', 'C', 'D', 'E', 'U'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tipo de Emisión</Form.Label>
                  <Form.Select
                    value={filters.tipoEmision}
                    onChange={e => setFilters({...filters, tipoEmision: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {Object.keys(COLOR_CONFIG.emission).map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado del Programa</Form.Label>
                  <Form.Select
                    value={filters.estadoPrograma}
                    onChange={e => setFilters({...filters, estadoPrograma: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {Object.keys(COLOR_CONFIG.status).map(e => (
                      <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="text-end mt-3">
                <Button
                  variant="primary"
                  onClick={() => setFilters({...filters})}
                  className="me-2"
                >
                  Buscar
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setFilters({
                    fechaDesde: '',
                    fechaHasta: '',
                    network: '',
                    feed: '',
                    tipoEmision: '',
                    estadoPrograma: ''
                  })}
                >
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-3">
        <Tab eventKey="tabla" title="Vista de Tabla">
          <Card className="shadow">
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Network</th>
                    <th>Feed</th>
                    <th>Tipo Emisión</th>
                    <th>Estado</th>
                    <th>Duración (min)</th>
                    <th>Reportes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => (
                    <tr key={item.id}>
                      <td>{item.fecha}</td>
                      <td>{item.network}</td>
                      <td>{item.feed}</td>
                      <td style={{backgroundColor: COLOR_CONFIG.emission[item.tipoEmision]}}>
                        {item.tipoEmision}
                      </td>
                      <td style={{backgroundColor: COLOR_CONFIG.status[item.estadoPrograma]}}>
                        {item.estadoPrograma}
                      </td>
                      <td>{item.duracion}</td>
                      <td>{item.reportes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="grafico" title="Vista Gráfica">
          <Card className="shadow">
            <Card.Body>
              <div className="mb-4">
                <ButtonGroup>
                  <Button
                    variant={chartType === 'reportes' ? 'primary' : 'outline-primary'}
                    onClick={() => setChartType('reportes')}
                  >
                    Reportes por Hora
                  </Button>
                  <Button
                    variant={chartType === 'duracion' ? 'primary' : 'outline-primary'}
                    onClick={() => setChartType('duracion')}
                  >
                    Duración por Programa
                  </Button>
                </ButtonGroup>
              </div>

              <VictoryChart domainPadding={20} horizontal>
                <VictoryAxis
                  style={{ tickLabels: { fontSize: 10 } }}
                  tickFormat={chartType === 'reportes' 
                    ? hourlyReports.map(h => h.x) 
                    : filteredData.map(d => d.network)}
                />
                <VictoryAxis dependentAxis />
                
                <VictoryBar
                  data={chartType === 'reportes' ? hourlyReports : filteredData}
                  x={chartType === 'reportes' ? 'x' : 'network'}
                  y={chartType === 'reportes' ? 'y' : 'duracion'}
                  labels={({ datum }) => chartType === 'reportes' 
                    ? datum.label 
                    : `Duración: ${datum.duracion} min`}
                  labelComponent={<VictoryTooltip />}
                  style={{
                    data: {
                      fill: ({ datum }) => chartType === 'reportes' 
                        ? '#4a90e2' 
                        : COLOR_CONFIG.emission[datum.tipoEmision]
                    }
                  }}
                />

                <VictoryLegend
                  data={chartType === 'reportes' 
                    ? [{ name: 'Reportes por Hora', symbol: { fill: '#4a90e2' } }]
                    : Object.entries(COLOR_CONFIG.emission).map(([key, value]) => ({
                        name: key,
                        symbol: { fill: value }
                      }))
                  }
                  orientation="horizontal"
                  gutter={20}
                  style={{ labels: { fontSize: 10 } }}
                />
              </VictoryChart>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ReportesProgramacion;