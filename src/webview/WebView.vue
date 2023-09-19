<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { Msg } from '../common';
import { SymbolNode } from '../extension/symbolnode';
import CodeTree from './components/CodeTree.vue';
import { findActionPath, setAllExpanded } from './assets/utils';
import useMain from './hooks/useMain';
import useContextmenu from './hooks/useContextmenu';
import copy from 'copy-to-clipboard';
import ContextMenu from './components/ContextMenu.vue'

export default defineComponent({
  components: {
    CodeTree,
    ContextMenu
  },
  setup () {
    const str = sessionStorage.getItem('nodes');

    const nodes = ref<SymbolNode[]>(str != null ? JSON.parse(str) : []);

    const {
      activePath,
      pathIndex,
      orderList,
      focusing,
      actionHandler,
      actionNodeHandler,
      changeHandle,
      changePathState,
      setOrderList
    } = useMain(nodes);

    actionHandler('get-file-path')

    watch(() => nodes.value, (newVal) => {
      sessionStorage.setItem('nodes', JSON.stringify(newVal))
      let firstLayerFolded = false
      for (const node of newVal) {
        if (node.expanded && node.children.length > 0) {
          firstLayerFolded = true
        }
      }
      actionHandler('set-expand-status', firstLayerFolded ? '1' : '0')
    }, {
      deep: true
    })

    const listener = (event: MessageEvent<Msg>) => {
      switch (event.data.type) {
        case 'update':
          nodes.value = event.data.value;
          sessionStorage.setItem('nodes', JSON.stringify(event.data.value))
          break;
        case 'selected':
          const data = findActionPath(nodes.value, event.data.value.selection)
          if (data) {
            activePath.value = data.path
            pathIndex.value = orderList.value.indexOf(data.path)
            data.parents.forEach((item) => {
              item.expanded = true
            })
            setOrderList(nodes.value, orderList.value)
            console.log(focusing.value)
            if (!focusing.value) {
              const timer = setTimeout(() => {
                clearTimeout(timer)
                document.getElementById(data.path)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center'
                })
              }, 0)
            }
          }
          break;
        case 'delete-down':
          changePathState()
          break;
        case 'comment-down':
          changePathState()
          break;
        case 'focus':
          window.focus()
          break;
        case 'set-all-expanded':
          setAllExpanded(nodes.value, event.data.value)
          break;
        case 'copy-value':
          copy(event.data.value)
          break;
        case 'set-file-path':
          const filePath = sessionStorage.getItem('filePath')
          if (filePath && filePath !== event.data.value) {
            actionHandler('refresh')
          }
          sessionStorage.setItem('filePath', event.data.value)
          break;
        default:
          break;
      }
    };
    onMounted(() => {
      window.addEventListener('message', listener);
    });
    onUnmounted(() => {
      window.removeEventListener('message', listener);
    });

    const {
      showContextMenu,
      contextMenuPosition,
      contextmenuHandle,
      contextMenuItemHandler
    } = useContextmenu(actionNodeHandler);

    watch(() => focusing.value, (newVal) => {
      if (!newVal) {
        showContextMenu.value = false
      }
    })

    return {
      nodes,
      activePath,
      orderList,
      focusing,
      showContextMenu,
      contextMenuPosition,
      actionNodeHandler,
      changeHandle,
      contextmenuHandle,
      contextMenuItemHandler
    };
  },
});
</script>
<template>
  <div v-if="nodes.length > 0">
    <div class="container">
      <CodeTree :nodes="nodes" :activePath="activePath" :focusing="focusing"
        @gotoPosition="(node) => { actionNodeHandler('show', node) }" @change="changeHandle"
        @contextmenu="contextmenuHandle">
      </CodeTree>
    </div>
  </div>
  <div v-else style="text-align: center;">
    No data, or acquisition failed
  </div>
  <ContextMenu :showContextMenu="showContextMenu" :contextMenuPosition="contextMenuPosition"
    @itemClick="contextMenuItemHandler">
  </ContextMenu>
</template>
<style lang="scss">
body {
  padding: 0 !important;
  position: relative;
}

.container {
  width: 100%;
}
</style>