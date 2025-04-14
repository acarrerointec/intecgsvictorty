import React, { useReducer, useEffect, useContext, useRef } from 'react';
import axiosApi from '../../axiosApi';
import { getPreference, setPreference } from './context-functions';
import useMessageBox from '../hooks/useMessageBox';

/* FALSO ENUM */
const actionTypes = {
  INFO_ADICIONAL_SET_ALL: "INFO_ADICIONAL_SET_ALL",
  LTS_SET_OPCION: "LTS_SET_OPCION",
  LTS_SET_OPCIONES: "LTS_SET_OPCIONES",
  TOGGLE_ESTADO_MATERIALES: "TOGGLE_ESTADO_MATERIALES",
  TOGGLE_ESTADO_PROGRAMA: "TOGGLE_ESTADO_PROGRAMA",
  TOGGLE_SUPERPOSICION: "TOGGLE_SUPERPOSICION",
  TOGGLE_TIENE_GUIAS: "TOGGLE_TIENE_GUIAS",
  TOGGLE_TIENE_REPO_TECNICO: "TOGGLE_TIENE_REPO_TECNICO",
  TOGGLE_TIPO_EMISION: "TOGGLE_TIPO_EMISION",
  TOP_MANU_TOGGLE_SENIAL: "TOP_MANU_TOGGLE_SENIAL",
  TOP_MANU_SET_SENIALES: "TOP_MANU_SET_SENIALES",
  PROGRAMAS_EMITIDOS: "PROGRAMAS_EMITIDOS",
  PROGRAMAS_PAUTADOS: "PROGRAMAS_PAUTADOS",
  SEGMENTACION:"SEGMENTACION",
  TOP_MENU_UPDATE_GROUPS: "TOP_MENU_UPDATE_GROUPS",
  TOP_MENU_SET_GROUPS:"TOP_MENU_SET_GROUPS",
  ALTERNATIVO: "ALTERNATIVO",
};
fillFakeEnum(actionTypes);
/* FIN FALSO ENUM */

const initialState = {
  lts: {
    opciones: []
  },
  infoAdicionalConfig: {
    superposicion: false,
    estadoMateriales: false,
    estadoPrograma: false,
    tipoEmision: false,
    tieneGuias: false,
    tieneRepoTecnico: false,
    emitido:false,
    pautado:false,
    segmentacion:false,
    alternativo:false,
  },
  topMenuConfig: [],
  topMenuGroups: [],
  loadingChannels: true
};

const ProgramacionContextState = React.createContext(initialState);
const ProgramacionContextDispatch = React.createContext(undefined);

