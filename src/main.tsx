/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { ActiveEditorProvider } from './utils/ActiveEditorContext.jsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="App">
      <h1>Lexical React Rich Text Toggle Editable Example</h1>
      <ActiveEditorProvider>
        <App />
      </ActiveEditorProvider>
    </div>
  </React.StrictMode>
);
