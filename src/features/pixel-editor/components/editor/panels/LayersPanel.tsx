import React from 'react';
import { X, Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown, Image, Type, Square, Circle, Star } from 'lucide-react';
import { useEditor, LayerItem } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { cn } from '@pixel/lib/utils';
import { ScrollArea } from '@pixel/components/ui/scroll-area';

const getLayerIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'textbox':
    case 'i-text':
      return <Type className="w-4 h-4" />;
    case 'rect':
      return <Square className="w-4 h-4" />;
    case 'circle':
      return <Circle className="w-4 h-4" />;
    case 'polygon':
      return <Star className="w-4 h-4" />;
    default:
      return <Square className="w-4 h-4" />;
  }
};

export const LayersPanel: React.FC = () => {
  const { 
    setActiveTool, 
    canvas, 
    layers, 
    selectedObject,
    setSelectedObject,
    deleteSelectedObject,
    duplicateSelectedObject,
    bringForward,
    sendBackward,
    pushHistory,
    updateLayers,
  } = useEditor();

  const handleClose = () => {
    setActiveTool(null);
  };

  const handleSelectLayer = (layer: LayerItem) => {
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    setSelectedObject(layer.object);
    canvas.renderAll();
  };

  const handleToggleVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.set('visible', !layer.visible);
    canvas.renderAll();
    pushHistory();
    updateLayers();
  };

  const handleToggleLock = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    const isLocked = !layer.locked;
    layer.object.set({
      selectable: !isLocked,
      evented: !isLocked,
      hasControls: !isLocked,
    });
    
    if (isLocked && selectedObject === layer.object) {
      canvas.discardActiveObject();
      setSelectedObject(null);
    }
    
    canvas.renderAll();
    pushHistory();
    updateLayers();
  };

  const handleDeleteLayer = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    canvas.remove(layer.object);
    if (selectedObject === layer.object) {
      canvas.discardActiveObject();
      setSelectedObject(null);
    }
    canvas.renderAll();
    pushHistory();
    updateLayers();
  };

  const isSelected = (layer: LayerItem) => {
    return selectedObject === layer.object;
  };

  return (
    <div className="w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Layers</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Actions */}
      {selectedObject && !(selectedObject as any).isBackground && (
        <div className="flex items-center justify-center gap-1 p-3 border-b border-border bg-secondary/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={bringForward}
            className="h-8 w-8"
            title="Bring Forward"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={sendBackward}
            className="h-8 w-8"
            title="Send Backward"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={duplicateSelectedObject}
            className="h-8 w-8"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={deleteSelectedObject}
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-3">
                <Square className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No layers yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add images, text, or shapes to get started
              </p>
            </div>
          ) : (
            layers.map((layer, index) => (
              <div
                key={layer.id}
                onClick={() => handleSelectLayer(layer)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group",
                  isSelected(layer) 
                    ? "bg-primary/20 border border-primary/50" 
                    : "hover:bg-secondary/50 border border-transparent",
                  layer.locked && "opacity-60"
                )}
              >
                {/* Layer icon */}
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center bg-secondary",
                  !layer.visible && "opacity-50"
                )}>
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer name */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    !layer.visible && "opacity-50"
                  )}>
                    {layer.name} {index + 1}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {layer.type}
                  </p>
                </div>

                {/* Layer actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleVisibility(layer, e)}
                    className="h-7 w-7"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleLock(layer, e)}
                    className="h-7 w-7"
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteLayer(layer, e)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Info */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground text-center">
          {layers.length} layer{layers.length !== 1 ? 's' : ''} • Click to select
        </p>
      </div>
    </div>
  );
};
