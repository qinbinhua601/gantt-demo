function getLeftHandleBar(w, box, taskBarRect) {
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
    position: [box.x, box.y],
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
    currentGroup = this.parent;
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
    syncLocal();
    currentGroup = null;
    // Redraw the chart after dragging
    redrawChart(true);
  });
  return leftBar;
}

function getRightHandleBar(w, box, taskBarRect) {
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
    position: [box.x + width, box.y],
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
    currentGroup = this.parent
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
    syncLocal();
    currentGroup = null
    // Redraw the chart after dragging
    redrawChart(true);
  });
  return rightBar;
}