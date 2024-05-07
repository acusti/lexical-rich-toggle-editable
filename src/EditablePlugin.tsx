import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $selectAll } from 'lexical';
import { useEffect } from 'react';

export default function EditablePlugin({ isEditable }: { isEditable: boolean }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() =>
        editor.registerEditableListener((_isEditable) => {
            if (_isEditable) {
                setTimeout(() => {
                    editor.focus();
                    editor.update(() => {
                        $selectAll();
                    });
                }, 0); // next tick
            }
        }),
        [editor],
    );

    useEffect(() => {
        editor.setEditable(isEditable);
    }, [editor, isEditable]);

    return null;
}
