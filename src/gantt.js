import * as zrender from 'zrender'
import 'zrender/lib/canvas/canvas'
import { hachureLines } from './hachure'
import { isHoliday } from './holidays'
import { syncLocal, getRandomColor, getLocal, initData, updateData } from './utils'
import { createFlagGroup } from './flag'
import { getLeftHandleBar, getRightHandleBar, getRealDuration, getTaskBarMoveLine, createLeftArrowRect, createRightArrowRect } from './task'
import { drawTodayLine } from './today'
import { getLocale, t } from './i18n'
import { debug, defaultTaskOwner, unitWidth, halfUnitWidth, taskNamePaddingLeft, initChartStartX, initChartStartY, timeScaleHeight, milestoneTopHeight, barHeight, barMargin, scrollSpeed, includeHoliday, useLocal, useRemote, mockTaskSize, todayOffset, currentGroup, setCurrentGroup, initLastScrollX, categoryFilter, isMobile, baseDate, dayMs, view, viewDate } from './const'

export function initGantt({
  container,
  onScrollXChange,
  onEditTask,
  onContextMenu,
  onHideContextMenu,
  onCreateTask,
  onDataChange
}) {
  if (!container) {
    throw new Error('Gantt container is required')
  }

  let lastHandleMove = null

  // 默认设置到今天左边一格
  let lastScrollX = 0 + initLastScrollX, lastScrollY = 0

  const notifyScrollX = () => {
    onScrollXChange?.(lastScrollX)
  }

  const notifyDataChange = (reason = 'update') => {
    onDataChange?.({
      reason,
      tasks: window.tasks,
      mileStones: window.mileStones,
      categories: getCategories(window.tasks || []),
      categoryColors: getCategoryColors()
    })
  }

  // Initialize ZRender
  const zr = zrender.init(container, {
    renderer: 'canvas'
  })

  const CATEGORY_COLORS_KEY = 'categoryColors'
  const loadCategoryColors = () => {
    try {
      const raw = localStorage.getItem(CATEGORY_COLORS_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch (error) {
      return {}
    }
  }
  const saveCategoryColors = () => {
    try {
      localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify(categoryColors))
    } catch (error) {
      // ignore
    }
  }

  let categoryColors = loadCategoryColors()

  const getUniqueRandomColor = () => {
    const used = new Set(Object.values(categoryColors))
    let color = getRandomColor()
    let tries = 0
    while (used.has(color) && tries < 50) {
      color = getRandomColor()
      tries += 1
    }
    return color
  }

  const ensureCategoryColor = (category, preferredColor) => {
    const resolved = category || t('category.uncategorized')
    const existing = categoryColors[resolved]
    if (preferredColor && !existing) {
      categoryColors[resolved] = preferredColor
      saveCategoryColors()
      return preferredColor
    }
    if (!existing) {
      const generated = getUniqueRandomColor()
      categoryColors[resolved] = generated
      saveCategoryColors()
      return generated
    }
    return existing
  }

  const applyCategoryColor = (task, preferredColor) => {
    if (!task || !task.name) return task
    const category = task.category || t('category.uncategorized')
    const color = ensureCategoryColor(category, preferredColor || task.fillColor)
    return {
      ...task,
      category,
      fillColor: color
    }
  }

  const normalizeTask = (task) => {
    if (!task || !task.name) return task
    const start = Number(task.start)
    const duration = Number(task.duration)
    const normalized = {
      ...task,
      start: Number.isFinite(start) ? start : 0,
      duration: Number.isFinite(duration) && duration > 0 ? duration : 1
    }
    return applyCategoryColor(normalized)
  }

  const getOffsetFromDate = (date) => Math.floor((date.getTime() - baseDate.getTime()) / dayMs)

  const getCategories = (taskList = tasks) => {
    const categorySet = new Set([
      t('category.uncategorized'),
      ...Object.keys(categoryColors)
    ])
    taskList.forEach(task => {
      if (task?.name) {
        categorySet.add(task.category || t('category.uncategorized'))
      }
    })
    return Array.from(categorySet)
  }

  const getCategoryColors = () => {
    const categories = getCategories(tasks)
    categories.forEach(category => {
      ensureCategoryColor(category)
    })
    return { ...categoryColors }
  }

  const getViewRange = () => {
    if (!view) return null
    const today = viewDate ? new Date(viewDate) : new Date()
    if (view === 'week') {
      const day = today.getDay()
      const mondayOffset = (day + 6) % 7
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6)
      return {
        start: getOffsetFromDate(startDate),
        end: getOffsetFromDate(endDate)
      }
    }
    if (view === 'month') {
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        start: getOffsetFromDate(startDate),
        end: getOffsetFromDate(endDate)
      }
    }
    return null
  }

  // Define tasks for the Gantt chart
  const tasks = (useLocal ? getLocal() : [
    { name: "Task 1", start: todayOffset + 0, duration: 3, resource: "John", category: "Design", fillColor: getRandomColor() },
    { name: "Task 2", start: todayOffset + 2, duration: 4, resource: "Jane", category: "Design", fillColor: getRandomColor() },
    { name: "Task 3 long long long", start: todayOffset + 7, duration: 1, resource: "Bob", category: "Build", fillColor: getRandomColor() },
    { name: "Task 4", start: todayOffset + 8, duration: 2, resource: "Bose", category: "Build", fillColor: getRandomColor() },
    { name: "Task 5", start: todayOffset + 10, duration: 3, resource: "Uno", category: "QA", fillColor: getRandomColor() },
    {}
    // Add more tasks as needed
  ]).map(normalizeTask)

  const lastTask = tasks.pop()
  while (tasks.length > 1 && tasks.length < mockTaskSize) {
    tasks.push(...tasks.map(item => ({ ...item })))
  }
  tasks.push(lastTask)

  window.tasks = tasks

  // Define the milestones
  const mileStones = useLocal ? getLocal('mileStones') : [
    { start: 10, name: t('gantt.demoMilestoneName') }
  ]
  window.mileStones = mileStones

  if (isMobile) {
    let lastTouchX

    zr.dom.addEventListener('touchstart', function (event) {
      if (currentGroup?.resizing || currentGroup?.dragging) {
        return
      }
      lastTouchX = event.touches[0].clientX
    })

    zr.dom.addEventListener('touchmove', function (event) {
      if (currentGroup?.resizing || currentGroup?.dragging) {
        return
      }
      event.preventDefault()
      let deltaX = event.touches[0].clientX - lastTouchX
      lastTouchX = event.touches[0].clientX
      lastScrollX -= Math.floor(deltaX)
      redrawChart(true, lastScrollX, 0)
      notifyScrollX()
    })
  } else {
    // 点击其他区域隐藏ContextMenu
    zr.dom.addEventListener('click', function () {
      onHideContextMenu?.()
    })
    zr.on('mousewheel', function (e) {
      e.event.preventDefault()
      // set speed for the scroll
      lastScrollX -= Math.floor(e.event.wheelDeltaX * 0.01 * scrollSpeed)
      redrawChart(true, lastScrollX, 0)
      notifyScrollX()
    })
  }

  const resizeHandler = function () {
    zr.resize()
    redrawChart(true)
  }

  // redraw when browser window size change
  window.addEventListener('resize', resizeHandler)

  let isFirstFlag = true
  function redrawChart(clear = false, scrollX = lastScrollX, scrollY = 0) {
    const isFirst = isFirstFlag
    if (isFirstFlag) {
      isFirstFlag = false
    }
    const viewRange = getViewRange()
    const isFixedView = (view === 'week' || view === 'month') && viewRange
    const daysInView = viewRange ? (viewRange.end - viewRange.start + 1) : 0
    const effectiveUnitWidth = isFixedView ? (zr.getWidth() / daysInView) : unitWidth
    const halfEffectiveUnitWidth = effectiveUnitWidth / 2
    const viewStartOffset = isFixedView ? viewRange.start : 0
    const viewScrollX = isFixedView ? 0 : scrollX
    // margin left to the container
    const chartStartX = initChartStartX - viewScrollX
    // margin top to the container
    const chartStartY = Math.max(initChartStartY, timeScaleHeight + milestoneTopHeight) - scrollY
    // clear the painter
    clear && zr.clear()
    const canvasWidth = zr.getWidth()
    const canvasHeight = zr.getHeight()

    const filledTasks = tasks.filter(task => task?.name)
    const emptyTasks = tasks.filter(task => !task?.name)
    filledTasks.sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
    tasks.length = 0
    tasks.push(...filledTasks, ...emptyTasks)

    const isFilteredView = Boolean(viewRange)
    const isTaskInRange = (task) => {
      if (!viewRange) return true
      const start = task.start ?? 0
      const duration = task.duration ?? 1
      const end = start + duration - 1
      return end >= viewRange.start && start <= viewRange.end
    }
    const visibleTasks = viewRange ? filledTasks.filter(isTaskInRange) : filledTasks
    const placeholderTask = emptyTasks[0] || {}
    const displayTasks = [...visibleTasks, placeholderTask]
    const displayTaskEntries = displayTasks.map((task, displayIndex) => ({
      task,
      displayIndex,
      taskIndex: task?.name ? Math.max(0, tasks.indexOf(task)) : tasks.length - 1
    }))

    if (view === 'month' && viewRange) {
      const monthStartDate = new Date(baseDate.getTime() + viewRange.start * dayMs)
      const monthYear = monthStartDate.getFullYear()
      const monthIndex = monthStartDate.getMonth()
      const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate()
      const firstDayOfWeek = (new Date(monthYear, monthIndex, 1).getDay() + 6) % 7
      const totalCells = firstDayOfWeek + daysInMonth
      const weekRows = Math.ceil(totalCells / 7)
      const cellWidth = canvasWidth / 7
      const weekdayHeaderHeight = Math.max(24, timeScaleHeight)
      const barHeightMini = 20
      const barGap = 4
      const tasksByDay = new Map()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOffset = viewRange.start + (day - 1)
        const tasksForDay = visibleTasks.filter(task => {
          const start = task.start ?? 0
          const duration = task.duration ?? 1
          const end = start + duration - 1
          return dayOffset >= start && dayOffset <= end
        })
        tasksByDay.set(dayOffset, tasksForDay)
      }
      const maxTasksInDay = Math.max(1, ...Array.from(tasksByDay.values()).map(items => items.length))
      const cellHeight = Math.max(110, 28 + maxTasksInDay * (barHeightMini + barGap))
      const calendarStartY = chartStartY
      const headerY = chartStartY - weekdayHeaderHeight

      const locale = (typeof getLocale === 'function' ? getLocale() : 'en')
      const weekdayFormatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : locale, { weekday: 'short' })
      const weekdayBase = new Date(2024, 0, 1)
      for (let col = 0; col < 7; col++) {
        const labelDate = new Date(weekdayBase.getFullYear(), weekdayBase.getMonth(), weekdayBase.getDate() + col)
        const weekdayText = new zrender.Text({
          style: {
            text: weekdayFormatter.format(labelDate),
            x: chartStartX + col * cellWidth + cellWidth / 2,
            y: headerY + weekdayHeaderHeight / 2,
            textAlign: 'center',
            textVerticalAlign: 'middle',
            fontSize: 12,
            fill: '#6b7280'
          },
          z: 2
        })
        zr.add(weekdayText)
      }

      for (let row = 0; row < weekRows; row++) {
        for (let col = 0; col < 7; col++) {
          const cellIndex = row * 7 + col
          const dayNumber = cellIndex - firstDayOfWeek + 1
          const cellX = chartStartX + col * cellWidth
          const cellY = calendarStartY + row * cellHeight
          const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth
          const dayOffset = viewRange.start + (dayNumber - 1)

          const dateInfo = inMonth ? isHoliday(baseDate.getTime() + dayOffset * dayMs) : null
          const cellRect = new zrender.Rect({
            shape: {
              x: cellX,
              y: cellY,
              width: cellWidth,
              height: cellHeight
            },
            style: {
              fill: inMonth && dateInfo?.isHoliday ? 'rgba(245, 245, 245, 0.6)' : '#ffffff',
              stroke: 'lightgray'
            }
          })
          cellRect.on('mouseover', function () {
            this.attr({
              style: {
                stroke: '#60a5fa',
                lineWidth: 2
              }
            })
          })
          cellRect.on('mouseout', function () {
            this.attr({
              style: {
                stroke: 'lightgray',
                lineWidth: 1
              }
            })
          })
          cellRect.on('click', function () {
            const insertIndex = tasks.length - 1
            if (onCreateTask) {
              onCreateTask({ posX: dayOffset, posY: insertIndex })
              return
            }
            const taskName = prompt(t('gantt.taskNamePrompt'))
            if (!taskName) return
            const resourceName = prompt(t('gantt.assignPrompt')) || defaultTaskOwner
            tasks.splice(insertIndex, 0, applyCategoryColor({
              name: taskName,
              start: dayOffset,
              duration: 1,
              resource: resourceName,
              category: t('category.uncategorized')
            }))
            syncLocal()
            notifyDataChange('create')
            redrawChart(true)
          })
          zr.add(cellRect)

          if (!inMonth) continue

          const dateText = new zrender.Text({
            style: {
              text: dateInfo?.dateString || String(dayNumber),
              x: cellX + 6,
              y: cellY + 4,
              textAlign: 'left',
              textVerticalAlign: 'top',
              fontSize: 12,
              fill: '#111827'
            },
            z: 2
          })
          zr.add(dateText)

          if (dayOffset === todayOffset) {
            const todayDot = new zrender.Circle({
              shape: {
                cx: cellX + cellWidth - 10,
                cy: cellY + 10,
                r: 4
              },
              style: {
                fill: '#2955c9'
              },
              z: 3
            })
            zr.add(todayDot)
          }

          const tasksForDay = tasksByDay.get(dayOffset) || []
          tasksForDay.forEach((task, index) => {
            const taskIndex = tasks.indexOf(task)
            const barY = cellY + 22 + index * (barHeightMini + barGap)
            const barRect = new zrender.Rect({
              shape: {
                x: cellX + 6,
                y: barY,
                width: cellWidth - 12,
                height: barHeightMini,
                r: 3
              },
              style: {
                fill: task.fillColor || '#2955c9'
              },
              z: 2
            })
            barRect.on('contextmenu', function (e) {
              e.event.preventDefault()
              const { zrX: x, zrY: y } = e.event
              const { left, top } = container.getBoundingClientRect()
              onContextMenu?.({
                index: taskIndex,
                x: x + left,
                y: y + top
              })
            })
            const barText = new zrender.Text({
              style: {
                text: task.name,
                x: cellX + 10,
                y: barY,
                textAlign: 'left',
                textVerticalAlign: 'top',
                lineHeight: barHeightMini,
                fontSize: 10,
                fill: '#ffffff'
              },
              z: 3
            })
            barText.on('contextmenu', function (e) {
              e.event.preventDefault()
              const { zrX: x, zrY: y } = e.event
              const { left, top } = container.getBoundingClientRect()
              onContextMenu?.({
                index: taskIndex,
                x: x + left,
                y: y + top
              })
            })
            zr.add(barRect)
            zr.add(barText)
          })
        }
      }

      return
    }

    const boundingLeft = isFixedView ? viewRange.start : Math.floor(viewScrollX / unitWidth)
    const boundingRight = isFixedView ? viewRange.end : Math.floor((viewScrollX + canvasWidth) / unitWidth)
    // hover day grid to add task
    let lastPos
    let lastDayRect
    function handleMove(e) {
      if (currentGroup?.resizing || currentGroup?.dragging) {
        return
      }
      const x = e.event.zrX - chartStartX
      const y = e.event.zrY - chartStartY
      const rawPosX = Math.floor(x / effectiveUnitWidth)
      const posX = isFixedView ? viewStartOffset + rawPosX : rawPosX
      const posY = Math.floor(y / (barHeight + barMargin))
      if (lastPos !== [posX, posY].join()) {
        lastPos = [posX, posY].join()
        if (posY >= 0 && posY < displayTasks.length) {
          const hasTask = posY !== displayTasks.length - 1 // 只能在最后一行插入新任务
          if (hasTask) {
            lastDayRect && zr.remove(lastDayRect)
            return
          }
          const dayHoverGroup = new zrender.Group()
          dayHoverGroup.on('click', function () {
            const insertIndex = tasks.length - 1
            if (onCreateTask) {
              onCreateTask({ posX, posY: insertIndex })
              return
            }
            const taskName = prompt(t('gantt.taskNamePrompt'))
            if (!taskName) return
            const resourceName = prompt(t('gantt.assignPrompt')) || defaultTaskOwner
            tasks.splice(insertIndex, 0, applyCategoryColor({
              name: taskName,
              start: posX,
              duration: 1,
              resource: resourceName,
              category: t('category.uncategorized')
            }))
            syncLocal()
            notifyDataChange('create')
            redrawChart(true)
          })
          // draw the hover rect on the day grid
          const dayRect = new zrender.Rect({
            shape: {
              x: chartStartX + effectiveUnitWidth * (posX - viewStartOffset) + 5,
              y: chartStartY + (barHeight + barMargin) * posY,
              width: effectiveUnitWidth - 10,
              height: barHeight + barMargin,
            },
            style: {
              fill: 'transparent',
              stroke: 'gray',
              lineDash: [5, 7]
            },
            z: 100
          })
          const rowHoverRect = new zrender.Rect({
            shape: {
              x: chartStartX + viewScrollX,
              y: chartStartY + (barHeight + barMargin) * posY,
              width: effectiveUnitWidth * timeScaleWidth,
              height: barHeight + barMargin,
            },
            style: {
              fill: 'rgba(221, 221, 221, 0.3)',
            },
            z: 1
          })

          const lineH = new zrender.Line({
            shape: {
              x1: chartStartX + effectiveUnitWidth * (posX - viewStartOffset) + effectiveUnitWidth / 2 - 5,
              y1: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2,
              x2: chartStartX + effectiveUnitWidth * (posX - viewStartOffset) + effectiveUnitWidth / 2 + 5,
              y2: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2
            },
            style: {
              stroke: 'gray'
            },
            z: 100
          })
          const lineV = new zrender.Line({
            shape: {
              x1: chartStartX + effectiveUnitWidth * (posX - viewStartOffset) + effectiveUnitWidth / 2,
              y1: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2 - 5,
              x2: chartStartX + effectiveUnitWidth * (posX - viewStartOffset) + effectiveUnitWidth / 2,
              y2: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2 + 5
            },
            style: {
              stroke: 'gray'
            },
            z: 100
          })
          dayHoverGroup.add(dayRect)
          dayHoverGroup.add(lineH)
          dayHoverGroup.add(lineV)
          dayHoverGroup.add(rowHoverRect)
          lastDayRect && zr.remove(lastDayRect)
          lastDayRect = dayHoverGroup
          zr.add(dayHoverGroup)
        } else {
          lastDayRect && zr.remove(lastDayRect)
        }
      }
    }
    lastHandleMove && zr.off('mousemove', lastHandleMove)
    lastHandleMove = handleMove
    zr.on('mousemove', handleMove)

    const timeScaleWidth = isFixedView ? daysInView : Math.ceil((canvasWidth) / effectiveUnitWidth)
    // Draw time scale
    const timeScale = new zrender.Rect({
      shape: {
        x: chartStartX + viewScrollX,
        y: chartStartY - timeScaleHeight,
        width: timeScaleWidth * effectiveUnitWidth,
        height: timeScaleHeight
      },
      style: {
        fill: "rgba(255, 0,0, .2)"
      }
    })
    zr.add(timeScale)

    // Draw vertical grid lines
    const gridStartX = chartStartX
    const gridEndX = timeScaleWidth * effectiveUnitWidth
    const gridLineCount = timeScaleWidth + 1
    const deltaScrollX = isFixedView ? viewStartOffset : Math.floor(viewScrollX / unitWidth)
    for (let i = 0 + deltaScrollX, count = 0; count < gridLineCount; i++, count++) {
      const viewPortTaskLength = Math.min(displayTasks.length, (canvasHeight - chartStartY) / (barHeight + barMargin))
      const gridX = gridStartX + (i - viewStartOffset) * effectiveUnitWidth
      const gridLine = new zrender.Line({
        shape: {
          x1: gridX,
          y1: chartStartY - timeScaleHeight,
          x2: gridX,
          y2: chartStartY + (barHeight + barMargin) * viewPortTaskLength
        },
        style: {
          stroke: "lightgray"
        }
      })

      // Draw the date
      if (count < gridLineCount - 1) {
        const currentDate = baseDate.getTime() + i * dayMs
        const dateInfo = isHoliday(currentDate)
        // Draw the hachure fill 画斜线
        if (dateInfo.isHoliday) {
          try {
            const lines = hachureLines([
              [chartStartX + (i - viewStartOffset) * effectiveUnitWidth, chartStartY],
              [chartStartX + (i - viewStartOffset) * effectiveUnitWidth + effectiveUnitWidth, chartStartY],
              [chartStartX + (i - viewStartOffset) * effectiveUnitWidth + effectiveUnitWidth, chartStartY + (barHeight + barMargin) * viewPortTaskLength],
              [chartStartX + (i - viewStartOffset) * effectiveUnitWidth, chartStartY + (barHeight + barMargin) * viewPortTaskLength]
            ], 10, 45)
            lines.forEach(line => {
              const [x1, y1] = line[0]
              const [x2, y2] = line[1]
              const l = new zrender.Line({
                shape: {
                  x1, y1, x2, y2
                },
                style: {
                  stroke: 'rgba(221, 221, 221, 0.7)'
                }
              })
              zr.add(l)
            })
          } catch (error) {
            console.log(error)
          }
        }
        // 画日期文字
        const dateText = new zrender.Text({
          style: {
            text: dateInfo.dateString,
            x: isFixedView ? (gridX + effectiveUnitWidth / 2) : gridX,
            y: isFixedView ? (chartStartY - timeScaleHeight / 2) : (chartStartY - timeScaleHeight),
            textAlign: isFixedView ? 'center' : 'left',
            textVerticalAlign: isFixedView ? 'middle' : 'top'
          },
          z: 1
        })
        const [flagGroup] = createFlagGroup(zr, gridX, halfEffectiveUnitWidth, chartStartY, timeScaleHeight)
        dateText.on('click', function () {
          const index = mileStones.findIndex(item => item.start === i)
          if (index === -1) {
            if (confirm(t('gantt.createMilestoneConfirm'))) {
              const mileStoneName = prompt(t('gantt.milestoneNamePrompt'))
              mileStones.push({
                start: i,
                name: mileStoneName
              })
              syncLocal()
              notifyDataChange('milestone')
            }
          } else {
            if (confirm(t('gantt.deleteMilestoneConfirm'))) {
              mileStones.splice(index, 1)
              syncLocal()
              notifyDataChange('milestone')
            }
          }
          redrawChart(true)
        })
        dateText.on('mouseover', function () {
          this.attr({
            style: {
              opacity: 0
            }
          })
          flagGroup.show()
        })
        dateText.on('mouseout', function () {
          this.attr({
            style: {
              opacity: 1
            }
          })
          flagGroup.hide()
        })

        const { width, height } = dateText.getBoundingRect()
        dateText.attr({
          style: {
            x: gridX - width / 2 + halfEffectiveUnitWidth,
            y: chartStartY - timeScaleHeight - height / 2 + timeScaleHeight / 2,
          }
        })
        zr.add(dateText)
      }
      zr.add(gridLine)
    }

    // Draw horizontally grid lines
    const gridLineCountY = tasks.length + 1

    for (let j = 0; j < 1; j++) {
      const gridY = chartStartY + j * (barHeight + barMargin)
      const gridLineY = new zrender.Line({
        shape: {
          x1: chartStartX,
          y1: gridY,
          x2: gridEndX + chartStartX,
          y2: gridY
        },
        style: {
          stroke: "lightgray"
        }
      })
      zr.add(gridLineY)
    }

    // Draw today line
    if (!isFixedView || (todayOffset >= viewRange.start && todayOffset <= viewRange.end)) {
      drawTodayLine(zr, chartStartX, chartStartY, timeScaleHeight, barHeight, barMargin, todayOffset, effectiveUnitWidth, viewStartOffset)
    }

    // Draw milestones
    mileStones.forEach(function (item) {
      if (isFixedView && (item.start < viewRange.start || item.start > viewRange.end)) return
      const milestoneX = chartStartX + (item.start - viewStartOffset) * effectiveUnitWidth - 1
      const milestone = new zrender.Rect({
        shape: {
          x: milestoneX,
          y: chartStartY - timeScaleHeight,
          width: 2,
          height: displayTasks.length * (barHeight + barMargin) + timeScaleHeight
        },
        style: {
          fill: "rgba(255, 0, 0, 1)"
        },
        z: 1
      })
      const milestone_top = new zrender.Rect({
        shape: {
          x: milestoneX,
          y: chartStartY - timeScaleHeight - milestoneTopHeight,
          width: 10,
          height: milestoneTopHeight
        },
        style: {
          fill: "rgba(255, 0, 0, 1)"
        },
        z: 1
      })
      const milestone_top_text = new zrender.Text({
        style: {
          x: milestoneX + 10,
          y: chartStartY - timeScaleHeight - milestoneTopHeight,
          text: item.name || t('gantt.milestoneDefaultName'),
          fill: "white",
          lineHeight: milestoneTopHeight,
          fontSize: 12
        },
        z: 1
      })
      const milestone_top_text_rect = milestone_top_text.getBoundingRect()
      milestone_top.attr({
        shape: {
          width: milestone_top_text_rect.width + 10 * 2,
        }
      })
      zr.add(milestone)
      zr.add(milestone_top)
      zr.add(milestone_top_text)
    })

    let drawTaskBar = 0
    // Draw tasks, resource assignments, and task bars
    displayTaskEntries.forEach(function ({ task, displayIndex, taskIndex }) {
      if (!task?.name) return
      // perf: 在视口外跳过
      if (displayIndex > Math.floor((canvasHeight - chartStartY) / (barHeight + barMargin))) return
      const showLeftArrow = !isFixedView && task.start <= boundingLeft
      const showRightArrow = !isFixedView && (task.start + task.duration) > boundingRight

      // Calculate position and dimensions
      const x = chartStartX + (task.start - viewStartOffset) * effectiveUnitWidth
      const y = chartStartY + (barHeight + barMargin) * displayIndex
      const width = task.duration * effectiveUnitWidth
      const taskBarRect = {
        width,
        height: barHeight
      }

      const leftArrow = createLeftArrowRect(x, y, task, taskBarRect, showLeftArrow, boundingLeft, function () {
        lastScrollX = (task.start - 3) * unitWidth
        notifyScrollX()
        redrawChart(true)
      })
      const rightArrow = createRightArrowRect(x, y, task, effectiveUnitWidth, viewScrollX, canvasWidth, taskBarRect, showRightArrow, boundingRight, function () {
        lastScrollX = (task.start + task.duration + 3) * unitWidth - canvasWidth
        notifyScrollX()
        redrawChart(true)
      })
      leftArrow && zr.add(leftArrow)
      rightArrow && zr.add(rightArrow)
      if (task.start > boundingRight || (task.start + task.duration) < boundingLeft) return
      drawTaskBar++
      // Create a group to hold task elements
      const group = new zrender.Group({
        x,
        y,
        draggable: !isMobile
      })
      // Create a rectangle shape for each task
      const rect = new zrender.Rect({
        shape: {
          x: 0,
          y: 0,
          width: width,
          height: barHeight,
          r: 6
        },
        style: {
          fill: task.fillColor
        },
        cursor: 'move'
      })
      group.add(rect)
      group.index = taskIndex

      const w = 6
      const box = rect.getBoundingRect()
      const leftBar = getLeftHandleBar(w, box, taskBarRect, redrawChart, effectiveUnitWidth, halfEffectiveUnitWidth)
      leftBar.taskBar = rect
      group.add(leftBar)

      const rightBar = getRightHandleBar(w, box, taskBarRect, redrawChart, effectiveUnitWidth, halfEffectiveUnitWidth)
      rightBar.taskBar = rect
      group.add(rightBar)

      group.on("mouseover", function () {
        if (this.dragging) return

        rect.attr("style", { fill: zrender.color.lift(task.fillColor, 0.3) })
      })

      group.on("mouseout", function () {
        if (this.dragging || this.resizing) return
        rect.attr("style", { fill: task.fillColor })
      })

      // Create a text shape for task name
      const taskName = new zrender.Text({
        style: {
          text: task.name,
          x: taskNamePaddingLeft,
          y: barHeight / 2 - 12 / 2,
          textFill: "white",
          textAlign: "left",
          textVerticalAlign: "middle",
          fill: "white"
        },
        cursor: 'move'
      })

      // Create a text for duration
      const realDuration = getRealDuration(task, includeHoliday)
      const taskDuration = new zrender.Text({
        style: {
          text: `${realDuration}d`,
          x: width - 30,
          y: barHeight / 2 - 12 / 2,
          textFill: "white",
          textAlign: "left",
          textVerticalAlign: "middle",
          fill: "white"
        }
      })

      // Create a text for resource
      const resourceText = new zrender.Text({
        style: {
          text: task.resource,
          x: width + 5,
          y: barHeight / 2 - 12 / 2,
          textFill: "black",
          textAlign: "left",
          textVerticalAlign: "middle",
          fill: "black"
        }
      })

      group.add(taskName)
      group.add(taskDuration)
      group.add(resourceText)

      // drag logic
      let dragStartX = 0
      let lastPosY = null
      let lastBottomLine = null
      group.on("dragstart", function (e) {
        if (this.resizing) return
        dragStartX = e.event.zrX
        setCurrentGroup(this)
      })
      group.on("drag", function (e) {
        if (this.resizing) return
        const y = e.event.zrY - chartStartY
        const posY = Math.floor(y / (barHeight + barMargin))
        if (lastPosY !== posY) {
          lastPosY = posY
          zr.remove(lastBottomLine)
          const bottomLine = getTaskBarMoveLine(chartStartX, chartStartY, viewScrollX, timeScaleWidth, posY, effectiveUnitWidth)
          lastBottomLine = bottomLine
          bottomLine && zr.add(bottomLine)
          zr.refresh()
        }
      })
      group.on("dragend", function (e) {
        if (this.isContextMenu) {
          this.isContextMenu = false
          return
        }
        this.isDragging = false
        if (this.resizing) {
          this.resizing = false
          return
        }
        const deltaX = e.event.zrX - dragStartX
        const dir = deltaX < 0 ? -1 : 1
        const delta = Math.abs(deltaX)
        const mod = delta % effectiveUnitWidth
        const offsetX = dir * (Math.floor(delta / effectiveUnitWidth) + Math.floor(mod / halfEffectiveUnitWidth))
        const y = e.event.zrY - chartStartY
        const posY = Math.floor(y / (barHeight + barMargin))
        const clampedPosY = Math.max(0, Math.min(posY, displayTasks.length - 1))
        const offsetY = clampedPosY - displayIndex
        task.start += offsetX
        if (!isFilteredView && lastBottomLine && clampedPosY !== displayIndex) {
          tasks.splice(taskIndex, 1)
          tasks.splice(clampedPosY > displayIndex ? clampedPosY - 1 : clampedPosY, 0, { ...task })
        }
        if (offsetX || offsetY) {
          syncLocal()
          notifyDataChange('move')
        }
        setCurrentGroup(null)
        redrawChart(true)
      })
      group.eachChild(function (child) {
        child.attr({
          z: 10
        })
      })

      group.on("dblclick", function () {
        onEditTask?.({
          index: this.index,
          task: tasks[this.index]
        })
      })

      group.on("contextmenu", function (e) {
        this.isContextMenu = true
        e.event.preventDefault()
        const { zrX: x, zrY: y } = e.event
        const { left, top } = container.getBoundingClientRect()
        onContextMenu?.({
          index: this.index,
          x: x + left,
          y: y + top
        })
      })

      zr.add(group)
    })

    // 如果屏幕里没有任务条，调整到第一个
    if (isFirst && drawTaskBar === 0) {
      if (visibleTasks.length > 0) {
        lastScrollX += (visibleTasks[0].start - boundingLeft - 1) * unitWidth
        notifyScrollX()
        redrawChart(true)
      }
    }

    debug && console.log({
      drawTaskBar
    })
  }

  window.redrawChart = redrawChart

  if (useRemote) {
    document.title += t('app.remoteSuffix')
    initData(zr, () => {
      redrawChart(true)
      notifyDataChange('init')
    })
  } else {
    if (categoryFilter) {
      const defaultCategory = t('category.uncategorized')
      updateData('tasks', tasks.filter(item => {
        const matchesCategory = categoryFilter
          ? (item.category || defaultCategory) === categoryFilter
          : true
        return matchesCategory
      }))
    }
    redrawChart()
    notifyDataChange('init')
  }

  notifyScrollX()

  const api = {
    resetScroll() {
      lastScrollX = initLastScrollX
      lastScrollY = 0
      notifyScrollX()
      redrawChart(true)
    },
    clearTasks() {
      tasks.length = 0
      tasks.push({})
      syncLocal()
      notifyDataChange('clear')
      redrawChart(true)
    },
    clearMilestones() {
      mileStones.length = 0
      syncLocal('mileStones')
      notifyDataChange('milestone')
      redrawChart(true)
    },
    copyTask(index) {
      const curTask = { ...tasks[index], duration: 1 }
      tasks.splice(index + 1, 0, curTask)
      syncLocal()
      notifyDataChange('copy')
      redrawChart(true)
    },
    deleteTask(index) {
      tasks.splice(index, 1)
      syncLocal()
      notifyDataChange('delete')
      redrawChart(true)
    },
    updateTask(index, values) {
      const updated = applyCategoryColor({ ...tasks[index], ...values })
      tasks.splice(index, 1, updated)
      syncLocal()
      notifyDataChange('edit')
      redrawChart(true)
    },
    addTaskAt({ posX, posY }, values) {
      const task = applyCategoryColor({
        name: values.name,
        start: posX,
        duration: 1,
        resource: values.resource || defaultTaskOwner,
        category: values.category || t('category.uncategorized')
      }, values.fillColor)
      tasks.splice(posY, 0, task)
      syncLocal()
      notifyDataChange('create')
      redrawChart(true)
    },
    addTasks(newTasks = []) {
      if (!Array.isArray(newTasks) || newTasks.length === 0) return
      const cleaned = newTasks
        .filter(task => task && task.name)
        .map(task => applyCategoryColor({
          name: task.name,
          start: Number.isFinite(task.start) ? task.start : 0,
          duration: Math.max(1, Number(task.duration) || 1),
          resource: task.resource || defaultTaskOwner,
          category: task.category || t('category.uncategorized')
        }, task.fillColor))
      if (!cleaned.length) return
      const insertIndex = Math.max(0, tasks.length - 1)
      tasks.splice(insertIndex, 0, ...cleaned)
      syncLocal()
      notifyDataChange('import')
      redrawChart(true)
    },
    redraw() {
      redrawChart(true)
    },
    getCategories() {
      return getCategories(tasks)
    },
    getCategoryColors() {
      return getCategoryColors()
    },
    setCategoryColor(category, color) {
      if (!category) return
      const nextColor = color || getUniqueRandomColor()
      categoryColors = { ...categoryColors, [category]: nextColor }
      saveCategoryColors()
      tasks.forEach((task, index) => {
        if (task?.name && (task.category || t('category.uncategorized')) === category) {
          tasks[index] = { ...task, fillColor: nextColor, category }
        }
      })
      syncLocal()
      notifyDataChange('category-color')
      redrawChart(true)
    },
    renameCategory(oldName, newName) {
      if (!oldName || !newName || oldName === newName) return
      const defaultCategory = t('category.uncategorized')
      if (oldName === defaultCategory || newName === defaultCategory) return
      const existingColor = categoryColors[oldName]
      if (existingColor && !categoryColors[newName]) {
        categoryColors = { ...categoryColors, [newName]: existingColor }
      }
      if (categoryColors[oldName]) {
        const { [oldName]: _, ...rest } = categoryColors
        categoryColors = rest
      }
      saveCategoryColors()
      tasks.forEach((task, index) => {
        if (task?.name && (task.category || defaultCategory) === oldName) {
          tasks[index] = applyCategoryColor({ ...task, category: newName })
        }
      })
      syncLocal()
      notifyDataChange('category-rename')
      redrawChart(true)
    },
    deleteCategory(name, fallback = t('category.uncategorized')) {
      if (!name) return
      const defaultCategory = t('category.uncategorized')
      if (name === defaultCategory) return
      if (categoryColors[name]) {
        const { [name]: _, ...rest } = categoryColors
        categoryColors = rest
        saveCategoryColors()
      }
      const target = fallback || defaultCategory
      tasks.forEach((task, index) => {
        if (task?.name && (task.category || defaultCategory) === name) {
          tasks[index] = applyCategoryColor({ ...task, category: target })
        }
      })
      syncLocal()
      notifyDataChange('category-delete')
      redrawChart(true)
    },
    destroy() {
      window.removeEventListener('resize', resizeHandler)
      zr.dispose()
    }
  }

  return api
}
