import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Input } from '@pixel/components/ui/input';
import { toast } from 'sonner';
import { FabricImage } from 'fabric';

export const AppsPanel: React.FC = () => {
  const { setActiveTool, canvas, pushHistory, originalImage } = useEditor();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    setActiveTool(null);
  };

  const handleRemoveBackground = async () => {
    if (!canvas) {
      toast.error('Canvas not initialized');
      return;
    }

    // Get the first image object from canvas
    const objects = canvas.getObjects();
    const imageObject = objects.find(obj => obj instanceof FabricImage) as FabricImage | undefined;

    if (!imageObject) {
      toast.error('No image found. Please upload an image first.');
      return;
    }

    setIsProcessing(true);
    toast.info('Processing image... This may take a moment.');

    try {
      // Dynamic import for background removal
      const { removeBackground } = await import('@imgly/background-removal');

      // Get the image element from the fabric image
      const imgElement = imageObject.getElement() as HTMLImageElement;
      
      // Create a canvas to get the image data
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Get original dimensions
      const originalWidth = imgElement.naturalWidth || imgElement.width;
      const originalHeight = imgElement.naturalHeight || imgElement.height;
      
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      ctx.drawImage(imgElement, 0, 0, originalWidth, originalHeight);

      // Convert to blob for processing
      const blob = await new Promise<Blob>((resolve, reject) => {
        tempCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      // Remove background using img.ly
      const resultBlob = await removeBackground(blob, {
        progress: (key, current, total) => {
          console.log(`Processing ${key}: ${Math.round((current / total) * 100)}%`);
        },
      });

      // Create URL from result blob
      const resultUrl = URL.createObjectURL(resultBlob);

      // Load the result as a new image
      const newImg = new Image();
      newImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        newImg.onload = () => resolve();
        newImg.onerror = reject;
        newImg.src = resultUrl;
      });

      // Store original position and scale
      const originalLeft = imageObject.left || 0;
      const originalTop = imageObject.top || 0;
      const originalScaleX = imageObject.scaleX || 1;
      const originalScaleY = imageObject.scaleY || 1;

      // Remove the old image
      canvas.remove(imageObject);

      // Create new fabric image with removed background
      const fabricImg = new FabricImage(newImg, {
        left: originalLeft,
        top: originalTop,
        scaleX: originalScaleX,
        scaleY: originalScaleY,
      });

      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      pushHistory();

      // Clean up the object URL
      URL.revokeObjectURL(resultUrl);

      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const apps = [
    {
      id: 'bg-remover',
      name: 'Remove Background',
      description: 'AI-powered background removal',
      icon: '🖼️',
      action: handleRemoveBackground,
    },
  ];

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Apps</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="editor-input pl-9 w-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={app.action}
              disabled={isProcessing}
              className="flex flex-col items-center p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && app.id === 'bg-remover' ? (
                <Loader2 className="w-12 h-12 mb-2 animate-spin text-primary" />
              ) : (
                <div className="w-20 h-20 mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  <span className="text-3xl">{app.icon}</span>
                </div>
              )}
              <span className="text-sm font-medium text-center">{app.name}</span>
              {isProcessing && app.id === 'bg-remover' && (
                <span className="text-xs text-muted-foreground mt-1">Processing...</span>
              )}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-muted">
          <h4 className="text-sm font-medium mb-2">Background Removal</h4>
          <p className="text-xs text-muted-foreground">
            Powered by img.ly AI. Upload an image and click the Remove Background app to automatically remove the background from your image.
          </p>
        </div>

        {/* More Apps Coming Soon */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-2">More Apps Coming Soon</h4>
          <p className="text-xs text-muted-foreground">
            We're working on bringing more AI-powered tools to enhance your editing experience.
          </p>
        </div>
      </div>
    </div>
  );
};
