import React, { useState, useRef } from 'react';
import { X, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { FabricImage } from 'fabric';
import { toast } from 'sonner';
import { ScrollArea } from '@pixel/components/ui/scroll-area';

export const PicturePanel: React.FC = () => {
  const { setActiveTool, canvas, pushHistory, selectionArea, updateLayers, isMobile, setIsPanelOpen } = useEditor();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setActiveTool(null);
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = (file: File) => {
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Add to uploaded images list
      setUploadedImages((prev) => [...prev, dataUrl]);
      
      // Add to canvas
      addImageToCanvas(dataUrl);
    };
    
    reader.readAsDataURL(file);
  };

  const addImageToCanvas = (dataUrl: string) => {
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      let left = canvas.width! / 2;
      let top = canvas.height! / 2;
      let maxWidth = canvas.width! * 0.4;
      let maxHeight = canvas.height! * 0.4;

      // If we have a selection area, place and size within it
      if (selectionArea) {
        left = selectionArea.x + selectionArea.width / 2;
        top = selectionArea.y + selectionArea.height / 2;
        maxWidth = selectionArea.width * 0.9;
        maxHeight = selectionArea.height * 0.9;
      }

      const scale = Math.min(
        maxWidth / img.width,
        maxHeight / img.height,
        1 // Don't scale up
      );

      const fabricImg = new FabricImage(img, {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
      });

      // Give it a custom name for the layers panel
      (fabricImg as any).customName = 'Uploaded Image';

      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      pushHistory();
      updateLayers();
      toast.success('Image added!');
      if (isMobile) {
        setIsPanelOpen(false);
      }
    };
    
    img.src = dataUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full md:w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Pictures</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Upload Section */}
      <div 
        className="p-4 border-b border-border"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Upload Images</p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
          </div>
        </label>
      </div>

      {/* Uploaded Images Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {uploadedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No images uploaded yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload images to use in your design
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((dataUrl, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border group relative"
                >
                  <img
                    src={dataUrl}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => addImageToCanvas(dataUrl)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        addImageToCanvas(dataUrl);
                      }}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUploadedImage(idx);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Info */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground text-center">
          Images are placed in the design area
        </p>
      </div>
    </div>
  );
};
