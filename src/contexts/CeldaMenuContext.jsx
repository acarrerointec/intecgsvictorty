import { useReducer } from 'react';
import { createContainer } from 'react-tracked';

/* FALSO ENUM */
const actionTypes = {
  CELDA_CONTEXT_MENU_SET_DATA: "CELDA_CONTEXT_MENU_SET_DATA",
  CELDA_CONTEXT_MENU_SET: "CELDA_CONTEXT_MENU_SET",
  CELDA_CONTEXT_POP_UP_MODULE_SET: "CELDA_CONTEXT_POP_UP_MODULE_SET",
};
fillFakeEnum(actionTypes);
/* FIN FALSO ENUM */

const initialState = {
  celdaContextMenuData: null,
  celdaContextMenu: null,
  popUpModule: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.CELDA_CONTEXT_MENU_SET:
      return { ...state, celdaContextMenu: action.payload };

    case actionTypes.CELDA_CONTEXT_MENU_SET_DATA:
      return { ...state, celdaContextMenuData: action.payload };

    case actionTypes.CELDA_CONTEXT_POP_UP_MODULE_SET:
      return { ...state, popUpModule: action.payload };

    default:
      return state;
  }
}

const { Provider, useTracked } = createContainer(() => useReducer(reducer, initialState));

export { Provider, actionTypes, useTracked };

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
