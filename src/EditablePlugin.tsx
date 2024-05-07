import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $selectAll } from 'lexical';
import { useEffect } from 'react';

export default function EditablePlugin({ isEditable }: { isEditable: boolean }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() =>
        editor.registerEditableListener((_isEditable) => {
            if (_isEditable) {
                // editor.focus(); // also tried focussing here with no luck
                editor.update(() => {
                    editor.focus();
                    $selectAll();
                });
            }
        }),
        [editor],
    );

    useEffect(() => {
        editor.setEditable(isEditable);
        /* I first tried to focus from here, but it didn’t work, so I tried the listener
        if (isEditable) {
            // editor.focus(); // also tried focussing here with no luck
            editor.update(() => {
                editor.focus();
                $selectAll();
            });
        }
        */
    }, [editor, isEditable]);

    return null;
}
