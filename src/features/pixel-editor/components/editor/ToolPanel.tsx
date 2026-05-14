import React from 'react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { X } from 'lucide-react';
import { Button } from '@pixel/components/ui/button';
import { CropPanel } from './panels/CropPanel';
import { AdjustPanel } from './panels/AdjustPanel';
import { FilterPanel } from './panels/FilterPanel';
import { TextPanel } from './panels/TextPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { StickerPanel } from './panels/StickerPanel';
import { AppsPanel } from './panels/AppsPanel';
import { PicturePanel } from './panels/PicturePanel';
import { LayersPanel } from './panels/LayersPanel';
import { AnimatePresence, motion } from 'framer-motion';

export const ToolPanel: React.FC = () => {
  const { activeTool, isMobile, isPanelOpen, setActiveTool, setIsPanelOpen } = useEditor();

  if (!activeTool) return null;
  if (isMobile && !isPanelOpen) return null;

  const closePanel = () => {
    setActiveTool(null);
    if (isMobile) setIsPanelOpen(false);
  };

  const renderPanel = () => {
    switch (activeTool) {
      case 'crop':
        return <CropPanel key="crop" />;
      case 'adjust':
        return <AdjustPanel key="adjust" />;
      case 'filter':
        return <FilterPanel key="filter" />;
      case 'text':
        return <TextPanel key="text" />;
      case 'shapes':
        return <ShapesPanel key="shapes" />;
      case 'sticker':
        return <StickerPanel key="sticker" />;
      case 'picture':
        return <PicturePanel key="picture" />;
      case 'apps':
        return <AppsPanel key="apps" />;
      case 'layers':
        return <LayersPanel key="layers" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTool}
        initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -20 }}
        animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
        exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={
          isMobile
            ? 'fixed inset-x-0 bottom-[calc(var(--editor-mobile-dock-h)+env(safe-area-inset-bottom,0px))] z-50 max-h-[min(72vh,28rem)] bg-editor-panel/98 backdrop-blur-md border-t border-border rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col'
            : 'h-full w-72 bg-editor-panel border-r border-border'
        }
      >
        {isMobile && (
          <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border bg-editor-panel-header/80">
            <span className="text-sm font-semibold text-foreground capitalize truncate">
              {activeTool.replace(/-/g, ' ')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={closePanel}
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className={isMobile ? 'flex-1 overflow-y-auto overscroll-contain min-h-0' : 'h-full overflow-y-auto'}>
          {renderPanel()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
