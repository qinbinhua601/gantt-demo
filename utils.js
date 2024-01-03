function getParamsFromSearch(key = 'unitWidth') {
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

function getRandomColor() {
  // Generate random values for red, green, and blue components
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convert values to hexadecimal and format the color
  const hexColor = '#' + r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0');

  return hexColor;
}

// deprecated
function getTimeScaleWidthByTasks(tasks) {
  let min = 1000000000,
    max = -1;
  tasks.forEach((task) => {
    const { start = 0, duration = 0 } = task;
    min = Math.min(start, min);
    max = Math.max(max, start + duration);
  });
  return max - min;
}