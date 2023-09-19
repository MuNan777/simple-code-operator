import { onMounted, onUnmounted, ref } from "vue"
import { actionNodeHandlerType } from "../assets/utils"
import { SymbolNode } from "../../extension/symbolnode"
import { MsgType } from "../../common"

const getContextMenuPosition = (event: MouseEvent) => {
  const target = document.getElementById('context-menu') as HTMLDivElement

  const menuWidth = target.offsetWidth
  const menuHeight = target.offsetHeight

  let menuX = event.clientX;
  if (menuX + menuWidth > window.innerWidth) {
    menuX = window.innerWidth - menuWidth - 17;
  }

  let menuY = event.clientY;
  if (menuY + menuHeight > window.innerHeight) {
    menuY = window.innerHeight - menuHeight;
  }

  if (menuY < 0) {
    menuY = 0;
  }
  return {
    x: menuX,
    y: menuY
  }
}


const useContextmenu = (actionNodeHandler: actionNodeHandlerType) => {

  const showContextMenu = ref(false)

  const contextMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });

  const node = ref<SymbolNode | null>(null)

  const contextmenuHandle = (event: MouseEvent, _node: SymbolNode) => {
    node.value = _node
    showContextMenu.value = true
    const data = getContextMenuPosition(event);
    contextMenuPosition.value = {
      x: data.x,
      y: data.y,
    }
    actionNodeHandler('show', _node)
  }

  const contextMenuItemHandler = (type: MsgType) => {
    actionNodeHandler(type, node.value)
    showContextMenu.value = false
  }

  const hideContextMenu = () => {
    showContextMenu.value = false
  }

  onMounted(() => {
    window.addEventListener('click', hideContextMenu)
  })

  onUnmounted(() => {
    window.removeEventListener('click', hideContextMenu)
  })

  return {
    showContextMenu,
    contextMenuPosition,
    contextmenuHandle,
    contextMenuItemHandler
  }
}

export default useContextmenu