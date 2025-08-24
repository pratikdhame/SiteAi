import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StepsPanel from './StepsPanel';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import {PreviewFrame} from './PreviewFrame';
import { Step, StepType } from './StepsPanel';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { FileItem } from './StepsPanel';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';

const BuilderPage: React.FC = () => {
  const location = useLocation();
  const prompt = location.state?.prompt || '';
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [files, setFiles] = useState<FileItem[]>([]);
  const webcontainer = useWebContainer();

useEffect(() => {
  let originalFiles = [...files];
  let updateHappened = false;
  
  steps.filter(({status}) => status === "pending").map(step => {
    updateHappened = true;
    if (step?.type === StepType.CreateFile) {
      let parsedPath = step.path?.split("/") ?? [];
      let currentFileStructure = [...originalFiles];
      let finalAnswerRef = currentFileStructure;

      let currentFolder = ""
      while(parsedPath.length) {
        currentFolder = `${currentFolder}/${parsedPath[0]}`;
        let currentFolderName = parsedPath[0];
        parsedPath = parsedPath.slice(1);

        if (!parsedPath.length) {
          // final file
          let file = currentFileStructure.find(x => x.path === currentFolder)
          if (!file) {
            currentFileStructure.push({
              name: currentFolderName,
              type: 'file',
              path: currentFolder,
              content: step.code
            })
          } else {
            file.content = step.code;
          }
        } else {
          // in a folder
          let folder = currentFileStructure.find(x => x.path === currentFolder)
          if (!folder) {
            // create the folder
            currentFileStructure.push({
              name: currentFolderName,
              type: 'folder',
              path: currentFolder,
              children: []
            })
          }
          currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
        }
      }
      originalFiles = finalAnswerRef;
    }
  })

  if (updateHappened) {
    setFiles(originalFiles)
    setSteps(steps => steps.map((s: Step) => ({
      ...s,
      status: "completed"
    })))
  }
}, [steps, files]);

    useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log('Mounting structure:', mountStructure);
    webcontainer?.mount(mountStructure);
    console.log(webcontainer);
  }, [files, webcontainer]);

  async function init() {
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      
      const { prompts, uiPrompts } = response.data;
      
      // Parse and set initial steps
      const parsedSteps = parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: 'pending' as const, // Set as pending so they get processed
      }));
      
      console.log('Setting initial steps:', parsedSteps);
      setSteps(parsedSteps);

      // Make the chat request
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(content => ({
          role: 'user',
          content
        }))
      });

      setSteps(s=> [...s, ...parseXml(stepsResponse.data.response).map((x: Step) => ({
        ...x,
        status: 'pending' as const,
      }))])
      
      console.log('Chat response:', stepsResponse.data);
    } catch (error) {
      console.error('Error in init:', error);
    }
  }
  
  useEffect(() => { 
    init();
  }, []); // Empty dependency array

  return (
    
    <div className="h-screen bg-gray-900 flex">
      {/* Left Panel - Steps */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700">
        <StepsPanel steps={steps} prompt={prompt} />
      </div>

      {/* Middle Panel - File Explorer */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700">
        <FileExplorer 
          files={files} 
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
        />
      </div>

      {/* Right Panel - Code Editor & Preview */}
      <div className="w-1/2 bg-gray-900 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'code'
                ? 'text-blue-400 bg-gray-900 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-400 bg-gray-900 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Preview
          </button>
        </div>
        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'code' ? (
            <CodeEditor selectedFile={selectedFile} />
          ) : (
            <PreviewFrame webContainer={webcontainer} files={files}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
