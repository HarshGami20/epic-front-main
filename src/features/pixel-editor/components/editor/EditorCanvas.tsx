import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { useEditor, products } from '@pixel/contexts/EditorContext';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@pixel/components/ui/button';
import { cn } from '@pixel/lib/utils';

export const EditorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundImgRef = useRef<FabricImage | null>(null);
  const { 
    canvas, 
    setCanvas, 
    zoom, 
    setZoom,
    setSelectedObject,
    pushHistory,
    setImageLoaded,
    imageLoaded,
    cropState,
    selectionArea,
    setSelectionArea,
    selectedProduct,
    setSelectedProduct,
    setBackgroundImage,
    updateLayers,
    deleteSelectedObject,
    isMobile,
  } = useEditor();

  const [productIndex, setProductIndex] = React.useState(0);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#1a1a1f',
      selection: true,
      preserveObjectStacking: true,
    });

    // Handle selection events - prevent selecting background
    fabricCanvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).isBackground) {
        fabricCanvas.discardActiveObject();
        setSelectedObject(null);
        return;
      }
      setSelectedObject(selected || null);
    });

    fabricCanvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).isBackground) {
        fabricCanvas.discardActiveObject();
        setSelectedObject(null);
        return;
      }
      setSelectedObject(selected || null);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Handle object modifications
    fabricCanvas.on('object:modified', () => {
      pushHistory();
    });

    fabricCanvas.on('object:added', () => {
      updateLayers();
    });

    fabricCanvas.on('object:removed', () => {
      updateLayers();
    });

    setCanvas(fabricCanvas);

    // Auto-select first product
    if (products.length > 0) {
      setSelectedProduct(products[0]);
      setBackgroundImage(products[0].image);
    }

    // Cleanup
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if we're in an input field
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
          return;
        }
        deleteSelectedObject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedObject]);

  // Constrain objects to selection area
  const constrainToSelection = useCallback((obj: any, currentSelectionArea: typeof selectionArea) => {
    if (!currentSelectionArea || (obj as any).isBackground) return;

    // Use scaled dimensions to handle all object types (text, images, stickers, etc.)
    const objWidth = obj.getScaledWidth ? obj.getScaledWidth() : (obj.width || 0) * (obj.scaleX || 1);
    const objHeight = obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || 0) * (obj.scaleY || 1);

    // Account for object origin (center, left, right, etc.)
    const originX = obj.originX || 'left';
    const originY = obj.originY || 'top';

    const originOffsetX =
      originX === 'center' ? objWidth / 2 : originX === 'right' ? objWidth : 0;
    const originOffsetY =
      originY === 'center' ? objHeight / 2 : originY === 'bottom' ? objHeight : 0;

    // Current top-left position in canvas space
    const currentLeft = (obj.left || 0) - originOffsetX;
    const currentTop = (obj.top || 0) - originOffsetY;

    // Calculate allowed bounds with bleed
    const minX = currentSelectionArea.x - currentSelectionArea.bleed;
    const minY = currentSelectionArea.y - currentSelectionArea.bleed;
    const maxX = currentSelectionArea.x + currentSelectionArea.width + currentSelectionArea.bleed - objWidth;
    const maxY = currentSelectionArea.y + currentSelectionArea.height + currentSelectionArea.bleed - objHeight;

    // Constrain position
    const clampedLeft = Math.max(minX, Math.min(maxX, currentLeft));
    const clampedTop = Math.max(minY, Math.min(maxY, currentTop));

    // Convert back from top-left to object origin coordinates
    const newLeft = clampedLeft + originOffsetX;
    const newTop = clampedTop + originOffsetY;

    obj.set({ left: newLeft, top: newTop });
  }, []);

  // Setup object constraints
  useEffect(() => {
    if (!canvas || !selectionArea) return;

    const handleMoving = (e: any) => {
      constrainToSelection(e.target, selectionArea);
      canvas.renderAll();
    };

    const handleScaling = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      
      const objWidth = (obj.width || 0) * (obj.scaleX || 1);
      const objHeight = (obj.height || 0) * (obj.scaleY || 1);
      const maxWidth = selectionArea.width + selectionArea.bleed * 2;
      const maxHeight = selectionArea.height + selectionArea.bleed * 2;
      
      if (objWidth > maxWidth) {
        obj.set({ scaleX: maxWidth / (obj.width || 1) });
      }
      if (objHeight > maxHeight) {
        obj.set({ scaleY: maxHeight / (obj.height || 1) });
      }
    };

    canvas.on('object:moving', handleMoving);
    canvas.on('object:scaling', handleScaling);

    return () => {
      canvas.off('object:moving', handleMoving);
      canvas.off('object:scaling', handleScaling);
    };
  }, [canvas, selectionArea, constrainToSelection]);

  // Mouse wheel zoom (centered on cursor) so zoom affects both image and selection consistently
  useEffect(() => {
    if (!canvas || !canvasRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!canvas) return;

      const delta = e.deltaY;
      let zoomFactor = canvas.getZoom();

      if (delta < 0) {
        zoomFactor *= 1.1;
      } else {
        zoomFactor /= 1.1;
      }

      // Clamp zoom between 10% and 200%
      zoomFactor = Math.max(0.1, Math.min(2, zoomFactor));

      const rect = canvasRef.current!.getBoundingClientRect();
      // Use Fabric's Point class to satisfy type expectations for zoomToPoint
      const point = new (FabricCanvas as any).prototype.constructor.Point(
        e.clientX - rect.left,
        e.clientY - rect.top
      );

      canvas.zoomToPoint(point, zoomFactor);
      setZoom(zoomFactor * 100);
      canvas.renderAll();
    };

    const canvasElement = canvasRef.current;
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvasElement.removeEventListener('wheel', handleWheel as EventListener);
    };
  }, [canvas, setZoom, canvasRef]);

  // Handle window resize
  useEffect(() => {
    if (!canvas || !containerRef.current) return;

    const handleResize = () => {
      const container = containerRef.current!;
      canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      
      // Recalculate selection area if product is loaded
      if (selectedProduct && backgroundImgRef.current) {
        const bgImg = backgroundImgRef.current;
        const imgWidth = (bgImg.width || 0) * (bgImg.scaleX || 1);
        const imgHeight = (bgImg.height || 0) * (bgImg.scaleY || 1);
        
        const selectionX = (bgImg.left || 0) + (imgWidth * selectedProduct.selectionArea.xPercent) / 100;
        const selectionY = (bgImg.top || 0) + (imgHeight * selectedProduct.selectionArea.yPercent) / 100;
        const selectionWidth = (imgWidth * selectedProduct.selectionArea.widthPercent) / 100;
        const selectionHeight = (imgHeight * selectedProduct.selectionArea.heightPercent) / 100;
        
        setSelectionArea({
          x: selectionX,
          y: selectionY,
          width: selectionWidth,
          height: selectionHeight,
          bleed: selectedProduct.bleed,
        });
      }
      
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas, selectedProduct, setSelectionArea]);

  // Load product background image
  useEffect(() => {
    if (!canvas || !selectedProduct) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Remove existing background image
      if (backgroundImgRef.current) {
        canvas.remove(backgroundImgRef.current);
      }

      // Calculate scale to fit canvas with padding
      const padding = 40;
      const maxWidth = canvas.width! - padding * 2;
      const maxHeight = canvas.height! - padding * 2;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      const fabricImg = new FabricImage(img, {
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        excludeFromExport: false,
      });

      // Mark as background
      (fabricImg as any).isBackground = true;

      // Center the image
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;
      fabricImg.set({
        left: (canvas.width! - imgWidth) / 2,
        top: (canvas.height! - imgHeight) / 2,
      });

      // Lock background image
      fabricImg.set({
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: false,
      });

      canvas.add(fabricImg);
      // Move to back - use correct Fabric.js v6 method
      canvas.sendObjectToBack(fabricImg);
      backgroundImgRef.current = fabricImg;

      // Calculate selection area based on product definition
      const selectionX = fabricImg.left! + (imgWidth * selectedProduct.selectionArea.xPercent) / 100;
      const selectionY = fabricImg.top! + (imgHeight * selectedProduct.selectionArea.yPercent) / 100;
      const selectionWidth = (imgWidth * selectedProduct.selectionArea.widthPercent) / 100;
      const selectionHeight = (imgHeight * selectedProduct.selectionArea.heightPercent) / 100;

      setSelectionArea({
        x: selectionX,
        y: selectionY,
        width: selectionWidth,
        height: selectionHeight,
        bleed: selectedProduct.bleed,
      });

      setImageLoaded(true);
      canvas.renderAll();
      updateLayers();
    };

    img.onerror = () => {
      console.error('Failed to load product image:', selectedProduct.image);
    };

    img.src = selectedProduct.image;
  }, [canvas, selectedProduct, setSelectionArea, setImageLoaded, updateLayers]);

  const handlePrevProduct = () => {
    const newIndex = (productIndex - 1 + products.length) % products.length;
    setProductIndex(newIndex);
    setSelectedProduct(products[newIndex]);
    setBackgroundImage(products[newIndex].image);
  };

  const handleNextProduct = () => {
    const newIndex = (productIndex + 1) % products.length;
    setProductIndex(newIndex);
    setSelectedProduct(products[newIndex]);
    setBackgroundImage(products[newIndex].image);
  };

  // Derive current canvas transform for correctly positioning the selection overlay in screen space
  const zoomScale = canvas ? canvas.getZoom() : 1;
  const viewportTransform = (canvas as any)?.viewportTransform as number[] | undefined;
  const offsetX = viewportTransform?.[4] ?? 0;
  const offsetY = viewportTransform?.[5] ?? 0;

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative bg-editor-bg overflow-hidden"
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Loading state when no product selected */}
      {!selectedProduct && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Loading product...
            </h2>
          </div>
        </div>
      )}

      {/* Selection Area Overlay - transformed with canvas zoom/pan so it stays aligned with the image */}
      {selectionArea && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: `${(selectionArea.x - selectionArea.bleed) * zoomScale + offsetX}px`,
            top: `${(selectionArea.y - selectionArea.bleed) * zoomScale + offsetY}px`,
            width: `${(selectionArea.width + selectionArea.bleed * 2) * zoomScale}px`,
            height: `${(selectionArea.height + selectionArea.bleed * 2) * zoomScale}px`,
          }}
        >
          {/* Bleed area (outer) */}
          <div className="absolute inset-0 border-2 border-blue-400/60 border-dashed rounded-sm" />
          {/* Safety area (inner) */}
          <div 
            className="absolute border-2 border-green-400/60 border-dashed rounded-sm" 
            style={{
              left: `${selectionArea.bleed * zoomScale}px`,
              top: `${selectionArea.bleed * zoomScale}px`,
              width: `${selectionArea.width * zoomScale}px`,
              height: `${selectionArea.height * zoomScale}px`,
            }} 
          />
          {/* Corner labels */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-4">
            <span className="text-[10px] text-blue-400 font-medium bg-editor-bg/90 px-1.5 py-0.5 rounded whitespace-nowrap">
              Bleed Area
            </span>
            <span className="text-[10px] text-green-400 font-medium bg-editor-bg/90 px-1.5 py-0.5 rounded whitespace-nowrap">
              Safe Zone
            </span>
          </div>
        </div>
      )}

      {/* Product Selector */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-editor-panel/95 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-lg',
          isMobile ? 'bottom-28' : 'bottom-4'
        )}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={handlePrevProduct}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          {products.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => {
                setProductIndex(idx);
                setSelectedProduct(product);
                setBackgroundImage(product.image);
              }}
              className={cn(
                "w-10 h-10 rounded-lg overflow-hidden border-2 transition-all",
                idx === productIndex 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={handleNextProduct}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Crop overlay */}
      {cropState.isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute border-2 border-primary border-dashed"
            style={{
              left: '10%',
              top: '10%',
              right: '10%',
              bottom: '10%',
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
