const $backToOriginButton = document.querySelector('#back-to-origin-button');

$backToOriginButton.addEventListener('click', function() {
  lastScrollX = 0;
  lastScrollY = 0;
  redrawChart(true);
})
