import { useGlobalState, actionTypes, messageTypes } from "../contexts/GlobalConstext"

function useMessageBox() {
  const [state, dispatch] = useGlobalState()

  const showMessage = (messageObject) => {
    /*
      This is the original format for a message object.
      Check in GlobalContext to see if it's changed.
      {
        visible: true,
        title,
        message,
        okCBF,
        cancelCBF,
        yesCBF,
        noCBF,
        hideDelay: 300,
        type,
      }
    */
    dispatch({
      type: actionTypes.globalMessage.SHOW_MESSAGE,
      payload: messageObject
    });
  }

  const hideMessage = () =>
    dispatch({ type: actionTypes.globalMessage.HIDE_MESSAGE })


  let messageTemplate = {
    visible: false,
    title: "",
    message: "",
    okCBF: undefined,
    cancelCBF: undefined,
    yesCBF: undefined,
    noCBF: undefined,
    hideDelay: 300,
    type: messageTypes.INFO,
  }

  return [showMessage, hideMessage, messageTemplate, messageTypes]
}

export default useMessageBox
