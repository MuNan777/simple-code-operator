import { MsgType } from "../../common";
import { SymbolNode } from "../../extension/symbolnode";
import { Range } from 'vscode'

export type actionNodeHandlerType = (type: MsgType, node: SymbolNode | null) => void

export const setOrderList = (nodes: SymbolNode[], orderList: string[]): void => {
  for (const node of nodes) {
    if (!orderList.includes(node.path)) {
      orderList.push(node.path)
    }
    if (node.children && node.expanded) {
      setOrderList(node.children, orderList);
    }
  }
}

export const findNodeByPathBfs = (nodes: SymbolNode[], path: string): SymbolNode | null => {
  const queue: SymbolNode[] = [];
  queue.push(...nodes);

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        for (const child of node?.children) {
          queue.push(child);
        }
      }
    }
  }
  return null;
}

export const findActionPath = (nodes: SymbolNode[], range: Range): { path: string, parents: SymbolNode[] } | null => {
  const recursive = (nodes: SymbolNode[], range: Range, parents: SymbolNode[]): { path: string, parents: SymbolNode[] } | null => {
    for (const node of nodes) {
      const target = range.start.line
      const start = node.range.start.line
      const end = node.range.end.line
      if (target === start || target === end) {
        return { path: node.path, parents: parents }
      } else {
        if (start < target && target < end) {
          if (node.children.length === 0) {
            return { path: node.path, parents: parents }
          } else {
            for (const item of node.children) {
              const s = item.range.start.line
              const e = item.range.end.line
              if (s <= target && target <= e) {
                const newParents = [...parents, node]
                return recursive([item], range, newParents)
              }
            }
            return { path: node.path, parents: parents }
          }
        }
      }
    }
    return null
  }

  return recursive(nodes, range, [])
}

export const setAllExpanded = (nodes: SymbolNode[], expanded: boolean) => {
  for (const node of nodes) {
    node.expanded = expanded
    if (node.children) {
      setAllExpanded(node.children, expanded)
    }
  }
}