/**
 * COMPONENTE: ProgramGraphic.jsx
 * 
 * DESCRIPCIÓN:
 * Dashboard ejecutivo para análisis de programación televisiva que permite visualizar
 * y analizar datos de programación de múltiples redes y feeds.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Visualización de métricas clave (contenido total, programas en vivo, grabados, etc.)
 * - Filtrado avanzado por fecha, red, tipo de programa, etc.
 * - Gráficos interactivos de distribución horaria y por redes
 * - Tabla resumen y vista detallada de programas
 * - Detección de programas duplicados
 * - Carga múltiple de archivos Excel con validación
 * - Exportación a PDF
 * 
 * ESTRUCTURA DE DATOS REQUERIDA:
 * - El componente espera archivos Excel con columnas específicas (ver REQUIRED_COLUMNS)
 * - Los datos deben incluir información sobre programas, horarios, redes y tipos de emisión
 * 
 * PROPS: Ninguno (este es un componente autónomo)
 * 
 * ESTADO:
 * - Gestiona múltiples estados para filtros, datos cargados, selecciones UI y modales
 * - Persiste datos en localStorage para mantener la sesión entre recargas
 * 
 * DEPENDENCIAS EXTERNAS:
 * - React-Bootstrap: Componentes UI
 * - Recharts: Gráficos
 * - xlsx: Procesamiento de Excel
 * - date-fns: Manejo de fechas
 */

// React y Hooks
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Componentes UI
import {
  Container, Row, Col, Card, Form,
  Button, Badge, Accordion, Stack, Collapse, Table, Tabs, Tab, Modal, Spinner
} from 'react-bootstrap';

// Gráficos
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Iconos
import {
  FiDownload, FiRefreshCw, FiEye, FiEyeOff, FiSearch,
  FiCalendar, FiSliders, FiMonitor, FiClock, FiList,
  FiTv, FiFilm, FiType, FiInfo, FiBarChart2, FiCopy, FiX, FiCheck,
  FiXCircle, FiUpload,
  FiBriefcase,
  FiBell,
  FiGitCommit
} from 'react-icons/fi';

// Selector de rango de fechas
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';

// Utilidades
import * as XLSX from 'xlsx';
import { exportToPDF } from './PdfExporter';
import 'jspdf-autotable';

// Estilos
import './ExecutiveDashboard.css';
import { FaFilm } from 'react-icons/fa';


// Columnas requeridas en el archivo Excel
const REQUIRED_COLUMNS = [
  'Feed', 'Network', 'Show Code', 'Program', 'Title #', 'Episode Title', 'Dow',
  'Start Date', 'Start Time', 'End Time', 'End Date', 'Duration', 'LTSA', 'Status',
  'Origin'
];

// Columnas para comparacion de duplicados
const COLUMNS_TO_COMPARE = [...REQUIRED_COLUMNS];

// FUNCIONES DE UTILIDAD

/**
 * Convierte una fecha en formato `DD-MM-YYYY` a un objeto `Date`.
 * Si la conversión falla, devuelve la fecha actual.
 * @param {string} dateString - Fecha en formato `DD-MM-YYYY`.
 * @returns {Date} - Objeto `Date` correspondiente o la fecha actual si ocurre un error.
 */
const processDate = (dateString) => {
  if (!dateString) return new Date();

  try {
    // Intentar múltiples formatos
    if (dateString.includes('-')) {
      const [day, month, year] = dateString.split('-');
      return new Date(`${year}-${month}-${day}`);
    }

    // Formato ISO (YYYY-MM-DD)
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }

    // Formato timestamp de Excel
    if (!isNaN(dateString)) {
      return new Date((dateString - 25569) * 86400 * 1000);
    }

    return new Date(dateString);
  } catch (error) {
    console.error('Error procesando fecha:', dateString);
    return new Date();
  }
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
    const matchesDate = item.start >= rangeStart && item.start <= rangeEnd;

    const matchesSearch = filters.search
      ? searchMatches(item, filters.search)
      : true;

    // Convertir network a string para comparación  
    const matchesNetwork = filters.network
      ? item.Network?.toString().trim() === filters.network.toString().trim()
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

    const isSingleBroadcast = filters.ltsa === 'single'
      ? data.filter(d => d["Show Code"] === item["Show Code"]).length === 1
      : true;

    return (
      matchesDate &&
      matchesSearch &&
      matchesNetwork &&
      matchesShowCode &&
      matchesFeed &&
      matchesStatus &&
      matchesLTSA &&
      isSingleBroadcast
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
    program["Episode Title"]?.toLowerCase().includes(lowerSearchTerm) ||
    program["Show Code"]?.toLowerCase().includes(lowerSearchTerm) ||
    program.Network?.toLowerCase().includes(lowerSearchTerm) ||
    program.Feed?.toLowerCase().includes(lowerSearchTerm)
  );
};

// COMPONENTES AUXILIARES

/**
 * Componente para mostrar información detallada de un programa.
 * @param {Object} program - Datos del programa.
 * @param {boolean} isDuplicate - Indica si el programa está duplicado.
 * @param {Array} Networks - Lista de redes asociadas al programa.
 * @returns {JSX.Element} - Tarjeta con la información del programa.
 */
const ProgramCard = ({ program, isDuplicate, Networks }) => (
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
                  {Networks.length > 1 ? `${Networks.length} redes` : 'Duplicado'}
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
  Networks: PropTypes.arrayOf(PropTypes.string)
};

