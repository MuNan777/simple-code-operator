<script lang="ts">
import { defineComponent } from 'vue'
import { MsgType } from '../../common'
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
  emits: ['itemClick'],
  setup (props, { emit }) {
    const itemClick = (type: MsgType) => {
      emit('itemClick', type)
    }
    const items: { label: string, hotkey: string, type: MsgType }[] = [
      {
        label: 'Delete',
        hotkey: 'delete',
        type: 'remove'
      },
      {
        label: 'Copy',
        hotkey: 'ctrl+c',
        type: 'copy'
      },
      {
        label: 'Comment',
        hotkey: '/',
        type: 'comment'
      }
    ]
    return {
      items,
      itemClick
    }
  }
})
</script>
<template>
  <div v-show="showContextMenu" class="context-menu" id="context-menu"
    :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }">
    <template v-for="item of items">
      <div @click="itemClick(item.type)" class="btn">
        <span>{{ item.label }}</span>
        <span class="hotkey">{{ item.hotkey }}</span>
      </div>
    </template>
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