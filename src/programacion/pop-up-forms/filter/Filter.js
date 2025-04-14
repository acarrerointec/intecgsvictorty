import React from "react"
import "./Filter.scss"

const Filter = ({ fieldName, display, value = "", onChange, placeholder }) => {
  return (
    <div className="filter__wrapper">
      <div>
        {display}
      </div>
      <div>
        <input value={value} onChange={(e) => onChange(fieldName, e.target.value)} className="filter__text" placeholder={placeholder} />
      </div>
    </div>
  )
}

export default Filter