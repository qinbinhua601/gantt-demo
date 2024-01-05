function getParamsFromSearch(key = 'unitWidth', autoConvert = true) {
  const params = new URLSearchParams((location.search));
  return (params.get(key) && autoConvert) ? Number(params.get(key)) : params.get(key);
}

// sync tasks and mileStones data to localStorage
function syncLocal() {
  // 同步远端开启
  if(syncRemote()) return
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

let timer = null

function syncRemote() {
  // 如果开启了
  if (getParamsFromSearch('useRemote')) {
    const data = { tasks: window.tasks, mileStones: window.mileStones }
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      recordUpdate(data).then(res => {
        console.log('recordUpdate', res)
      })
    }, 200);
    return true
  }
  return false
}

const remoteHost = localStorage.getItem('remoteHost') ? localStorage.getItem('remoteHost') : 'http://localhost:3004'

function recordUpdate(data) {
  return fetch(`${remoteHost}/record/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ view, ...data })
  })
}

function recordQuery() {
  console.log('current view', view);
  return fetch(`${remoteHost}/record/query${view ? `?view=${view}` : ''}`).then(res => res.json())
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

function getFromLocalAndDelete(key) {
  const result = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
  localStorage.removeItem(key);
  return result;
}

function initData() {
  // 先不展示画布，获取初始化数据以后展示
  zr.dom.hidden = true
  recordQuery()
    .then((res) => {
      const { data } = res
      console.log(data)
      window.tasks.length = 0;
      window.mileStones.length = 0;
      // const tasks = getFromLocalAndDelete('tasks') || data?.tasks
      // const mileStones = getFromLocalAndDelete('mileStones') || data?.mileStones
      if (data?.tasks || data?.mileStones) {
        window.tasks.push(...data.tasks);
        window.mileStones.push(...data.mileStones);
      } else {
        if (!data) {
          window.tasks.push({})
        }
      }
      redrawChart(true);
      zr.dom.hidden = false;
    })
}

function saveToRemote(saveView) {
  const viewObj = saveView ? { view: `${saveView}` } : {}
  recordUpdate({
    tasks: window.tasks,
    mileStones: window.mileStones,
    ...viewObj
  })
}

function saveToLocal(view) {
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