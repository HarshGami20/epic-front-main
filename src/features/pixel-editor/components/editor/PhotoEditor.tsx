import React from 'react';
import { Toaster } from 'sonner';
import { TopBar } from './TopBar';
import { CustomizeVariantBar } from './CustomizeVariantBar';
import { ToolSidebar } from './ToolSidebar';
import { ToolPanel } from './ToolPanel';
import { EditorCanvas } from './EditorCanvas';

export const PhotoEditor: React.FC = () => {
  return (
    <div id="pixel-editor-root" className="min-h-screen editor-app-shell">
      <div className="h-screen w-screen flex flex-col bg-editor-bg overflow-hidden">
        <TopBar />
        <CustomizeVariantBar />

        <div className="flex-1 flex overflow-hidden relative">
          <ToolSidebar />
          <ToolPanel />
          <EditorCanvas />
        </div>
        <Toaster richColors theme="light" position="top-center" />
      </div>
    </div>
  );
};
