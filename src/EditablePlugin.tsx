import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import { $selectAll } from 'lexical';
import { useEffect } from 'react';

export default function EditablePlugin({ isEditable }: { isEditable: boolean }) {
    const [editor] = useLexicalComposerContext();
    const editableState = useLexicalEditable();

    useEffect(() => {
        editor.setEditable(isEditable);
    }, [editor, isEditable]);

    useEffect(() => {
        if (editableState) {
            editor.update(() => {
                $selectAll();
            });
        }
    }, [editableState, editor]);

    return null;
}
