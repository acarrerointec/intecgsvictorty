import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Tab, Table, Badge, Button, Stack } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FiFilm, FiBarChart2, FiList, FiCheck, FiX, FiXCircle } from 'react-icons/fi';

// Componente principal
const TapesHourlyChart = ({ tapesList = [] }) => {
  const [tapeTabKey, setTapeTabKey] = useState('chart');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filteredTapes, setFilteredTapes] = useState([]);
  const [tapesByChannel, setTapesByChannel] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Preparar datos al cargar o cambiar tapesList
  useEffect(() => {
    // Calcular tapes por canal
    const channelCounts = {};
    tapesList.forEach(tape => {
      if (tape.Feed) {
        channelCounts[tape.Feed] = (channelCounts[tape.Feed] || 0) + 1;
      }
    });

    const channelData = Object.keys(channelCounts).map(channel => ({
      channel,
      count: channelCounts[channel]
    })).sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

    setTapesByChannel(channelData);

    // Preparar datos por franja horaria
    setTimeSlots(prepareTimeSlotData(tapesList, channelData));
    setFilteredTapes(tapesList); // Inicialmente, mostrar todos los tapes
  }, [tapesList]);

  // Efecto para filtrar tapes cuando se selecciona una franja horaria
  useEffect(() => {
    if (selectedSlot !== null) {
      const filtered = tapesList.filter(tape => {
        const tapeHour = tape.Date?.split(' ')[1]?.substring(0, 2);
        return tapeHour === selectedSlot;
      });
      setFilteredTapes(filtered);
    } else {
      setFilteredTapes(tapesList);
    }
  }, [selectedSlot, tapesList]);

  // Función para preparar datos por franja horaria
  const prepareTimeSlotData = (tapes, channels) => {
    // Crear un array de 24 horas
    const slots = Array.from({ length: 24 }, (_, i) => ({
      hour: String(i).padStart(2, '0'),
      // Inicializar cada canal con 0
      ...channels.reduce((acc, channel) => {
        acc[channel.channel] = 0;
        return acc;
      }, {})
    }));
    
    // Llenar con datos reales
    tapes.forEach(tape => {
      const hour = tape.Date?.split(' ')[1]?.substring(0, 2);
      if (hour && tape.Feed) {
        const slotIndex = parseInt(hour, 10);
        if (!isNaN(slotIndex) && slotIndex >= 0 && slotIndex < 24) {
          slots[slotIndex][tape.Feed] = (slots[slotIndex][tape.Feed] || 0) + 1;
        }
      }
    });
    
    return slots;
  };

  // Función para manejar el clic en las barras
  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const hour = data.activePayload[0].payload.hour;
      setSelectedSlot(selectedSlot === hour ? null : hour);
    }
  };

  // Función para obtener color por índice
  const getColorByIndex = (index) => {
    const colors = ['#2E86AB', '#A23B72', '#F18F01', '#5FAD56', '#5f4bb6', '#EE6C4D', '#02C39A', '#9A031E'];
    return colors[index % colors.length];
  };

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border shadow">
          <p className="mb-1 fw-bold">{`${label}:00 - ${parseInt(label) + 1}:00`}</p>
          {payload.map((entry, index) => (
            entry.value > 0 && (
              <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                {`${entry.name}: ${entry.value} tapes`}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  // Formatear fecha y hora para mostrar en la tabla
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '', time: '' };
    const parts = dateTimeStr.split(' ');
    return {
      date: parts[0] || '',
      time: parts[1] || ''
    };
  };

  return (
    <>
      {tapesList.length > 0 && (
        <Row className="g-4 mb-5">
          <Col xl={12}>
            <Card className="chart-card">
              <Card.Header className="chart-header">
                <Stack direction="horizontal" className="justify-content-between align-items-center">
                  <div>
                    <FiFilm className="me-2" />
                    Tapes Originales por Franja Horaria
                  </div>
                  {selectedSlot && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSelectedSlot(null)}
                      className="text-danger"
                    >
                      <FiX className="me-1" /> Limpiar filtro ({selectedSlot}:00 - {parseInt(selectedSlot) + 1}:00)
                    </Button>
                  )}
                </Stack>
              </Card.Header>
              <Card.Body>
                <Tabs
                  activeKey={tapeTabKey}
                  onSelect={(k) => setTapeTabKey(k)}
                  className="mb-3"
                >
                  <Tab eventKey="chart" title={<span><FiBarChart2 className="me-2" />Gráfico</span>}>
                    <div style={{ height: '400px' }}>
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
                            label={{ 
                              value: 'Hora del día', 
                              position: 'bottom',
                              offset: 5,
                              fill: '#6c757d'
                            }}
                          />
                          <YAxis
                            label={{
                              value: 'Cantidad de Tapes',
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
                          {tapesByChannel.slice(0, 7).map((channel, index) => (
                            <Bar
                              key={channel.channel}
                              dataKey={channel.channel}
                              name={channel.channel}
                              fill={getColorByIndex(index)}
                              fillOpacity={selectedSlot ? 0.7 : 1}
                              radius={[4, 4, 0, 0]}
                              stackId="stack"
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Tab>
                  <Tab eventKey="details" title={<span><FiList className="me-2" />Detalle</span>}>
                    <Row className="g-4">
                      <Col md={12}>
                        <div className="mb-4">
                          <h6 className="mb-3">
                            {selectedSlot 
                              ? `Distribución por Canal (Hora: ${selectedSlot}:00 - ${parseInt(selectedSlot) + 1}:00)` 
                              : 'Distribución por Canal'}
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {tapesByChannel.map((channel, idx) => {
                              // Contar los tapes filtrados por canal
                              const filteredCount = filteredTapes.filter(tape => tape.Feed === channel.channel).length;
                              return (
                                <Badge 
                                  key={idx} 
                                  className="p-2"
                                  style={{ 
                                    backgroundColor: getColorByIndex(idx),
                                    opacity: selectedSlot ? 0.9 : 1
                                  }}
                                >
                                  {channel.channel}: {filteredCount} tapes
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
                              <th>Fecha</th>
                              <th>Hora</th>
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
                            {filteredTapes.map((tape, idx) => {
                              const { date, time } = formatDateTime(tape.Date);
                              return (
                                <tr key={idx}>
                                  <td>{tape.Code}</td>
                                  <td>{tape[" Description"]}</td>
                                  <td>{date}</td>
                                  <td>{time}</td>
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
                              );
                            })}
                          </tbody>
                        </Table>
                        {filteredTapes.length === 0 && (
                          <div className="text-center py-4">
                            <FiXCircle className="display-6 text-muted mb-3" />
                            <p className="text-muted">No se encontraron tapes con los filtros actuales</p>
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
    </>
  );
};

export default TapesHourlyChart;