import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import { useEffect, useRef } from 'react';

import ExampleTheme from './ExampleTheme.js';

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  namespace: 'Toggle Editable Example',
  nodes: [],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

export default function Editor({ isEditable }: { isEditable: boolean; }) {
  const editorRef = useRef<LexicalEditor | null>(null);

  useEffect(() => {
    editorRef.current?.setEditable(isEditable);
    console.log('isEditable', isEditable, 'editor', editorRef.current);
  }, [isEditable]);

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editable: isEditable,
        editorState: (editor) => {
          editorRef.current = editor;
          editor.registerEditableListener((currentIsEditable) => {
            console.log(
              'initialConfig editable listener isEditable ',
              currentIsEditable,
            );
          });
        },
      }}
    >
      <div className="editor-container">
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
