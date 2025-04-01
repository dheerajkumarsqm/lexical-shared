import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

const theme = {
  // Define your Lexical theme here
};

const LexicalEditor = () => {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError: (error: Error) => console.error(error),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin 
        contentEditable={<ContentEditable className="editor" />} 
        placeholder={<div>Type something...</div>}
        ErrorBoundary={LexicalErrorBoundary}/>
      <HistoryPlugin />
    </LexicalComposer>
  );
};

export default LexicalEditor;
