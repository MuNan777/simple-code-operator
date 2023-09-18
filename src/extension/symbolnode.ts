import { DocumentSymbol, Position, SymbolKind } from "vscode";

type SymbolKindStr =
  'File' | 'Module' | 'Namespace' | 'Package' | 'Class' | 'Method' |
  'Property' | 'Field' | 'Constructor' | 'Enum' | 'Interface' |
  'Function' | 'Variable' | 'Constant' | 'String' | 'Number' |
  'Boolean' | 'Array' | 'Object' | 'Key' | 'Null' | 'EnumMember' |
  'Struct' | 'Event' | 'Operator' | 'TypeParameter';

export class SymbolNode {

  /* The name of this symbol */
  name: string;
  /* The kind of this symbol. */
  kind: SymbolKindStr;
  /* More detail for this symbol, e.g. the signature of a function.*/
  detail: string;
  /* node is expanded? */
  expanded: boolean;
  /* node is inView? */
  inView: boolean;
  /* node is focus? */
  focus: boolean;
  /** The range enclosing this symbol not including leading/trailing whitespace but everything else, e.g. comments and code. */
  range: { start: Position, end: Position };
  /* children of this node */
  children: SymbolNode[];
  /* className of this node */
  className: string[];
  /* type of this node */
  path: string;

  constructor(docSymbol: DocumentSymbol) {
    this.kind = SymbolKind[docSymbol.kind] as SymbolKindStr;
    this.name = docSymbol.name;
    this.detail = docSymbol.detail;
    this.expanded = true;
    this.inView = false;
    this.focus = false;
    this.path = 'root/'
    this.range = {
      start: new Position(docSymbol.range.start.line, docSymbol.range.start.character),
      end: new Position(docSymbol.range.end.line, docSymbol.range.end.character),
    };
    this.children = [];
    this.className = ['simple-code-operator'];
  }
}