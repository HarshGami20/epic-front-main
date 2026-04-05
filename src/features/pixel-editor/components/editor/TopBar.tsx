import React, { useState } from 'react';
import { Point } from 'fabric';
import { Undo2, Redo2, ZoomIn, ZoomOut, Download, Menu, Trash2, Copy, RotateCcw, Maximize2 } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@pixel/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const TopBar: React.FC = () => {
  const { 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    zoom, 
    setZoom, 
    canvas,
    imageLoaded,
    isMobile,
    setIsPanelOpen,
    isPanelOpen,
    selectedObject,
    deleteSelectedObject,
    duplicateSelectedObject,
    selectionArea,
    selectedProduct,
    editorProduct,
    editorSource,
    fitCanvasToView,
  } = useEditor();

  /** Toolbar zoom is anchored to the viewport center (Fabric’s setZoom uses top-left and drifts the artboard). */
  const handleZoomIn = () => {
    if (!canvas) return;
    const nextPct = Math.min(Math.round(canvas.getZoom() * 100) + 10, 400);
    const z = nextPct / 100;
    const center = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, z);
    setZoom(nextPct);
    canvas.requestRenderAll();
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const nextPct = Math.max(Math.round(canvas.getZoom() * 100) - 10, 10);
    const z = nextPct / 100;
    const center = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, z);
    setZoom(nextPct);
    canvas.requestRenderAll();
  };

  const handleExport = (format: 'png' | 'jpg' | 'webp') => {
    if (!canvas || !selectionArea) return;
    
    // Export only the selection area
    const multiplier = 2; // 2x resolution for quality
    
    const dataURL = canvas.toDataURL({
      format: format === 'jpg' ? 'jpeg' : format,
      quality: 1,
      multiplier: multiplier,
      left: selectionArea.x - selectionArea.bleed,
      top: selectionArea.y - selectionArea.bleed,
      width: selectionArea.width + selectionArea.bleed * 2,
      height: selectionArea.height + selectionArea.bleed * 2,
    });
    
    const link = document.createElement('a');
    const productName =
      (editorSource === 'product' ? editorProduct?.name : selectedProduct?.name)
        ?.replace(/\s+/g, '-')
        .toLowerCase() || 'design';
    link.download = `${productName}-design.${format}`;
    link.href = dataURL;
    link.click();
    
    toast.success(`Design exported as ${format.toUpperCase()}`);
  };

  const handleExportFull = (format: 'png' | 'jpg' | 'webp') => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: format === 'jpg' ? 'jpeg' : format,
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    const productName =
      (editorSource === 'product' ? editorProduct?.name : selectedProduct?.name)
        ?.replace(/\s+/g, '-')
        .toLowerCase() || 'mockup';
    link.download = `${productName}-mockup.${format}`;
    link.href = dataURL;
    link.click();
    
    toast.success(`Full mockup exported as ${format.toUpperCase()}`);
  };

  const handleReset = () => {
    if (!canvas) return;
    
    // Remove all objects except background
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (!(obj as any).isBackground) {
        canvas.remove(obj);
      }
    });
    
    canvas.discardActiveObject();
    canvas.renderAll();
    toast.success('Canvas reset');
  };

  return (
    <div className="h-14 shrink-0 bg-editor-panel/95 backdrop-blur-sm border-b border-border/80 flex items-center justify-between px-3 sm:px-5 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <Undo2 className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <Redo2 className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Redo</span>
        </Button>
        
        <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
        
        {/* Object actions when selected */}
        {selectedObject && !(selectedObject as any).isBackground && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={duplicateSelectedObject}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelectedObject}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </>
        )}
      </div>

      {/* Center - Title */}
      <div className="hidden sm:flex items-center gap-2">
        <h1 className="text-foreground font-semibold text-base sm:text-lg tracking-tight truncate max-w-[min(280px,40vw)]">
          {editorSource === 'product' && editorProduct?.name
            ? editorProduct.name
            : selectedProduct?.name || 'Design studio'}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={!imageLoaded}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        
        <div className="flex items-center gap-1 bg-secondary rounded-md px-2 py-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-foreground min-w-[50px] text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden sm:inline-flex"
            title="Fit mockup to canvas"
            disabled={!imageLoaded}
            onClick={fitCanvasToView}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              disabled={!imageLoaded}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Design Only
            </div>
            <DropdownMenuItem onClick={() => handleExport('png')}>
              Export Design as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('jpg')}>
              Export Design as JPG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('webp')}>
              Export Design as WebP
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Full Mockup
            </div>
            <DropdownMenuItem onClick={() => handleExportFull('png')}>
              Export Mockup as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFull('jpg')}>
              Export Mockup as JPG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
