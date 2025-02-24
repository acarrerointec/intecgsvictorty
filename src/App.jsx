import { useState, useMemo, useEffect } from "react";
import { VictoryPie, VictoryTooltip, VictoryLegend } from "victory";
import { Container, Row, Col, Form, Button, Card, Tabs, Tab, Table } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";

// Sample data
const sampleData = [
  { date: "2024-09-01", value: 1, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2024-09-15", value: 2, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2024-10-01", value: 1, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2024-10-02", value: 1, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2024-10-03", value: 2, emissionType: "replay", programStatus: "draft", feed: "706", network: "A" },
  { date: "2024-11-04", value: 2, emissionType: "delayed", programStatus: "canceled", feed: "315", network: "B" },
  { date: "2024-11-05", value: 3, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2024-11-06", value: 1, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2024-11-07", value: 2, emissionType: "replay", programStatus: "draft", feed: "706", network: "A" },
  { date: "2024-11-08", value: 2, emissionType: "delayed", programStatus: "canceled", feed: "315", network: "B" },
  { date: "2024-11-09", value: 3, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2024-12-10", value: 1, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2024-12-11", value: 2, emissionType: "replay", programStatus: "draft", feed: "706", network: "A" },
  { date: "2025-01-12", value: 2, emissionType: "delayed", programStatus: "canceled", feed: "315", network: "B" },
  { date: "2025-01-13", value: 3, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2025-01-14", value: 2, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2025-01-15", value: 2, emissionType: "replay", programStatus: "draft", feed: "706", network: "A" },
  { date: "2025-02-16", value: 2, emissionType: "delayed", programStatus: "canceled", feed: "315", network: "B" },
  { date: "2025-01-17", value: 3, emissionType: "live", programStatus: "published", feed: "706", network: "A" },
  { date: "2025-02-18", value: 2, emissionType: "recorded", programStatus: "approved", feed: "315", network: "B" },
  { date: "2025-02-19", value: 2, emissionType: "replay", programStatus: "draft", feed: "706", network: "A" },
  { date: "2025-02-20", value: 3, emissionType: "delayed", programStatus: "canceled", feed: "315", network: "B" },
  { date: "2025-02-25", value: 1, emissionType: "live", programStatus: "approved", feed: "706", network: "A" }
];

// Color configuration
const emissionColors = {
  live: "#ff0000",
  recorded: "#00ff00",
  replay: "#0000ff",
  delayed: "#ffff00",
  "short-turnaround": "#00ffff"
};

const statusColors = {
  canceled: "#ff0000",
  draft: "#808080",
  approved: "#ffff00",
  published: "#00ff00"
};