ProgramCard.defaultProps = {
  isDuplicate: false,
  Networks: []
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




const ProgramGraphic = () => {

  // Referencias para los componentes
  const metricsRef = useRef(null);
  const timeSlotsRef = useRef(null);
  const programsTableRef = useRef(null);
  const networkDistributionRef = useRef(null);


  // Estado para los archivos subidos
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const savedFiles = localStorage.getItem('executiveDashboardFiles');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  const [dashboardData, setDashboardData] = useState(() => {
    const savedData = localStorage.getItem('executiveDashboardData');
    return savedData ? JSON.parse(savedData) : [];
  });

  // Estado de UI
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);


  // Filtros
  const [filters, setFilters] = useState({
    feed: '',
    network: '',
    status: '',
    ltsa: '',
    search: '',
    showCode: ''
  });


  // Estado para el rango de fechas temporal
  const [tempDateRange, setTempDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  // Rangos de fecha / hora
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  // Estado para el rango de fechas disponibles
  const [availableDateRange, setAvailableDateRange] = useState({
    minDate: null,
    maxDate: null
  });

  // Estados para el control del gráfico de franjas horarias
  const [hourRange, setHourRange] = useState({ start: 0, end: 23 });
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [timeSlotTabKey, setTimeSlotTabKey] = useState('chart');

  /* Modales y Estados de Programas */

  // Estado para controlar los modales
  const [showModal, setShowModal] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedTypePrograms, setSelectedTypePrograms] = useState([]);
  const [clickedType, setClickedType] = useState('');

  // Programas tape seleccionados
  const [showTapeModal, setShowTapeModal] = useState(false);
  const [selectedDayPrograms, setSelectedDayPrograms] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  // Estado para controlar el modal de información de archivo
  const [showInfoModal, setShowInfoModal] = useState(false);


  // Colores para gráficos
  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B5249', '#59A5D8'];

  // Efectos 

  // Referencia para el componente de fecha

  useEffect(() => {
    if (dashboardData.length > 0) {
      const sampleWithNetwork = dashboardData.find(item => item.Network);
      console.log("Ejemplo de dato con Network:", sampleWithNetwork);

      const allNetworks = [...new Set(dashboardData.map(item => item.Network).filter(Boolean))];
      console.log("Todos los valores únicos de Network:", allNetworks);
    }
  }, [dashboardData]);

  // Efecto para limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (uploadMessage) {
      const timeout = setTimeout(() => {
        setUploadMessage(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [uploadMessage]);

  // Funciones principales 
  // Manejo de datos 
  // Función para manejar la carga de archivos

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsLoading(true);
    setUploadMessage(null);

    const promises = files.map(file =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convertir a JSON manteniendo los headers originales
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

            // Normalizar los nombres de columnas
            const normalizedData = jsonData.map(item => {
              const normalized = {};
              for (const key in item) {
                // Normalizar el nombre de la columna
                const cleanKey = key.trim().toUpperCase();

                // Mapear a nombres estándar
                if (cleanKey === 'NETWORK' || cleanKey === 'CHANNEL' || cleanKey === 'NETWORK ID') {
                  normalized['Network'] = item[key]?.toString().trim();
                } else if (REQUIRED_COLUMNS.map(c => c.toUpperCase()).includes(cleanKey)) {
                  normalized[REQUIRED_COLUMNS.find(c => c.toUpperCase() === cleanKey)] = item[key]?.toString().trim();
                } else {
                  normalized[key] = item[key];
                }
              }
              return normalized;
            });

            // Verificar que tenga las columnas requeridas
            const firstItemKeys = Object.keys(normalizedData[0] || {});
            const missing = REQUIRED_COLUMNS.filter(col => !firstItemKeys.includes(col));

            if (missing.length > 0) {
              throw new Error(`Missing columns: ${missing.join(', ')}`);
            }

            resolve({ file, data: normalizedData });
          } catch (error) {
            resolve({ file, error: error.message });
          }
        };
        reader.readAsArrayBuffer(file);
      })
    );

    Promise.all(promises).then(results => {
      const validFiles = [];
      const allValidData = [];
      const errorMessages = [];

      results.forEach(result => {
        if (result.error) {
          errorMessages.push(`${result.file.name}: ${result.error}`);
        } else {
          validFiles.push(result.file);
          allValidData.push(...result.data);
        }
      });

      if (allValidData.length > 0) {
        const combined = [...dashboardData, ...allValidData];

        // Eliminar duplicados
        const unique = combined.filter((item, index, self) =>
          index === self.findIndex(other =>
            COLUMNS_TO_COMPARE.every(key =>
              (item[key]?.toString().trim() || '') === (other[key]?.toString().trim() || '')
            )
          )
        );

        setDashboardData(unique);
        localStorage.setItem('executiveDashboardData', JSON.stringify(unique));

        setUploadedFiles(prev => [...prev, ...validFiles.map(f => ({
          name: f.name,
          lastModified: f.lastModified,
          size: f.size
        }))]);

        updateDateRange(unique);
      }

      // Mostrar mensajes
      if (errorMessages.length > 0) {
        setUploadMessage({
          type: allValidData.length > 0 ? 'warning' : 'danger',
          text: `Some files had issues:\n${errorMessages.join('\n')}`
        });
      } else if (allValidData.length > 0) {
        setUploadMessage({
          type: 'success',
          text: 'Files uploaded successfully!'
        });
      }

      setIsLoading(false);
      e.target.value = '';
    });
  };

  // Función para eliminar un archivo cargado

  const handleRemoveFile = (fileToRemove) => {
    const updatedFiles = uploadedFiles.filter(file =>
      !(file.name === fileToRemove.name &&
        file.lastModified === fileToRemove.lastModified &&
        file.size === fileToRemove.size)
    );

    setUploadedFiles(updatedFiles);
    localStorage.setItem('executiveDashboardFiles', JSON.stringify(updatedFiles));

    if (updatedFiles.length === 0) {
      setDashboardData([]);
      localStorage.removeItem('executiveDashboardData');
      setAvailableDateRange({ minDate: null, maxDate: null });
    }
  };

  // Actualizar el rango de fechas disponible
  const updateDateRange = (data) => {
    const dates = data
      .map(item => processDate(item["Start Date"]))
      .filter(date => !isNaN(date.getTime()));

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
      const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));

      setAvailableDateRange({ minDate, maxDate });
      setDateRange([{ startDate: minDate, endDate: maxDate, key: 'selection' }]);
      setTempDateRange([{ startDate: minDate, endDate: maxDate, key: 'selection' }]);
    }
  };

  //filtros

  // Función para aplicar el rango de fechas
  const handleApplyDate = () => {
    setIsFiltering(true);

    setTimeout(() => {
      if (!tempDateRange[0]?.startDate || !tempDateRange[0]?.endDate) {
        setIsFiltering(false);
        return;
      }

      const startDate = new Date(tempDateRange[0].startDate);
      const endDate = new Date(tempDateRange[0].endDate);

      if (availableDateRange.minDate && startDate < availableDateRange.minDate) {
        alert(`Start date cannot be before ${availableDateRange.minDate.toLocaleDateString()}`);
        setIsFiltering(false);
        return;
      }

      if (availableDateRange.maxDate && endDate > availableDateRange.maxDate) {
        alert(`End date cannot be after ${availableDateRange.maxDate.toLocaleDateString()}`);
        setIsFiltering(false);
        return;
      }

      setDateRange([...tempDateRange]);
      setIsFiltering(false);
    }, 500);
  };

  // Función para aplicar el rango de fechas
  const toggleFilters = () => setShowFilters(!showFilters);

  // Exportacion 

  // Función para generar el PDF
  const handleExportPDF = async () => {
    try {
      // 1. Mostrar todos los elementos necesarios
      setShowFilters(true);
      setShowDetails(true);
      setTimeSlotTabKey('chart'); // Asegurar que el gráfico está visible

      // 2. Esperar múltiples ciclos de renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. Preparar datos para el PDF
      const reportSections = [
        {
          title: 'Key Metrics',
          type: 'metrics',
          data: [
            { label: 'Total Programs', value: filteredData.length },
            { label: 'Live Broadcasts', value: filteredData.filter(p => p.LTSA === 'Live').length },
            { label: 'Tape Delays', value: filteredData.filter(p => p.LTSA === 'Tape').length },
            { label: 'Short Turnaround', value: filteredData.filter(p => p.LTSA === 'Short Turnaround').length },
            { label: 'Duplicate Shows', value: Array.from(duplicates.values()).filter(v => v.count > 1).length },
            { label: 'Unique Networks', value: new Set(filteredData.map(p => p.Network)).size }
          ]
        },
        {
          title: 'Time Slot Distribution',
          type: 'chart',
          node: document.getElementById('time-slots-chart-container') // Asegúrate de tener este ID
        },
        {
          title: 'Program Schedule',
          type: 'table',
          headers: ['Show Code', 'Title', 'Network', 'Time', 'Duration', 'Type', 'Status'],
          rows: filteredData.map(program => [
            program["Show Code"] || 'N/A',
            program["Episode Title"] || 'N/A',
            program.Network || 'N/A',
            program["Start Time"] || 'N/A',
            program.Duration || 'N/A',
            program.LTSA || 'N/A',
            program.Status || 'N/A'
          ])
        }
      ];

      // 4. Generar PDF
      await exportToPDF(reportSections, 'Program Report');

    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };


  // Manejadores de interacion 

  // Función para manejar clic en gráfico de tipos
  const handleTypeBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedType = data.activePayload[0].payload.name;
      let matchingPrograms = [];

      if (clickedType === 'Live' || clickedType === 'Tape' || clickedType === 'Short Turnaround') {
        matchingPrograms = filteredData.filter(item => item.LTSA === clickedType);
      } else if (clickedType === 'PLATAFORMA' || clickedType === 'LINEAL') {
        matchingPrograms = filteredData.filter(item => item.EMISION === clickedType);
      }

      setSelectedTypePrograms(matchingPrograms);
      setClickedType(clickedType);
      setShowTypeModal(true);
    }
  };

  // Manejador de clic en las barras del gráfico
  const handleTimeSlotBarClick = (e) => {
    if (e.activePayload && e.activePayload.length > 0) {
      const clickedHour = parseInt(e.activePayload[0].payload.hour);

      // Filtrar programas de esa hora
      const matchingPrograms = filteredData.filter(program => {
        const programHour = parseInt(program["Start Time"]?.split(':')[0] || 0);
        return programHour === clickedHour &&
          (selectedFeeds.length === 0 || selectedFeeds.includes(program.Feed));
      });

      setSelectedPrograms(matchingPrograms);
      setShowModal(true);
    }
  };

  // Función para manejar clic en gráfico de horarios
  const handleTimeSlotClick = (data, index) => {
    if (!timeSlots || index === undefined) return;
    const clickedSlot = timeSlots[index];

    const matchingPrograms = filteredData.filter(program => {
      const programHour = parseInt(program["Start Time"]?.split(':')[0] || 0);
      return programHour >= clickedSlot.originalHour && programHour < clickedSlot.originalHour + 3;
    });

    setSelectedPrograms(matchingPrograms);
    setShowModal(true);
    setSelectedSlot(clickedSlot);
  };


  // Utiliades 

  // Formatear rango de fechas
  const formatDateRange = useCallback((start, end) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate) || isNaN(endDate)) return 'Invalid date';

      const options = { day: '2-digit', month: 'short' };
      return startDate.toLocaleDateString('es-ES', options) +
        (startDate.getTime() === endDate.getTime()
          ? ` ${startDate.getFullYear()}`
          : ` - ${endDate.toLocaleDateString('es-ES', options)} ${endDate.getFullYear()}`);
    } catch {
      return 'Invalid date';
    }
  }, []);

  // Referencia para el PDF
  const pdfRef = useRef();

  /* Datos derivadoes (used in useMemo) */

  // Procesamiento de datos principal
  const { filteredData, timeSlots, duplicates, networkDistribution, showCodeNetworkMap } = useMemo(() => {
    setIsFiltering(true);
    const processed = dashboardData
      .map(item => ({
        ...item,
        start: processDate(item["Start Date"]),
        end: processDate(item["End Date"]),
        Network: item.Network?.toString().trim()
      }))
      .filter(item => !isNaN(item.start.getTime()) && !isNaN(item.end.getTime()));

    const rangeStart = new Date(dateRange[0].startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange[0].endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    const filtered = filterData(processed, filters, rangeStart, rangeEnd);

    // Calcular programas únicos por network
    const uniqueProgramsByNetwork = {};
    const showCodeNetworkMap = {};

    // Mapeamos todos los show codes a sus networks
    processed.forEach(program => {
      if (!showCodeNetworkMap[program["Show Code"]]) {
        showCodeNetworkMap[program["Show Code"]] = new Set();
      }
      showCodeNetworkMap[program["Show Code"]].add(program.Network);
    });

    // Para el filtro 'single', contamos solo los programas que aparecen en una sola network
    if (filters.ltsa === 'single') {
      filtered.forEach(program => {
        const networksForShow = showCodeNetworkMap[program["Show Code"]];
        if (networksForShow && networksForShow.size === 1) {
          const network = Array.from(networksForShow)[0];
          uniqueProgramsByNetwork[network] = (uniqueProgramsByNetwork[network] || 0) + 1;
        }
      });
    }

    const programMap = new Map();
    filtered.forEach(program => {
      const key = `${program["Show Code"]}-${program["Start Date"]}-${program["Start Time"]}`;
      const existing = programMap.get(key) || { count: 0, networks: new Set() };
      programMap.set(key, {
        count: existing.count + 1,
        networks: existing.networks.add(program.Network)
      });
    });

    const slots = Array(8).fill().map((_, i) => ({
      hour: `${i * 3}:00 - ${i * 3 + 3}:00`,
      Live: 0,
      Tape: 0,
      Short: 0,
      originalHour: i * 3
    }));

    filtered.forEach(item => {
      const hour = parseInt(item["Start Time"]?.split(':')[0] || 0);
      const slotIndex = slots.findIndex(slot =>
        hour >= slot.originalHour && hour < slot.originalHour + 3
      );
      if (slotIndex !== -1) {
        const type = item.LTSA === 'Short Turnaround' ? 'Short' : item.LTSA;
        slots[slotIndex][type]++;
      }
    });

    const networkData = filters.ltsa === 'single'
      ? uniqueProgramsByNetwork
      : filtered.reduce((acc, program) => {
        const network = program.Network;
        acc[network] = (acc[network] || 0) + 1;
        return acc;
      }, {});


    const networkDistribution = filters.network
      ? [{ name: filters.network.toString(), count: filtered.length }]
      : Object.entries(networkData)
        .map(([name, count]) => ({ name: name.toString(), count }))
        .sort((a, b) => b.count - a.count);
    setIsFiltering(false);

    return {
      filteredData: filtered,
      timeSlots: slots,
      duplicates: programMap,
      networkDistribution,
      showCodeNetworkMap
    };
  }, [dashboardData, dateRange, filters]);

  // Procesar datos para el gráfico de franjas horarias
  const { timeSlotsNew, filteredTimeSlotData } = useMemo(() => {
    const slots = Array(24).fill().map((_, i) => ({
      hour: `${i}:00`,
      Live: 0,
      Tape: 0,
      'Short Turnaround': 0,
      originalHour: i
    }));

    filteredData.forEach(item => {
      const hour = parseInt(item["Start Time"]?.split(':')[0] || 0);
      if (hour >= 0 && hour < 24) {
        const type = item.LTSA === 'Short Turnaround' ? 'Short Turnaround' : item.LTSA;
        slots[hour][type]++;
      }
    });

    // Filtrar según el rango horario y feeds seleccionados
    const filtered = slots
      .filter(item => {
        const hour = parseInt(item.hour);
        return hour >= hourRange.start && hour <= hourRange.end;
      })
      .map(item => {
        // Si hay feeds seleccionados, ajustar los datos
        if (selectedFeeds.length > 0) {
          const feedCounts = filteredData.reduce((acc, program) => {
            const programHour = parseInt(program["Start Time"]?.split(':')[0] || 0);
            if (programHour === item.originalHour && selectedFeeds.includes(program.Feed)) {
              acc[program.LTSA === 'Short Turnaround' ? 'Short Turnaround' : program.LTSA]++;
            }
            return acc;
          }, { Live: 0, Tape: 0, 'Short Turnaround': 0 });

          return { ...item, ...feedCounts };
        }
        return item;
      });

    return { timeSlotsNew: slots, filteredTimeSlotData: filtered };
  }, [filteredData, hourRange, selectedFeeds]);

  // Métricas calculadas
  const metrics = useMemo(() => ({
    total: filteredData.length,
    live: filteredData.filter(d => d.LTSA === 'Live').length,
    tape: filteredData.filter(d => d.LTSA === 'Tape').length,
    short: filteredData.filter(d => d.LTSA === 'Short Turnaround').length,

    duplicates: Array.from(duplicates.values()).filter(v => v.count > 1).length,
    programsSingles: showCodeNetworkMap
      ? Object.values(showCodeNetworkMap).filter(networks => networks.size === 1).length
      : 0
  }), [filteredData, duplicates, showCodeNetworkMap]);




  return (
    <Container fluid className="executive-dashboard" ref={pdfRef}>
      {/* Spinner de carga */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <Spinner animation="border" variant="primary" />
            <div className="loading-text">Processing data...</div>
          </div>
        </div>
      )}

      {/* Mensaje de carga de archivos */}
      {uploadMessage && (
        <div className={`alert alert-${uploadMessage.type} text-center`} role="alert">
          {uploadMessage.text}
        </div>
      )}

      {/* Modal de Información de Formato de Archivo */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-warning text-black">
          <Modal.Title>
            <FiInfo className="me-2" />
            Excel File Format Requirements
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Supported Formats:</h5>
          <ul>
            <li>.xlsx (Excel Workbook)</li>
            <li>.xls (Excel 97-2003 Workbook)</li>
            <li>.csv (Comma Separated Values)</li>
          </ul>

          <h5 className="mt-4">Required Columns:</h5>
          <Table striped bordered responsive style={{ width: '100%', maxWidth: '100%' }}>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {REQUIRED_COLUMNS.map((column, index) => (
                <tr key={index}>
                  <td><strong>{column}</strong></td>
                  <td>
                    {column === 'Feed' && 'Feed number or identifier'}
                    {column === 'Network' && 'Network number or identifier'}
                    {column === 'Show Code' && 'Unique identifier for the content'}
                    {column === 'Program' && 'Program identifier'}
                    {column === 'Title #' && 'Title number'}
                    {column === 'Episode Title' && 'Title or description of the content'}
                    {column === 'Dow' && 'Day of week identifier'}
                    {column === 'Start Date' && 'Date of the content (DD/MM/YYYY)'}
                    {column === 'Start Time' && 'Start time of the content (HH:MM:SS)'}
                    {column === 'End Time' && 'End time of the content (HH:MM:SS)'}
                    {column === 'End Date' && 'End date of the content (DD/MM/YYYY)'}
                    {column === 'Duration' && 'Duration of the content (HH:MM:SS)'}
                    {column === 'LTSA' && 'Type of broadcast (Live, Tape, Short Turnaround)'}
                    {column === 'Status' && 'Current status'}
                    {column === 'Origin' && 'Origin of the content'}

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Modal de Detalles de Programas por Horario */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FiClock className="me-2" />
            Programs for {selectedSlot?.hour || 'selected time slot'}
            <Badge bg="info" className="ms-3">
              {selectedPrograms.length} {selectedPrograms.length === 1 ? 'program' : 'programs'}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive style={{ width: '100%', maxWidth: '100%' }}>
            <thead>
              <tr>
                <th>Show Code</th>
                <th>Episode Title</th>
                <th>Network</th>
                <th>Feed</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Type</th>

              </tr>
            </thead>
            <tbody>
              {selectedPrograms.map((program, index) => (
                <tr key={index}>
                  <td>{program["Show Code"]}</td>
                  <td>{program["Episode Title"]}</td>
                  <td>{program.Network}</td>
                  <td>{program.Feed}</td>
                  <td>{program["Start Time"]}</td>
                  <td>{program.Duration}</td>
                  <td>
                    <Badge bg={program.LTSA === 'Live' ? 'danger' : 'warning'}>
                      {program.LTSA}
                    </Badge>
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>
          {selectedPrograms.length === 0 && (
            <div className="text-center py-4">
              <FiXCircle className="display-6 text-muted mb-3" />
              <p className="text-muted">No programs found for this time slot</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal para Type Program (Live, Tape, etc.) */}
      <Modal show={showTypeModal} onHide={() => setShowTypeModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FiFilm className="me-2" />
            {clickedType} Programs
            <Badge bg="info" className="ms-3">
              {selectedTypePrograms.length} {selectedTypePrograms.length === 1 ? 'program' : 'programs'}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>


          <Table striped bordered hover responsive style={{ width: '100%', maxWidth: '100%' }}>
            <thead>
              <tr>
                <th>Show Code</th>
                <th>Episode Title</th>
                <th>Network</th>
                <th>Feed</th>
                <th>Start Date</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedTypePrograms.map((program, index) => (
                <tr key={index}>
                  <td>{program["Show Code"]}</td>
                  <td>{program["Episode Title"]}</td>
                  <td>{program.Network}</td>
                  <td>{program.Feed}</td>
                  <td>{program["Start Date"]}</td>
                  <td>{program["Start Time"]}</td>
                  <td>{program.Duration}</td>
                  <td>{program.Status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {selectedTypePrograms.length === 0 && (
            <div className="text-center py-4">
              <FiXCircle className="display-6 text-muted mb-3" />
              <p className="text-muted">No programs found for this type</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal for Tape Programs Details */}
      <Modal show={showTapeModal} onHide={() => setShowTapeModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FiCalendar className="me-2" />
            Tape Programs for {selectedDayDate?.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
            <Badge bg="success" className="ms-3">
              {selectedDayPrograms.length} {selectedDayPrograms.length === 1 ? 'program' : 'programs'}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive style={{ width: '100%', maxWidth: '100%' }}>
            <thead>
              <tr>
                <th>Show Code</th>
                <th>Episode Title</th>
                <th>Network</th>
                <th>Feed</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedDayPrograms.map((program, index) => (
                <tr key={index}>
                  <td>{program["Show Code"]}</td>
                  <td>{program["Episode Title"]}</td>
                  <td>{program.Network}</td>
                  <td>{program.Feed}</td>
                  <td>{program["Start Time"]}</td>
                  <td>{program.Duration}</td>
                  <td>{program.Status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {selectedDayPrograms.length === 0 && (
            <div className="text-center py-4">
              <FiXCircle className="display-6 text-muted mb-3" />
              <p className="text-muted">No Tape programs found for this day</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Encabezado del dashboard */}
      <Row className="dashboard-header align-items-center mb-4">
        <Col md={8}>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <div>
              <h3 className="mb-1">Program Report Graphic  </h3>
              <div className="date-display">
                <FiCalendar className="me-3" />
                {formatDateRange(dateRange[0].startDate, dateRange[0].endDate)}
              </div>
            </div>
          </Stack>
        </Col>
        <Col md={4} className="text-end">
          <Stack direction="horizontal" gap={3} className="justify-content-end align-items-center">
            <Button variant="outline-primary" onClick={toggleFilters}>
              {showFilters ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Filters
            </Button>
            <Button variant="outline-secondary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}
              Table
            </Button>
            <Button variant="outline-danger" onClick={handleExportPDF}>
              <FiDownload className="me-2" />
              Export PDF
            </Button>
            <Button variant="outline-warning" onClick={() => setShowInfoModal(true)}>
              <FiInfo className="me-2" />
              File Format
            </Button>

            {/* Botón para cargar archivos */}
            <div className="file-upload-section">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                multiple
              />
              <Button as="label" htmlFor="file-upload" variant="outline-success">
                <FiUpload className="me-2" />
                Upload Files
              </Button>
            </div>
          </Stack>
        </Col>
      </Row>

      {/* Archivos Cargados */}
      {uploadedFiles.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <h6>Uploaded Files:</h6>
                <div className="file-list">
                  {uploadedFiles.map((file, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2 file-badge">
                      {file.name}
                      <Button
                        variant="link"
                        className="text-danger p-0 ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file);
                        }}
                        title="Remove file"
                      >
                        <FiX size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Collapse in={showFilters}>
        <div>
          <Card className="main-filters mb-5">
            <Card.Body>
              <Row className="g-3">
                <Col xl={4} lg={5} md={12} className="d-flex flex-column">
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
                          direction="horizontal"
                          minDate={availableDateRange.minDate}
                          maxDate={availableDateRange.maxDate}
                        />
                      </div>
                      {availableDateRange.minDate && availableDateRange.maxDate && (
                        <h3 className="text-muted d-block mt-1">
                          Available range: {availableDateRange.minDate.toLocaleDateString()} - {availableDateRange.maxDate.toLocaleDateString()}
                        </h3>
                      )}
                      <Button
                        variant="primary"
                        onClick={handleApplyDate}
                        className="mt-2 w-90 apply-date-btn"
                        disabled={isFiltering}
                      >
                        {isFiltering ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <FiCheck className="me-2" /> Apply Date
                          </>
                        )}
                      </Button>
                    </div>
                  </FilterControl>
                </Col>

                <Col xl={8} lg={7} md={12}>
                  <Row className="g-3">
                    <Col md={12} className="filter-group">
                      <Row className="g-3">
                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Type" icon={<FiSliders />}>
                            <Form.Select
                              value={filters.ltsa}
                              onChange={e => setFilters(prev => ({ ...prev, ltsa: e.target.value }))}
                            >
                              <option value="">All</option>
                              <option value="Live">Live</option>
                              <option value="Tape">Tape</option>
                              <option value="Short Turnaround">Short Turnaround</option>
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Feed" icon={<FiType />}>
                            <Form.Select
                              value={filters.feed}
                              onChange={e => setFilters(prev => ({ ...prev, feed: e.target.value }))}
                            >
                              <option value="">All</option>
                              {['A', 'B', 'C', 'D', 'E', 'U'].map(feed => (
                                <option key={feed} value={feed}>{feed}</option>
                              ))}
                            </Form.Select>
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Network" icon={<FiTv />}>

                            <Form.Select
                              value={filters.network}
                              onChange={e => setFilters(prev => ({ ...prev, network: e.target.value }))}
                            >
                              <option value="">All</option>
                              {['9', '14', '17', '53', '93', '109', '171', '173', '177', '178', '179', '193', '214', '314', '315', '417', '418', '426', '428', '651', '653', '654', '691', '692', '693']
                                .map(network => (
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
                          <FilterControl label="Show Code" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Search by show code"
                              value={filters.showCode}
                              onChange={e => setFilters(prev => ({ ...prev, showCode: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <FilterControl label="Episode Title" icon={<FiSearch />}>
                            <Form.Control
                              type="text"
                              placeholder="Search by title"
                              value={filters.search}
                              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                          </FilterControl>
                        </Col>

                        <Col xs={12} sm={4} lg={3}>
                          <Button
                            variant="outline-danger"
                            onClick={() => setFilters({
                              feed: '', network: '', status: '', ltsa: '', search: '', showCode: ''
                            })}
                            className="w-90 clear-all-btn"
                          >
                            <FiRefreshCw className="me-2" /> Clear filters
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

      {/* Métricas */}
      <Row ref={metricsRef} id="metrics-section" className="metrics-grid" style={{ visibility: 'visible' }}>
        {[
          { title: 'Total Content', value: metrics.total, icon: <FiTv />, color: 'dark' },
          { title: 'Live', value: metrics.live, icon: <FiCalendar />, color: 'danger' },
          { title: 'Tape', value: metrics.tape, icon: <FaFilm />, color: 'secondary' },
          { title: 'Short Turnaround', value: metrics.short, icon: <FiBell />, color: 'warning' },

          { title: 'Show Code', value: metrics.duplicates, icon: <FiBarChart2 />, color: 'primary' }


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

      {/* Gráficos principales */}

      <Row ref={timeSlotsRef} id="time-slots-section" className="time-slots-chart" style={{ visibility: 'visible' }}>
        {/* pendiente - Gráfico de Franjas Horarias */}

        <Col xl={12}>
          <Card id="time-slots-chart-container" ref={timeSlotsRef} className="chart-card">
            <Card.Header className="chart-header">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <FiClock className="me-2" />
                  Programs by Time Slot
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
                    <small className="me-2">Networl:</small>
                    <div className="d-flex flex-wrap gap-1 feed-badges">

                      {['A', 'B', 'C', 'D', 'E', 'U'].map(feed => (
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
                activeKey={timeSlotTabKey}
                onSelect={(k) => setTimeSlotTabKey(k)}
                className="mb-3"
              >
                <Tab eventKey="chart" title={<span><FiBarChart2 className="me-2" />Graphic</span>}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={filteredTimeSlotData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      onClick={handleTimeSlotBarClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                      <XAxis
                        dataKey="hour"
                        label={{
                          value: 'Hour of Day',
                          position: 'insideBottom',
                          offset: -50,
                          fontSize: 12
                        }}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        label={{
                          value: 'Number of Programs',
                          angle: -90,
                          position: 'insideLeft',
                          offset: 10,
                          fontSize: 12
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const hour = parseInt(label);
                            const totalPrograms = payload.reduce((sum, item) => sum + item.value, 0);

                            return (
                              <div className="custom-tooltip p-2 bg-white border rounded shadow">
                                <p className="fw-bold mb-1">{`${hour}:00 - ${hour + 1}:00`}</p>
                                {payload.map((item, idx) => (
                                  <p key={idx} className="mb-0" style={{ color: item.color }}>
                                    {item.name}: <strong>{item.value}</strong>
                                  </p>
                                ))}
                                <p className="mt-1 mb-0">Total: <strong>{totalPrograms}</strong></p>
                                <small className="text-muted">Click to see details</small>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="small">{value}</span>}
                      />
                      <Bar
                        dataKey="Live"
                        name="Live"
                        stackId="stack"
                        fill="#dc3545"
                        opacity={0.8}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="Tape"
                        name="Tape"
                        stackId="stack"
                        fill="#28a745"
                        opacity={0.8}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="Short Turnaround"
                        name="Short Turnaround"
                        stackId="stack"
                        fill="#ffc107"
                        opacity={0.8}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Displaying {filteredTimeSlotData.length} hours from the selected time range |
                      Total programs: {filteredData.length}
                    </small>
                  </div>
                </Tab>
                <Tab eventKey="details" title={<span><FiList className="me-2" />Table</span>}>
                  <Row className="g-4">
                    <Col md={12}>
                      <div className="mb-4">
                        <h6 className="mb-3">Distribution by Feed</h6>
                        <div className="d-flex flex-wrap gap-2">

                          {['9', '14', '17', '53', '93', '109', '171', '173', '177', '178', '179', '193', '214', '314', '315', '417', '418', '426', '428', '651', '653', '654', '691', '692', '693'].map((network, index) => {
                            const count = filteredData.filter(program => program.Network === network).length;
                            return (
                              <Badge
                                key={network}
                                bg="light"
                                text="dark"
                                className="p-2"
                                style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                              >
                                {network}: {count} programs
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <Table ref={programsTableRef} id="programs-table" striped bordered responsive className="program-details-table" style={{ width: '100%', maxWidth: '100%' }}>
                        <thead>
                          <tr>
                            <th>Show Code</th>
                            <th>Episode Title</th>
                            <th>Network</th>
                            <th>Feed</th>
                            <th>Start Time</th>
                            <th>Duration</th>
                            <th>Type</th>

                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((program, idx) => (
                            <tr
                              key={idx}
                              onClick={() => {
                                setSelectedPrograms([program]);
                                setShowModal(true);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{program["Show Code"]}</td>
                              <td>{program["Episode Title"]}</td>
                              <td>{program.Network
                                ? program.Network
                                : <span className="text-muted">Unknown Network</span>

                              }</td>
                              <td>{program.Feed}</td>
                              <td>{program["Start Time"]}</td>
                              <td>{program.Duration}</td>
                              <td>
                                <Badge bg={program.LTSA === 'Live' ? 'danger' :
                                  program.LTSA === 'Tape' ? 'success' : 'warning'}>
                                  {program.LTSA}
                                </Badge>
                              </td>

                              <td>{program.Status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {filteredData.length === 0 && (
                        <div className="text-center py-4">
                          <FiXCircle className="display-6 text-muted mb-3" />
                          <p className="text-muted">No programs were found with the current filters</p>
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

      {/* Gráfico de programas Tape en 15 días */}
      <Row className="g-4 mb-5">
        <Col xl={12}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FiCalendar className="me-2" />
              Tape Programs Over 7 Days
              {filters.showCode && (
                <Badge bg="info" className="ms-2">
                  Tracking: {filters.showCode}
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={useMemo(() => {
                    // Calculate 7-day date range
                    const startDate = new Date(dateRange[0].startDate);
                    const endDate = new Date(dateRange[0].endDate);

                    // Adjust if range is less than 7 days
                    const rangeDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    const daysToShow = Math.min(7, rangeDays);

                    // Create daily buckets
                    const dailyData = Array(daysToShow).fill().map((_, i) => {
                      const date = new Date(startDate);
                      date.setDate(date.getDate() + i);
                      date.setHours(0, 0, 0, 0);

                      const nextDay = new Date(date);
                      nextDay.setDate(nextDay.getDate() + 1);

                      // Filter Tape programs for this day
                      const dayPrograms = filteredData.filter(program =>
                        program.LTSA === 'Tape' &&
                        program.start >= date &&
                        program.start < nextDay
                      );

                      // Check if the searched Show Code exists in this day's programs
                      const showCodeProgram = filters.showCode
                        ? dayPrograms.find(program =>
                          program["Show Code"]?.toLowerCase() === filters.showCode.toLowerCase()
                        )
                        : null;

                      return {
                        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                        count: dayPrograms.length,
                        fullDate: date,
                        programs: dayPrograms,
                        hasSearchedShowCode: !!showCodeProgram,
                        showCodeProgram: showCodeProgram
                      };
                    });

                    return dailyData;
                  }, [filteredData, dateRange, filters.showCode])}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                      const clickedData = data.activePayload[0].payload;
                      setSelectedDayPrograms(clickedData.programs);
                      setSelectedDayDate(clickedData.fullDate);
                      setShowTapeModal(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    label={{
                      value: 'Date',
                      position: 'insideBottom',
                      offset: -50,
                      fontSize: 12
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Number of Tape Programs',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      fontSize: 12
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="custom-tooltip p-2 bg-white border rounded shadow">
                            <p className="fw-bold mb-1">
                              {data.fullDate.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="mb-0">Tape programs: <strong>{data.count}</strong></p>
                            {data.hasSearchedShowCode && filters.showCode && (
                              <>
                                <hr className="my-2" />
                                <p className="mb-0 text-primary">
                                  <strong>Show Code found:</strong> {filters.showCode}
                                </p>
                                <p className="mb-0">
                                  Title: <strong>{data.showCodeProgram?.["Episode Title"]}</strong>
                                </p>
                                <p className="mb-0">
                                  Time: <strong>{data.showCodeProgram?.["Start Time"]}</strong>
                                </p>
                              </>
                            )}
                            <small className="text-muted">Click for details</small>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Tape Programs"
                    fill="#28a745"
                    opacity={0.8}
                    animationDuration={1500}
                  >
                    {useMemo(() => {
                      return Array(7).fill().map((_, index) => {
                        const dataPoint = this?.props?.data?.[index];
                        const hasShowCode = dataPoint?.hasSearchedShowCode;

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={hasShowCode ? '#17a2b8' : '#28a745'}
                            stroke={hasShowCode ? '#343a40' : undefined}
                            strokeWidth={hasShowCode ? 2 : undefined}
                          />
                        );
                      });
                    }, [filters.showCode])}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing Tape programs distribution over {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
                  {filters.showCode && (
                    <span className="d-block mt-1">
                      <FiInfo className="me-1" />
                      Blue bars indicate days containing the Show Code: {filters.showCode}
                    </span>
                  )}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de distribución por red */}


      <Row ref={networkDistributionRef} className="network-distribution">
        <Col xl={12}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FiTv className="me-3" />
              Program Distribution by Network
              <Badge bg="info" className="ms-2">
                Total: {networkDistribution.reduce((sum, item) => sum + item.count, 0)} programs
              </Badge>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={networkDistribution}
                    margin={{ top: 20, right: 30, left: 120, bottom: 60 }}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload.length > 0) {
                        const clickedNetwork = data.activePayload[0].payload.name;
                        const matchingPrograms = filteredData.filter(
                          program => program.Network === clickedNetwork
                        );
                        setSelectedPrograms(matchingPrograms);
                        setShowModal(true);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#6c757d' }}
                      domain={[0, 'auto']}
                      label={{
                        value: 'Number of Programs',
                        position: 'bottom',
                        offset: 10,
                        fontSize: 12
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fill: '#6c757d' }}
                      interval={0}
                      label={{
                        value: 'Network',
                        angle: -90,
                        position: 'left',
                        offset: 10,
                        fontSize: 12
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const network = payload[0].payload.name;
                          const count = payload[0].value;
                          const liveCount = filteredData.filter(
                            p => p.Network === network && p.LTSA === 'Live'
                          ).length;
                          const tapeCount = filteredData.filter(
                            p => p.Network === network && p.LTSA === 'Tape'
                          ).length;
                          const shortCount = filteredData.filter(
                            p => p.Network === network && p.LTSA === 'Short Turnaround'
                          ).length;

                          return (
                            <div className="custom-tooltip p-3 bg-white border rounded shadow">
                              <h6 className="mb-2">{network}</h6>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Total:</span>
                                <strong>{count}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-danger">Live:</span>
                                <strong>{liveCount}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-success">Tape:</span>
                                <strong>{tapeCount}</strong>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="text-warning">Short:</span>
                                <strong>{shortCount}</strong>
                              </div>
                              <small className="d-block mt-2 text-muted">
                                Click to view all programs
                              </small>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Programs by Network"
                      radius={[0, 3, 3, 0]}
                    >
                      {networkDistribution.map((entry, index) => {
                        // Color basado en el porcentaje del total
                        const totalPrograms = networkDistribution.reduce((sum, item) => sum + item.count, 0);
                        const percentage = (entry.count / totalPrograms) * 100;
                        let color;

                        if (percentage > 20) color = '#2E86AB'; // Azul fuerte para redes con más del 20%
                        else if (percentage > 10) color = '#3B8EA5'; // Azul medio para 10-20%
                        else if (percentage > 5) color = '#4D9DBF'; // Azul claro para 5-10%
                        else color = '#6FB4D2'; // Azul muy claro para menos del 5%

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={color}
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        );
                      })}
                    </Bar>

                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Card.Footer className="text-muted">
                <div className="d-flex justify-content-between align-items-center">
                  <small>
                    {filters.network
                      ? `Showing results for network ${filters.network}`
                      : 'Program distribution by television network'}
                  </small>
                  <div className="network-stats">
                    <Badge bg="danger" className="me-2">
                      Live: {filteredData.filter(p => p.LTSA === 'Live').length}
                    </Badge>
                    <Badge bg="success" className="me-2">
                      Tape: {filteredData.filter(p => p.LTSA === 'Tape').length}
                    </Badge>
                    <Badge bg="warning">
                      Short: {filteredData.filter(p => p.LTSA === 'Short Turnaround').length}
                    </Badge>
                  </div>
                </div>
              </Card.Footer>
            </Card.Body>
          </Card>
        </Col>
      </Row>




      {/* Tabla de programas duplicados */}
      <Row className="g-4 mb-5">
        <Col xl={12}>
          <Card className="chart-card">
            <Tabs defaultActiveKey="chart" className="mb-3" responsive style={{ width: '100%', maxWidth: '100%' }}>
              <Tab eventKey="chart" title={<span><FiBarChart2 className="me-1" />Graphic Duplicate</span>}>
                <Card.Header className="chart-header">
                  <Stack direction="horizontal" className="justify-content-between align-items-center w-100">
                    <h5 className="mb-0">Duplicate Programs Distribution Show Code</h5>
                    <Badge bg="info" pill>
                      Total duplicates: {Array.from(duplicates.values()).filter(v => v.count > 1).length}
                    </Badge>
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
  <BarChart
    layout="vertical"
    data={Array.from(duplicates.entries())
      .filter(([_, info]) => info.count > 1)
      .map(([key, info]) => {
        const showCode = key.split('-')[0];
        const program = filteredData.find(p => p["Show Code"] === showCode);
        return {
          name: showCode,
          count: info.count,
          networks: Array.from(info.networks).join(', '),
          networksCount: info.networks.size,
          title: program?.["Episode Title"] || 'N/A'
        };
      })}
    margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis
      type="number"
      tick={{ fill: '#495057', fontSize: 12 }}
      domain={[0, 'auto']}
      label={{
        value: 'Number of Duplicates',
        position: 'bottom',
        offset: 10,
        fontSize: 12
      }}
    />
    <YAxis
      type="category"
      dataKey="name"
      width={140}
      tick={{ fill: '#495057', fontSize: 12 }}
      label={{
        value: 'Show Code',
        angle: -90,
        position: 'left',
        offset: 10,
        fontSize: 12
      }}
    />
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div className="custom-tooltip p-3 bg-white border rounded shadow">
              <h6 className="mb-2">{label}</h6>
              <p className="mb-1"><strong>Title:</strong> {data.title}</p>
              <div className="d-flex justify-content-between mb-1">
                <span>Duplicates:</span>
                <strong>{data.count}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Networks:</span>
                <strong>{data.networksCount}</strong>
              </div>
              <div className="mt-2">
                <small className="text-muted">{data.networks}</small>
              </div>
            </div>
          );
        }
        return null;
      }}
    />
    <Bar
      dataKey="count"
      name="Duplicates"
      onClick={(data) => {
        if (data?.activePayload?.[0]?.payload) {
          const showCode = data.activePayload[0].payload.name;
          const matchingPrograms = filteredData.filter(
            program => program["Show Code"] === showCode
          );
          setSelectedPrograms(matchingPrograms);
          setShowModal(true);
        }
      }}
    >
      {Array.from(duplicates.entries())
        .filter(([_, info]) => info.count > 1)
        .map(([_, info], index) => {
          const networksCount = info.networks.size;
          let color;
          if (networksCount > 4) color = '#dc3545';
          else if (networksCount > 3) color = '#000fff';
          else if (networksCount > 2) color = '#ffc107';
          else color = '#20c997';
          
          return (
            <Cell
              key={`cell-${index}`}
              fill={color}
              stroke="#fff"
              strokeWidth={1}
            />
          );
        })}
    </Bar>
    <Legend
      wrapperStyle={{ paddingTop: '10px' }}
      payload={[
        { value: '2 Networks', type: 'rect', color: '#20c997' },
        { value: '3 Networks', type: 'rect', color: '#ffc107' },
        { value: '4 Networks', type: 'rect', color: '#000fff' },
        { value: '5+ Networks', type: 'rect', color: '#dc3545' }
      ]}
    />
  </BarChart>
</ResponsiveContainer>
                    
                  </div>
                </Card.Body>
              </Tab>
              <Tab eventKey="table" title={<span><FiMonitor className="me-1" />Table <Badge bg="dark" pill>{Array.from(duplicates.values()).filter(v => v.count > 1).length}</Badge></span>}>
                <Card.Header className="details-header">
                  <Stack direction="horizontal" className="justify-content-between align-items-center w-100">
                    <h5 className="mb-0">Duplicate Programs Table</h5>
                    <div className="d-flex gap-2">
                      <Badge bg="success" pill>
                        2 Networks: {Array.from(duplicates.values()).filter(v => v.networks.size === 2).length}
                      </Badge>
                      <Badge bg="warning" pill>
                        3 Networks: {Array.from(duplicates.values()).filter(v => v.networks.size === 3).length}
                      </Badge>
                      <Badge bg="primary" pill>
                        4 Networks: {Array.from(duplicates.values()).filter(v => v.networks.size === 4).length}
                      </Badge>
                      <Badge bg="danger" pill>
                        5+ Networks: {Array.from(duplicates.values()).filter(v => v.networks.size > 4).length}
                      </Badge>
                    </div>
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped bordered hover responsive style={{ width: '100%', maxWidth: '100%' }}>
                      <thead>
                        <tr>
                          <th>Show Code</th>
                          <th>Title</th>
                          <th>Networks</th>
                          <th>Feed</th>
                          <th>Duplicates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(duplicates.entries())
                          .filter(([_, info]) => info.count > 1)
                          .map(([key, info]) => {
                            const [showCode] = key.split('-');
                            const program = filteredData.find(p => p["Show Code"] === showCode);
                            const networksCount = info.networks.size;

                            // Determinar el color basado en la cantidad de redes
                            let badgeColor;
                            if (networksCount > 4) badgeColor = 'danger';
                            else if (networksCount > 3) badgeColor = 'primary';
                            else if (networksCount > 2) badgeColor = 'warning';
                            else badgeColor = 'success';

                            return (
                              <tr
                                key={key}
                                onClick={() => {
                                  const matchingPrograms = filteredData.filter(
                                    p => p["Show Code"] === showCode
                                  );
                                  setSelectedPrograms(matchingPrograms);
                                  setShowModal(true);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <td>
                                  <Badge bg="dark" className="fw-normal">
                                    {showCode}
                                  </Badge>
                                </td>
                                <td className="text-nowrap">
                                  {program?.["Episode Title"] || 'N/A'}
                                </td>
                                <td>
                                  {Array.from(info.networks).map((network, idx) => (
                                    <Badge
                                      key={idx}
                                      bg="secondary"
                                      className="me-1"
                                    >
                                      {network}
                                    </Badge>
                                  ))}
                                </td>
                                <td>
                                  <Badge bg="info" className="fw-normal">
                                    {program?.Feed || 'N/A'}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge
                                    bg={badgeColor}
                                    className="fw-normal"
                                    pill
                                  >
                                    {info.count}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>
                  </div>
                  {Array.from(duplicates.values()).filter(v => v.count > 1).length === 0 && (
                    <div className="text-center py-4">
                      <FiXCircle className="display-6 text-muted mb-3" />
                      <p className="text-muted">No duplicate programs found with current filters</p>
                    </div>
                  )}
                </Card.Body>
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Tabla de programas */}
      <Accordion activeKey={showDetails ? 'details' : null}>
        <Card className="programs-accordion">
          <Accordion.Item eventKey="details">
            <Card.Header className="details-header">
              <Stack direction="horizontal" className="justify-content-between align-items-center w-100 flex-wrap">
                <h5 className="mb-0">Programs Table</h5>
                <Badge bg="dark" pill>{filteredData.length}</Badge>
              </Stack>
            </Card.Header>
            <Accordion.Body>
              <Table ref={programsTableRef}

                id="programs-table"
                striped
                bordered
                hover
                responsive
                style={{ width: '100%', maxWidth: '100%', visibility: 'visible' }}
              >
                <thead>
                  <tr>
                    <th>Show Code</th>
                    <th>Episode Title</th>
                    <th>Network</th>
                    <th>Feed</th>
                    <th>Start Date</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Type</th>

                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((program, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        setSelectedPrograms([program]);
                        setShowModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{program["Show Code"]}</td>
                      <td>{program["Episode Title"]}</td>
                      <td>{program.Network}</td>
                      <td>{program.Feed}</td>
                      <td>{program["Start Date"]}</td>
                      <td>{program["Start Time"]}</td>
                      <td>{program.Duration}</td>
                      <td>
                        <Badge bg={program.LTSA === 'Live' ? 'danger' : 'warning'}>
                          {program.LTSA}
                        </Badge>
                      </td>

                      <td>{program.Status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {!filteredData.length && (
                <div className="text-center py-4">
                  <FiXCircle className="display-6 text-muted mb-3" />
                  <p className="text-muted">No programs found with current filters</p>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      </Accordion>
    </Container>
  );
};

export default ProgramGraphic;