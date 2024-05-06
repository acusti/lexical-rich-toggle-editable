// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/FloatingLinkEditorPlugin/index.tsx
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, JSX, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import getSelectedNode from '../utils/getSelectedNode.js';
import setFloatingElementPositionForLinkEditor from '../utils/setFloatingElementPositionForLinkEditor.js';
import { sanitizeURL } from '../utils/urls.js';

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElement,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElement: HTMLElement;
  editor: LexicalEditor;
  isLink: boolean;
  isLinkEditMode: boolean;
  setIsLink: Dispatch<boolean>;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkURL, setLinkURL] = useState('');
  const [editedLinkURL, setEditedLinkURL] = useState('https://');
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
    null
  );

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        setLinkURL(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkURL(node.getURL());
      } else {
        setLinkURL('');
      }
      if (isLinkEditMode) {
        setEditedLinkURL(linkURL);
      }
    }
    const editorElement = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElement === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElementPositionForLinkEditor(
          domRect,
          editorElement,
          anchorElement
        );
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElementPositionForLinkEditor(
          null,
          editorElement,
          anchorElement
        );
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkURL('');
    }

    return true;
  }, [anchorElement, editor, setIsLinkEditMode, isLinkEditMode, linkURL]);

  useEffect(() => {
    const scrollerElem = anchorElement.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElement.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkURL !== '') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeURL(editedLinkURL));
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title,
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkURL('https://');
      setIsLinkEditMode(false);
    }
  };

  return (
    <div className="link-editor" ref={editorRef}>
      {!isLink ? null : isLinkEditMode ? (
        <>
          <input
            className="link-input"
            onChange={(event) => {
              setEditedLinkURL(event.target.value);
            }}
            onKeyDown={(event) => {
              monitorInputInteraction(event);
            }}
            ref={inputRef}
            value={editedLinkURL}
          />
          <div>
            <div
              className="link-cancel"
              onClick={() => {
                setIsLinkEditMode(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              role="button"
              tabIndex={0}
            />

            <div
              className="link-confirm"
              onClick={handleLinkSubmission}
              onMouseDown={(event) => event.preventDefault()}
              role="button"
              tabIndex={0}
            />
          </div>
        </>
      ) : (
        <div className="link-view">
          <a
            href={sanitizeURL(linkURL)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {linkURL}
          </a>
          <div
            className="link-edit"
            onClick={() => {
              setEditedLinkURL(linkURL);
              setIsLinkEditMode(true);
            }}
            onMouseDown={(event) => event.preventDefault()}
            role="button"
            tabIndex={0}
          />
          <div
            className="link-trash"
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }}
            onMouseDown={(event) => event.preventDefault()}
            role="button"
            tabIndex={0}
          />
        </div>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode
        );

        if (!focusLinkNode && !focusAutoLinkNode) {
          setIsLink(false);
          return;
        }

        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode && !autoLinkNode.is(focusAutoLinkNode))
            );
          });

        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), '_blank');
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return createPortal(
    <FloatingLinkEditor
      anchorElement={anchorElement}
      editor={activeEditor}
      isLink={isLink}
      isLinkEditMode={isLinkEditMode}
      setIsLink={setIsLink}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElement
  );
}

export default function FloatingLinkEditorPlugin({
  anchorElement = document.body,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElement?: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(
    editor,
    anchorElement,
    isLinkEditMode,
    setIsLinkEditMode
  );
}
