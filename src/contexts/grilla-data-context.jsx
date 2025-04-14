import React, {createContext, useReducer, useContext} from 'react';
import {fechaSinHora} from '../../utils/util.js'

const INITIAL_STATE = {
  data:[],
  fechaRef:null,
  filtro: {
    fechaRef: fechaSinHora(new Date()),
    canal: '',
    senial: ''
  },
  cantColumnSemanal:7,
  grillaType:null,
  refreshDelay: 900000,
  channelsGroups: [],
  fechaActual: null,
  globalReloadData: 0
}

const grillaDataTypes = {
  SET_GRILLA_DATA: 'SET_GRILLA_DATA',
  SET_FILTROS: 'SET_FILTROS',
  SET_COLUMN_SEMANAL: 'SET_COLUMN_SEMANAL',
  RESET_DATA: 'RESET_DATA',
  GLOBAL_RELOAD_DATA: 'GLOBAL_RELOAD_DATA',
  SET_INTERVAL_DELAY:'SET_INTERVAL_DELAY',
  SET_CHANNEL_GROUPS:'SET_CHANNEL_GROUPS',
  SET_BULK_CHANNEL_GROUPS:'SET_BULK_CHANNEL_GROUPS',
  SET_FECHA_ACTUAL: "SET_FECHA_ACTUAL",
};

const GrillaDataContext = createContext({});

function grillaDataReducer (state, action) {
  switch (action.type){
    case grillaDataTypes.SET_GRILLA_DATA:
    {
      const fecha = action.payload.fechaRef
      return{
        ...state,
        data: action.payload.data,
        fechaRef: fecha ? fecha : state.fechaRef,
        grillaType: action.payload.grillaType
      }
    }
    case grillaDataTypes.SET_FILTROS:
    {
      return{
        ...state,
        filtro: {...action.payload}
      }
    }
    case grillaDataTypes.SET_COLUMN_SEMANAL:
    {
      return{
        ...state,
        cantColumnSemanal: action.payload
      }
    }
    case grillaDataTypes.RESET_DATA:
    {
      return{
        ...state,
        data: []
      }
    }
    case grillaDataTypes.SET_INTERVAL_DELAY:
    {
      return{
        ...state,
        refreshDelay: action.payload.delay || 900000
      }
    }
    case grillaDataTypes.SET_CHANNEL_GROUPS:
    {
      return {
        ...state,
        channelsGroups: action.payload
      }
    }
    case grillaDataTypes.SET_BULK_CHANNEL_GROUPS:
    {
      return{
        ...state,
        channelsGroups: [...action.payload.groups]
      }
    }
    case grillaDataTypes.SET_FECHA_ACTUAL: {
      return {
        ...state,
        fechaActual: action.payload.fecha,
      };
    }
    case grillaDataTypes.GLOBAL_RELOAD_DATA: {
      return {
        ...state,
        globalReloadData: state.globalReloadData ? state.globalReloadData+1 : 1,
      };
    }
    default:
      return state
  }
}

function GrillaDataProvider({ children }) {
  const [state, dispatch] = useReducer(grillaDataReducer, INITIAL_STATE);
  return (
    <GrillaDataContext.Provider value={{ state, dispatch }}>
      {children}
    </GrillaDataContext.Provider>
  )
}

function useGrillaData() {
  const context = useContext(GrillaDataContext)
  return context
}

export {GrillaDataProvider, useGrillaData, grillaDataTypes}

