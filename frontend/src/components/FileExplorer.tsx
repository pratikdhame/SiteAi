import React, { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import {FileItem} from './StepsPanel';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFile: FileItem | null;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    // Sort items: folders first, then files
    const sortedItems = [...items].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name); // Alphabetical within same type
    });

    return sortedItems.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-700 transition-colors ${
            selectedFile?.path === item.path ? 'bg-blue-600' : ''
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              onFileSelect(item);
            }
          }}
        >
          {item.type === 'folder' ? (
            <>
              {expandedFolders.has(item.path) ? (
                <ChevronDown className="w-4 h-4 text-gray-400 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 mr-1" />
              )}
              {expandedFolders.has(item.path) ? (
                <FolderOpen className="w-4 h-4 text-blue-400 mr-2" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400 mr-2" />
              )}
            </>
          ) : (
            <File className="w-4 h-4 text-gray-400 mr-2 ml-5" />
          )}
          <span className="text-sm text-gray-200 truncate">{item.name}</span>
        </div>
        {item.type === 'folder' && item.children && expandedFolders.has(item.path) && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">File Explorer</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {renderFileTree(files)}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;