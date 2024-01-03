function createFlag() {
  const flag = zrender.path.createFromString('M3.333,10v 5 c0,0.184 -0.149, 0.333 -0.333, 0.333 h-0.667A0.333, 0.333 0 0 1 2, 15 V 1.333 c0, -0.368 0.298, -0.666 0.667, -0.666 h 11.525 a 0.667, 0.667 0 0 1 0.581, 0.994 L 12.76, 5.233 a 0.333, 0.333 0 0 0 0.002, 0.33 L 14.753, 9 A 0.667, 0.667 0 0 1 14.176, 10 H 3.333z', {
    style: {
      fill: '#F54A45'
    }
  })
  return flag;
}
function createFlagGroup(gridX, halfUnitWidth, chartStartY, timeScaleHeight) {
  const flagGroup = new zrender.Group()
  const flag = createFlag()
  const { width: fWidth, height: fHeight } = flag.getBoundingRect()
  flag.attr('position', [gridX + halfUnitWidth - fWidth / 2, (chartStartY - timeScaleHeight) + timeScaleHeight / 2 - fHeight / 2])
  const flagHoveredCircle = new zrender.Circle({
    shape: {
      cx: gridX + halfUnitWidth + 1,
      cy: (chartStartY - timeScaleHeight) + timeScaleHeight / 2,
      r: 12
    },
    style: {
      fill: 'rgba(211, 211, 211, 0.5)'
    }
  })
  flagGroup.add(flagHoveredCircle)
  flagGroup.add(flag)
  flagGroup.hide()
  zr.add(flagGroup)
  return [flagGroup, {
    flag,
    flagHoveredCircle
  }]
}