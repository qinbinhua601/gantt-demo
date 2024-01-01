function getParamsFromSearch(key = 'uniWidth') {
  const params = new URLSearchParams((location.search))
  return params.get(key) ? Number(params.get(key)) : params.get(key)
}