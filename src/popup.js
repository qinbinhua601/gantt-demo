import makeElementDraggable from './dragging'
// popup modal
export const Popup = {};

Popup.show = function ({
  currentIndex,
}) {
  if (!Popup.el) {
    const $popup = document.querySelector('.popup-wrapper')
    const $popupBody = document.querySelector('.popup-wrapper__body');
    const $button = $popup.querySelector('button.modify');
    // form item
    const $name = document.getElementById('name')
    const $resource = document.getElementById('resource')
    const $fillColor = document.getElementById('fillColor')

    makeElementDraggable($popupBody)

    $popup.addEventListener('click', function () {
      Popup.hide();
    });

    $button.onclick = function (e) {
      e.preventDefault();
      // const value = this.parentElement.previousElementSibling.value;
      const index = Popup.index
      const value = {
        ...tasks[index],
        name: $name.value,
        resource: $resource.value,
        fillColor: $fillColor.value
      }
      tasks.splice(index, 1, value);
      syncLocal();
      Popup.hide();
      redrawChart(true);
    }

    $popupBody.onclick = function (e) { e.stopPropagation(); }

    Popup.el = $popup;
    Popup.popupBody = $popupBody;
    Popup.formItems = {
      name: $name,
      resource: $resource,
      fillColor: $fillColor,
    }
  }

  Popup.el.style.display = 'flex';
  Popup.index = currentIndex

  const {
    name,
    resource,
    fillColor
  } = tasks[currentIndex]

  Popup.formItems.name.value = name
  Popup.formItems.resource.value = resource
  Popup.formItems.fillColor.value = fillColor
}
Popup.hide = function () {
  Popup.el.style.display = 'none';
  // clear dragging element style
  Popup.popupBody.removeAttribute('style')
}

export default Popup;
