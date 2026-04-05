import React from 'react';
import { Crop, SlidersHorizontal, Sparkles, Type, Shapes, Sticker, LayoutGrid, Image, Layers } from 'lucide-react';
import { useEditor, Tool } from '@pixel/contexts/EditorContext';
import { cn } from '@pixel/lib/utils';

interface ToolItem {
  id: Tool;
  icon: React.ReactNode;
  label: string;
}

const tools: ToolItem[] = [
  { id: 'picture', icon: <Image className="w-5 h-5" />, label: 'Picture' },
  { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { id: 'shapes', icon: <Shapes className="w-5 h-5" />, label: 'Shapes' },
  { id: 'sticker', icon: <Sticker className="w-5 h-5" />, label: 'Sticker' },
  { id: 'adjust', icon: <SlidersHorizontal className="w-5 h-5" />, label: 'Adjust' },
  { id: 'filter', icon: <Sparkles className="w-5 h-5" />, label: 'Filter' },
  { id: 'crop', icon: <Crop className="w-5 h-5" />, label: 'Crop' },
  { id: 'layers', icon: <Layers className="w-5 h-5" />, label: 'Layers' },
];

const appsItem: ToolItem = { id: 'apps', icon: <LayoutGrid className="w-5 h-5" />, label: 'Apps' };

export const ToolSidebar: React.FC = () => {
  const { activeTool, setActiveTool, imageLoaded, setIsPanelOpen, isMobile } = useEditor();

  const handleToolClick = (tool: Tool) => {
    if (!imageLoaded) return;
    
    if (activeTool === tool) {
      setActiveTool(null);
      if (isMobile) setIsPanelOpen(false);
    } else {
      setActiveTool(tool);
      if (isMobile) setIsPanelOpen(true);
    }
  };

  const baseButtonClasses = 'editor-tool-btn';

  // Desktop: vertical left sidebar
  if (!isMobile) {
    return (
      <div className="w-16 bg-editor-panel border-r border-border flex flex-col h-full">
        <div className="flex-1 flex flex-col py-4 gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              disabled={!imageLoaded}
              className={cn(
                baseButtonClasses,
                'mx-2',
                activeTool === tool.id && 'active',
                !imageLoaded && 'opacity-30 cursor-not-allowed'
              )}
            >
              {tool.icon}
              <span className="text-[10px]">{tool.label}</span>
            </button>
          ))}
        </div>
        
        <div className="border-t border-border py-4">
          <button
            onClick={() => handleToolClick(appsItem.id)}
            disabled={!imageLoaded}
            className={cn(
              baseButtonClasses,
              'mx-2',
              activeTool === appsItem.id && 'active',
              !imageLoaded && 'opacity-30 cursor-not-allowed'
            )}
          >
            {appsItem.icon}
            <span className="text-[10px]">{appsItem.label}</span>
          </button>
        </div>
      </div>
    );
  }

  // Mobile: bottom toolbar, horizontal, overlaying canvas
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-editor-panel/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between px-2 py-2 gap-1 overflow-x-auto">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            disabled={!imageLoaded}
            className={cn(
              baseButtonClasses,
              'flex-1 min-w-[64px]',
              activeTool === tool.id && 'active',
              !imageLoaded && 'opacity-30 cursor-not-allowed'
            )}
          >
            {tool.icon}
            <span className="text-[10px]">{tool.label}</span>
          </button>
        ))}

        <button
          onClick={() => handleToolClick(appsItem.id)}
          disabled={!imageLoaded}
          className={cn(
            baseButtonClasses,
            'flex-1 min-w-[64px]',
            activeTool === appsItem.id && 'active',
            !imageLoaded && 'opacity-30 cursor-not-allowed'
          )}
        >
          {appsItem.icon}
          <span className="text-[10px]">{appsItem.label}</span>
        </button>
      </div>
    </div>
  );
};
