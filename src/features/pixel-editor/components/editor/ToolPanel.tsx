import React from 'react';
import { useEditor } from '@pixel/contexts/EditorContext';
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
  const { activeTool, isMobile, isPanelOpen } = useEditor();

  if (!activeTool) return null;
  if (isMobile && !isPanelOpen) return null;

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
            ? 'fixed inset-x-0 bottom-[64px] z-50 max-h-[60vh] bg-editor-panel/95 backdrop-blur border-t border-border rounded-t-2xl shadow-lg overflow-y-auto'
            : 'h-full w-72 bg-editor-panel border-r border-border'
        }
      >
        {renderPanel()}
      </motion.div>
    </AnimatePresence>
  );
};
