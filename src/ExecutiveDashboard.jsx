import React, { useState, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Table, 
  Form, Button, ButtonGroup, Dropdown, 
  Badge, ProgressBar, Accordion 
} from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, 
  Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  FiFilter, FiDownload, FiRefreshCw, 
  FiBarChart2, FiPieChart, FiClock, FiX 
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import data from './data/csvjson.json';

const ExecutiveDashboard = () => {
  // State management
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date('2024-12-05'),
      endDate: new Date('2024-12-07'),
      key: 'selection'
    }
  ]);
  
  const [filters, setFilters] = useState({
    feed: '',
    network: '',
    status: '',
    showCode: '',
    emission: ''
  });

  // Processed data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const dateFilter = new Date(item.StartDate) >= dateRange[0].startDate &&
                       new Date(item.StartDate) <= dateRange[0].endDate;
      
      return dateFilter &&
        (filters.feed ? item.Feed === filters.feed : true) &&
        (filters.network ? item.Network.toString() === filters.network : true) &&
        (filters.status ? item.Status.includes(filters.status) : true) &&
        (filters.showCode ? item.ShowCode === filters.showCode : true) &&
        (filters.emission ? item.EMISION === filters.emission : true);
    });
  }, [data, dateRange, filters]);

  // Filters reset
  const resetFilters = () => {
    setFilters({
      feed: '',
      network: '',
      status: '',
      showCode: '',
      emission: ''
    });
    setDateRange([{
      startDate: new Date('2024-12-05'),
      endDate: new Date('2024-12-07'),
      key: 'selection'
    }]);
  };

  // Data processing for visualizations
  const emissionDistribution = useMemo(() => {
    const counts = filteredData.reduce((acc, item) => {
      acc[item.EMISION] = (acc[item.EMISION] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: name === 'PLATAFORMA' ? '#2E86AB' : '#F18F01'
    }));
  }, [filteredData]);

  const statusDistribution = useMemo(() => {
    const statuses = filteredData.reduce((acc, item) => {
      const status = item.Status.split('-')[1].trim();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      color: status === 'Draft' ? 'warning' :
             status === 'Published' ? 'success' :
             status === 'Approved' ? 'info' : 'secondary'
    }));
  }, [filteredData]);

  // Unique values for filters
  const uniqueValues = useMemo(() => ({
    feeds: [...new Set(data.map(item => item.Feed))],
    networks: [...new Set(data.map(item => item.Network))],
    statuses: [...new Set(data.map(item => item.Status.split('-')[1].trim()))],
    showCodes: [...new Set(data.map(item => item.ShowCode))],
    emissions: ['PLATAFORMA', 'LINEAL']
  }), [data]);

  return (
    <Container fluid className="px-4 py-4 executive-dashboard">
      {/* Filters Section */}
      <Row className="mb-4 align-items-center">
        <Col md={12}>
          <Card className="mb-3">
            <Card.Header>
              <h5>Filters</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Feed</Form.Label>
                    <Form.Select 
                      value={filters.feed}
                      onChange={e => setFilters({...filters, feed: e.target.value})}
                    >
                      <option value="">All</option>
                      {uniqueValues.feeds.map(feed => (
                        <option key={feed} value={feed}>{feed}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Network</Form.Label>
                    <Form.Select
                      value={filters.network}
                      onChange={e => setFilters({...filters, network: e.target.value})}
                    >
                      <option value="">All</option>
                      {uniqueValues.networks.map(network => (
                        <option key={network} value={network}>{network}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">All</option>
                      {uniqueValues.statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Emission Type</Form.Label>
                    <Form.Select
                      value={filters.emission}
                      onChange={e => setFilters({...filters, emission: e.target.value})}
                    >
                      <option value="">All</option>
                      {uniqueValues.emissions.map(emission => (
                        <option key={emission} value={emission}>{emission}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Date Range</Form.Label>
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={ranges => setDateRange([ranges.selection])}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="mt-3 d-flex justify-content-between">
                <Button 
                  variant="danger"
                  onClick={resetFilters}
                >
                  <FiX /> Clear Filters
                </Button>
                
                <Button variant="primary">
                  <FiDownload /> Export Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6}>
          <Card className="kpi-card">
            <Card.Body>
              <h5>Total Programs</h5>
              <h2>{filteredData.length}</h2>
              <ProgressBar now={100} variant="primary" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6}>
          <Card className="kpi-card">
            <Card.Body>
              <h5>Platform Emissions</h5>
              <h2>{emissionDistribution.find(d => d.name === 'PLATAFORMA')?.value || 0}</h2>
              <ProgressBar 
                now={(emissionDistribution.find(d => d.name === 'PLATAFORMA')?.value / filteredData.length * 100 || 0} 
                variant="info" 
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6}>
          <Card className="kpi-card">
            <Card.Body>
              <h5>Linear Emissions</h5>
              <h2>{emissionDistribution.find(d => d.name === 'LINEAL')?.value || 0}</h2>
              <ProgressBar 
                now={(emissionDistribution.find(d => d.name === 'LINEAL')?.value / filteredData.length * 100 || 0)} 
                variant="success" 
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6}>
          <Card className="kpi-card">
            <Card.Body>
              <h5>Live Broadcasts</h5>
              <h2>{filteredData.filter(d => d.BroadcastType === 'Live').length}</h2>
              <ProgressBar 
                now={(filteredData.filter(d => d.BroadcastType === 'Live').length / filteredData.length * 100 || 0} 
                variant="warning" 
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Visualizations */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Emission Type Distribution</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emissionDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {emissionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Program Status</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Program Details</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Feed</th>
                    <th>Network</th>
                    <th>Show Code</th>
                    <th>Title</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Emission</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Feed}</td>
                      <td>{item.Network}</td>
                      <td>{item.ShowCode}</td>
                      <td className="text-truncate" style={{maxWidth: '200px'}}>
                        {item.EpisodeTitle}
                      </td>
                      <td>{item.RoundedStartTime}</td>
                      <td>{item.Duration}</td>
                      <td>
                        <Badge bg={item.EMISION === 'PLATAFORMA' ? 'info' : 'success'}>
                          {item.EMISION}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={statusDistribution.find(s => s.status === item.Status.split('-')[1].trim())?.color}>
                          {item.Status.split('-')[1].trim()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExecutiveDashboard;