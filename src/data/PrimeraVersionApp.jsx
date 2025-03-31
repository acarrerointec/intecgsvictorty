import { useState } from 'react';
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
  FiBarChart2, FiPieChart, FiClock 
} from 'react-icons/fi';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file




const ExecutiveDashboard = () => {
  // State para filtros
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date('2025-02-28'),
      endDate: new Date('2025-03-01'),
      key: 'selection'
    }
  ]);
  const [networkFilter, setNetworkFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState('charts');

  // Datos procesados (basados en tu feed)
  const rawData = [  

  
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "CPUR435",
        "Program": "",
        "Title #": 435,
        "Episode Title": "UFC Recargado: UFC 266: Volkanovski vs. Ortega.",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:00:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "03:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 314,
        "Show Code": "SBMS23",
        "Program": "",
        "Title #": 23,
        "Episode Title": "Liga Mexicana de Softbol .",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:25:00",
        "End Time": "01:30:00",
        "End Date": "28-02-2025",
        "Duration": "03:05:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 178,
        "Show Code": "SOXP649",
        "Program": "",
        "Title #": 649,
        "Episode Title": "Liga Expansión MX. Ronda: Jornada 8.",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:55:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:05:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SBMS23",
        "Program": "",
        "Title #": 23,
        "Episode Title": "Liga Mexicana de Softbol .",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:55:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "03:05:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SBMS23",
        "Program": "",
        "Title #": 23,
        "Episode Title": "Liga Mexicana de Softbol .",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:55:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "03:05:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "BOKO1601",
        "Program": "",
        "Title #": 1601,
        "Episode Title": "ESPN KnockOut: Top Rank-Emanuel Navarrete. Oscar Valdez.",
        "Dow": "THU",
        "Start Date": "Invalid DateTime",
        "Start Time": "23:00:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 53,
        "Show Code": "SOLS818",
        "Program": "",
        "Title #": 818,
        "Episode Title": "LALIGA Show.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "00:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOCC985",
        "Program": "",
        "Title #": 985,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "TNMO372",
        "Program": "",
        "Title #": 372,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Quarterfinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRDB15231",
        "Program": "",
        "Title #": 15231,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRCC1106",
        "Program": "",
        "Title #": 1106,
        "Episode Title": "SportsCenter. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "TNMO372",
        "Program": "",
        "Title #": 372,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Quarterfinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRDB15231",
        "Program": "",
        "Title #": 15231,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "01:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 314,
        "Show Code": "BKND2461",
        "Program": "",
        "Title #": 2461,
        "Episode Title": "NBA G League-Indiana Mad Ants. San Diego Clippers. Estadio: Frontwave Arena.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "4 - Publicado / Published"
      },
      {
        "Feed": "A",
        "Network": 314,
        "Show Code": "SOCC1037",
        "Program": "",
        "Title #": 1037,
        "Episode Title": "2025 Concacaf Champions Cup-Vancouver Whitecaps FC. Deportivo Saprissa. Estadio: BC Place. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 315,
        "Show Code": "SOCC985",
        "Program": "",
        "Title #": 985,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "00:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOGR1364",
        "Program": "",
        "Title #": 1364,
        "Episode Title": "German Cup.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "01:00:00",
        "End Time": "03:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOAR4865",
        "Program": "",
        "Title #": 4865,
        "Episode Title": "Copa de La Liga Profesional 2024-Estudiantes de La Plata. Belgrano.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "01:00:00",
        "End Time": "03:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRLD24985",
        "Program": "",
        "Title #": 24985,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "01:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRLD24985",
        "Program": "",
        "Title #": 24985,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "01:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SOECR181",
        "Program": "",
        "Title #": 181,
        "Episode Title": "Equipo F Centroamérica. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "01:00:00",
        "End Time": "02:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 178,
        "Show Code": "BKNH860",
        "Program": "",
        "Title #": 860,
        "Episode Title": "NBA Thursday-Denver Nuggets. Milwaukee Bucks. Estadio: Fiserv Forum.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "02:00:00",
        "End Time": "04:30:00",
        "End Date": "28-02-2025",
        "Duration": "02:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "02:00:00",
        "End Time": "03:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "02:00:00",
        "End Time": "03:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 315,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "02:00:00",
        "End Time": "03:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "4 - Publicado / Published"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOCC983",
        "Program": "",
        "Title #": 983,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "03:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOEXF360",
        "Program": "",
        "Title #": 360,
        "Episode Title": "Expediente Fútbol - PREVIA FECHA 2 SAF 18/19 EDITADO.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "03:00:00",
        "End Time": "04:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "03:00:00",
        "End Time": "04:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "03:00:00",
        "End Time": "04:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 315,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "03:00:00",
        "End Time": "04:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "4 - Publicado / Published"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOHI2288",
        "Program": "",
        "Title #": 2288,
        "Episode Title": "Italian Serie A Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:00:00",
        "End Time": "05:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 178,
        "Show Code": "BKNH861",
        "Program": "",
        "Title #": 861,
        "Episode Title": "NBA Thursday-New Orleans Pelicans. Phoenix Suns. Estadio: Footprint Center.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "04:30:00",
        "End Time": "07:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOAP716",
        "Program": "",
        "Title #": 716,
        "Episode Title": "French Ligue 1 Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "05:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "CPUL380",
        "Program": "",
        "Title #": 380,
        "Episode Title": "UFC Unleashed.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:00:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOEH69",
        "Program": "",
        "Title #": 69,
        "Episode Title": "EFL Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "05:30:00",
        "End Time": "06:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOAR4854",
        "Program": "",
        "Title #": 4854,
        "Episode Title": "Copa de La Liga Profesional 2024-River Plate. Argentinos Jrs..",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "08:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOIU8473",
        "Program": "",
        "Title #": 8473,
        "Episode Title": "UEFA Champions League-Inter Milan. Estrella Roja.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "08:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "07:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "07:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "07:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "06:00:00",
        "End Time": "07:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SRID6590",
        "Program": "",
        "Title #": 6590,
        "Episode Title": "SportsCenter.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "07:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "03:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SRID6590",
        "Program": "",
        "Title #": 6590,
        "Episode Title": "SportsCenter.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "07:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "03:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRCC1106",
        "Program": "",
        "Title #": 1106,
        "Episode Title": "SportsCenter. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "07:00:00",
        "End Time": "08:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "TAEE107",
        "Program": "",
        "Title #": 107,
        "Episode Title": "ESPN Enfocados. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "07:00:00",
        "End Time": "08:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "9 - Finalizado"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "SOLS818",
        "Program": "",
        "Title #": 818,
        "Episode Title": "LALIGA Show.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "07:30:00",
        "End Time": "08:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 654,
        "Show Code": "SOEI891",
        "Program": "",
        "Title #": 891,
        "Episode Title": "Goles de la Premier League.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "09:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOIM17980",
        "Program": "",
        "Title #": 17980,
        "Episode Title": "Serie A 2024/2025-Hellas Verona. Fiorentina. Estadio: Stadio Marc'Antonio Bentegodi. Ronda: Fecha #26.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOAP716",
        "Program": "",
        "Title #": 716,
        "Episode Title": "French Ligue 1 Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "08:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOECR181",
        "Program": "",
        "Title #": 181,
        "Episode Title": "Equipo F Centroamérica. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "09:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOGF107",
        "Program": "",
        "Title #": 107,
        "Episode Title": "Generación Futbol. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "09:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 418,
        "Show Code": "TNWK1945",
        "Program": "",
        "Title #": 1945,
        "Episode Title": "ATP Tour: This Week.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:00:00",
        "End Time": "08:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 53,
        "Show Code": "SOLS818",
        "Program": "",
        "Title #": 818,
        "Episode Title": "LALIGA Show.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:30:00",
        "End Time": "09:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOEH69",
        "Program": "",
        "Title #": 69,
        "Episode Title": "EFL Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "08:30:00",
        "End Time": "09:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOEXF360",
        "Program": "",
        "Title #": 360,
        "Episode Title": "Expediente Fútbol - PREVIA FECHA 2 SAF 18/19 EDITADO.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:00:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "BKAB1935",
        "Program": "",
        "Title #": 1935,
        "Episode Title": "NBA Action.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:30:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 428,
        "Show Code": "BKAB1935",
        "Program": "",
        "Title #": 1935,
        "Episode Title": "NBA Action.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "09:30:00",
        "End Time": "10:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SRIAL85",
        "Program": "",
        "Title #": 85,
        "Episode Title": "SportsCenter. Estadio: Estudio de ESPN.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SRIAL85",
        "Program": "",
        "Title #": 85,
        "Episode Title": "SportsCenter. Estadio: Estudio de ESPN.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "SOYB257",
        "Program": "",
        "Title #": 257,
        "Episode Title": "Bundesliga Preview Show 24/25.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "10:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "BOKO1601",
        "Program": "",
        "Title #": 1601,
        "Episode Title": "ESPN KnockOut: Top Rank-Emanuel Navarrete. Oscar Valdez.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOIU8474",
        "Program": "",
        "Title #": 8474,
        "Episode Title": "UEFA Champions League-Lille. Real Madrid. Estadio: Estadio Bernabeu. Ronda: Fecha #2.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRCC1106",
        "Program": "",
        "Title #": 1106,
        "Episode Title": "SportsCenter. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:00:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 179,
        "Show Code": "BKAB1935",
        "Program": "",
        "Title #": 1935,
        "Episode Title": "NBA Action.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:30:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 315,
        "Show Code": "BKAB1935",
        "Program": "",
        "Title #": 1935,
        "Episode Title": "NBA Action.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "10:30:00",
        "End Time": "11:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SOFTW1856",
        "Program": "",
        "Title #": 1856,
        "Episode Title": "ESPN F12.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "13:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "B",
        "Network": 17,
        "Show Code": "AABD4918",
        "Program": "",
        "Title #": 4918,
        "Episode Title": "YR testing 17, focusing on 426 child network.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "11:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Live",
        "Status": "3 - Aprobado / Released"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SOFTW1856",
        "Program": "",
        "Title #": 1856,
        "Episode Title": "ESPN F12.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "13:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "B",
        "Network": 426,
        "Show Code": "AABD4918",
        "Program": "",
        "Title #": 4918,
        "Episode Title": "YR testing 17, focusing on 426 child network.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "11:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SOME41886",
        "Program": "",
        "Title #": 41886,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "11:00:00",
        "End Time": "12:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOAP716",
        "Program": "",
        "Title #": 716,
        "Episode Title": "French Ligue 1 Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "12:00:00",
        "End Time": "12:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOAR4854",
        "Program": "",
        "Title #": 4854,
        "Episode Title": "Copa de La Liga Profesional 2024-River Plate. Argentinos Jrs..",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "12:00:00",
        "End Time": "14:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "12:00:00",
        "End Time": "13:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRMD16003",
        "Program": "",
        "Title #": 16003,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "12:00:00",
        "End Time": "13:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOEH69",
        "Program": "",
        "Title #": 69,
        "Episode Title": "EFL Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "12:30:00",
        "End Time": "13:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SOFPE1136",
        "Program": "",
        "Title #": 1136,
        "Episode Title": "ESPN F90 .",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "13:00:00",
        "End Time": "15:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SOFPE1136",
        "Program": "",
        "Title #": 1136,
        "Episode Title": "ESPN F90 .",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "13:00:00",
        "End Time": "15:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOCC982",
        "Program": "",
        "Title #": 982,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "13:00:00",
        "End Time": "15:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOEXF360",
        "Program": "",
        "Title #": 360,
        "Episode Title": "Expediente Fútbol - PREVIA FECHA 2 SAF 18/19 EDITADO.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "14:00:00",
        "End Time": "15:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "SOISA90",
        "Program": "",
        "Title #": 90,
        "Episode Title": "Inside Serie A.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "14:30:00",
        "End Time": "15:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOCC983",
        "Program": "",
        "Title #": 983,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "15:00:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 653,
        "Show Code": "SOYB257",
        "Program": "",
        "Title #": 257,
        "Episode Title": "Bundesliga Preview Show 24/25.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "15:00:00",
        "End Time": "15:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "CPUL380",
        "Program": "",
        "Title #": 380,
        "Episode Title": "UFC Unleashed.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "15:00:00",
        "End Time": "16:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRIG10284",
        "Program": "",
        "Title #": 10284,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "15:00:00",
        "End Time": "16:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRIG10284",
        "Program": "",
        "Title #": 10284,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "15:00:00",
        "End Time": "16:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 651,
        "Show Code": "SOYB257",
        "Program": "",
        "Title #": 257,
        "Episode Title": "Bundesliga Preview Show 24/25.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "16:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOAP716",
        "Program": "",
        "Title #": 716,
        "Episode Title": "French Ligue 1 Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "16:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOMF9118",
        "Program": "",
        "Title #": 9118,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOMF9118",
        "Program": "",
        "Title #": 9118,
        "Episode Title": "Futbol Picante. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 9,
        "Show Code": "SOISA90",
        "Program": "",
        "Title #": 90,
        "Episode Title": "Inside Serie A.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "16:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 109,
        "Show Code": "SOISA90",
        "Program": "",
        "Title #": 90,
        "Episode Title": "Inside Serie A.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:00:00",
        "End Time": "16:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SRARN463",
        "Program": "",
        "Title #": 463,
        "Episode Title": "Sportscenter.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:30:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SRARN463",
        "Program": "",
        "Title #": 463,
        "Episode Title": "Sportscenter.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:30:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOEH69",
        "Program": "",
        "Title #": 69,
        "Episode Title": "EFL Highlights.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:30:00",
        "End Time": "17:00:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 418,
        "Show Code": "SOAH2176",
        "Program": "",
        "Title #": 2176,
        "Episode Title": "English League Championship.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "16:50:00",
        "End Time": "19:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:10:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOCC984",
        "Program": "",
        "Title #": 984,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "17:00:00",
        "End Time": "19:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOAR4854",
        "Program": "",
        "Title #": 4854,
        "Episode Title": "Copa de La Liga Profesional 2024-River Plate. Argentinos Jrs..",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "17:00:00",
        "End Time": "19:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRCC585",
        "Program": "",
        "Title #": 585,
        "Episode Title": "SportsCenter. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "17:00:00",
        "End Time": "18:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOEM108",
        "Program": "",
        "Title #": 108,
        "Episode Title": "Equipo Futbol. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "17:00:00",
        "End Time": "18:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SOECR182",
        "Program": "",
        "Title #": 182,
        "Episode Title": "Equipo F Centroamérica. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "18:00:00",
        "End Time": "19:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "TAEE108",
        "Program": "",
        "Title #": 108,
        "Episode Title": "ESPN Enfocados. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "18:00:00",
        "End Time": "19:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "CPUL380",
        "Program": "",
        "Title #": 380,
        "Episode Title": "UFC Unleashed.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "19:00:00",
        "End Time": "20:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOIU8474",
        "Program": "",
        "Title #": 8474,
        "Episode Title": "UEFA Champions League-Lille. Real Madrid. Estadio: Estadio Bernabeu. Ronda: Fecha #2.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "19:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRCC846",
        "Program": "",
        "Title #": 846,
        "Episode Title": "SportsCenter. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "19:00:00",
        "End Time": "20:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SOGF108",
        "Program": "",
        "Title #": 108,
        "Episode Title": "Generación Futbol. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "19:00:00",
        "End Time": "20:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "BOKS401",
        "Program": "",
        "Title #": 401,
        "Episode Title": "ESPN KnockOut.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 179,
        "Show Code": "SOEI892",
        "Program": "",
        "Title #": 892,
        "Episode Title": "Goles de la Premier League.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOAR4854",
        "Program": "",
        "Title #": 4854,
        "Episode Title": "Copa de La Liga Profesional 2024-River Plate. Argentinos Jrs..",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "22:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRED8727",
        "Program": "",
        "Title #": 8727,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRED8727",
        "Program": "",
        "Title #": 8727,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 314,
        "Show Code": "TASR10903",
        "Program": "",
        "Title #": 10903,
        "Episode Title": "Cronómetro.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:00:00",
        "End Time": "21:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 17,
        "Show Code": "SRII2362",
        "Program": "",
        "Title #": 2362,
        "Episode Title": "SportsCenter. Estadio: Buenos Aires.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:30:00",
        "End Time": "23:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 426,
        "Show Code": "SRII2362",
        "Program": "",
        "Title #": 2362,
        "Episode Title": "SportsCenter. Estadio: Buenos Aires.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "20:30:00",
        "End Time": "23:00:00",
        "End Date": "28-02-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 171,
        "Show Code": "SRCTA1343",
        "Program": "",
        "Title #": 1343,
        "Episode Title": "SportsCenter. Estadio: Buenos Aires.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "22:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 53,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 173,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 93,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 193,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "SOYB257",
        "Program": "",
        "Title #": 257,
        "Episode Title": "Bundesliga Preview Show 24/25.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "CPUL380",
        "Program": "",
        "Title #": 380,
        "Episode Title": "UFC Unleashed.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "22:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "SRED8292",
        "Program": "",
        "Title #": 8292,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "22:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "SRED8292",
        "Program": "",
        "Title #": 8292,
        "Episode Title": "SportsCenter. Estadio: Studio Mexico.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "22:00:00",
        "End Date": "28-02-2025",
        "Duration": "01:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "BKLM531",
        "Program": "",
        "Title #": 531,
        "Episode Title": "NBA Esta Noche. Estadio: Estudio ESPN Sur.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:00:00",
        "End Time": "21:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Short Turnaround",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 53,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 173,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 93,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 193,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "BKNN2303",
        "Program": "",
        "Title #": 2303,
        "Episode Title": "NBA Viernes-Cleveland Cavaliers. Boston Celtics. Estadio: TD Garden.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:30:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:30:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 178,
        "Show Code": "SOXP650",
        "Program": "",
        "Title #": 650,
        "Episode Title": "Liga Expansión MX. Ronda: Jornada 8.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:55:00",
        "End Time": "23:55:00",
        "End Date": "28-02-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "TNMO373",
        "Program": "",
        "Title #": 373,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Semifinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:55:00",
        "End Time": "23:30:00",
        "End Date": "28-02-2025",
        "Duration": "01:35:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "TNMO373",
        "Program": "",
        "Title #": 373,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Semifinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "21:55:00",
        "End Time": "23:30:00",
        "End Date": "28-02-2025",
        "Duration": "01:35:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 417,
        "Show Code": "BKAB1935",
        "Program": "",
        "Title #": 1935,
        "Episode Title": "NBA Action.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:00:00",
        "End Time": "22:30:00",
        "End Date": "28-02-2025",
        "Duration": "00:30:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 692,
        "Show Code": "SOIU8562",
        "Program": "",
        "Title #": 8562,
        "Episode Title": "UEFA Champions League-Juventus. Stuttgart. Estadio: Gottlieb-Daimler-Stadion. Ronda: Fecha #3.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "22:00:00",
        "End Time": "00:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 693,
        "Show Code": "SOCC985",
        "Program": "",
        "Title #": 985,
        "Episode Title": "2025 Concacaf Champions Cup. Ronda: First Round, Second Leg.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "23:00:00",
        "End Time": "01:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:00:00",
        "LTSA": "Tape",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 14,
        "Show Code": "TNMO374",
        "Program": "",
        "Title #": 374,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Semifinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "23:30:00",
        "End Time": "01:30:00",
        "End Date": "01-03-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 214,
        "Show Code": "TNMO374",
        "Program": "",
        "Title #": 374,
        "Episode Title": "Abierto Mexicano Telcel presentado por HSBC. Estadio: Arena GNP Seguros. Ronda: Semifinals.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "23:30:00",
        "End Time": "01:30:00",
        "End Date": "01-03-2025",
        "Duration": "02:00:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      },
      {
        "Feed": "A",
        "Network": 178,
        "Show Code": "SOXP651",
        "Program": "",
        "Title #": 651,
        "Episode Title": "Liga Expansión MX. Ronda: Jornada 8.",
        "Dow": "FRI",
        "Start Date": "Invalid DateTime",
        "Start Time": "23:55:00",
        "End Time": "02:00:00",
        "End Date": "01-03-2025",
        "Duration": "02:05:00",
        "LTSA": "Live",
        "Status": "2 - Borrador / Working"
      }


]; // Aquí irían tus datos completos del CSV

  // Procesamiento de datos
  const contentDistribution = [
    { name: 'Deportes', value: 89, color: '#2E86AB' },
    { name: 'Noticias', value: 3, color: '#F18F01' },
    { name: 'Entretenimiento', value: 2, color: '#C73E1D' }
  ];

  const statusDistribution = [
    { name: 'Borrador', value: 85, color: '#FFC107' },
    { name: 'Publicado', value: 3, color: '#28A745' },
    { name: 'Aprobado', value: 1, color: '#17A2B8' },
    { name: 'Finalizado', value: 5, color: '#6C757D' }
  ];

  const networkActivity = [
    { name: 'ESPN', value: 72, color: '#2E86AB' },
    { name: 'ESPN2', value: 2, color: '#F18F01' },
    { name: 'Otras', value: 20, color: '#6C757D' }
  ];

  const timeSlots = [
    { hour: '00-03', live: 8, tape: 12 },
    { hour: '03-06', live: 2, tape: 18 },
    { hour: '06-09', live: 1, tape: 15 },
    { hour: '09-12', live: 0, tape: 10 },
    { hour: '12-15', live: 3, tape: 14 },
    { hour: '15-18', live: 5, tape: 9 },
    { hour: '18-21', live: 12, tape: 6 },
    { hour: '21-00', live: 15, tape: 4 }
  ];

  const programTypes = [
    { type: 'Fútbol', count: 42, percent: 45 },
    { type: 'Básquetbol', count: 18, percent: 19 },
    { type: 'UFC/Boxeo', count: 8, percent: 9 },
    { type: 'Tenis', count: 6, percent: 6 },
    { type: 'Otros Deportes', count: 14, percent: 15 },
    { type: 'Noticias', count: 3, percent: 3 },
    { type: 'Entretenimiento', count: 2, percent: 2 }
  ];

  // Métricas clave
  const totalPrograms = rawData.length;
  const livePrograms = rawData.filter(p => p.LTSA === 'Live').length;
  const tapePrograms = totalPrograms - livePrograms;
  const avgDuration = '2h 15m'; // Calculado de los datos

  return (
    <Container fluid className="px-4 py-4 executive-dashboard">
      {/* Header con título y controles */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h1 className="dashboard-title">
            <FiBarChart2 className="me-2" />
            Panel de Control Ejecutivo - Programación
          </h1>
          <p className="text-muted mb-0">Resumen completo del 28/02/2025 al 01/03/2025</p>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <ButtonGroup className="me-3">
            <Button 
              variant={viewMode === 'charts' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('charts')}
            >
              <FiBarChart2 /> Gráficos
            </Button>
            <Button 
              variant={viewMode === 'tables' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('tables')}
            >
              <FiPieChart /> Tablas
            </Button>
          </ButtonGroup>
          
          <Dropdown className="me-3">
            <Dropdown.Toggle variant="outline-secondary">
              <FiFilter /> Filtros
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-3 filter-menu">
              <Form.Group className="mb-3">
                <Form.Label>Red:</Form.Label>
                <Form.Select 
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                >
                  <option>Todas</option>
                  <option>A - ESPN</option>
                  <option>B - ESPN2</option>
                  {/* Otras redes */}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Estado:</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>Todos</option>
                  <option>Borrador</option>
                  <option>Publicado</option>
                  <option>Aprobado</option>
                  <option>Finalizado</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Rango de fechas:</Form.Label>
                <DateRangePicker
                  ranges={dateRange}
                  onChange={item => setDateRange([item.selection])}
                  staticRanges={[]}
                  inputRanges={[]}
                />
              </Form.Group>
            </Dropdown.Menu>
          </Dropdown>
          
          <Button variant="outline-primary">
            <FiDownload /> Exportar
          </Button>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Programas Totales</h6>
                  <h2 className="mb-0">{totalPrograms}</h2>
                </div>
                <div className="kpi-icon bg-primary">
                  <FiClock size={24} />
                </div>
              </div>
              <ProgressBar now={100} variant="primary" className="mt-3" style={{ height: '4px' }} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Contenido en Vivo</h6>
                  <h2 className="mb-0">{livePrograms} <small className="text-muted">({Math.round((livePrograms/totalPrograms)*100)}%)</small></h2>
                </div>
                <div className="kpi-icon bg-success">
                  <FiRefreshCw size={24} />
                </div>
              </div>
              <ProgressBar now={(livePrograms/totalPrograms)*100} variant="success" className="mt-3" style={{ height: '4px' }} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Contenido Grabado</h6>
                  <h2 className="mb-0">{tapePrograms} <small className="text-muted">({Math.round((tapePrograms/totalPrograms)*100)}%)</small></h2>
                </div>
                <div className="kpi-icon bg-info">
                  <FiDownload size={24} />
                </div>
              </div>
              <ProgressBar now={(tapePrograms/totalPrograms)*100} variant="info" className="mt-3" style={{ height: '4px' }} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Duración Promedio</h6>
                  <h2 className="mb-0">{avgDuration}</h2>
                </div>
                <div className="kpi-icon bg-warning">
                  <FiClock size={24} />
                </div>
              </div>
              <ProgressBar now={100} variant="warning" className="mt-3" style={{ height: '4px' }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección principal de gráficos/tablas */}
      {viewMode === 'charts' ? (
        <Row className="mb-4">
          <Col xl={6} lg={12} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Distribución de Contenidos</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="link" id="content-distribution-dropdown">
                    Opciones
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Ver datos</Dropdown.Item>
                    <Dropdown.Item>Exportar</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} programas`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={6} lg={12} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5>Estado de Programación</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusDistribution}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => [`${value} programas`, 'Cantidad']} />
                      <Legend />
                      <Bar dataKey="value" name="Programas" fill="#8884d8">
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={6} lg={12} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5>Actividad por Red</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={networkActivity}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} programas`, 'Cantidad']} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={6} lg={12} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5>Programación por Franja Horaria</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSlots}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="live" 
                        stroke="#28A745" 
                        name="En vivo" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tape" 
                        stroke="#17A2B8" 
                        name="Grabado" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row className="mb-4">
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5>Detalle de Programas</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Red</th>
                      <th>Título</th>
                      <th>Hora</th>
                      <th>Duración</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{item.Network}</td>
                        <td className="text-truncate" style={{ maxWidth: '150px' }} title={item['Episode Title']}>
                          {item['Episode Title']}
                        </td>
                        <td>{item['Start Time']}</td>
                        <td>{item.Duration}</td>
                        <td>
                          <Badge bg={
                            item.Status.includes('Borrador') ? 'warning' :
                            item.Status.includes('Publicado') ? 'success' :
                            item.Status.includes('Aprobado') ? 'info' : 'secondary'
                          }>
                            {item.Status.split('-')[1].trim()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="link">Ver todos (94)</Button>
              </Card.Footer>
            </Card>
          </Col>
          
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5>Distribución por Tipo de Programa</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Porcentaje</th>
                      <th>Gráfico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programTypes.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.count}</td>
                        <td>{item.percent}%</td>
                        <td>
                          <ProgressBar 
                            now={item.percent} 
                            variant={
                              index === 0 ? 'primary' :
                              index === 1 ? 'success' :
                              index === 2 ? 'danger' :
                              index === 3 ? 'info' :
                              index === 4 ? 'warning' : 'secondary'
                            } 
                            style={{ height: '20px' }} 
                            label={`${item.percent}%`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sección de detalles */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Análisis Detallado</h5>
            </Card.Header>
            <Card.Body>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Distribución por Deporte</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Fútbol</h6>
                        <p>42 programas (45%) - Principalmente Liga MX, Concacaf Champions Cup y UEFA Champions League</p>
                        <ProgressBar now={45} variant="primary" className="mb-3" />
                        
                        <h6>Básquetbol</h6>
                        <p>18 programas (19%) - NBA, NBA G League</p>
                        <ProgressBar now={19} variant="success" className="mb-3" />
                      </Col>
                      <Col md={6}>
                        <h6>UFC/Boxeo</h6>
                        <p>8 programas (9%) - UFC Recargado, ESPN KnockOut</p>
                        <ProgressBar now={9} variant="danger" className="mb-3" />
                        
                        <h6>Tenis</h6>
                        <p>6 programas (6%) - Abierto Mexicano Telcel</p>
                        <ProgressBar now={6} variant="info" className="mb-3" />
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
                
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Estados de Programación</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Borrador / Working</h6>
                        <p>85 programas (90.4%) - En proceso de preparación</p>
                        <ProgressBar now={90.4} variant="warning" className="mb-3" />
                        
                        <h6>Publicado / Published</h6>
                        <p>3 programas (3.2%) - Listos para transmisión</p>
                        <ProgressBar now={3.2} variant="success" className="mb-3" />
                      </Col>
                      <Col md={6}>
                        <h6>Aprobado / Released</h6>
                        <p>1 programa (1.1%) - Aprobado para transmisión</p>
                        <ProgressBar now={1.1} variant="info" className="mb-3" />
                        
                        <h6>Finalizado</h6>
                        <p>5 programas (5.3%) - Transmisión completada</p>
                        <ProgressBar now={5.3} variant="secondary" className="mb-3" />
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExecutiveDashboard;