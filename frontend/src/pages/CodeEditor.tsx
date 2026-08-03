import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

import React,{ useRef } from 'react';



export function CodeEditor() {
    const editorRef = useRef(null);
    function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

    function showValue() {
    alert(editorRef.current.getValue());
  }
    return <>
    <div>
        <Editor 
        height="90vh" 
        defaultLanguage="javascript" 
        defaultValue="// some comment" 
        onMount={handleEditorDidMount}
        theme="vs-dark"
        />;
    </div>

    </>
}