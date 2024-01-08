import { initLastScrollX, showFilter } from './const';
import {syncLocal, updateFilterItems} from './utils'

export function addControls(setLastScrollX, setLastScrollY, $lastScrollXSpan, redrawChart) {
  const $backToOriginButton = document.querySelector('#back-to-origin-button');

  $backToOriginButton?.addEventListener('click', function() {
    setLastScrollX(initLastScrollX);
    setLastScrollY(0);
    $lastScrollXSpan.innerText = initLastScrollX;
    redrawChart(true);
  })
  
  const $clearButton = document.querySelector('#clear-button');
  
  $clearButton?.addEventListener('click', function() {
    const oldTaskLength = tasks.length;
    tasks.length = 0;
    for(let i = 0; i < oldTaskLength; i++) {
      tasks.push({});
    }
    syncLocal();
    redrawChart(true);
  })
  
  const $clearMilestoneButton = document.querySelector('#clear-milestone-button');
  
  $clearMilestoneButton?.addEventListener('click', function() {
    mileStones.length = 0;
    syncLocal('mileStones');
    redrawChart(true);
  })

  // 显示过滤器
  if (showFilter) {
    updateFilterItems(window.tasks)
  }
}