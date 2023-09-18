import { workspace } from 'vscode';

function getConfig (key: string, section = 'simple-code-operator') {
  return workspace.getConfiguration(section)?.get(key);
}

export const config = {
  /** Hide specified items. */
  hiddenItem: () => getConfig('hiddenItem') as string[],
  codeSeparator: () => getConfig('codeSeparator') as string[],
  selectedAreaColor: () => getConfig('selectedAreaColor') as string,
};