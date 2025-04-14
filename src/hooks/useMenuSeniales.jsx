import { useProgramacionState, actionTypes } from '../contexts/ProgramacionContext';

function useMenuSeniales() {
  const [state, dispatch] = useProgramacionState()

  const toggleSenial = (data, usuarioRed) => {
    dispatch({ type: actionTypes.TOP_MANU_TOGGLE_SENIAL, payload: data, usuarioRed })
  }

  return [state.topMenuConfig, toggleSenial]

}

export default useMenuSeniales
