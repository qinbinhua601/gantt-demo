// popup modal
export const Popup = {};

Popup.show = function () {
  if (!Popup.el) {
    const $popup = document.querySelector('.popup-wrapper')
    const $popupBody = document.querySelector('.popup-wrapper__body');
    const $button = $popup.querySelector('button.modify');

    $popup.addEventListener('click', function () {
      Popup.hide();
    });

    $button.onclick = function (e) {
      e.preventDefault();
      const value = this.parentElement.previousElementSibling.value;
      const index = Number(this.parentElement.previousElementSibling.dataset.index);
      tasks.splice(index, 1, JSON.parse(value));
      syncLocal();
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

export default Popup;
