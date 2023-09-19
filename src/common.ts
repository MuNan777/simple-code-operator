import { TextDocument, type DocumentSymbol, Range, Position } from "vscode";
import { SymbolNode } from "./extension/symbolnode";
import { config } from "./extension/config";

export type MsgType = 'update' | 'refresh' | 'remove' | 'show' | 'selected' | 'focus' | 'esc' | 'copy' | 'comment' |
  'copy-value' | 'get-file-path' | 'set-file-path' | 'clean-decoration' | 'set-active-path' | 'delete-down' | 'comment-down' | 'set-all-expanded' | 'set-expand-status'
export interface Msg {
  type: MsgType;
  value?: any;
}

export const generateNodeTree = (docSymbols: DocumentSymbol[]) => {
  const root: SymbolNode[] = [];
  const hiddenItem = config.hiddenItem();

  const recursive = (docSymbols: DocumentSymbol[], parent: SymbolNode | SymbolNode[]) => {
    docSymbols.sort((a, b) => a.range.start.line - b.range.start.line);
    docSymbols.forEach((docSymbol) => {
      const node = new SymbolNode(docSymbol);
      if (hiddenItem.includes(node.kind.toLowerCase())) {
        return;
      }
      if (Array.isArray(parent)) {
        parent.push(node);
        node.path += `${node.name}-${node.range.start.line}-${node.range.start.character}`
        node.className = node.className.concat(`--${node.kind}-${node.name}`);
      }
      else {
        node.path = `${parent.path}/${node.name}-${node.range.start.line}-${node.range.start.character}`
        node.className = parent.className.concat(`--${node.kind}-${node.name}`);
        parent.children.push(node);
      }
      if (docSymbol.children.length > 0) {
        recursive(docSymbol.children, node);
      }
    });
  };
  recursive(docSymbols, root);
  return root;
};

export const debounce = (func: Function, delay: number) => {
  let timer: any = null;

  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export const delay = (milliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const getDeclarationArea = (document: TextDocument, range: Range) => {
  const startLine = range.start.line;
  const startCharacter = range.start.character;
  const endLine = range.end.line;
  const endCharacter = range.end.character;

  const startLineText = document.lineAt(startLine).text;
  const endLineText = document.lineAt(endLine).text;

  const codeSeparator = config.codeSeparator();

  let startIndex = startCharacter;
  let endIndex = endCharacter;
  if (startCharacter > 0) {
    while (startIndex > 0) {
      if (codeSeparator.indexOf(startLineText[startIndex]) === -1) {
        startIndex--;
      } else {
        break;
      }
    }
  }

  if (endCharacter < endLineText.length) {
    while (endIndex < endLineText.length) {
      if (codeSeparator.indexOf(endLineText[endIndex]) === -1) {
        endIndex++;
      } else {
        break;
      }
    }
  }

  const declarationRange = new Range(
    new Position(startLine, startIndex),
    new Position(endLine, endIndex)
  );

  return declarationRange;
}

export const getCommentSE = (ext: string | undefined, text: string | undefined) => {
  if (ext) {
    if (CommentType[ext]) {
      return CommentType[ext]
    }
    if (ext === 'vue') {
      if (text?.match(/<[\s\S]*\>[\s\S]*<\/[\s\S]*\>/)) {
        return CommentType['html']
      }
      return CommentType['js']
    }
  }
}

export const CommentType: { [key: string]: { start: string, end: string } } = {
  "js": {
    start: "/*",
    end: "*/"
  },
  "ts": {
    start: "/*",
    end: "*/"
  },
  "py": {
    start: "'''",
    end: "'''"
  },
  "java": {
    start: "/*",
    end: "*/"
  },
  "cpp": {
    start: "/*",
    end: "*/"
  },
  "html": {
    start: "<!--",
    end: "-->"
  },
  "css": {
    start: "/*",
    end: "*/"
  },
  "php": {
    start: "/*",
    end: "*/"
  },
  "ruby": {
    start: "=begin",
    end: "=end"
  },
  "swift": {
    start: "/*",
    end: "*/"
  },
  "sql": {
    start: "/*",
    end: "*/"
  },
  "go": {
    start: "/*",
    end: "*/"
  },
  "c": {
    start: "/*",
    end: "*/"
  },
  "h": {
    start: "/*",
    end: "*/"
  },
  "rb": {
    start: "=begin",
    end: "=end"
  },
  "json": {
    start: "/*",
    end: "*/"
  },
  "xml": {
    start: "<!--",
    end: "-->"
  },
  "sh": {
    start: ": '",
    end: "'"
  },
  "md": {
    start: "<!--",
    end: "-->"
  }
}