import { $applyNodeReplacement, ParagraphNode } from 'lexical';
import type { EditorConfig, SerializedParagraphNode } from 'lexical';

export class InlineParagraphNode extends ParagraphNode {
  static getType() {
    return 'inline-paragraph';
  }

  static clone(node: InlineParagraphNode): InlineParagraphNode {
    return new InlineParagraphNode(node.__key);
  }

  static importJSON(
    serializedNode: SerializedParagraphNode
  ): InlineParagraphNode {
    const node = $createInlinePragraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    node.setTextFormat(serializedNode.textFormat);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: InlineParagraphNode.getType(),
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = super.createDOM(config).className;
    return dom;
  }
}

function $createInlinePragraphNode(): InlineParagraphNode {
  return $applyNodeReplacement(new InlineParagraphNode());
}
