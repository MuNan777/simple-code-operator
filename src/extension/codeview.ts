import {
  CancellationToken,
  ExtensionContext,
  TextDocument,
  Uri,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  TextEditorRevealType,
  TextEditorDecorationType,
  commands,
  Position,
} from 'vscode';
import { CodeTree } from './codetree';
import { Msg, getCommentSE, getDeclarationArea } from '../common';
import { config } from './config';
import { ExpandStatus, setExpandStatus } from './commands';

export class CodeView implements WebviewViewProvider {

  private extensionUri: Uri;

  private view: WebviewView | undefined;

  constructor(context: ExtensionContext) {
    this.extensionUri = context.extensionUri;
  }

  resolveWebviewView (webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
    this.view = webviewView;

    this.view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.extensionUri,
      ],
    };

    let decorationType: TextEditorDecorationType | null;

    this.render();
    const timer = setTimeout(() => {
      clearTimeout(timer);
      this.build();
    }, 300)
    this.view.webview.onDidReceiveMessage((str: string) => {
      const msg = JSON.parse(str) as Msg;
      switch (msg.type) {
        case 'show':
          if (decorationType) {
            decorationType.dispose();
          }
          if (msg.value) {
            decorationType = window.createTextEditorDecorationType({
              backgroundColor: config.selectedAreaColor(),
              isWholeLine: true
            });
            window.activeTextEditor?.setDecorations(decorationType, [msg.value.range]);
            window.activeTextEditor?.revealRange(msg.value.range, TextEditorRevealType.InCenter);
          }
          break;
        case 'refresh':
          this.build()
          break;
        case 'copy':
          if (window.activeTextEditor) {
            const copyRange = getDeclarationArea(window.activeTextEditor.document, msg.value.range)
            const value = window.activeTextEditor.document.getText(copyRange)
            this.postMessage({
              type: 'copy-value',
              value: value
            });
          }
          break;
        case 'remove':
          if (window.activeTextEditor) {
            const deleteRange = getDeclarationArea(window.activeTextEditor.document, msg.value.range)
            window.activeTextEditor.edit(editBuilder => {
              editBuilder.delete(deleteRange);
              if (decorationType) {
                decorationType.dispose();
              }
              this.postMessage({
                type: 'delete-down'
              });
            });
          }
          break;
        case 'comment':
          if (window.activeTextEditor) {
            const document = window.activeTextEditor.document
            const ext = document.fileName.split('.').pop();
            const commentRange = getDeclarationArea(document, msg.value.range)
            window.activeTextEditor.edit(editBuilder => {
              const comment = getCommentSE(ext, document.getText(commentRange));
              if (comment) {
                editBuilder.insert(commentRange.start, comment.start);
                editBuilder.insert(commentRange.end, comment.end);
                this.postMessage({
                  type: 'comment-down'
                });
              }
            });
          }
          break;
        case 'get-file-path':
          if (window.activeTextEditor) {
            this.postMessage({
              type: 'set-file-path',
              value: window.activeTextEditor.document.uri.path
            });
          }
          break;
        case 'clean-decoration':
          if (decorationType) {
            decorationType.dispose();
          }
          break;
        case 'set-active-path':
          if (window.activeTextEditor) {
            this.postMessage({
              type: 'selected',
              value: {
                selection: window.activeTextEditor.selection
              }
            });
          }
          break;
        case 'set-expand-status':
          setExpandStatus(parseInt(msg.value) === 0 ? ExpandStatus.collapse : ExpandStatus.expand);
          break;
        case 'esc':
          commands.executeCommand(
            'editor.action.goToLocations',
            window.activeTextEditor?.document.uri,
            new Position(
              msg.value.range.start.line,
              msg.value.range.start.character,
            ), [], 'goto', ''
          );
      }
    });
  }

  render () {
    if (!this.view) { return; }
    const getAssetUri = (path: string) => {
      return this.view?.webview.asWebviewUri(Uri.joinPath(this.extensionUri, ...path.split('/')));
    };
    this.view.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Simple Code View</title>
        <link href="${getAssetUri('node_modules/@vscode/codicons/dist/codicon.css')}" rel="stylesheet" />
        <link href="${getAssetUri('out/webview/index.css')}" rel="stylesheet" />
        <style id="color-style"></style>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="${getAssetUri('out/webview/index.js')}"></script>
      </body>
    </html>
    `;
  }

  build () {
    this.update(window.activeTextEditor?.document || window.visibleTextEditors[0].document);
  }

  update (textDocument: TextDocument) {
    const codeTree = new CodeTree(textDocument);
    codeTree.updateSymbols().then(() => {
      this.postMessage({
        type: 'update',
        value: codeTree.getNodes(),
      });
    });
  }

  postMessage (message: Msg) {
    this.view?.webview.postMessage(message);
  }
}
