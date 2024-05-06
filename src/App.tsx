import { lazy, Suspense, useCallback, useState } from 'react';

const Editor = lazy(() => import('./Editor.jsx'));

export default function App() {
  // NOTE Defaulting this to true makes the editor work,
  // though then contenteditable="true" will never become "false".
  // More specifically, the ContentEditable registered editableListener never fires:
  // https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/LexicalContentEditable.tsx#L71
  const [isEditable, setIsEditable] = useState(false);
  const enableEditable = useCallback(() => setIsEditable(true), []);
  const disableEditable = useCallback(() => setIsEditable(false), []);

  return (
    <section>
      <p>
        <button disabled={!isEditable} onClick={disableEditable}>
          {isEditable
            ? 'Disable Editing'
            : 'Editing Disabled (Click editor to enable)'}
        </button>
      </p>
      <div onClick={enableEditable}>
        <Suspense fallback={<Loader />}>
          <Editor isEditable={isEditable} />
        </Suspense>
      </div>
    </section>
  );
}

function Loader() {
  return (
    <div className="editor-container">
      <div className="editor-inner">
        <div className="editor-input" style={{ textAlign: 'center' }}>
          Loading…
        </div>
      </div>
    </div>
  );
}
