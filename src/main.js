import Popup from './popup'
import { hachureLines } from './hachure'
import { isHoliday } from './holidays'
import { addControls } from './controls'
import { syncLocal, getRandomColor, getLocal, initData, updateData } from './utils'
import { createFlagGroup } from './flag'
import { getLeftHandleBar, getRightHandleBar, getRealDuration, getTaskBarMoveLine, createLeftArrowRect, createRightArrowRect } from './task'
import { drawTodayLine } from './today'
import { debug, defaultTaskOwner, unitWidth, halfUnitWidth, taskNamePaddingLeft, initChartStartX, initChartStartY, timeScaleHeight, milestoneTopHeight, barHeight, barMargin, scrollSpeed, includeHoliday, useLocal, useRemote, mockTaskSize, todayOffset, $lastScrollXSpan, currentGroup, setCurrentGroup, initLastScrollX, filter } from './const'

let lastHandleMove = null;

// 默认设置到今天左边一格
let lastScrollX = 0 + initLastScrollX, lastScrollY = 0;

// Initialize ZRender
const zr = zrender.init(document.getElementById("zrender-container"), {
  renderer: 'canvas'
});

// Define tasks for the Gantt chart
const tasks = useLocal ? getLocal() : [
  { name: "Task 1", start: 0, duration: 3, resource: "John", fillColor: getRandomColor() },
  { name: "Task 2", start: 2, duration: 4, resource: "Jane", fillColor: getRandomColor() },
  { name: "Task 3 long long long", start: 7, duration: 1, resource: "Bob", fillColor: getRandomColor() },
  { name: "Task 4", start: 8, duration: 2, resource: "Bose", fillColor: getRandomColor() },
  { name: "Task 5", start: 10, duration: 3, resource: "Uno", fillColor: getRandomColor() },
  {}
  // Add more tasks as needed
];

const lastTask = tasks.pop();
while(tasks.length > 1 && tasks.length < mockTaskSize) {
  tasks.push(...tasks.map(item => ({...item})));
}
tasks.push(lastTask)

window.tasks = tasks;

// Define the milestones
const mileStones = useLocal ? getLocal('mileStones') : [
  { start: 10, name: '提测' }
];
window.mileStones = mileStones;

zr.on('mousewheel', function (e) {
  e.event.preventDefault();
  // console.log(e.event, e.event.wheelDeltaX);
  // set speed for the scroll
  lastScrollX -= Math.floor(e.event.wheelDeltaX * 0.01 * scrollSpeed);
  redrawChart(true, lastScrollX, 0);
  $lastScrollXSpan.innerText = lastScrollX;
})
// redraw when browser window size change
window.addEventListener('resize', function() {
  zr.resize();
  redrawChart(true);
});

addControls((val) => lastScrollX = val, (val) => lastScrollY = val, $lastScrollXSpan, redrawChart)

