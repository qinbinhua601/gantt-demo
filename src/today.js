import { unitWidth, halfUnitWidth } from './const'
import * as zrender from 'zrender'

export function drawTodayLine(zr, chartStartX, chartStartY, timeScaleHeight, barHeight, barMargin, todayOffset, unitWidthOverride, viewStartOffset = 0) {
  const widthUnit = unitWidthOverride || unitWidth
  const halfWidthUnit = widthUnit / 2
  const offsetIndex = todayOffset - viewStartOffset
  const todayLine = new zrender.Rect({
    shape: {
      x: chartStartX + offsetIndex * widthUnit - 1 + halfWidthUnit,
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
      cx: chartStartX + offsetIndex * widthUnit + halfWidthUnit,
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