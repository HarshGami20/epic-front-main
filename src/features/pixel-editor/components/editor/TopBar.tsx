import React, { useState } from 'react';
import { Point } from 'fabric';
import { Undo2, Redo2, ZoomIn, ZoomOut, Download, Menu, Trash2, Copy, RotateCcw, Maximize2, Bold, Minus, Plus } from 'lucide-react';
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
    pushHistory,
    editableZones,
    activeEditableZoneId,
  } = useEditor();

  const isTextSelected = selectedObject?.type === 'textbox';
  const textObject = selectedObject as any;

  const updateSelectedText = (property: string, value: any) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    (selectedObject as any).set(property, value);
    canvas.renderAll();
    pushHistory();
  };

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

  const activeZone =
    editableZones.find((z) => z.id === (textObject as any)?.editableZoneId) ??
    editableZones.find((z) => z.id === activeEditableZoneId) ??
    editableZones[0];

  return (
    <div className="h-14 shrink-0 bg-editor-panel/95 backdrop-blur-sm border-b border-border/80 flex items-center justify-between px-3 sm:px-5 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-[70vw]">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 shrink-0"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        {(!isMobile || !isTextSelected) && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Undo2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Redo2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Redo</span>
            </Button>
          </>
        )}

        <div className="w-px h-6 bg-border mx-1 hidden sm:block shrink-0" />

        {/* Object actions when selected */}
        {selectedObject && !(selectedObject as any).isBackground && (
          <>
            {/* Mobile Text Tools */}
            {isMobile && isTextSelected && (
              <>
                <Button
                  variant={textObject.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => updateSelectedText('fontWeight', textObject.fontWeight === 'bold' ? 'normal' : 'bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>

                {(!activeZone?.allowedColors || activeZone.allowedColors.length === 0) && (
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-md border border-border overflow-hidden shrink-0">
                    <input
                      type="color"
                      value={textObject.fill || '#000000'}
                      onChange={(e) => updateSelectedText('fill', e.target.value)}
                      className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer"
                    />
                  </div>
                )}

                <div className="flex items-center border border-border rounded-md h-8 shrink-0 bg-background">
                  <Button variant="ghost" size="icon" className="h-full w-7 rounded-none shrink-0" onClick={() => updateSelectedText('fontSize', Math.max(8, (textObject.fontSize || 24) - 2))}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-xs px-1 min-w-[20px] text-center">{Math.round(textObject.fontSize || 24)}</span>
                  <Button variant="ghost" size="icon" className="h-full w-7 rounded-none shrink-0" onClick={() => updateSelectedText('fontSize', Math.min(120, (textObject.fontSize || 24) + 2))}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <div className="w-px h-6 bg-border mx-1 shrink-0" />
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={duplicateSelectedObject}
              className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Copy className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={deleteSelectedObject}
              className="text-destructive hover:text-destructive shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Trash2 className="w-4 h-4 sm:mr-1" />
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
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          disabled={!imageLoaded}
          className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
        >
          <RotateCcw className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-md px-2 py-1">
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

        <div className="flex sm:hidden items-center shrink-0 bg-secondary/90 rounded-lg px-0.5 py-0.5 mr-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomOut}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-foreground min-w-[2.25rem] text-center font-medium">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomIn}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            title="Fit mockup"
            disabled={!imageLoaded}
            onClick={fitCanvasToView}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={!imageLoaded}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 sm:h-9"
            >
              <Download className="w-4 h-4 sm:mr-1" />
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