const App = () => {
  const [emissionType, setEmissionType] = useState("all");
  const [programStatus, setProgramStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("1 week");
  const [dataType, setDataType] = useState("emission");
  const [applyFilters, setApplyFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("visualization");
  const [chartDimensions, setChartDimensions] = useState({ width: 1, height: 1 });

  const timeRangeMap = {
    "1 day": 1,
    "1 week": 7,
    "1 month": 30,
    "3 months": 90,
    "1 year": 365
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth * 0.8; // 80% del ancho de la ventana
      const height = window.innerHeight * 0.5; // 50% del alto de la ventana
      setChartDimensions({ width, height });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Llamar inicialmente para establecer las dimensiones

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (!applyFilters) return [];

    const maxDate = new Date(Math.max(...sampleData.map(d => new Date(d.date))));
    const days = timeRangeMap[timeRange] || 7;
    const startDate = new Date(maxDate);
    startDate.setDate(startDate.getDate() - days);

    return sampleData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate >= startDate &&
        itemDate <= maxDate &&
        (emissionType === "all" || item.emissionType === emissionType) &&
        (programStatus === "all" || item.programStatus === programStatus)
      );
    });
  }, [applyFilters, emissionType, programStatus, timeRange]);

  const aggregateData = (data, key) => {
    return Object.values(
      data.reduce((acc, item) => {
        const keyValue = item[key];
        if (!acc[keyValue]) {
          acc[keyValue] = {
            x: keyValue,
            y: 0,
            color: key === 'emissionType' 
              ? emissionColors[keyValue] 
              : statusColors[keyValue]
          };
        }
        acc[keyValue].y += 1; // Contar eventos
        return acc;
      }, {})
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Filtered Data", 10, 10);
    filteredData.forEach((item, index) => {
      doc.text(
        `${item.date} - ${item.value} - ${item.emissionType} - ${item.programStatus} - ${item.feed} - ${item.network}`,
        10,
        20 + index * 10
      );
    });
    doc.save("data.pdf");
  };

  // Get legend data
  const legendData = dataType === "emission" 
    ? Object.keys(emissionColors).map(key => ({ name: key, symbol: { fill: emissionColors[key] } }))
    : Object.keys(statusColors).map(key => ({ name: key, symbol: { fill: statusColors[key] } }));

  return (
    <Container className="mt-4" style={{ maxWidth: 'auto' }}>
      <Card>
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Control Panel
          <div>
            <Button variant="success" onClick={exportToExcel} className="me-2">
              Export to Excel
            </Button>
            <Button variant="danger" onClick={exportToPDF}>
              Export to PDF
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3 g-3">
            {/* Filters */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Show by</Form.Label>
                <Form.Select 
                  value={dataType} 
                  onChange={(e) => setDataType(e.target.value)}
                >
                  <option value="emission">Emission Type</option>
                  <option value="status">Program Status</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Emission Type</Form.Label>
                <Form.Select 
                  value={emissionType} 
                  onChange={(e) => setEmissionType(e.target.value)}
                  style={{ backgroundColor: emissionColors[emissionType] || 'white' }}
                  disabled={dataType === "status"}
                >
                  <option value="all">All Options</option>
                  <option value="live" style={{ backgroundColor: emissionColors.live }}>Live</option>
                  <option value="recorded" style={{ backgroundColor: emissionColors.recorded }}>Recorded</option>
                  <option value="replay" style={{ backgroundColor: emissionColors.replay }}>Replay</option>
                  <option value="delayed" style={{ backgroundColor: emissionColors.delayed }}>Delayed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Program Status</Form.Label>
                <Form.Select 
                  value={programStatus} 
                  onChange={(e) => setProgramStatus(e.target.value)}
                  style={{ backgroundColor: statusColors[programStatus] || 'white' }}
                  disabled={dataType === "emission"}
                >
                  <option value="all">All Options</option>
                  <option value="canceled" style={{ backgroundColor: statusColors.canceled }}>Canceled</option>
                  <option value="draft" style={{ backgroundColor: statusColors.draft }}>Draft</option>
                  <option value="approved" style={{ backgroundColor: statusColors.approved }}>Approved</option>
                  <option value="published" style={{ backgroundColor: statusColors.published }}>Published</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Time Range</Form.Label>
                <Form.Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                  <option value="1 day">1 Day</option>
                  <option value="1 week">1 Week</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="1 year">1 Year</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="d-flex align-items-end gap-2">
              <Button 
                variant="primary" 
                onClick={() => setApplyFilters(true)}
              >
                Apply Filters
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setEmissionType("all");
                  setProgramStatus("all");
                  setTimeRange("1 week");
                  setApplyFilters(false);
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Tabs for visualization and results */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="visualization" title="Data Visualization">
              <Card className="mt-4">
                <Card.Body style={{ height: '400px' }}>
                  {!applyFilters ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <h4>There are no modifications for the selected option</h4>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Título de la visualización */}
                      <h5 style={{ marginBottom: '10px' }}>
                        Showing by: {dataType === 'emission' ? 'Emission Type' : 'Program Status'}
                      </h5>

                      {/* Gráfico de torta */}
                      <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <VictoryPie
                          data={aggregateData(
                            filteredData, 
                            dataType === 'emission' ? 'emissionType' : 'programStatus'
                          )}
                          colorScale={aggregateData(
                            filteredData, 
                            dataType === 'emission' ? 'emissionType' : 'programStatus'
                          ).map(d => d.color)}
                          width={chartDimensions.width}
                          height={chartDimensions.height}
                          padAngle={3}
                          labels={({ datum }) => `${datum.x}: ${datum.y}`}
                          labelComponent={<VictoryTooltip style={{ fontSize: 18 }} />}
                          padding={{ top: 50, bottom: 50, left: 50, right: 50 }}
                        />
                      </div>

                      {/* Leyenda debajo del gráfico */}
                      <div style={{ marginTop: '20px' }}>
                        <VictoryLegend
                          data={legendData}
                          orientation="horizontal"
                          gutter={50}
                          style={{ labels: { fontSize: 16 } }}
                        />
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="results" title="Results Table">
              <Card className="mt-4">
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {!applyFilters ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <h4>there are no modifications for the selected option</h4>
                    </div>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Value</th>
                          <th>Emission Type</th>
                          <th>Program Status</th>
                          <th>Feed</th>
                          <th>Network</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.date}</td>
                            <td>{item.value}</td>
                            <td style={{ backgroundColor: emissionColors[item.emissionType] }}>
                              {item.emissionType}
                            </td>
                            <td style={{ backgroundColor: statusColors[item.programStatus] }}>
                              {item.programStatus}
                            </td>
                            <td>{item.feed}</td>
                            <td>{item.network}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default App;