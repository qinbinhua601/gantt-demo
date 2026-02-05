import * as zrender from 'zrender'
import { isHoliday } from './holidays'
import { syncLocal } from './utils'
import { debug, unitWidth, halfUnitWidth, currentGroup, setCurrentGroup, barHeight, barMargin, arrowSize, showArrow, baseDate, dayMs } from './const'

export function getLeftHandleBar(w, box, taskBarRect, redrawChart) {
  const { height: barHeight, width } = taskBarRect;
  const leftBar = new zrender.Rect({
    name: "leftBar",
    style: {
      fill: `rgba(0, 255, 0, ${debug ? 1 : 0})`,
      lineWidth: 1
    },
    shape: {
      width: w,
      height: barHeight
    },
    draggable: "horizontal",
    cursor: "ew-resize",
    z: 1
  });
  leftBar.attr({
    x: box.x,
    y: box.y,
    shape: {
      x: -w / 2,
      y: 0
    }
  });
  let dragStartX = 0;
  let oldX = 0;
  let oldWidth = 0;
  leftBar.on("dragstart", function (e) {
    this.parent.resizing = true;
    dragStartX = e.event.zrX;
    const taskBar = this.taskBar;
    oldWidth = taskBar.shape.width;
    oldX = taskBar.shape.x;
    setCurrentGroup(this.parent);
  });
  leftBar.on("drag", function (e) {
    const deltaX = e.event.zrX - dragStartX;
    const taskBar = this.taskBar;
    taskBar.attr({
      shape: {
        x: oldX + deltaX,
        width: oldWidth - deltaX
      }
    });
  });
  leftBar.on("dragend", function (e) {
    const deltaX = e.event.zrX - dragStartX;
    const dir = deltaX < 0 ? -1 : 1;
    const delta = Math.abs(deltaX);
    const mod = delta % unitWidth;
    const offsetX = dir * (Math.floor(delta / unitWidth) + Math.floor(mod / halfUnitWidth));
    console.log(offsetX)
    const task = tasks[this.parent.index];
    task.start += offsetX;
    task.duration -= offsetX;
    if (offsetX) {
      syncLocal();
    }
    setCurrentGroup(null);
    // Redraw the chart after dragging
    redrawChart(true);
  });
  return leftBar;
}

export function getRightHandleBar(w, box, taskBarRect, redrawChart) {
  const { height: barHeight, width } = taskBarRect;
  const rightBar = new zrender.Rect({
    style: {
      fill: `rgba(255, 192, 203, ${debug ? 1 : 0})`,
      lineWidth: 1
    },
    shape: {
      width: w,
      height: barHeight
    },
    draggable: "horizontal",
    cursor: "ew-resize",
    z: 1
  });
  rightBar.attr({
    x: box.x + width,
    y: box.y,
    shape: {
      x: -w / 2,
      y: 0
    }
  });
  let dragStartX = 0;
  let oldX = 0;
  let oldWidth = 0;
  rightBar.on("dragstart", function (e) {
    this.parent.resizing = true;
    dragStartX = e.event.zrX;
    const taskBar = this.taskBar;
    oldWidth = taskBar.shape.width;
    oldX = taskBar.shape.x;
    console.log(currentGroup)
    setCurrentGroup(this.parent);
  });
  rightBar.on("drag", function (e) {
    const deltaX = e.event.zrX - dragStartX;
    const taskBar = this.taskBar;
    taskBar.attr({
      shape: {
        width: oldWidth + deltaX
      }
    });
  });
  rightBar.on("dragend", function (e) {
    const deltaX = e.event.zrX - dragStartX;
    const dir = deltaX < 0 ? -1 : 1;
    const delta = Math.abs(deltaX);
    const mod = delta % unitWidth;
    const offsetX = dir * (Math.floor(delta / unitWidth) + Math.floor(mod / halfUnitWidth));
    const task = tasks[this.parent.index];
    task.duration += offsetX;
    if (offsetX) {
      syncLocal();
    }
    setCurrentGroup(null);
    // Redraw the chart after dragging
    redrawChart(true);
  });
  return rightBar;
}

const taskStartDate = +baseDate
const taskDayCount = dayMs

// 获取天数
export function getRealDuration(task, includeHoliday) {
  const { start, duration } = task;
  if (includeHoliday) return task.duration;
  let res = 0;
  const endLen = duration + start
  for(let i = start; i < endLen; i++) {
    if (isHoliday(new Date(taskStartDate + taskDayCount * i)).isHoliday) continue;
    res++;
  }
  return res
}

