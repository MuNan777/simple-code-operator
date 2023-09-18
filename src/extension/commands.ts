import { commands } from "vscode"
import { CodeView } from "./codeview";

export enum ExpandStatus {
  collapse,
  expand,
}

export interface Command {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => any;
}

export const setExpandStatus = (status: ExpandStatus) => {
  commands.executeCommand('setContext', 'simple-code-operator.expand-all', status);
}

export const getDisposableList = (codeView: CodeView): Command[] => {

  const commandList: Command[] = []

  commands.executeCommand('setContext', 'simple-code-operator.expand-all', ExpandStatus.expand);

  commandList.push({
    name: 'simple-code-operator.focusCodeView', fn: () => {
      codeView.postMessage({
        type: 'focus'
      });
    }
  });

  commandList.push({
    name: 'simple-code-operator.expandAllNodes',
    fn: () => {
      codeView.postMessage({
        type: 'set-all-expanded',
        value: true,
      });
      setExpandStatus(ExpandStatus.expand)
    }
  });

  commandList.push({
    name: 'simple-code-operator.collapseAllNodes',
    fn: () => {
      codeView.postMessage({
        type: 'set-all-expanded',
        value: false,
      });
      setExpandStatus(ExpandStatus.collapse)
    }
  });

  return commandList
}