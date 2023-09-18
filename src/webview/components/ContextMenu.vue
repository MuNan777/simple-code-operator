<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    showContextMenu: {
      type: Boolean,
      required: true
    },
    contextMenuPosition: {
      type: Object as () => { x: number, y: number },
      required: true
    }
  },
  emits: ['delete', 'copy'],
  setup (props, { emit }) {
    const deleteItem = () => {
      emit('delete')
    }
    const copyItem = () => {
      emit('copy')
    }
    return {
      deleteItem,
      copyItem
    }
  }
})
</script>
<template>
  <div v-show="showContextMenu" class="context-menu" id="context-menu"
    :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }">
    <div @click="deleteItem" class="btn">
      <span>Delete</span>
      <span class="hotkey">delete</span>
    </div>
    <div @click="copyItem" class="btn">
      <span>Copy</span>
      <span class="hotkey">ctrl+c</span>
    </div>
  </div>
</template>
<style lang="scss">
.context-menu {
  position: fixed;
  z-index: 999;
  border: 1px solid var(--vscode-activityBar-border);
  border-radius: 5px;
  overflow: hidden;
  padding: 5px;
  background-color: var(--vscode-editor-background);

  .btn {
    width: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--vscode-editor-background);
    border-radius: 5px;

    &:hover {
      background-color: var(--vscode-list-activeSelectionBackground);
    }

    .hotkey {
      font-size: 0.7rem;
      color: var(--vscode-descriptionForeground);
    }
  }
}

.context-menu div {
  cursor: pointer;
  padding: 5px;
}
</style>