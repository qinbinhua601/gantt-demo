import { t } from './i18n'

// Context Menu
export const ContextMenu = {};

ContextMenu.show = function ({
  currentIndex,
  position: {
    x,
    y
  }
}) {
  if (!ContextMenu.el) {
    const $contextMenu = document.querySelector('#contextMenu')
    const $copyElement = $contextMenu.querySelector('.menu-item.copy')
    const $deleteElement = $contextMenu.querySelector('.menu-item.delete')

    $deleteElement.onclick = function (e) {
      e.preventDefault();
      const index = Number($contextMenu.dataset.index);
      if (confirm(t('contextMenu.deleteConfirm'))) {
        tasks.splice(index, 1)
        syncLocal();
      }
      ContextMenu.hide();
      redrawChart(true);
    }

    $copyElement.onclick = function (e) {
      e.preventDefault();
      const index = Number($contextMenu.dataset.index);
      const curTask = { ...tasks[index], duration: 1 };
      tasks.splice(index + 1, 0, curTask);
      console.log(tasks[index])
      syncLocal();
      ContextMenu.hide();
      redrawChart(true);
    }

    ContextMenu.el = $contextMenu;

    const {
      left: offsetX,
      top: offsetY
    } = document.querySelector('#zrender-container')?.getBoundingClientRect() || {
      left: 0,
      top: 0
    }
    ContextMenu.offsetX = offsetX
    ContextMenu.offsetY = offsetY
  }

  ContextMenu.el.style.display = 'block'

  ContextMenu.el.dataset.index = currentIndex
  ContextMenu.el.style.left = `${x + ContextMenu.offsetX}px`
  ContextMenu.el.style.top = `${y + ContextMenu.offsetY}px`
}
ContextMenu.hide = function () {
  if (ContextMenu.el) {
    ContextMenu.el.style.display = 'none';
  }
}

export default ContextMenu;
