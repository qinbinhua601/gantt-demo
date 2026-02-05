import {getParamsFromSearch} from './utils'

export let currentGroup = null;
export const setCurrentGroup = (val) => {
  currentGroup = val
}

export const debug = getParamsFromSearch('debug') ?? false;

export const defaultTaskOwner = 'alexq';
// unit width of the column
export const unitWidth = getParamsFromSearch() ?? 160;
// half unit width
export const halfUnitWidth = unitWidth / 2;
// taskName paddingLeft
export const taskNamePaddingLeft = getParamsFromSearch('taskNamePaddingLeft') ?? 15;
export const initChartStartX = 1
export const initChartStartY = 50;
// time scale height
export const timeScaleHeight = getParamsFromSearch('timeScaleHeight') ?? 20;
// milestone top height
export const milestoneTopHeight = getParamsFromSearch('milestoneTopHeight') ?? 20;
// taskBar height
export const barHeight = getParamsFromSearch('barHeight') ?? 30;
// taskBar margin bottom
export const barMargin = debug ? 10 : (getParamsFromSearch('barMargin') ?? 1);
// scroll speed [1, 100]
export const scrollSpeed = getParamsFromSearch('scrollSpeed') ?? 35;
// includeHoliday hell no!!!
export const includeHoliday = getParamsFromSearch('includeHoliday') ?? false;
// if use local data
export const useLocal = getParamsFromSearch('useLocal');
// if use remote data
export const useRemote = getParamsFromSearch('useRemote');
// query view
export const view = getParamsFromSearch('view', false) ?? ''

// mockTaskSize for test only enabled when useLocal is false
export const mockTaskSize = !useRemote && !useLocal && getParamsFromSearch('mockTaskSize') ? Number(getParamsFromSearch('mockTaskSize')) : 0;

export const dayMs = 24 * 60 * 60 * 1000
export const baseDate = new Date(2024, 0, 1)

export const todayOffset = Math.floor((+new Date() - +baseDate) / dayMs)

export const initLastScrollX = (todayOffset - 1) * unitWidth

// 过滤色
export const filter = getParamsFromSearch('filter', false) ?? null;

// 显示过滤控制器
export const showFilter = getParamsFromSearch('showFilter') ?? false;

// 2/3 of barHeight is arrowSize
export const arrowSize = barHeight / 3 * 2

export const showArrow = getParamsFromSearch('showArrow') ?? true;

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);