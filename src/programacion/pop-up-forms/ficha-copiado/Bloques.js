import React, { useState, useEffect } from 'react'
import Duration from './Duration'
import imageDelete from '../../../../images/icons/delete-i.png'
import imageAdd from '../../../../images/icons/add-i.png'
import imageEdit from '../../../../images/icons/edit-i.png'
import useMessageBox from '../../../hooks/useMessageBox'

const defaultBloque = () => {
  return {
    index: null,
    id: null,
    id_copiado: null,
    bloqueNro: null,
    letra: "",
    duracion: null,
    tc_in: null,
    tc_out: null,
  }
}

const Bloques = ({ pBloques, onChangeCBF , hasPermission}) => {
  const [showMessage, hideMessage, messageTemplate, messageTypes] = useMessageBox()

  const [bloque, setBloque] = useState(defaultBloque());
  const [bloques, setBloques] = useState([]);
  const [bloquesJSX, setBloquesJSX] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setBloques(() => pBloques || []);
  }, [pBloques])

  const handleEdit = (index) => {
    if(!hasPermission) return
    setBloque(() => bloques[index])
    setSelectedIndex(index)
  }

  const handleDelete = (index) => {
    if(!hasPermission) return
    setBloques(prev => {
      if(!prev) return
      let aux = [...prev]
      aux.splice(index, 1);
      onChangeCBF(aux)
      return aux
    })
  }

  function validateBloque(bloque, bloques) {
    if (bloque.bloqueNro == null || bloque.bloqueNro === "")
      return { valid: false, message: "Falta el Número de Bloque." } // Número de bloque nulo o vacío
    if (bloque.duracion == null || bloque.duracion === 0)
      return { valid: false, message: "Falta la duración." } // Duración nulo o vacío

    if (bloques.findIndex((el, ix) => {
      if (ix != selectedIndex) // Si no es el mismo elemento en el array que el editado
        if (el.bloqueNro == bloque.bloqueNro) { // Comparar sólo cuando el bloque coincide
          if (el.letra?.trim() == "" || bloque.letra?.trim() == "" || el.letra == bloque.letra)
            return true // Si la letra ya existe en el grupo
        }
    }) > -1) {
      return { valid: false, message: "En caso de duplicar Número de Bloque, se debe incluir una letra distinta en cada uno." }
    }
    return { valid: true, message: "" }
  }


  const handleAdd = e => {
    if(!hasPermission) return
    let v = validateBloque(bloque, bloques)
    if (v.valid) {
      if (selectedIndex !== null) {
        setBloques(prev => {
          prev.splice(selectedIndex, 1, { ...bloque });
          onChangeCBF(prev)
          return prev;
        })
        setSelectedIndex(null)
      }
      else {
        let auxBloque = { ...bloque }
        setBloques(prev => {
          onChangeCBF([...prev, auxBloque])
          return [...prev, auxBloque]
        }
        )
      }
      // Reset bloque
      setBloque(() => defaultBloque())
    } else {
      let m = messageTemplate
      m.title = "ATENCION"
      m.message = v.message
      m.type = messageTypes.ALERT
      m.okCBF= () => { }
      showMessage(m)
      //alert(v.message)
    }
  }

  useEffect(() => {
    updateGrid()
  }, [bloques])

  useEffect(() => {
    updateGrid()
  }, [selectedIndex])

  const updateGrid = () => {
    const b = bloques.sort((a, b) => {
      if (a.bloqueNro == b.bloqueNro)
        return 0
      else if (a.bloqueNro < b.bloqueNro)
        return -1
      else
        return 1
    }).map((el, i) => {
      return (
        <tr key={i} style={selectedIndex === i ? { backgroundColor: "#999" } : null}>
          <td>{el.bloqueNro} </td>
          <td>{el.letra}</td>
          <td>{global.util.intToFormattedTime(el.duracion)}</td>
          <td>{el.tc_in}</td>
          <td>{el.tc_out}</td>
          <td><img src={imageEdit} alt="" className="ficha-copiado-bloques__grid-icon button" onClick={() => handleEdit(i)} /></td>
          <td><img src={imageDelete} alt="" className="ficha-copiado-bloques__grid-icon button" onClick={() => handleDelete(i)} /></td>
        </tr>
      )
    })

    setBloquesJSX(() => b
    )
  }

  const handleBloqueNroChange = e => {
    e.persist()
    setBloque(prev => { return { ...prev, bloqueNro: e.target.value } })
  }

  const handleLetraChange = e => {
    e.persist()
    setBloque(prev => { return { ...prev, letra: e.target.value } })
  }

  const handleDuracionChange = (dur) => {
    setBloque(prev => { return { ...prev, duracion: global.util.timeToInt(dur) } })
  }

  const handleTc_inChange = e => {
    e.persist()
    setBloque(prev => { return { ...prev, tc_in: e.target.value } })
  }

  const handleTc_outChange = e => {
    e.persist()
    setBloque(prev => { return { ...prev, tc_out: e.target.value } })
  }

  const focusTo = (which, id) => {
    if (which === 13)
      document.querySelector(`#${id}`).focus()
  }

  return (
    <div className="ficha-copiado-bloques__wrapper">
      <div className="ficha-copiado-bloques__title">
        Bloques del programa
      </ div>
      <div >
        <table className="ficha-copiado-bloques__table">
          <thead>
            <tr>
              <th>Bloque</th>
              <th>Letra</th>
              <th>Duracion</th>
              <th>TC IN</th>
              <th>TC OUT</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bloquesJSX}
          </tbody>
          <tfoot>
            <tr>
              <td><input disabled={!hasPermission} type="number" id="fcb-bloque_nro" onKeyPress={(e) => focusTo(e.which, "fcb-letra")} value={bloque.bloqueNro == null ? "" : bloque.bloqueNro} onChange={handleBloqueNroChange} className="ficha-copiado-bloques__grid-input" min="1" /></td>
              <td><input disabled={!hasPermission} id="fcb-letra" onKeyPress={(e) => focusTo(e.which, "fcb-duration")} value={!bloque.letra ? "" : bloque.letra} onChange={handleLetraChange} size="1" maxLength="1" className="ficha-copiado-bloques__grid-input" /></td>
              {/* <td><input value={!bloque.duracion ? "" : bloque.duracion} onChange={handleDuracionChange} className="ficha-copiado-bloques__grid-input" type="time" step="1" placeholder="Duración" /></td> */}
              <td><Duration hasPermission={hasPermission} id="fcb-duration" onKeyPress={(e) => focusTo(e.which, "fcb-tc_in")} value={bloque.duracion} CBF={handleDuracionChange} /></td>
              <td><input disabled={!hasPermission} id="fcb-tc_in" onKeyPress={(e) => focusTo(e.which, "fcb-tc_out")} value={!bloque.tc_in ? "" : bloque.tc_in} onChange={handleTc_inChange} className="ficha-copiado-bloques__grid-input" type="number" min="0" /></td>
              <td><input disabled={!hasPermission} id="fcb-tc_out" onKeyPress={(e) => { if (e.which === 13) { handleAdd(e); focusTo(e.which, "fcb-bloque_nro"); } }} value={!bloque.tc_out ? "" : bloque.tc_out} onChange={handleTc_outChange} className="ficha-copiado-bloques__grid-input" type="number" min="0" /></td>
              <td colSpan="2"><img src={imageAdd} alt="" className="ficha-copiado-bloques__grid-icon button" onClick={handleAdd} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div >
  )
}

export default Bloques
