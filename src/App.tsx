// STILL TO TEST
// [ ] onChange handler
// [ ] remix
// [ ] CSS transform scale?
import { lazy, Suspense, useContext } from 'react';

import { ActiveEditorContext } from './utils/ActiveEditorContext.jsx';
import EDITOR_CONTENTS from './constants/editor-contents.js';

const Editor = lazy(() => import('./Editor.jsx'));

export default function App() {
  const { activeEditorIndex, setActiveEditorIndex } =
    useContext(ActiveEditorContext);

  return EDITOR_CONTENTS.map((text, index) => {
    const isEditable = activeEditorIndex === index;
    const isInline = index % 2 === 1;
    return (
      <section
        className={isInline ? 'inline-editor' : ''}
        key={`editor-${index}`}
      >
        <p>
          {isEditable
            ? 'Editing Enabled'
            : 'Editing Disabled (Click editor to enable)'}
        </p>
        <div onClick={() => setActiveEditorIndex(index)}>
          <Suspense fallback={<Loader />}>
            <Editor isEditable={isEditable} isInline={isInline} text={text} />
          </Suspense>
        </div>
      </section>
    );
  });
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
