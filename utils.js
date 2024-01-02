function getParamsFromSearch(key = 'uniWidth') {
  const params = new URLSearchParams((location.search));
  return params.get(key) ? Number(params.get(key)) : params.get(key);
}

// sync tasks and mileStones data to localStorage
function syncLocal() {
  if (!getParamsFromSearch('useLocal')) return;
  Object.keys(defaultValues).forEach(key => {
    const lastLocalStorage = localStorage.getItem(key);
    try {
      localStorage.setItem(key, JSON.stringify(window[key]));
    } catch (error) {
      console.error('fail to syncLocal')
      localStorage.setItem(key, lastLocalStorage);
    }
  })
}

const defaultValues = {
  'tasks': [{}],
  'mileStones': []
}

function getLocal(key = 'tasks') {
  try {
    const res = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValues[key];
    return res;
  } catch (error) {
    console.error('fail to getLocal')
    return defaultValues[key]
  }
}