const ProgramacionContext = ({ children }) => {
  const [showMessage, hideMessage, messageTemplate,messageTypes] = useMessageBox();

  const mounted = useRef(0);

  const reducer = (state, action) => {
    switch (action.type) {
      case actionTypes.LTS_SET_OPCIONES:
        return { ...state, lts: { ...state.lts, opciones: action.payload } };

      case actionTypes.LTS_SET_OPCION:
        setPreference({ modulo: "Filtro_TipoEmi", opcion: action.payload.descrip, descrip: action.payload.descrip, valor: action.payload.seleccionado });
        const arr = [...state.lts.opciones];
        arr[arr.findIndex(el => el.codi === action.payload.codi)] = action.payload;
        return { ...state, lts: { ...state.lts, opciones: arr } };

      //PREFERENCIAS DE SUSUARIO, MENU GRILLA PROGRA
      case actionTypes.TOGGLE_SUPERPOSICION:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "superposicion", descrip: "", valor: !state.infoAdicionalConfig.superposicion });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, superposicion: !state.infoAdicionalConfig.superposicion } };

      case actionTypes.TOGGLE_ESTADO_MATERIALES:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "estadoMateriales", descrip: "", valor: !state.infoAdicionalConfig.estadoMateriales });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, estadoMateriales: !state.infoAdicionalConfig.estadoMateriales } };

      case actionTypes.TOGGLE_ESTADO_PROGRAMA:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "estadoPrograma", descrip: "", valor: !state.infoAdicionalConfig.estadoPrograma });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, estadoPrograma: !state.infoAdicionalConfig.estadoPrograma } };

      case actionTypes.TOGGLE_TIPO_EMISION:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "tipoEmision", descrip: "", valor: !state.infoAdicionalConfig.tipoEmision });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, tipoEmision: !state.infoAdicionalConfig.tipoEmision } };

      case actionTypes.TOGGLE_TIENE_GUIAS:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "tieneGuias", descrip: "", valor: !state.infoAdicionalConfig.tieneGuias });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, tieneGuias: !state.infoAdicionalConfig.tieneGuias } };

      case actionTypes.TOGGLE_TIENE_REPO_TECNICO:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "tieneRepoTecnico", descrip: "", valor: !state.infoAdicionalConfig.tieneRepoTecnico });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, tieneRepoTecnico: !state.infoAdicionalConfig.tieneRepoTecnico } };

      case actionTypes.PROGRAMAS_EMITIDOS:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "emitido", descrip: "", valor: !state.infoAdicionalConfig.emitido });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, emitido: !state.infoAdicionalConfig.emitido } };

      case actionTypes.PROGRAMAS_PAUTADOS:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "pautado", descrip: "", valor: !state.infoAdicionalConfig.pautado });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, pautado: !state.infoAdicionalConfig.pautado } };

      case actionTypes.SEGMENTACION:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "info_adicional", opcion: "segmentacion", descrip: "", valor: !state.infoAdicionalConfig.segmentacion });
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, segmentacion: !state.infoAdicionalConfig.segmentacion } };

      case actionTypes.ALTERNATIVO:
        return { ...state, infoAdicionalConfig: { ...state.infoAdicionalConfig, alternativo: !state.infoAdicionalConfig.alternativo } };
  
      case actionTypes.INFO_ADICIONAL_SET_ALL:
        return { ...state, infoAdicionalConfig: {...state.infoAdicionalConfig,...action.payload} };

      case actionTypes.TOP_MANU_SET_SENIALES:
        return { ...state, topMenuConfig: action.payload };

      case actionTypes.TOP_MANU_TOGGLE_SENIAL:
        setPreference({ usuarioRed: action.usuarioRed, modulo: "top_menu_seniales_visibles", opcion: action.payload.senial, descrip: "Señales que se ven en la grilla diaria", valor: action.payload.estado });
        return {
          ...state, topMenuConfig: state.topMenuConfig.map(el => {
            if (el.senial === action.payload.senial)
              el.estado = action.payload.estado
            return el
          })
        };
      
      case actionTypes.TOP_MENU_UPDATE_GROUPS:
        setPreference({usuarioRed: action.usuarioRed, modulo: "top_menu_grupos", opcion: "groups", descrip: "Grupos que se ven en la grilla diaria", valor: JSON.stringify(action.payload) });
        return {
          ...state, topMenuGroups: action.payload
        };
      case actionTypes.TOP_MENU_SET_GROUPS:
        return {
          ...state, topMenuGroups: action.payload ? JSON.parse(action.payload) : [], loadingChannels: false
        };

      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    mounted.current++;
    if (mounted.current !== 0) {
      const asyncFunc = async () => {
        // seteo opciones de la grilla
        const superposicion = await getPreference('info_adicional', 'superposicion');
        const estadoMateriales = await getPreference('info_adicional', 'estadoMateriales');
        const estadoPrograma = await getPreference('info_adicional', 'estadoPrograma');
        const tipoEmision = await getPreference('info_adicional', 'tipoEmision');
        const tieneGuias = await getPreference('info_adicional', 'tieneGuias');
        const tieneRepoTecnico = await getPreference('info_adicional', 'tieneRepoTecnico');
        const segmentacion = await getPreference('info_adicional', 'segmentacion');
        const emitido = await getPreference('info_adicional', 'emitido');
        const pautado = await getPreference('info_adicional', 'pautado');
        dispatch({
          type: actionTypes.INFO_ADICIONAL_SET_ALL, payload: {
            superposicion: parseBool(superposicion),
            estadoMateriales: parseBool(estadoMateriales),
            estadoPrograma: parseBool(estadoPrograma),
            tipoEmision: parseBool(tipoEmision),
            tieneGuias: parseBool(tieneGuias),
            tieneRepoTecnico: parseBool(tieneRepoTecnico),
            segmentacion: parseBool(segmentacion),
            emitido: parseBool(emitido),
            pautado: parseBool(pautado)
          }
        });
        // fin seteo op de grilla

        // inicio seteo de opciones de grupos
        const topMenuGroups = await getPreference('top_menu_grupos', 'groups');
        dispatch({
          type: actionTypes.TOP_MENU_SET_GROUPS, payload: topMenuGroups
        })
        // fin seteo opciones de grupo
        mounted.current++
      }
      asyncFunc();
      
      const asyncFn = async () => {
        try {
          if (mounted.current) {
            const api = await axiosApi()
            const response = await api.get('listas/lts/Filtro_TipoEmi');
            const data = await response.data;
            
            if(!data.message.success){
               return showMessage({
                title: "Error",
                message: data.message.message,
                okCBF: () => { },
                type: messageTypes.ERROR,
              })
            }
            const payload = data.model.map((el) => {
              return { codi: el.codi, descrip: el.descrip, seleccionado: el.seleccionado, explicacion: el.explicacion };
            })
            dispatch({ type: actionTypes.LTS_SET_OPCIONES, payload })
          }
        } catch (error) {
          console.log('Error', error)
        }
        mounted.current++
      }
      asyncFn();

      const getSenialesLista = async () => {
        try {
          if (mounted.current) {
            const api = await axiosApi()
            const response = await api.get('top-menu-seniales-lista');
            const data = await response.data;
            const payload = data.model
            dispatch({ type: actionTypes.TOP_MANU_SET_SENIALES, payload })
          }
        } catch (error) {
          console.log('Error', error)
        }
        mounted.current++
      }
      getSenialesLista();
      
    }
    return () => mounted.current = 0;
  }, [])

  return (
    <ProgramacionContextState.Provider value={state}>
      <ProgramacionContextDispatch.Provider value={dispatch}>
        {children}
      </ProgramacionContextDispatch.Provider>
    </ProgramacionContextState.Provider>
  )
}

const useProgramacionState = () => [
  React.useContext(ProgramacionContextState),
  React.useContext(ProgramacionContextDispatch)
]

function useProgramacion() {
  const context = useContext(ProgramacionContextState)
  return context
}

export { ProgramacionContext, actionTypes, useProgramacionState, useProgramacion };

/* SUPPORT FUNC */
const parseBool = (t) => {
  if (t === 'true')
    return true;
  else
    return false;
}

function fillFakeEnum(fakeEnum) {
  let i = 0;
  for (var key in actionTypes) {
    if (fakeEnum.hasOwnProperty(key)) {
      i++;
      fakeEnum[key] = key;
    }
  };
}