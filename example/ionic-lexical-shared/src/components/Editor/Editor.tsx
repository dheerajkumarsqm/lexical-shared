import React, { useEffect, useState } from 'react';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
    ListItemNode,
    ListNode,
} from '@lexical/list';
import { LinkNode } from "@lexical/link";
import { LayoutItemNode } from "./nodes/LayoutItemNode";
import { $generateHtmlFromNodes } from '@lexical/html';
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    createCommand,
    DOMConversionMap,
    DOMExportOutput,
    DOMExportOutputMap,
    isHTMLElement,
    Klass,
    LexicalEditor,
    LexicalNode,
    ParagraphNode,
    TextNode,
} from 'lexical';
import ExampleTheme from './Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig';
import './styles.css';
// import VaButton from '@/design-system/ui/button';
// import { RiEdit2Line } from 'react-icons/ri';
// import VaGrid from '@/design-system/ui/grid';
import LockNodesPlugin from './nodes/LockNodesPlugin';
import { LockedTextNode } from './nodes/LockedTextNode';
import bgImage from '@/assets/images/bgImage.png';

const LOCAL_STORAGE_KEY = "editorContent";
const placeholder = 'Enter some rich text...';


const removeStylesExportDOM = (
    editor: LexicalEditor,
    target: LexicalNode,
): DOMExportOutput => {
    const output = target.exportDOM(editor);
    if (output && isHTMLElement(output.element)) {
        // Remove all inline styles and classes if the element is an HTMLElement
        // Children are checked as well since TextNode can be nested
        // in i, b, and strong tags.
        for (const el of [
            output.element,
            ...output.element.querySelectorAll('[style],[class],[dir="ltr"]'),
        ]) {
            el.removeAttribute('class');
            el.removeAttribute('style');
            if (el.getAttribute('dir') === 'ltr') {
                el.removeAttribute('dir');
            }
        }
    }
    return output;
};

const exportMap: DOMExportOutputMap = new Map<
    Klass<LexicalNode>,
    (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
    [ParagraphNode, removeStylesExportDOM],
    [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
    // Parse styles from pasted input, but only if they match exactly the
    // sort of styles that would be produced by exportDOM
    let extraStyles = '';
    const fontSize = parseAllowedFontSize(element.style.fontSize);
    const backgroundColor = parseAllowedColor(element.style.backgroundColor);
    const color = parseAllowedColor(element.style.color);
    if (fontSize !== '' && fontSize !== '15px') {
        extraStyles += `font-size: ${fontSize};`;
    }
    if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
        extraStyles += `background-color: ${backgroundColor};`;
    }
    if (color !== '' && color !== 'rgb(0, 0, 0)') {
        extraStyles += `color: ${color};`;
    }
    return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
    const importMap: DOMConversionMap = {};

    // Wrap all TextNode importers with a function that also imports
    // the custom styles implemented by the playground
    for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
        importMap[tag] = (importNode) => {
            const importer = fn(importNode);
            if (!importer) {
                return null;
            }
            return {
                ...importer,
                conversion: (element) => {
                    const output = importer.conversion(element);
                    if (
                        output === null ||
                        output.forChild === undefined ||
                        output.after !== undefined ||
                        output.node !== null
                    ) {
                        return output;
                    }
                    const extraStyles = getExtraStyles(element);
                    if (extraStyles) {
                        const { forChild } = output;
                        return {
                            ...output,
                            forChild: (child, parent) => {
                                const textNode = forChild(child, parent);
                                if ($isTextNode(textNode)) {
                                    textNode.setStyle(textNode.getStyle() + extraStyles);
                                }
                                return textNode;
                            },
                        };
                    }
                    return output;
                },
            };
        };
    }

    return importMap;
};

const defaultContent = JSON.stringify({
    root: {
        children: [
            {
                type: "heading",
                tag: "h1",
                locked: true,
                children: [
                    {
                        type: "text",
                        text: "Welcome to the Lexical Playground!",
                        style: "font-size: 50px; line-height: 1;",

                    },
                ],
            },
            {
                type: "quote",
                children: [
                    {
                        type: "text",
                        text: "In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        text: "",
                    },
                ],
            },
            {
                type: "layout-item",
                children: [
                    {
                        type: "paragraph",
                        // locked: true,
                        children: [
                            {
                                type: "text",
                                text: "BRANDING",
                                format: 1,
                                style: "font-size: 20px; display:block; padding-bottom: 10px;",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        locked: true,
                        children: [
                            {
                                type: "text",
                                text: "VIP",
                                format: 1,
                                style: "font-size: 36px;line-height: 1;",
                            },
                            {
                                type: "text",
                                text: " ",
                            },
                            {
                                type: "text",
                                text: "Activation",
                                style: "font-size: 36px;line-height: 1;",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        children: [
                            {
                                type: "text",
                                text: "Scelerisque auctor dolor diam tortor, fames faucibus non interdum nunc. Ultrices nibh sapien elit gravida ac, rutrum molestie adipiscing lacinia.",
                            },
                        ],
                    },
                ],
            },
            {
                type: "paragraph",
                locked: true,
                children: [
                    {
                        type: "text",
                        text: "The playground is a demo environment built with @lexical/react. Try typing in some text with different formats.",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        text: "Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        text: "If you'd like to find out more about Lexical, you can:",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        text: "Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance 🙂.",
                    },
                ],
            },
        ],
        type: "root",
        version: 1,
    },
});

const editorConfig = {
    html: {
        export: exportMap,
        import: constructImportMap(),
    },
    namespace: 'React.js Demo',
    nodes: [
        ParagraphNode,
        TextNode,
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        // ImageNode,
        LinkNode,
        LayoutItemNode,
        LockedTextNode,
    ],
    onError(error: Error) {
        throw error;
    },
    theme: ExampleTheme,
    editorState: defaultContent,
    editable: false,
};

const LoadInitialContent = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            const editorState = editor.parseEditorState(JSON.parse(defaultContent));
            // const editorState = editor.parseEditorState(JSON.stringify(savedEditorState.editorState));
            editor.setEditorState(editorState);
            editor.setEditable(false);
        });
    }, [editor]);
    return null;
};


