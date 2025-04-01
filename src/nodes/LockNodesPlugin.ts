import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_CRITICAL,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    KEY_DOWN_COMMAND,
    PASTE_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
} from "lexical";

const LOCKED_TEXTS = ["Welcome to the Lexical Playground!", "VIP Activation"];

const LockNodesPlugin = ({ lockedTexts }: { lockedTexts: string[] }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const checkLockedSelection = (event: any) => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                for (const node of nodes) {
                    if ($isTextNode(node) && lockedTexts.includes(node.getTextContent())) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        const removeKeydownListener = editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const nodes = selection.getNodes();
                    for (const node of nodes) {
                        if ($isTextNode(node) && lockedTexts.includes(node.getTextContent())) {
                            event.preventDefault();
                            return true;
                        }
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        const removePasteListener = editor.registerCommand(
            PASTE_COMMAND,
            (event) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const nodes = selection.getNodes();
                    for (const node of nodes) {
                        if ($isTextNode(node) && lockedTexts.includes(node.getTextContent())) {
                            event.preventDefault();
                            return true;
                        }
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        const removeFormatListener = editor.registerCommand(
            FORMAT_TEXT_COMMAND,
            (event) => {
                if(checkLockedSelection(event)) {
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        const removeUndoListener = editor.registerCommand(
            UNDO_COMMAND,
            (event) => {
                if (checkLockedSelection(event)) {
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        const removeRedoListener = editor.registerCommand(
            REDO_COMMAND,
            (event) => {
                if (checkLockedSelection(event)) {
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        const removeAlignmentListener = editor.registerCommand(
            FORMAT_ELEMENT_COMMAND,
            (event) => {
                if (checkLockedSelection(event)) {
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        return () => {
            removeKeydownListener();
            removePasteListener();
            removeFormatListener();
            removeUndoListener();
            removeRedoListener();
            removeAlignmentListener();
        };
    }, [editor, lockedTexts]);

    return null;
};

export default LockNodesPlugin;
