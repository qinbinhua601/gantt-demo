export let currentGroup = null;
export const setCurrentGroup = (val) => {
  currentGroup = val
}

const SETTINGS_STORAGE_KEY = 'gantt_setting'

const readStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    return {}
  }
}

const stored = readStoredSettings()
const getSetting = (key, fallback) => (stored[key] ?? fallback)

export const debug = getSetting('debug', false);

export const defaultTaskOwner = 'alexq';
// unit width of the column
export const unitWidth = getSetting('unitWidth', 160);
// half unit width
export const halfUnitWidth = unitWidth / 2;
// taskName paddingLeft
export const taskNamePaddingLeft = getSetting('taskNamePaddingLeft', 15);
export const initChartStartX = 1
export const initChartStartY = 50;
// time scale height
export const timeScaleHeight = getSetting('timeScaleHeight', 20);
// milestone top height
export const milestoneTopHeight = getSetting('milestoneTopHeight', 20);
// taskBar height
export const barHeight = getSetting('barHeight', 30);
// taskBar margin bottom
export const barMargin = debug ? 10 : getSetting('barMargin', 1);
// scroll speed [1, 100]
export const scrollSpeed = getSetting('scrollSpeed', 35);
// includeHoliday hell no!!!
export const includeHoliday = getSetting('includeHoliday', false);
// if use local data
export const useLocal = getSetting('useLocal', 1);
// if use remote data
export const useRemote = getSetting('useRemote', 0);
// query view
export const view = getSetting('view', 'week')
export const viewDate = getSetting('viewDate', '')

// mockTaskSize for test only enabled when useLocal is false
export const mockTaskSize = !useRemote && !useLocal && getSetting('mockTaskSize', 0) ? Number(getSetting('mockTaskSize', 0)) : 0;

export const dayMs = 24 * 60 * 60 * 1000
export const baseDate = new Date(2024, 0, 1)

export const todayOffset = Math.floor((+new Date() - +baseDate) / dayMs)

export const initLastScrollX = (todayOffset - 1) * unitWidth

// 过滤色
export const filter = getSetting('filter', null);

// 显示过滤控制器
export const showFilter = getSetting('showFilter', false);

// 2/3 of barHeight is arrowSize
export const arrowSize = barHeight / 3 * 2

export const showArrow = getSetting('showArrow', true);

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);