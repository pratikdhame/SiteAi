import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [loadingStage, setLoadingStage] = useState<'installing' | 'starting' | 'ready'>('installing');

  async function main() {
    try {
      setLoadingStage('installing');
      
      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      // Wait for install to complete
      await installProcess.exit;
      
      setLoadingStage('starting');
      
      await webContainer.spawn('npm', ['run', 'dev']);

      // Wait for `server-ready` event
      webContainer.on('server-ready', (port, url) => {
        console.log(url);
        console.log(port);
        setLoadingStage('ready');
        setUrl(url);
      });
    } catch (error) {
      console.error('Error during setup:', error);
    }
  }

  useEffect(() => {
    main();
  }, []);

  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Spinning circles animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
      </div>
      
      {/* Loading text with dots animation */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">
          {loadingStage === 'installing' && 'Installing dependencies'}
          {loadingStage === 'starting' && 'Starting development server'}
          {loadingStage === 'ready' && 'Almost ready'}
        </h3>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center space-x-4 mt-4">
        <div className={`flex items-center space-x-2 ${loadingStage === 'installing' ? 'text-blue-600' : loadingStage === 'starting' || loadingStage === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-3 h-3 rounded-full border-2 ${loadingStage === 'installing' ? 'border-blue-600 bg-blue-100' : loadingStage === 'starting' || loadingStage === 'ready' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
            {(loadingStage === 'starting' || loadingStage === 'ready') && (
              <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">Install</span>
        </div>

        <div className="w-8 h-0.5 bg-gray-300 relative overflow-hidden">
          <div className={`absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500 ${loadingStage === 'starting' || loadingStage === 'ready' ? 'w-full' : 'w-0'}`}></div>
        </div>

        <div className={`flex items-center space-x-2 ${loadingStage === 'starting' ? 'text-blue-600' : loadingStage === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-3 h-3 rounded-full border-2 ${loadingStage === 'starting' ? 'border-blue-600 bg-blue-100' : loadingStage === 'ready' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
            {loadingStage === 'ready' && (
              <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">Start Server</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex items-center justify-center">
      {!url ? (
        <div className="text-gray-600">
          <LoadingAnimation />
        </div>
      ) : (
        <iframe width="100%" height="100%" src={url} className="border-0" />
      )}
    </div>
  );
}