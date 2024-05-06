// STILL TO TEST
// [ ] onChange handler
// [ ] remix
// [ ] CSS transform scale?
import { lazy, Suspense, useState } from 'react';

const Editor = lazy(() => import('./Editor.jsx'));

const EDITORS = Array(4).fill(null);

export default function App() {
  const [activeEditorIndex, setActiveEditorIndex] =
    useState(0);

  return EDITORS.map((_, index) => {
    const isEditable = activeEditorIndex === index;
    return (
      <section key={`editor-${index}`}>
        <p>
          {isEditable
            ? 'Editing Enabled'
            : 'Editing Disabled (Click editor to enable)'}
        </p>
        <div onClick={() => setActiveEditorIndex(index)}>
          <Suspense fallback={<Loader />}>
            <Editor isEditable={isEditable} />
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
