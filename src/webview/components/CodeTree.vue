<template>
  <template v-for="node in treeData" :key="node.path">
    <div :class="['active', getBgColorClassName(node.path)]" :id="node.path"
      @contextmenu.prevent="handleContextmenu($event, node)">
      <div class="tree-node" @click="gotoPosition(node)" :style="{ paddingLeft: `${layerCount * deltaX + 5}px` }">
        <span :class="{ 'expanded': node.expanded, 'symbol-item': true }" style="width: 1rem;"
          @click.stop="toggleNode(node)">
          <span v-if="node.children.length > 0" class="expand-btn codicon codicon-chevron-right"></span>
        </span>
        <span>
          <div :class="[...node.className, 'symbol-item']">
            <span :class="`symbol-icon codicon codicon-symbol-${node.kind.toLowerCase()}`"
              :style="{ color: `var(--${node.kind.toLowerCase()}-color)` }"></span>
            <span class="symbol-name">
              {{ node.name }}
            </span>
          </div>
        </span>
      </div>
    </div>
    <template v-if="node.children && node.expanded">
      <CodeTree :nodes="node.children" @gotoPosition="gotoPosition" :parent="node" :layerCount="layerCount + 1"
        :isChild="true" :activePath="activePath" :focusing="focusing">
      </CodeTree>
    </template>
  </template>
</template>

<script lang="ts">
import { PropType, defineComponent, inject, provide, ref, watch } from 'vue';
import { SymbolNode } from '../../extension/symbolnode';

type HandleChangeType = (node: SymbolNode, nodes: SymbolNode[]) => void;
type handleContextmenu = (event: MouseEvent, node: SymbolNode) => void;

export default defineComponent({
  name: 'CodeTree',
  props: {
    nodes: {
      type: Object as PropType<SymbolNode[]>,
      required: true
    },
    deltaX: {
      type: Number,
      default: 10
    },
    layerCount: {
      type: Number,
      default: 0
    },
    parent: {
      type: Object as PropType<SymbolNode>,
      default: () => ({ name: 'root' })
    },
    isChild: {
      type: Boolean,
      default: false
    },
    activePath: {
      type: String,
      required: true
    },
    focusing: {
      type: Boolean,
      required: true
    }
  },
  emits: ['gotoPosition', 'change', 'contextmenu'],
  setup (props, { emit }) {
    const treeData = ref<SymbolNode[]>(props.nodes);

    watch(() => props.nodes, (newVal) => {
      treeData.value = newVal
    })

    let handleChange: HandleChangeType = () => { };

    let handleContextmenu: handleContextmenu = () => { }

    if (!props.isChild) {
      handleChange = (node: SymbolNode, nodes: SymbolNode[]) => {
        emit('change', node, nodes);
      };
      provide<HandleChangeType>('handleChange', handleChange);
      handleContextmenu = (event, node) => {
        emit('contextmenu', event, node);
      };
      provide<handleContextmenu>('handleContextmenu', handleContextmenu);
    } else {
      const _handleChange = inject<HandleChangeType>('handleChange')
      if (_handleChange) {
        handleChange = _handleChange;
      }
      const _handleContextmenu = inject<handleContextmenu>('handleContextmenu')
      if (_handleContextmenu) {
        handleContextmenu = _handleContextmenu;
      }
    }

    const toggleNode = (node: SymbolNode) => {
      node.expanded = !node.expanded;
      handleChange(node, treeData.value);
    };

    const gotoPosition = (node: SymbolNode) => {
      emit('gotoPosition', node);
    };

    const getBgColorClassName = (path: string) => {
      if (props.activePath === path) {
        return props.focusing ? 'focus-active' : 'blur-active'
      }
      return ''
    }

    return {
      treeData,
      toggleNode,
      gotoPosition,
      getBgColorClassName,
      handleContextmenu
    };
  }
});
</script>

<style lang="scss">
.active {
  :hover {
    background-color: var(--vscode-list-inactiveSelectionBackground);
  }

  width: 100%;
}

.tree-node {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px 0;
  cursor: pointer;
}

.symbol-item {
  display: flex;
  align-items: center;
}

.symbol-name {
  margin-left: 5px;
}

.symbol-item.expanded {
  transform: rotate(90deg);
}

.focus-active {
  box-sizing: border-box;
  background-color: var(--vscode-list-activeSelectionBackground);
  border: 1px solid var(--vscode-list-focusOutline);
}

.blur-active {
  background-color: var(--vscode-list-inactiveSelectionBackground);
}
</style>