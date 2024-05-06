/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
 import { $isCodeHighlightNode } from '@lexical/code';
 import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
 import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
 import { mergeRegister } from '@lexical/utils';
 import {
     $getSelection,
     $isParagraphNode,
     $isRangeSelection,
     $isTextNode,
     COMMAND_PRIORITY_LOW,
     FORMAT_TEXT_COMMAND,
     LexicalEditor,
     SELECTION_CHANGE_COMMAND,
 } from 'lexical';
 import { useCallback, useEffect, useRef, useState } from 'react';
 import type { Dispatch, JSX } from 'react';
 import { createPortal } from 'react-dom';
 
 import getDOMRangeRect from '../utils/getDOMRangeRect.js';
 import getSelectedNode from '../utils/getSelectedNode.js';
 import setFloatingElementPosition from '../utils/setFloatingElementPosition.js';
 
 function TextFormatFloatingToolbar({
     anchorElement,
     editor,
     isLink,
     isBold,
     isItalic,
     isUnderline,
     isCode,
     isStrikethrough,
     isSubscript,
     isSuperscript,
     setIsLinkEditMode,
 }: {
     anchorElement: HTMLElement;
     editor: LexicalEditor;
     isBold: boolean;
     isCode: boolean;
     isItalic: boolean;
     isLink: boolean;
     isStrikethrough: boolean;
     isSubscript: boolean;
     isSuperscript: boolean;
     isUnderline: boolean;
     setIsLinkEditMode: Dispatch<boolean>;
 }): JSX.Element {
     const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);
 
     const insertLink = useCallback(() => {
         if (!isLink) {
             setIsLinkEditMode(true);
             editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
         } else {
             setIsLinkEditMode(false);
             editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
         }
     }, [editor, isLink, setIsLinkEditMode]);
 
     function mouseMoveListener(e: MouseEvent) {
         if (
             popupCharStylesEditorRef?.current &&
             (e.buttons === 1 || e.buttons === 3)
         ) {
             if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
                 const x = e.clientX;
                 const y = e.clientY;
                 const elementUnderMouse = document.elementFromPoint(x, y);
 
                 if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
                     // Mouse is not over the target element => not a normal click, but probably a drag
                     popupCharStylesEditorRef.current.style.pointerEvents = 'none';
                 }
             }
         }
     }
     function mouseUpListener(_event: MouseEvent) {
         if (popupCharStylesEditorRef?.current) {
             if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
                 popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
             }
         }
     }
 
     useEffect(() => {
         if (popupCharStylesEditorRef?.current) {
             document.addEventListener('mousemove', mouseMoveListener);
             document.addEventListener('mouseup', mouseUpListener);
 
             return () => {
                 document.removeEventListener('mousemove', mouseMoveListener);
                 document.removeEventListener('mouseup', mouseUpListener);
             };
         }
     }, [popupCharStylesEditorRef]);
 
     const updateTextFormatFloatingToolbar = useCallback(() => {
         const selection = $getSelection();
 
         const popupCharStylesEditorElement = popupCharStylesEditorRef.current;
         const nativeSelection = window.getSelection();
 
         if (popupCharStylesEditorElement == null) return;
 
         const rootElement = editor.getRootElement();
         if (
             selection !== null &&
             nativeSelection !== null &&
             !nativeSelection.isCollapsed &&
             rootElement !== null &&
             rootElement.contains(nativeSelection.anchorNode)
         ) {
             const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
 
             setFloatingElementPosition(
                 rangeRect,
                 popupCharStylesEditorElement,
                 anchorElement,
                 isLink,
             );
         }
     }, [editor, anchorElement, isLink]);
 
     useEffect(() => {
         const scrollerElem = anchorElement.parentElement;
 
         const update = () => {
             editor.getEditorState().read(() => {
                 updateTextFormatFloatingToolbar();
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
     }, [editor, updateTextFormatFloatingToolbar, anchorElement]);
 
     useEffect(() => {
         editor.getEditorState().read(() => {
             updateTextFormatFloatingToolbar();
         });
         return mergeRegister(
             editor.registerUpdateListener(({ editorState }) => {
                 editorState.read(() => {
                     updateTextFormatFloatingToolbar();
                 });
             }),
 
             editor.registerCommand(
                 SELECTION_CHANGE_COMMAND,
                 () => {
                     updateTextFormatFloatingToolbar();
                     return false;
                 },
                 COMMAND_PRIORITY_LOW,
             ),
         );
     }, [editor, updateTextFormatFloatingToolbar]);
 
     return (
         <div className="floating-text-format-popup" ref={popupCharStylesEditorRef}>
             {editor.isEditable() ? (
                 <>
                     <button
                         aria-label="Format text as bold"
                         className={'popup-item spaced ' + (isBold ? 'active' : '')}
                         onClick={() => {
                             editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                         }}
                         type="button"
                     >
                         <i className="format bold" />
                     </button>
                     <button
                         aria-label="Format text as italics"
                         className={
                             'popup-item spaced ' + (isItalic ? 'active' : '')
                         }
                         onClick={() => {
                             editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                         }}
                         type="button"
                     >
                         <i className="format italic" />
                     </button>
                     <button
                         aria-label="Format text to underlined"
                         className={
                             'popup-item spaced ' + (isUnderline ? 'active' : '')
                         }
                         onClick={() => {
                             editor.dispatchCommand(
                                 FORMAT_TEXT_COMMAND,
                                 'underline',
                             );
                         }}
                         type="button"
                     >
                         <i className="format underline" />
                     </button>
                     <button
                         aria-label="Format text with a strikethrough"
                         className={
                             'popup-item spaced ' + (isStrikethrough ? 'active' : '')
                         }
                         onClick={() => {
                             editor.dispatchCommand(
                                 FORMAT_TEXT_COMMAND,
                                 'strikethrough',
                             );
                         }}
                         type="button"
                     >
                         <i className="format strikethrough" />
                     </button>
                     <button
                         aria-label="Format Subscript"
                         className={
                             'popup-item spaced ' + (isSubscript ? 'active' : '')
                         }
                         onClick={() => {
                             editor.dispatchCommand(
                                 FORMAT_TEXT_COMMAND,
                                 'subscript',
                             );
                         }}
                         title="Subscript"
                         type="button"
                     >
                         <i className="format subscript" />
                     </button>
                     <button
                         aria-label="Format Superscript"
                         className={
                             'popup-item spaced ' + (isSuperscript ? 'active' : '')
                         }
                         onClick={() => {
                             editor.dispatchCommand(
                                 FORMAT_TEXT_COMMAND,
                                 'superscript',
                             );
                         }}
                         title="Superscript"
                         type="button"
                     >
                         <i className="format superscript" />
                     </button>
                     <button
                         aria-label="Insert code block"
                         className={'popup-item spaced ' + (isCode ? 'active' : '')}
                         onClick={() => {
                             editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                         }}
                         type="button"
                     >
                         <i className="format code" />
                     </button>
                     <button
                         aria-label="Insert link"
                         className={'popup-item spaced ' + (isLink ? 'active' : '')}
                         onClick={insertLink}
                         type="button"
                     >
                         <i className="format link" />
                     </button>
                 </>
             ) : null}
         </div>
     );
 }
 
 function useFloatingTextFormatToolbar(
     editor: LexicalEditor,
     anchorElement: HTMLElement,
     setIsLinkEditMode: Dispatch<boolean>,
 ): JSX.Element | null {
     const [isText, setIsText] = useState(false);
     const [isLink, setIsLink] = useState(false);
     const [isBold, setIsBold] = useState(false);
     const [isItalic, setIsItalic] = useState(false);
     const [isUnderline, setIsUnderline] = useState(false);
     const [isStrikethrough, setIsStrikethrough] = useState(false);
     const [isSubscript, setIsSubscript] = useState(false);
     const [isSuperscript, setIsSuperscript] = useState(false);
     const [isCode, setIsCode] = useState(false);
 
     const updatePopup = useCallback(() => {
         editor.getEditorState().read(() => {
             // Should not to pop up the floating toolbar when using IME input
             if (editor.isComposing()) {
                 return;
             }
             const selection = $getSelection();
             const nativeSelection = window.getSelection();
             const rootElement = editor.getRootElement();
 
             if (
                 nativeSelection !== null &&
                 (!$isRangeSelection(selection) ||
                     rootElement === null ||
                     !rootElement.contains(nativeSelection.anchorNode))
             ) {
                 setIsText(false);
                 return;
             }
 
             if (!$isRangeSelection(selection)) {
                 return;
             }
 
             const node = getSelectedNode(selection);
 
             // Update text format
             setIsBold(selection.hasFormat('bold'));
             setIsItalic(selection.hasFormat('italic'));
             setIsUnderline(selection.hasFormat('underline'));
             setIsStrikethrough(selection.hasFormat('strikethrough'));
             setIsSubscript(selection.hasFormat('subscript'));
             setIsSuperscript(selection.hasFormat('superscript'));
             setIsCode(selection.hasFormat('code'));
 
             // Update links
             const parent = node.getParent();
             if ($isLinkNode(parent) || $isLinkNode(node)) {
                 setIsLink(true);
             } else {
                 setIsLink(false);
             }
 
             if (
                 !$isCodeHighlightNode(selection.anchor.getNode()) &&
                 selection.getTextContent() !== ''
             ) {
                 setIsText($isTextNode(node) || $isParagraphNode(node));
             } else {
                 setIsText(false);
             }
 
             const rawTextContent = selection.getTextContent().replace(/\n/g, '');
             if (!selection.isCollapsed() && rawTextContent === '') {
                 setIsText(false);
                 return;
             }
         });
     }, [editor]);
 
     useEffect(() => {
         document.addEventListener('selectionchange', updatePopup);
         return () => {
             document.removeEventListener('selectionchange', updatePopup);
         };
     }, [updatePopup]);
 
     useEffect(() => {
         return mergeRegister(
             editor.registerUpdateListener(() => {
                 updatePopup();
             }),
             editor.registerRootListener(() => {
                 if (editor.getRootElement() === null) {
                     setIsText(false);
                 }
             }),
         );
     }, [editor, updatePopup]);
 
     if (!isText) {
         return null;
     }
 
     return createPortal(
         <TextFormatFloatingToolbar
             anchorElement={anchorElement}
             editor={editor}
             isBold={isBold}
             isCode={isCode}
             isItalic={isItalic}
             isLink={isLink}
             isStrikethrough={isStrikethrough}
             isSubscript={isSubscript}
             isSuperscript={isSuperscript}
             isUnderline={isUnderline}
             setIsLinkEditMode={setIsLinkEditMode}
         />,
         anchorElement,
     );
 }
 
 export default function FloatingTextFormatToolbarPlugin({
     anchorElement = document.body,
     setIsLinkEditMode,
 }: {
     anchorElement?: HTMLElement;
     setIsLinkEditMode: Dispatch<boolean>;
 }): JSX.Element | null {
     const [editor] = useLexicalComposerContext();
     return useFloatingTextFormatToolbar(editor, anchorElement, setIsLinkEditMode);
 }
 