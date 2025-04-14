import { useState } from 'react'

function unsecuredCopyToClipboard(text) {
  const aux = document.createElement("input");
  aux.setAttribute("value", text);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
}

function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null)

  const copy = async text => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
    }

    try {
      if (window.isSecureContext && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        console.log("Copy with clipboard: ", text)
      } else {
        unsecuredCopyToClipboard(text);
        console.log("Copy with execCommand: ", text)
      }
      setCopiedText(text)
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}

export default useCopyToClipboard