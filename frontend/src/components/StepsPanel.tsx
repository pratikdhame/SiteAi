import React from 'react';
import { CheckCircle, Circle, Play } from 'lucide-react';

export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  path: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed';
  code?: string;
  path?: string;
}

interface StepsPanelProps {
  steps: Step[];
  prompt: string;
}

const StepsPanel: React.FC<StepsPanelProps> = ({ steps, prompt }) => {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-blue-400" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">Build Steps</h2>
        {prompt && (
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-300 mb-1">Project Brief:</p>
            <p className="text-sm text-white">{prompt}</p>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.status === 'in-progress' ? 'text-blue-400' :
                  step.status === 'completed' ? 'text-green-400' :
                  'text-gray-400'
                }`}>
                  {step.title}
                </p>
                {index < steps.length - 1 && (
                  <div className="mt-2 ml-2 w-0.5 h-4 bg-gray-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
        
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="p-3 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-300 mb-2">Progress</p>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
          </p>
        </div>
      </div>  
    </div>
    </div>
  );
};

export default StepsPanel;