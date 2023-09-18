import { Ref, onMounted, onUnmounted, ref, watch } from "vue"
import { SymbolNode } from "../../extension/symbolnode"
import { findNodeByPathBfs, setOrderList } from "../assets/utils"
import { MsgType } from "../../common"
import { setHotKeys } from "../assets/hotkeys";

const vscode = acquireVsCodeApi();

const useMain = (nodes: Ref<SymbolNode[]>) => {
  const activePath = ref<string>('')

  const orderList = ref<string[]>([])

  const pathIndex = ref<number>(-1)

  if (orderList.value.length === 0) {
    setOrderList(nodes.value, orderList.value)
  }

  watch(() => nodes.value, (newVal) => {
    orderList.value.length = 0
    setOrderList(newVal, orderList.value)
  })

  const changeHandle = (node: SymbolNode, nodes: SymbolNode[]) => {
    activePath.value = node.path
    pathIndex.value = orderList.value.indexOf(node.path)
    orderList.value.length = 0
    setOrderList(nodes, orderList.value)
    actionNodeHandler('show', node)
  }

  const changeActive = () => {
    if (pathIndex.value === -1) {
      pathIndex.value = 0
    }
    activePath.value = orderList.value[pathIndex.value]
    const node = findNodeByPathBfs(nodes.value, activePath.value)
    document.getElementById(activePath.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
    actionNodeHandler('show', node)
  }

  const changePathState = () => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      let exec = true
      if (pathIndex.value != -1) {
        const itemReduce = orderList.value[pathIndex.value - 1]
        if (itemReduce) {
          activePath.value = itemReduce
          pathIndex.value--
        } else {
          const itemAdd = orderList.value[pathIndex.value + 1]
          if (itemAdd) {
            activePath.value = itemAdd
            pathIndex.value++
          } else {
            activePath.value = ''
            pathIndex.value = -1
            exec = false
          }
        }
        exec && changeActive()
      }
    }, 300)
  }

  const actionHandler = (type: MsgType, value?: any) => {
    vscode.postMessage(JSON.stringify({
      type,
      value
    }));
  }

  const actionNodeHandler = (type: MsgType, node: SymbolNode | null) => {
    if (node) {
      try {
        vscode.postMessage(JSON.stringify({
          type,
          value: {
            range: node.range
          }
        }));
        activePath.value = node.path
        pathIndex.value = orderList.value.indexOf(node.path)
      } catch (e: any) {
        console.error(e.message)
      }
    }
  }

  setHotKeys(nodes, pathIndex, activePath, orderList, actionNodeHandler, changeActive)

  if (nodes.value.length > 0 && activePath.value === '') {
    actionHandler('set-active-path')
  }

  watch(() => nodes.value, (newVal) => {
    if (newVal.length > 0 && activePath.value === '') {
      actionHandler('set-active-path')
    }
  })

  const focusing = ref(false)

  const handleFocus = () => {
    focusing.value = true;
    changeActive()
  }

  const handleBlur = () => {
    focusing.value = false;
    actionHandler('clean-decoration')
  }

  onMounted(() => {
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
  });

  onUnmounted(() => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
  });

  return {
    activePath,
    orderList,
    focusing,
    pathIndex,
    changeHandle,
    actionHandler,
    actionNodeHandler,
    changePathState,
    setOrderList
  }
}

export default useMain