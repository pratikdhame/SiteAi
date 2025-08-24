import React from 'react';
import Editor from '@monaco-editor/react';
import { FileText } from 'lucide-react';
import { FileItem } from './StepsPanel';

interface CodeEditorProps {
  selectedFile: FileItem | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedFile }) => {
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Select a file to view its contents</p>
          <p className="text-gray-500 text-sm mt-2">Choose a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <FileText className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-200">{selectedFile.name}</span>
        <span className="text-xs text-gray-500 ml-2">({selectedFile.path})</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(selectedFile.name)}
          value={selectedFile.content}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            selectionHighlight: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            padding: { top: 16, bottom: 16 },
          }}
          onMount={(editor) => {
            // Custom dark theme
            editor.updateOptions({
              theme: 'vs-dark'
            });
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;