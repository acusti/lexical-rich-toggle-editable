import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export default function EditablePlugin({ isEditable }: { isEditable: boolean }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.setEditable(isEditable);
        console.log('toggling isEditable', isEditable);
    }, [editor, isEditable]);

    return null;
}