function EditorContentComponent() {
    const [editor] = useLexicalComposerContext();
    const [editorState, setEditorState] = useState(null);
    const [content, setContent] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const handleExport = () => {
        editor.update(() => {
            const json = JSON.stringify(editor.getEditorState().toJSON());
            localStorage.setItem(LOCAL_STORAGE_KEY, json);
            alert("Content saved locally!");
        });
    };

    const toggleEditing = () => {
        setIsEditable((prev) => !prev);
        editor.setEditable(!isEditable);
    };

    useEffect(() => {
        const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const nodes = selection.getNodes();
                    console.log("Selected nodes:", nodes);
                    const hasLockedNode = nodes.some((node: any) => {
                        const latestNode = node.getLatest();
                        console.log("Checking node:", latestNode);
                        return latestNode?.__locked === true || latestNode?.locked === true;
                    });

                    setIsLocked(hasLockedNode);
                } else {
                    setIsLocked(false);
                }
            });
        });

        return () => {
            unregisterListener();
        };
    }, [editor]);


    const shouldShowToolbar = isEditable && !isLocked;

    useEffect(() => {
        console.log("Toolbar should be visible:", shouldShowToolbar);
        console.log("isEditable:", isEditable);
        console.log("isLocked:", isLocked);
    }, [isEditable, isLocked]);

    // const exportHTML = () => {
    //     editor.update(() => {
    //         const editorState = editor.getEditorState();
    //         const jsonString = JSON.stringify(editorState);
    //         console.log('jsonString', jsonString);
    //         const htmlString = $generateHtmlFromNodes(editor, null);
    //         console.log('htmlString', htmlString);
    //     });
    // };
    const exportHTML = () => {
        editor.update(() => {
            const editorState = editor.getEditorState();
            const jsonString = JSON.stringify(editorState);
            console.log('jsonString', jsonString);
            const htmlString = $generateHtmlFromNodes(editor, null);
            console.log('htmlString', htmlString);
            const blob = new Blob([htmlString], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lexical-content.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    const extractLockedTexts = (content: any) => {
        const lockedTexts: string[] = [];

        const traverseNodes = (node: any) => {
            if (node.locked && node.children) {
                node.children.forEach((child: any) => {
                    if (child.type === "text") {
                        lockedTexts.push(child.text);
                    }
                });
            }
            if (node.children) {
                node.children.forEach(traverseNodes);
            }
        };

        const parsedContent = JSON.parse(defaultContent);
        traverseNodes(parsedContent.root);
        return lockedTexts;
    };

    const lockedTexts = extractLockedTexts(defaultContent);

    return (
        // <VaGrid className="editor-container">
        //     {shouldShowToolbar && <ToolbarPlugin />}
        //     <VaGrid className="editor-inner">
        //         <RichTextPlugin
        //             contentEditable={
        //                 <ContentEditable
        //                     className="editor-input"
        //                     aria-placeholder={placeholder}
        //                     placeholder={<div className="editor-placeholder">{placeholder}</div>}
        //                 />
        //             }
        //             ErrorBoundary={LexicalErrorBoundary}
        //         />
        //         <HistoryPlugin />
        //         <ListPlugin />
        //         <AutoFocusPlugin />
        //         <TreeViewPlugin />
        //         <LockNodesPlugin lockedTexts={lockedTexts} />
        //     </VaGrid>
        //     <VaButton onClick={toggleEditing} className="toggle-button" startIcon={isEditable ? <RiEdit2Line /> : <RiEdit2Line />}>
        //         {isEditable ? `Disable Edit` : `Edit`}
        //     </VaButton>
        //     <VaButton onClick={exportHTML} >
        //         Export HTML
        //     </VaButton>
        // </VaGrid>
        <div>
            {/* <img src={bgImage} width={"100%"} alt="map view" /> */}
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                {/* Editor Container */}
                <div>
                    <div className="editor-container">
                        {shouldShowToolbar && <ToolbarPlugin />}
                        <div className="editor-inner">
                            <RichTextPlugin
                                contentEditable={
                                    // <div style={{
                                    //     backgroundImage: `url(${bgImage})`,
                                    //     backgroundSize: 'cover',
                                    //     backgroundPosition: 'center',
                                    //     minHeight: '300px',
                                    //     padding: '20px',
                                    //     borderRadius: '8px'
                                    // }}>
                                        <ContentEditable className="editor-content" />
                                    // </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <ListPlugin />
                            <AutoFocusPlugin />
                            <TreeViewPlugin />
                            <LockNodesPlugin lockedTexts={lockedTexts} />
                        </div>
                        <button onClick={toggleEditing} className="toggle-button">
                            {isEditable ? `Disable Edit` : `Edit`}
                        </button>
                        <button onClick={exportHTML} >
                            Export HTML
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EditorWrapper() {
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <EditorContentComponent />
        </LexicalComposer>
    );
}
