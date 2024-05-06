import { createContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export type ContextType = {
  activeEditorIndex: number;
  setActiveEditorIndex: Dispatch<SetStateAction<number>>;
};

const CONTEXT_STUB: ContextType = {
  activeEditorIndex: -1,
  setActiveEditorIndex: noop,
};

export const ActiveEditorContext = createContext<ContextType>(CONTEXT_STUB);

export const ActiveEditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeEditorIndex, setActiveEditorIndex] = useState(
    CONTEXT_STUB.activeEditorIndex
  );

  return (
    <ActiveEditorContext.Provider
      value={{
        activeEditorIndex,
        setActiveEditorIndex,
      }}
    >
      {children}
    </ActiveEditorContext.Provider>
  );
};
