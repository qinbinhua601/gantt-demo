export default function makeElementDraggable(draggableElement) {
  // 获取可拖动元素
  // const draggableElement = document.querySelector('.popup-wrapper__body');

  let offsetX, offsetY, isDragging = false;

  // 鼠标按下时，记录鼠标与元素的位置差
  draggableElement.addEventListener('mousedown', function(event) {
    draggableElement.style.position = 'absolute'
    // console.log(event.target, event.target.closest('#taskForm'))
    if (event.target.closest('#taskForm')) return
    isDragging = true;
    offsetX = event.clientX - draggableElement.getBoundingClientRect().left;
    offsetY = event.clientY - draggableElement.getBoundingClientRect().top;
    
    // 防止选中文本
    document.body.style.userSelect = 'none';
  });

  // 鼠标移动时，更新元素的位置
  document.addEventListener('mousemove', function(event) {
    if (isDragging) {
      const newX = event.clientX - offsetX;
      const newY = event.clientY - offsetY;
      draggableElement.style.left = newX + 'px';
      draggableElement.style.top = newY + 'px';
    }
  });

  // 鼠标松开时，停止拖动
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = 'auto';  // 恢复文本选择
  });
}