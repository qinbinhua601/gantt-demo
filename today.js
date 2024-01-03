function drawTodayLine(chartStartX, chartStartY, timeScaleHeight, barHeight, barMargin) {
  const todayLine = new zrender.Rect({
    shape: {
      x: chartStartX + todayOffset * unitWidth - 1 + halfUnitWidth,
      y: chartStartY,
      width: 2,
      height: tasks.length * (barHeight + barMargin)
    },
    style: {
      fill: "#2955c9"
    },
    z: 1
  });
  const circle = new zrender.Circle({
    shape: {
      cx: chartStartX + todayOffset * unitWidth + halfUnitWidth,
      cy: chartStartY - timeScaleHeight + timeScaleHeight + 2,
      r: 3
    },
    style: {
      fill: "#2955c9"
    }
  })
  zr.add(todayLine);
  zr.add(circle);
}