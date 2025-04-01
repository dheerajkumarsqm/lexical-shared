import { EditorConfig, LexicalNode, TextNode } from "lexical";

export class LockedTextNode extends TextNode {
  static getType() {
    return "locked-text";
  }

  static clone(node: TextNode): TextNode {
    return new LockedTextNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig) {
    const element = super.createDOM(config);
    element.setAttribute("contenteditable", "false");
    element.style.userSelect = "none";
    return element;
  }

  updateDOM() {
    return false;
  }

  isEditable() {
    return false; // Blocks direct editing
  }

  setFormat() {
    return this; // Blocks any formatting from the toolbar
  }

  format() {
    return this; // Blocks toolbar styling commands
  }

  canInsertTextBefore() {
    return false; // Prevents inserting text before
  }

  canInsertTextAfter() {
    return false; // Prevents inserting text after
  }

  canBeEmpty() {
    return false; // Prevents deletion by ensuring non-emptiness
  }

  remove() {
    return false; // Blocks deletion of the node
  }
}

export function $createLockedTextNode(text: string) {
  return new LockedTextNode(text);
}
