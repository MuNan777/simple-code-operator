import { DocumentSymbol, TextDocument, commands } from "vscode";
import { SymbolNode } from "./symbolnode";
import { delay, generateNodeTree } from "../common";

export class CodeTree {

  private textDocument: TextDocument;

  private MAX_ATTEMPTS = 5;
  private attempts = 0;

  private nodes: SymbolNode[] = [];

  constructor(textDocument: TextDocument) {
    this.textDocument = textDocument;
  }

  getNodes () {
    return this.nodes;
  }

  async updateSymbols () {
    await delay(50)
    let docSymbols: DocumentSymbol[] = []
    try {
      docSymbols = await commands.executeCommand<DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        this.textDocument.uri,
      );
    } catch (e: any) {
      console.log(e.message)
    }
    if (docSymbols) {
      this.nodes = generateNodeTree(docSymbols);
      // Reset attempts
      this.attempts = 0;
    } else if (this.attempts < this.MAX_ATTEMPTS) {
      this.attempts++;
      await delay(300);
      await this.updateSymbols()
      console.log(`simple-code-operator: Failed to get symbols of ${this.textDocument.uri.toString()}. Attempt ${this.attempts} / ${this.MAX_ATTEMPTS}.`);
    } else {
      this.nodes = generateNodeTree([]);
      console.error(`simple-code-operator: Failed to get symbols of ${this.textDocument.uri.toString()}.`)
    }
  }
}