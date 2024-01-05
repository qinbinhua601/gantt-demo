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

export const todayOffset = Math.floor((+new Date() - +new Date('2024-01-01')) / (60 * 60 * 24 * 1000))

// 显示scrollX的值
export const $lastScrollXSpan = document.querySelector('#last-scroll-x');