const $backToOriginButton = document.querySelector('#back-to-origin-button');

$backToOriginButton?.addEventListener('click', function() {
  lastScrollX = 0;
  lastScrollY = 0;
  $lastScrollXSpan.innerText = 0;
  redrawChart(true);
})

const $clearButton = document.querySelector('#clear-button');

$clearButton?.addEventListener('click', function() {
  const oldTaskLength = tasks.length;
  tasks.length = 0;
  for(let i = 0; i < oldTaskLength; i++) {
    tasks.push({});
  }
  redrawChart(true);
})

const $clearMilestoneButton = document.querySelector('#clear-milestone-button');

$clearMilestoneButton?.addEventListener('click', function() {
  mileStones.length = 0;
  redrawChart(true);
})
