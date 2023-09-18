
import hotkeys from 'hotkeys-js';
import { Ref } from 'vue';
import { actionNodeHandlerType, findNodeByPathBfs, setOrderList } from './utils';

export const setHotKeys = (nodes: Ref, pathIndex: Ref, activePath: Ref, orderList: Ref, actionNodeHandler: actionNodeHandlerType, changeActive: () => void) => {
  hotkeys('up, left', (event) => {
    event.preventDefault();
    if (pathIndex.value > 0) {
      pathIndex.value--
    }
    changeActive()
  })

  hotkeys('down, right', (event) => {
    event.preventDefault();
    if (pathIndex.value < orderList.value.length - 1) {
      pathIndex.value++
    }
    changeActive()
  })

  hotkeys('space', () => {
    const node = findNodeByPathBfs(nodes.value, activePath.value)
    if (node && node.children.length > 0) {
      node.expanded = !node.expanded
      orderList.value.length = 0
      setOrderList(nodes.value, orderList.value)
    }
  })

  hotkeys('delete', () => {
    const node = findNodeByPathBfs(nodes.value, activePath.value)
    actionNodeHandler('remove', node)
  })

  hotkeys('esc, enter', () => {
    const node = findNodeByPathBfs(nodes.value, activePath.value)
    actionNodeHandler('esc', node)
  })

  hotkeys('ctrl+c', () => {
    const node = findNodeByPathBfs(nodes.value, activePath.value)
    actionNodeHandler('copy', node)
  })
}