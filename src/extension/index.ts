import { ExtensionContext, TextDocumentChangeEvent, commands, window, workspace } from 'vscode';
import { CodeView } from './codeview';
import { debounce } from '../common';
import { getDisposableList } from './commands';

export function activate (context: ExtensionContext) {

  const codeView = new CodeView(context);

  window.onDidChangeActiveTextEditor(event => {
    const document = event?.document || window.activeTextEditor?.document;
    if (document) codeView.update(document);
  });

  window.onDidChangeTextEditorSelection(() => {
    if (window.activeTextEditor) {
      codeView.postMessage({
        type: 'selected',
        value: {
          selection: window.activeTextEditor.selection
        }
      });
    }
  })

  workspace.onDidChangeTextDocument(debounce((event: TextDocumentChangeEvent) => {
    const document = event.document;
    codeView.update(document);
  }, 300));


  context.subscriptions.push(
    window.registerWebviewViewProvider('simple-code-operator', codeView),
    ...getDisposableList(codeView).map(command => commands.registerCommand(command.name, command.fn.bind(null))));
}

// This method is called when your extension is deactivated
export function deactivate () { }
