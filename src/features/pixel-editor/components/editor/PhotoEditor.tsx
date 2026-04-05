import React from 'react';
import { TopBar } from './TopBar';
import { ToolSidebar } from './ToolSidebar';
import { ToolPanel } from './ToolPanel';
import { EditorCanvas } from './EditorCanvas';

export const PhotoEditor: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Tool Sidebar */}
        <ToolSidebar />
        
        {/* Tool Panel (collapsible) */}
        <ToolPanel />
        
        {/* Canvas Area */}
        <EditorCanvas />
      </div>
    </div>
  );
};
