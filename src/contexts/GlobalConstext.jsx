import React, {useEffect, useReducer, useRef} from 'react';

const actionTypes = {
  RESET_MESSAGE_STATE:'RESET_MESSAGE_STATE',
  ACTION_1: "ACTION_1",
  SET_DATA: "SET_DATA",

  innerClock: {
    SET_TICK: "SET_TICK",
    SET_TICK_INTERVAL: "SET_TICK_INTERVAL",
  },
  globalMessage: {
    SHOW_MESSAGE: "SHOW_MESSAGE",
    HIDE_MESSAGE: "HIDE_MESSAGE",
  },
  globalUser: {
    GET_USER: "GET_USER",
  }
};

const messageTypes = {
  NONE: 0,
  INFO: 1,
  VALIDATION: 2,
  QUESTION: 3,
  ALERT: 4,
  FORBIDEN: 5,
  ERROR: 6,
  FAIL: 7,
  SUCCESS: 8,

  COLOR: {
    RED: "RED",
    GREEN: "GREEN",
    BLUE: "BLUE",
    WHITE: "WHITE",
    BLACK: "BLACK",
    YELLOW: "YELLOW",
  },
};

// Datos mock para usuario
const mockUserData = {
  descrip: 'Usuario Demo',
  usuarioRed: 'demo@empresa.com',
  listPermisos: [
    'PERMISSION_1',
    'PERMISSION_2',
    'PERMISSION_3'
  ]
};

const initialState = {
  permissions:[],
  globalUser: {
    name: '',
    fullname: ''
  },
  innerClock: {
    tickInterval: 1000,
    tick: 0,
  },
  globalMessage: {
    visible: false,
    title: "",
    message: "",
    okCBF: undefined,
    cancelCBF: undefined,
    yesCBF: undefined,
    noCBF: undefined,
    hideDelay: 300,
    type: messageTypes.SUCCESS,
  }
}

const GlobalContextState = React.createContext(initialState);
const GlobalContextDispatch = React.createContext(undefined);

const GlobalContext = ({ children }) => {
  const mounted = useRef(0);

  const reducer = (state, action) => {
    switch (action.type) {
      case actionTypes.innerClock.SET_TICK:
        return { ...state, innerClock: { ...state.innerClock, tick: state.innerClock.tick + 1 } };
      case actionTypes.innerClock.SET_TICK_INTERVAL:
        return { ...state, innerClock: { ...state.innerClock, tickInterval: action.payload } };
      case actionTypes.globalMessage.SHOW_MESSAGE:
        return { ...state, globalMessage: { ...state.globalMessage, ...action.payload, visible: true } };
      case actionTypes.globalMessage.HIDE_MESSAGE:
        return { ...state, globalMessage: { ...state.globalMessage, title: "", message: "", visible: false } };
      case actionTypes.RESET_MESSAGE_STATE:
        return { ...state, globalMessage: { ...initialState.globalMessage } };
      case actionTypes.globalUser.GET_USER:
        return { 
          ...state, 
          globalUser: { 
            ...state.globalUser, 
            name: action.globalUser_pld.descrip, 
            fullname: action.globalUser_pld.usuarioRed
          }, 
          permissions: action.globalUser_pld.listPermisos || [] 
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Cargar datos mock directamente sin llamar a API
    dispatch({
      type: actionTypes.globalUser.GET_USER,
      globalUser_pld: mockUserData
    });
  }, []);

  return (
    <GlobalContextState.Provider value={state}>
      <GlobalContextDispatch.Provider value={dispatch}>
        {children}
      </GlobalContextDispatch.Provider>
    </GlobalContextState.Provider>
  )
}

const useGlobalState = () => [
  React.useContext(GlobalContextState),
  React.useContext(GlobalContextDispatch)
]

export { GlobalContext, useGlobalState, actionTypes, messageTypes };

// Función auxiliar (se mantiene igual)
function fillFakeEnum(fakeEnum) {
  let i = 0;
  for (var key in actionTypes) {
    if (fakeEnum.hasOwnProperty(key)) {
      i++;
      fakeEnum[key] = key;
    }
  };
}