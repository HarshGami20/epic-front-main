import React, { useMemo } from 'react';
import { Crop, SlidersHorizontal, Sparkles, Type, Shapes, Sticker, LayoutGrid, Image, Layers } from 'lucide-react';
import { useEditor, Tool } from '@pixel/contexts/EditorContext';
import { cn } from '@pixel/lib/utils';

interface ToolItem {
  id: Tool;
  icon: React.ReactNode;
  label: string;
}

const allTools: ToolItem[] = [
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
  const {
    activeTool,
    setActiveTool,
    imageLoaded,
    setIsPanelOpen,
    isMobile,
    productTextOnlyMode,
    editorSource,
    editableZones,
    activeEditableZoneId,
  } = useEditor();

  const tools = useMemo(() => {
    if (editorSource === 'product' && productTextOnlyMode) {
      return allTools.filter((t) => t.id === 'text' || t.id === 'layers');
    }

    if (editorSource === 'product' && editableZones.length > 0) {
      const activeZone = editableZones.find(z => z.id === activeEditableZoneId) ?? editableZones[0];
      if (activeZone) {
        if (activeZone.type === 'text') {
          return allTools.filter((t) => ['text', 'layers'].includes(t.id));
        } else if (activeZone.type === 'image') {
          return allTools.filter((t) => ['picture', 'shapes', 'sticker', 'adjust', 'filter', 'crop', 'layers'].includes(t.id));
        }
      }
    }

    return allTools;
  }, [editorSource, productTextOnlyMode, editableZones, activeEditableZoneId]);

  const showApps = editorSource === 'demo' || (!productTextOnlyMode && (editableZones.find(z => z.id === activeEditableZoneId) ?? editableZones[0])?.type !== 'text');

  React.useEffect(() => {
    if (activeTool && activeTool !== 'apps' && !tools.find((t) => t.id === activeTool)) {
      setActiveTool(null);
      if (isMobile) setIsPanelOpen(false);
    }
  }, [tools, activeTool, setActiveTool, isMobile, setIsPanelOpen]);

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

  if (!isMobile) {
    return (
      <div className="w-[72px] shrink-0 bg-editor-panel border-r border-border flex flex-col h-full shadow-sm">
        <div className="flex-1 flex flex-col py-3 gap-0.5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolClick(tool.id)}
              disabled={!imageLoaded}
              className={cn(
                baseButtonClasses,
                'mx-1.5',
                activeTool === tool.id && 'active',
                !imageLoaded && 'opacity-30 cursor-not-allowed'
              )}
            >
              {tool.icon}
              <span className="text-[10px] leading-tight text-center px-0.5">{tool.label}</span>
            </button>
          ))}
        </div>

        {showApps && (
          <div className="border-t border-border py-3">
            <button
              type="button"
              onClick={() => handleToolClick(appsItem.id)}
              disabled={!imageLoaded}
              className={cn(
                baseButtonClasses,
                'mx-1.5',
                activeTool === appsItem.id && 'active',
                !imageLoaded && 'opacity-30 cursor-not-allowed'
              )}
            >
              {appsItem.icon}
              <span className="text-[10px]">{appsItem.label}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-editor-panel/95 backdrop-blur-md border-t border-border min-h-[var(--editor-mobile-dock-h)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-1 py-2 gap-0.5 overflow-x-auto">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => handleToolClick(tool.id)}
            disabled={!imageLoaded}
            className={cn(
              baseButtonClasses,
              'flex-1 min-w-[56px]',
              activeTool === tool.id && 'active',
              !imageLoaded && 'opacity-30 cursor-not-allowed'
            )}
          >
            {tool.icon}
            <span className="text-[10px]">{tool.label}</span>
          </button>
        ))}

        {showApps && (
          <button
            type="button"
            onClick={() => handleToolClick(appsItem.id)}
            disabled={!imageLoaded}
            className={cn(
              baseButtonClasses,
              'flex-1 min-w-[56px]',
              activeTool === appsItem.id && 'active',
              !imageLoaded && 'opacity-30 cursor-not-allowed'
            )}
          >
            {appsItem.icon}
            <span className="text-[10px]">{appsItem.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
