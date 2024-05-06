import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $selectAll, ParagraphNode } from 'lexical';
import type { EditorState, LexicalEditor } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

import ExampleTheme from './ExampleTheme.js';
import { INLINE_TRANSFORMERS, TRANSFORMERS } from './MarkdownTransformers.js';
import { EmojiNode } from './nodes/EmojiNode.jsx';
import { InlineParagraphNode } from './nodes/InlineParagraphNode.jsx';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin.jsx';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin.jsx';
import InlineEditorPlugin from './plugins/InlineEditorPlugin.jsx';
// import TreeViewPlugin from './plugins/TreeViewPlugin.js';
import { validateURL } from './utils/urls.js';
import useDebounce from './utils/useDebounce.js';

const editorConfig = {
  namespace: 'Toggle Editable Example',
  nodes: [
    EmojiNode,
    HorizontalRuleNode,
    CodeNode,
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
  ],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

const inlineEditorConfig = {
  namespace: 'Toggle Editable Example › Inline',
  nodes: [
    EmojiNode,
    LinkNode,
    InlineParagraphNode,
    {
      replace: ParagraphNode,
      with: (_node: ParagraphNode) => {
        return new InlineParagraphNode();
      },
    },
  ],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

type Props = {
  isEditable: boolean;
  isInline?: boolean;
  onChange?: (editorState: EditorState) => void;
  text: string;
};

export default function Editor({
  isEditable,
  isInline,
  onChange,
  text,
}: Props) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const [floatingAnchorElement, setFloatingAnchorElement] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const debouncedEditorState = useDebounce(editorState, 1000);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    if (debouncedEditorState && onChangeRef.current) {
      onChangeRef.current?.(debouncedEditorState);
    }
  }, [debouncedEditorState]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!isEditable) {
      editor.setEditable(false);
      return;
    }

    editor.setEditable(isEditable);
    editor.update(() => {
      $selectAll();
    });
    setTimeout(() => {
      editor.focus();
    }, 1); // next tick
  }, [isEditable]);

  const handleChange = useCallback((_editorState: EditorState) => {
    setEditorState(_editorState);
  }, []);

  return (
    <LexicalComposer
      initialConfig={{
        ...(isInline ? inlineEditorConfig : editorConfig),
        editable: isEditable,
        editorState: (editor) => {
          editorRef.current = editor;
          $convertFromMarkdownString(text, TRANSFORMERS);
        },
      }}
    >
      <div className="editor-container" ref={setFloatingAnchorElement}>
        {floatingAnchorElement ? (
          <>
            <FloatingLinkEditorPlugin
              anchorElement={floatingAnchorElement}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingTextFormatToolbarPlugin
              anchorElement={floatingAnchorElement}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        ) : null}
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin validateUrl={validateURL} />
          <AutoFocusPlugin />
          <MarkdownShortcutPlugin
            transformers={isInline ? INLINE_TRANSFORMERS : TRANSFORMERS}
          />
          <OnChangePlugin onChange={handleChange} />
          {isInline ? (
            <InlineEditorPlugin />
          ) : (
            <>
              <TabIndentationPlugin />
              <ListPlugin />
            </>
          )}
          {/* <TreeViewPlugin /> */}
        </div>
      </div>
    </LexicalComposer>
  );
}