let isFirstFlag = true
function redrawChart(clear = false, scrollX = lastScrollX, scrollY = 0) {
  const isFirst = isFirstFlag
  if (isFirstFlag) {
    isFirstFlag = false
  }
  // margin left to the container
  const chartStartX = initChartStartX - scrollX;
  // margin top to the container
  const chartStartY = Math.max(initChartStartY, timeScaleHeight + milestoneTopHeight) - scrollY;
  // clear the painter
  clear && zr.clear();
  const canvasWidth = zr.getWidth();
  const canvasHeight = zr.getHeight();

  const boundingLeft = Math.floor(lastScrollX / unitWidth);
  const boundingRight = Math.floor((lastScrollX + canvasWidth) / unitWidth);
  // hover day grid to add task
  let lastPos
  let lastDayRect
  function handleMove(e) {
    if (currentGroup?.resizing || currentGroup?.dragging) {
      return
    }
    const x = e.event.zrX - chartStartX
    const y = e.event.zrY - chartStartY
    const posX = Math.floor(x / unitWidth)
    const posY = Math.floor(y / (barHeight + barMargin))
    if (lastPos !== [posX, posY].join()) {
      lastPos = [posX, posY].join()
      // if (true || (posX >= 0 && posX < timeScaleWidth && posY >= 0 && posY < tasks.length)) {
      if (posY >= 0 && posY < tasks.length) {
        // console.log('zr', 'clicked', posX, posY)
        const hasTask = posX >= tasks[posY].start && posX < tasks[posY].start + tasks[posY].duration
        if (hasTask) {
          lastDayRect && zr.remove(lastDayRect)
          return
        }
        const dayHoverGroup = new zrender.Group()
        dayHoverGroup.on('click', function () {
          console.log('dayHoverGroup clicked pos: ', [posX, posY])
          // alert([posX, posY])
          const taskName = prompt('task name?');
          if (!taskName) return
          const resourceName = prompt('assign to who?') || defaultTaskOwner;
          tasks.splice(posY, 0, { name: taskName, start: posX, duration: 1, resource: resourceName, fillColor: getRandomColor() });
          syncLocal();
          redrawChart(true)
        })
        // draw the hover rect on the day grid
        const dayRect = new zrender.Rect({
          shape: {
            x: chartStartX + unitWidth * posX + 5,
            y: chartStartY + (barHeight + barMargin) * posY,
            width: unitWidth - 10,
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
            x: chartStartX + lastScrollX,
            y: chartStartY + (barHeight + barMargin) * posY,
            width: unitWidth * timeScaleWidth,
            height: barHeight + barMargin,
          },
          style: {
            fill: 'rgba(221, 221, 221, 0.3)',
          },
          z: 1
        })

        const lineH = new zrender.Line({
          shape: {
            x1: chartStartX + unitWidth * posX + unitWidth / 2 - 5,
            y1: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2,
            x2: chartStartX + unitWidth * posX + unitWidth / 2 + 5,
            y2: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2
          },
          style: {
            stroke: 'gray'
          },
          z: 100
        })
        const lineV = new zrender.Line({
          shape: {
            x1: chartStartX + unitWidth * posX + unitWidth / 2,
            y1: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2 - 5,
            x2: chartStartX + unitWidth * posX + unitWidth / 2,
            y2: chartStartY + (barHeight + barMargin) * posY + (barHeight + barMargin) / 2 + 5
          },
          style: {
            stroke: 'gray'
          },
          z: 100
        })
        // if(!tasks[posY]?.name) {
        dayHoverGroup.add(dayRect)
        dayHoverGroup.add(lineH)
        dayHoverGroup.add(lineV)
        dayHoverGroup.add(rowHoverRect)
        // }
        lastDayRect && zr.remove(lastDayRect)
        lastDayRect = dayHoverGroup
        zr.add(dayHoverGroup)
      } else {
        lastDayRect && zr.remove(lastDayRect)
        // console.log('invalid pos')
      }
    } else {
      // lastDayRect && zr.remove(lastDayRect)
      // console.log('same as the last pos')
    }
  }
  lastHandleMove && zr.off('mousemove', lastHandleMove)
  lastHandleMove = handleMove
  zr.on('mousemove', handleMove);

  const timeScaleWidth = Math.ceil((canvasWidth) / unitWidth);
  // Draw time scale
  // MARK: 日期时间轴
  const timeScale = new zrender.Rect({
    shape: {
      x: chartStartX + lastScrollX,
      y: chartStartY - timeScaleHeight,
      width: timeScaleWidth * unitWidth,
      height: timeScaleHeight
    },
    style: {
      // fill: "lightgray"
      fill: "rgba(255, 0,0, .2)"
    }
  });
  zr.add(timeScale);

  // Draw vertical grid lines
  // MARK: grid 竖线
  const gridStartX = chartStartX;
  const gridEndX = timeScaleWidth * unitWidth;
  const gridLineCount = timeScaleWidth + 1;
  const deltaScrollX = Math.floor(lastScrollX / unitWidth);
  for (let i = 0 + deltaScrollX, count = 0; count < gridLineCount; i++,count++) {
    // perf: 
    const viewPortTaskLength = Math.min(tasks.length, (canvasHeight - chartStartY) / (barHeight + barMargin))
    const gridX = gridStartX + i * unitWidth;
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
    });

    // Draw the date
    if (count < gridLineCount - 1) {
      // MARK: 同一个遍历画「休息日斜线」
      const now = +new Date('2024-01-01');
      const currentDate = now + i * 60 * 1000 * 60 * 24
      const dateInfo = isHoliday(currentDate)
      // Draw the hachure fill 画斜线
      if (dateInfo.isHoliday) {
        // if (i % 7 == 0 || i % 7 === 1) {
        try {
          const lines = hachureLines([
            [chartStartX + i * unitWidth, chartStartY],
            [chartStartX + i * unitWidth + unitWidth, chartStartY],
            [chartStartX + i * unitWidth + unitWidth, chartStartY + (barHeight + barMargin) * viewPortTaskLength],
            [chartStartX + i * unitWidth, chartStartY + (barHeight + barMargin) * viewPortTaskLength]
          ], 10, 45);
          // console.log(lines)
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
      // MARK: 画日期文字
      const dateText = new zrender.Text({
        style: {
          // text: i,
          text: dateInfo.dateString,
          x: gridX,
          y: chartStartY - timeScaleHeight,
        },
        z: 1
      });
      const [flagGroup, {
        flag
      }] = createFlagGroup(zr, gridX, halfUnitWidth, chartStartY, timeScaleHeight)
      dateText.on('click', function () {
        console.log('date text click', i);
        const index = mileStones.findIndex(item => item.start === i)
        if (index === -1) {
          if (confirm('Do you want to CREATE a milestone here?')) {
            const mileStoneName = prompt('mileStone name?');
            mileStones.push({
              start: i,
              name: mileStoneName
            });
            syncLocal();
          }
        } else {
          if (confirm('Do you want to DELETE the milestone here?')) {
            mileStones.splice(index, 1)
            syncLocal();
          }
        }
        redrawChart(true)
      })
      dateText.on('mouseover', function (e) {
        this.attr({
          style: {
            opacity: 0
          }
        });
        flagGroup.show()
      })
      dateText.on('mouseout', function (e) {
        this.attr({
          style: {
            opacity: 1
          }
        });
        flagGroup.hide()
      })

      const { width, height } = dateText.getBoundingRect()
      dateText.attr({
        style: {
          x: gridX - width / 2 + halfUnitWidth,
          y: chartStartY - timeScaleHeight - height / 2 + timeScaleHeight / 2,
        }
      })
      zr.add(dateText);
    }
    zr.add(gridLine);
  }

  // Draw horizontally grid lines
  // MARK: 画grid横线
  const gridLineCountY = tasks.length + 1;

  for (let j = 0; j < 1; j++) {
    const gridY = chartStartY + j * (barHeight + barMargin);
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
    });
    zr.add(gridLineY);
  }

  // Draw today line
  drawTodayLine(zr, chartStartX, chartStartY, timeScaleHeight, barHeight, barMargin, todayOffset);

  // Draw milestones
  // MARK: 画里程碑线
  mileStones.forEach(function (item) {
    const milestone = new zrender.Rect({
      shape: {
        // x: chartStartX + milestone.start * unitWidth - 1 + halfUnitWidth,
        x: chartStartX + item.start * unitWidth - 1,
        y: chartStartY - timeScaleHeight,
        width: 2,
        height: tasks.length * (barHeight + barMargin) + timeScaleHeight
      },
      style: {
        fill: "rgba(255, 0, 0, 1)"
      },
      z: 1
    });
    const milestone_top = new zrender.Rect({
      shape: {
        x: chartStartX + item.start * unitWidth - 1,
        y: chartStartY - timeScaleHeight - milestoneTopHeight,
        width: 10,
        height: milestoneTopHeight
      },
      style: {
        fill: "rgba(255, 0, 0, 1)"
      },
      z: 1
    });
    const milestone_top_text = new zrender.Text({
      style: {
        x: chartStartX + item.start * unitWidth - 1 + 10,
        y: chartStartY - timeScaleHeight - milestoneTopHeight,
        text: item.name || '里程碑',
        fill: "white",
        lineHeight: milestoneTopHeight,
        fontSize: 12
      },
      z: 1
    });
    const milestone_top_text_rect = milestone_top_text.getBoundingRect()
    milestone_top.attr({
      shape: {
        width: milestone_top_text_rect.width + 10 * 2,
      }
    })
    zr.add(milestone);
    zr.add(milestone_top);
    zr.add(milestone_top_text);
  });

  let drawTaskBar = 0;
  // Draw tasks, resource assignments, and task bars
  // MARK: 画任务条
  tasks.forEach(function (task, index) {
    if (!task?.name) return
    // perf: 在视口外跳过
    if (index > Math.floor((canvasHeight - chartStartY) / (barHeight + barMargin))) return
    // if (task.start > boundingRight || (task.start + task.duration) < boundingLeft) return
    const showLeftArrow = task.start <= boundingLeft, showRightArrow = (task.start + task.duration) > boundingRight

    drawTaskBar++;
    // Calculate position and dimensions
    const x = chartStartX + task.start * unitWidth;
    const y = chartStartY + (barHeight + barMargin) * index;
    const width = task.duration * unitWidth;
    const taskBarRect = {
      width,
      height: barHeight
    };

    const leftArrow = createLeftArrowRect(x, y, task, taskBarRect, showLeftArrow, boundingLeft, function() {
      lastScrollX = (task.start - 3) * unitWidth;
      $lastScrollXSpan.innerText = lastScrollX
      redrawChart(true)
    })
    const rightArrow = createRightArrowRect(x, y, task, unitWidth, lastScrollX, canvasWidth, taskBarRect, showRightArrow, boundingRight, function() {
      lastScrollX = (task.start + task.duration + 3) * unitWidth - canvasWidth;
      $lastScrollXSpan.innerText = lastScrollX
      redrawChart(true)
    })
    leftArrow && zr.add(leftArrow)
    rightArrow && zr.add(rightArrow)
    if (task.start > boundingRight || (task.start + task.duration) < boundingLeft) return
    // Create a group to hold task elements
    const group = new zrender.Group({
      x,
      y,
      draggable: true  // Enable draggable for the group
      // draggable: "horizontal", // Enable draggable for the group
    });
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
        // fill: task.fillColor || "blue"
        fill: task.fillColor
      },
      cursor: 'move'
    });
    group.add(rect);
    group.index = index;

    const w = 6;
    const box = rect.getBoundingRect();
    const leftBar = getLeftHandleBar(w, box, taskBarRect, redrawChart);
    leftBar.taskBar = rect;
    group.add(leftBar);

    const rightBar = getRightHandleBar(w, box, taskBarRect, redrawChart);
    rightBar.taskBar = rect;
    group.add(rightBar);

    group.on("mouseover", function () {
      if (this.dragging) return;

      rect.attr("style", { fill: zrender.color.lift(task.fillColor, 0.3) });
    });

    group.on("mouseout", function () {
      if (this.dragging || this.resizing) return;
      rect.attr("style", { fill: task.fillColor });
    });

    // zr.add(rect);

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
    });
    
    // Create a text for duration
    const taskDurationText = new zrender.Text({
      style: {
        text: `${getRealDuration(task, includeHoliday)}天`,
        x: width - taskNamePaddingLeft,
        y: barHeight / 2 - 12 / 2,
        textFill: "white",
        textAlign: "left",
        textVerticalAlign: "middle",
        fill: "white"
      },
      cursor: 'move'
    });
    const { width: taskDurationTextWidth } = taskDurationText.getBoundingRect()
    taskDurationText.attr({
      style: {
        x: width - taskDurationTextWidth - taskNamePaddingLeft
      }
    })
    // Create a text shape for resource assignment
    const resourceText = new zrender.Text({
      style: {
        text: "Assigned to: " + task.resource,
        x: 0 + width + 5,
        y: barHeight / 2 + 0 - 12 / 2,
        textFill: "black"
      },
      cursor: 'normal'
    });

    // 如果放不下，显示到resourceText上去，隐藏taskName
    if (taskName.getBoundingRect().width + taskDurationTextWidth + taskNamePaddingLeft * 2 > width) {
      resourceText.attr({
        style: {
          text: task.name
        }
      })
      taskName.hide();
    }
    group.add(taskName);
    group.add(taskDurationText);
    group.add(resourceText);

    // drag logic
    let dragStartX = 0;
    let lastPosY = null;
    let lastBottomLine = null;
    // taskBar拖动逻辑
    group.on("dragstart", function (e) {
      if (this.resizing) return;
      dragStartX = e.event.zrX;
      setCurrentGroup(this)
    });
    group.on("drag", function (e) {
      if (this.resizing) return;
      const y = e.event.zrY - chartStartY
      const posY = Math.floor(y / (barHeight + barMargin))
      if (lastPosY !== posY) {
        // console.log('pos', {
        //   posY
        // })
        lastPosY = posY
        zr.remove(lastBottomLine)
        const bottomLine = getTaskBarMoveLine(chartStartX, chartStartY, lastScrollX, timeScaleWidth, posY)
        lastBottomLine = bottomLine
        bottomLine && zr.add(bottomLine)
        zr.refresh()
      } else {
        // console.log('pos', 'is the same')
      }
    });
    group.on("dragend", function (e) {
      console.log('dragend')
      if (this.resizing) {
        this.resizing = false;
        return;
      }
      const deltaX = e.event.zrX - dragStartX;
      const dir = deltaX < 0 ? -1 : 1;
      const delta = Math.abs(deltaX);
      const mod = delta % unitWidth;
      const offsetX = dir * (Math.floor(delta / unitWidth) + Math.floor(mod / halfUnitWidth));
      const y = e.event.zrY - chartStartY
      const posY = Math.floor(y / (barHeight + barMargin))
      const offsetY = posY - index
      task.start += offsetX;
      if (lastBottomLine && posY !== index) {
        // console.log('delta', '上下移动位置', {
        //   old: index,
        //   new: posY
        // })
        // delete current item
        tasks.splice(index, 1);
        // move current item to the target pos
        tasks.splice(posY > index ? posY - 1 : posY, 0, {...task})
      }
      if (offsetX || offsetY ) {
        syncLocal();
      }
      setCurrentGroup(null);
      // Redraw the chart after dragging
      redrawChart(true);
    });
    group.eachChild(function (child) {
      child.attr({
        z: 10
      });
    });

    group.on("dblclick", function () {
      Popup.show()
      const $taskInput = document.querySelector('#current-task')

      $taskInput.value = JSON.stringify(tasks[this.index], null, 2);
      $taskInput.dataset.index = this.index
    });

    zr.add(group);
  });

  // 如果屏幕里没有任务条，调整到第一个
  if (isFirst && drawTaskBar === 0) {
    if (tasks.length > 0) {
      console.log(tasks[0].start);
      lastScrollX += (tasks[0].start - boundingLeft - 1) * unitWidth;
      $lastScrollXSpan.innerText
      redrawChart(true)
    }
  }

  debug && console.log({
    drawTaskBar
  })
}
window.redrawChart = redrawChart

if (useRemote) {
  document.title += ' (Remote)'
  initData(zr, redrawChart)
} else {
  // 如果有过滤filter参数，按fillColor过滤
  if (filter) {
    updateData('tasks', tasks.filter(item => item.fillColor === filter))
  }
  redrawChart();
}
