import { useState, useEffect } from 'react';
import { Table, DatePicker, Select, Button, Card, Row, Col, Tag } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ProgramSchedule = () => {
  // Sample data from your JSON (converted to English)
  const originalData = [
    {
      "Feed": "A",
      "Network": 417,
      "ShowCode": "HOSP223",
      "Program": "HOSP",
      "TitleNumber": 223,
      "EpisodeTitle": "National Hockey League-Seattle Kraken. New York Islanders. Venue: UBS Arena.",
      "DayOfWeek": "THU",
      "StartDate": "05-12-2024",
      "StartTime": "21:30:00",
      "RoundedStartTime": "9:30 p.m.",
      "EndTime": "0:05:00",
      "EndDate": "06-12-2024",
      "Duration": "02:35:00",
      "BroadcastType": "Live",
      "Status": "30- Final Update",
      "Emission": "LINEAL"
    },
    {
      "Feed": "A",
      "Network": 428,
      "ShowCode": "HOSP223",
      "Program": "HOSP",
      "TitleNumber": 223,
      "EpisodeTitle": "National Hockey League-Seattle Kraken. New York Islanders. Venue: UBS Arena.",
      "DayOfWeek": "THU",
      "StartDate": "05-12-2024",
      "StartTime": "21:30:00",
      "RoundedStartTime": "9:30 p.m.",
      "EndTime": "00:05:00",
      "EndDate": "06-12-2024",
      "Duration": "02:35:00",
      "BroadcastType": "Live",
      "Status": "30- Final Update",
      "Emission": "LINEAL"
    },
    // Add more data as needed from your JSON
  ];

  const [data, setData] = useState(originalData);
  const [filteredData, setFilteredData] = useState(originalData);
  const [filters, setFilters] = useState({
    dateRange: null,
    feed: null,
    network: null,
    status: null,
    showCode: null,
    emission: null,
  });

  // Extract unique values for filters
  const uniqueFeeds = [...new Set(originalData.map(item => item.Feed))];
  const uniqueNetworks = [...new Set(originalData.map(item => item.Network))];
  const uniqueStatuses = [...new Set(originalData.map(item => item.Status))];
  const uniqueShowCodes = [...new Set(originalData.map(item => item.ShowCode))];
  const uniqueEmissions = [...new Set(originalData.map(item => item.Emission))];

  // Apply filters
  useEffect(() => {
    let result = [...data];
    
    // Date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      result = result.filter(item => {
        const itemDate = moment(item.StartDate, 'DD-MM-YYYY');
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });
    }
    
    // Other filters
    if (filters.feed) {
      result = result.filter(item => item.Feed === filters.feed);
    }
    
    if (filters.network) {
      result = result.filter(item => item.Network === filters.network);
    }
    
    if (filters.status) {
      result = result.filter(item => item.Status === filters.status);
    }
    
    if (filters.showCode) {
      result = result.filter(item => item.ShowCode === filters.showCode);
    }
    
    if (filters.emission) {
      result = result.filter(item => item.Emission === filters.emission);
    }
    
    setFilteredData(result);
  }, [filters, data]);

  const handleDateChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const clearFilters = () => {
    setFilters({
      dateRange: null,
      feed: null,
      network: null,
      status: null,
      showCode: null,
      emission: null,
    });
  };

  // Calculate statistics for charts
  const platformStats = filteredData.reduce((acc, item) => {
    acc[item.Emission] = (acc[item.Emission] || 0) + 1;
    return acc;
  }, {});

  const broadcastTypeStats = filteredData.reduce((acc, item) => {
    acc[item.BroadcastType] = (acc[item.BroadcastType] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    {
      title: 'Feed',
      dataIndex: 'Feed',
      key: 'Feed',
      sorter: (a, b) => a.Feed.localeCompare(b.Feed),
    },
    {
      title: 'Network',
      dataIndex: 'Network',
      key: 'Network',
      sorter: (a, b) => a.Network - b.Network,
    },
    {
      title: 'Show Code',
      dataIndex: 'ShowCode',
      key: 'ShowCode',
      sorter: (a, b) => a.ShowCode.localeCompare(b.ShowCode),
    },
    {
      title: 'Program',
      dataIndex: 'Program',
      key: 'Program',
      sorter: (a, b) => a.Program.localeCompare(b.Program),
    },
    {
      title: 'Episode Title',
      dataIndex: 'EpisodeTitle',
      key: 'EpisodeTitle',
      ellipsis: true,
    },
    {
      title: 'Day',
      dataIndex: 'DayOfWeek',
      key: 'DayOfWeek',
      sorter: (a, b) => a.DayOfWeek.localeCompare(b.DayOfWeek),
    },
    {
      title: 'Start Date/Time',
      key: 'StartDateTime',
      render: (_, record) => (
        <div>
          <div>{record.StartDate}</div>
          <div>{record.RoundedStartTime}</div>
        </div>
      ),
      sorter: (a, b) => {
        const dateA = moment(`${a.StartDate} ${a.StartTime}`, 'DD-MM-YYYY HH:mm:ss');
        const dateB = moment(`${b.StartDate} ${b.StartTime}`, 'DD-MM-YYYY HH:mm:ss');
        return dateA - dateB;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'Duration',
      key: 'Duration',
      sorter: (a, b) => {
        const durationA = moment.duration(a.Duration).asSeconds();
        const durationB = moment.duration(b.Duration).asSeconds();
        return durationA - durationB;
      },
    },
    {
      title: 'Type',
      dataIndex: 'BroadcastType',
      key: 'BroadcastType',
      render: (type) => {
        let color = '';
        switch (type) {
          case 'Live':
            color = 'green';
            break;
          case 'Tape':
            color = 'blue';
            break;
          case 'Short Turnaround':
            color = 'orange';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{type}</Tag>;
      },
      sorter: (a, b) => a.BroadcastType.localeCompare(b.BroadcastType),
    },
    {
      title: 'Platform',
      dataIndex: 'Emission',
      key: 'Emission',
      render: (emission) => {
        let color = emission === 'LINEAL' ? 'purple' : 'cyan';
        return <Tag color={color}>{emission}</Tag>;
      },
      sorter: (a, b) => a.Emission.localeCompare(b.Emission),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      sorter: (a, b) => a.Status.localeCompare(b.Status),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>TV Program Schedule</h1>
      
      <Card title="Filters" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={handleDateChange}
              value={filters.dateRange}
              format="DD-MM-YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Feed"
              onChange={(value) => handleFilterChange('feed', value)}
              value={filters.feed}
              allowClear
            >
              {uniqueFeeds.map(feed => (
                <Option key={feed} value={feed}>{feed}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Network"
              onChange={(value) => handleFilterChange('network', value)}
              value={filters.network}
              allowClear
            >
              {uniqueNetworks.map(network => (
                <Option key={network} value={network}>{network}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
              allowClear
            >
              {uniqueStatuses.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Show Code"
              onChange={(value) => handleFilterChange('showCode', value)}
              value={filters.showCode}
              allowClear
            >
              {uniqueShowCodes.map(code => (
                <Option key={code} value={code}>{code}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Platform"
              onChange={(value) => handleFilterChange('emission', value)}
              value={filters.emission}
              allowClear
            >
              {uniqueEmissions.map(emission => (
                <Option key={emission} value={emission}>{emission}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="primary" 
              icon={<ClearOutlined />} 
              onClick={clearFilters}
              style={{ width: '100%' }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card title="Statistics" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card title="Platform Distribution">
              <ul>
                {Object.entries(platformStats).map(([platform, count]) => (
                  <li key={platform}>
                    {platform}: {count} programs ({((count / filteredData.length) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title="Broadcast Type Distribution">
              <ul>
                {Object.entries(broadcastTypeStats).map(([type, count]) => (
                  <li key={type}>
                    {type}: {count} programs ({((count / filteredData.length) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
      
      <Card title="Program Schedule">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey={(record) => `${record.Feed}-${record.Network}-${record.StartDate}-${record.StartTime}`}
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ProgramSchedule;