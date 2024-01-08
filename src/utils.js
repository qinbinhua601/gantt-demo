import { view, filter, showFilter } from './const'

export function getParamsFromSearch(key = 'unitWidth', autoConvert = true) {
  const params = new URLSearchParams((location.search));
  return (params.get(key) && autoConvert) ? Number(params.get(key)) : params.get(key);
}

// sync tasks and mileStones data to localStorage
export function syncLocal() {
  // 开始过滤的话，不要同步信息
  if (filter) return
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
window.syncLocal = syncLocal
let timer = null

function syncRemote() {
  // 如果开启了
  if (getParamsFromSearch('useRemote')) {
    const data = { tasks: window.tasks, mileStones: window.mileStones }
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      recordUpdate(data).then(res => {
        if (res.status === 0) {
          console.log('recordUpdate成功', res)
        }
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
  }).then(res => res.json())
}

function recordQuery() {
  console.log('current view', view);
  return fetch(`${remoteHost}/record/query${view ? `?view=${view}` : ''}`).then(res => res.json())
}

const defaultValues = {
  'tasks': [{}],
  'mileStones': []
}

export function getLocal(key = 'tasks') {
  try {
    const res = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValues[key];
    return res;
  } catch (error) {
    console.error('fail to getLocal')
    return defaultValues[key]
  }
}

export function getRandomColor() {
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

export function initData(zr, redrawChart) {
  // 先不展示画布，获取初始化数据以后展示
  zr.dom.style.opacity = 0;
  recordQuery()
    .then((res) => {
      const { data } = res
      console.log(data)
      if (data?.tasks || data?.mileStones) {
        updateData('tasks', data.tasks.filter(item => filter ? item.fillColor === filter : true))
        updateData('mileStones', data.mileStones)
        // window.tasks.push(...data.tasks);
        // window.mileStones.push(...data.mileStones);
      } else {
        if (!data) {
          window.tasks.push({})
        }
      }
      updateFilterItems(data?.tasks);
      redrawChart(true);
      zr.dom.style.opacity = 1;
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
window.saveToRemote = saveToRemote

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
window.saveToLocal = saveToLocal


export function updateData(key, data) {
  window[`old_${key}`] = [...window[key]]
  window[key].length = 0;
  window[key].push(...[...data])
}

function onColorPickerClick(e) {
  console.log(e.target)
  const params = new URLSearchParams(location.search)
  if (e.target.dataset?.color) {
    e.target.dataset.hovered = true
    params.set('filter', e.target.dataset.color)
  } else {
    params.delete('filter')
  }
  location.href = `${location.pathname}?${params.toString()}`
}

// 更新过滤选择器
export function updateFilterItems(data) {
  if (!showFilter) return
  if (!data) return
  const tasks = data
  const $colorPicker = document.querySelector('#color-picker');
  console.log('123')
  $colorPicker.removeEventListener('click', onColorPickerClick);
  $colorPicker.addEventListener('click', onColorPickerClick);
  const contents = [...new Set(tasks.map(({ fillColor }) => fillColor)), ''].filter(item => item !== undefined).map(color => `<div data-color="${color}" style="background-color: ${color};"></div>`);
  $colorPicker.innerHTML = contents.join('');
}
