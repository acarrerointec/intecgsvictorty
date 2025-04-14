import React, { useState } from 'react'
import Filter from './Filter'

const useColumnFilter = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(new Map());
  const [hasChanged, setHasChanged] = useState(false)

  return [data, setData, filters, setFilters, hasChanged, setHasChanged]
}

export { useColumnFilter, Filter }