export function getTaskBarMoveLine (chartStartX, chartStartY, lastScrollX, timeScaleWidth, posY) {
  // 如果越界，不要画蓝色底线
  if (posY < 0 || posY > tasks.length - 1) return null
  const bottomLine = new zrender.Rect({
    shape: {
      x: chartStartX + lastScrollX,
      y: chartStartY + (barHeight + barMargin) * posY,
      width: timeScaleWidth * unitWidth,
      height: 1
    },
    style: {
      // fill: "lightgray"
      fill: "blue"
    },
    zlevel: 1
  });
  return bottomLine
}


export function createLeftArrowRect(x, y, task, taskBarRect, displayArrow, boundingLeft, onClickHandler) {
  if (!showArrow) return
  const baseZ = 1000
  const group = new zrender.Group({
    x: 0 + 5,
    y: y + (taskBarRect.height - arrowSize) / 2,
  })
  const text = new zrender.Text({
    x: arrowSize * 0.1,
    style: {
      text: '←',
      fill: 'rgb(101, 116, 114)',
      fontSize: arrowSize * 0.8,
      textAlign: "center",
      lineHeight: arrowSize
    },
    z: baseZ + 1,
    name: 'leftArrowText'
  })
  group.add(text)
  const leftArrowRect = new zrender.Rect({
    shape: {
      width: arrowSize,
      height: arrowSize,
      r: 3
    },
    style: {
      fill: 'rgba(221, 221, 221, 1)'
    },
    z: baseZ,
    name: 'leftArrowRect'
  })
  group.on('mouseover', function() {
    if (boundingLeft >= task.start + task.duration) {
      const rect = this.childOfName('leftArrowRect')
      rect.attr({
        style: {
          fill: task.fillColor
        }
      })
    }
    const text = this.childOfName('leftArrowText')
    text.attr({
      style: {
        fill: 'rgb(32, 35, 40)'
      }
    })
  })
  group.on('mouseout', function() {
    const rect = this.childOfName('leftArrowRect')
    rect.attr({
      style: {
        fill: 'rgba(221, 221, 221, 1)'
      }
    })
    const text = this.childOfName('leftArrowText')
    text.attr({
      style: {
        fill: 'rgb(101, 116, 114)',
      }
    })
  })
  group.on('click', onClickHandler)
  group.add(leftArrowRect)
  if (!displayArrow) {
    group.eachChild(function (child) {
      child.hide();
    });
  }
  return group
}

export function createRightArrowRect(x, y, task, unitWidth, lastScrollX, canvasWidth, taskBarRect, displayArrow, boundingRight, onClickHandler) {
  if (!showArrow) return
  const baseZ = 1000
  const group = new zrender.Group({
    x: x + lastScrollX + canvasWidth - arrowSize - 10 - task.start * unitWidth,
    y: y + (taskBarRect.height - arrowSize) / 2,
  })
  const text = new zrender.Text({
    x: arrowSize * 0.1,
    style: {
      text: '→',
      fill: 'rgb(101, 116, 114)',
      fontSize: arrowSize * 0.8,
      textAlign: "center",
      lineHeight: arrowSize
    },
    z: baseZ + 1,
    name: 'rightArrowText'
  })
  group.add(text)
  const rightArrowRect = new zrender.Rect({
    shape: {
      width: arrowSize,
      height: arrowSize,
      r: 3
    },
    style: {
      fill: 'rgba(221, 221, 221, 1)'
    },
    z: baseZ,
    name: 'rightArrowRect'
  })
  group.on('mouseover', function() {
    const rect = this.childOfName('rightArrowRect')
    if (boundingRight < task.start) {
      rect.attr({
        style: {
          fill: task.fillColor
        }
      })
    }
    const text = this.childOfName('rightArrowText')
    text.attr({
      style: {
        fill: 'rgb(32, 35, 40)'
      }
    })
  })
  group.on('mouseout', function() {
    const rect = this.childOfName('rightArrowRect')
    rect.attr({
      style: {
        fill: 'rgba(221, 221, 221, 1)'
      }
    })
    const text = this.childOfName('rightArrowText')
    text.attr({
      style: {
        fill: 'rgb(101, 116, 114)',
      }
    })
  })
  group.on('click', onClickHandler)
  group.add(rightArrowRect)
  if (!displayArrow) {
    group.eachChild(function (child) {
      child.hide();
    });
  }
  return group
}