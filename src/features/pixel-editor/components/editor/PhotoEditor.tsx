import React from 'react';
import { Toaster } from 'sonner';
import { TopBar } from './TopBar';
import { CustomizeVariantBar } from './CustomizeVariantBar';
import { CustomizeStyleVariantBar } from './CustomizeStyleVariantBar';
import { ToolSidebar } from './ToolSidebar';
import { ToolPanel } from './ToolPanel';
import { EditorCanvas } from './EditorCanvas';
import { ProductStudio } from './ProductStudio';
import { useEditor } from '@pixel/contexts/EditorContext';

export const PhotoEditor: React.FC = () => {
  const { editorSource } = useEditor();

  if (editorSource === 'product') {
    return (
      <div id="pixel-editor-root" className="min-h-screen editor-app-shell bg-[#faf9f5]">
        <ProductStudio />
        <Toaster richColors theme="light" position="top-center" />
      </div>
    );
  }

  return (
    <div id="pixel-editor-root" className="min-h-screen editor-app-shell">
      <div className="h-screen w-screen flex flex-col bg-editor-bg overflow-hidden">
        <TopBar />
        <CustomizeStyleVariantBar />
        <CustomizeVariantBar />

        <div className="flex-1 flex overflow-hidden relative editor-studio-main">
          <ToolSidebar />
          <ToolPanel />
          <EditorCanvas />
        </div>
        <Toaster richColors theme="light" position="top-center" />
      </div>
    </div>
  );
};
