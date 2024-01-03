// popup modal
let Popup = {};

Popup.show = function () {
  if (!Popup.el) {
    const $popup = document.querySelector('.popup-wrapper')
    const $popupBody = document.querySelector('.popup-wrapper__body');
    const $button = $popup.querySelector('button.modify');
    const $deleteButton = $popup.querySelector('button.delete');
    const $copyButton = $popup.querySelector('button.copy');

    $popup.addEventListener('click', function () {
      Popup.hide();
    });

    $button.onclick = function (e) {
      e.preventDefault();
      const value = this.parentElement.previousElementSibling.value;
      const index = this.parentElement.previousElementSibling.dataset.index;
      tasks.splice(index, 1, JSON.parse(value));
      syncLocal();
      Popup.hide();
      redrawChart(true);
    }

    $deleteButton.onclick = function (e) {
      e.preventDefault();
      const index = this.parentElement.previousElementSibling.dataset.index;
      if (confirm('Are you sure to DELETE the task?')) {
        tasks.splice(index, 1)
        syncLocal();
      }
      Popup.hide();
      redrawChart(true);
    }

    $copyButton.onclick = function (e) {
      e.preventDefault();
      const index = this.parentElement.previousElementSibling.dataset.index;
      const curTask = {...tasks[index]};
      tasks.splice(index, 0, curTask);
      Popup.hide();
      redrawChart(true);
    }

    $popupBody.onclick = function (e) { e.stopPropagation(); }

    Popup.el = $popup;
  }

  Popup.el.style.display = 'flex';
}
Popup.hide = function () {
  Popup.el.style.display = 'none';
}