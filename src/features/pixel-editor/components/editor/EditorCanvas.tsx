import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas as FabricCanvas, FabricImage, Point } from 'fabric';
import { useEditor, products, type EditableZoneCanvas } from '@pixel/contexts/EditorContext';
import {
  pickCustomizationSlice,
  resolveProductAssetUrl,
  mapEditableAreaToCanvas,
  getCustomizationVariantOptions,
  ROOT_CUSTOMIZATION_VARIANT_ID,
} from '@pixel/lib/productCustomization';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@pixel/components/ui/button';
import { cn } from '@pixel/lib/utils';
import { fitObjectInZone } from '@pixel/lib/canvasZoneFit';
import { bakeTextboxScaleIntoMetrics } from '@pixel/lib/textAdaptiveSizing';

type Mat2D = [number, number, number, number, number, number];

/** Map a scene-space axis-aligned rect to viewport (canvas element) pixels using the current vpt. */
function sceneRectToViewportCss(
  vpt: Mat2D,
  left: number,
  top: number,
  width: number,
  height: number
) {
  const corners = [
    new Point(left, top).transform(vpt),
    new Point(left + width, top).transform(vpt),
    new Point(left, top + height).transform(vpt),
    new Point(left + width, top + height).transform(vpt),
  ];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const l = Math.min(...xs);
  const t = Math.min(...ys);
  return {
    left: l,
    top: t,
    width: Math.max(...xs) - l,
    height: Math.max(...ys) - t,
  };
}

export const EditorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundImgRef = useRef<FabricImage | null>(null);
  /** Loaded mockup `<img>` for natural dimensions on container resize */
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const spacePanRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });
  const textFitListenerAttached = useRef(new WeakSet<object>());
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
    setSelectionArea,
    selectedProduct,
    setSelectedProduct,
    setBackgroundImage,
    updateLayers,
    deleteSelectedObject,
    isMobile,
    editorSource,
    editorProduct,
    selectedVariantId,
    setSelectedVariantId,
    setEditableZones,
    editableZones,
    activeEditableZoneId,
    setActiveEditableZoneId,
    registerFitCanvasHandler,
  } = useEditor();

  const [productIndex, setProductIndex] = React.useState(0);
  /** Bumps when the canvas viewport changes so zone overlays stay aligned while panning/zooming. */
  const [viewportTick, setViewportTick] = React.useState(0);
  const viewportRafRef = useRef<number | null>(null);

  const customizationSlice = useMemo(
    () =>
      editorProduct
        ? pickCustomizationSlice(editorProduct.customization ?? null, selectedVariantId)
        : null,
    [editorProduct, selectedVariantId]
  );

  /** One chip per `customization.variants` entry (ids must match storefront design data). */
  const customizationVariantOptions = useMemo(
    () => getCustomizationVariantOptions(editorProduct),
    [editorProduct]
  );

  const getZoneForObject = useCallback(
    (obj: any): EditableZoneCanvas | null => {
      if (!obj || (obj as any).isBackground) return null;
      const id = (obj as any).editableZoneId as string | undefined;
      if (id) {
        const z = editableZones.find((z) => z.id === id);
        if (z) return z;
      }
      if (activeEditableZoneId) {
        return editableZones.find((z) => z.id === activeEditableZoneId) ?? null;
      }
      return editableZones[0] ?? null;
    },
    [editableZones, activeEditableZoneId]
  );

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#e8ecf1',
      selection: true,
      preserveObjectStacking: true,
    });

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

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorSource !== 'demo') return;
    if (!products.length) return;
    setSelectedProduct((p) => p ?? products[0]);
    setBackgroundImage((b) => b ?? products[0].image);
  }, [editorSource, setSelectedProduct, setBackgroundImage]);

  useEffect(() => {
    if (!editableZones.length) {
      setSelectionArea(null);
      return;
    }
    const active =
      editableZones.find((z) => z.id === activeEditableZoneId) ?? editableZones[0];
    if (active) {
      setSelectionArea({
        x: active.x,
        y: active.y,
        width: active.width,
        height: active.height,
        bleed: active.bleed,
      });
    }
  }, [editableZones, activeEditableZoneId, setSelectionArea]);

  useEffect(() => {
    if (!editableZones.length) {
      setActiveEditableZoneId(null);
      return;
    }
    if (!activeEditableZoneId || !editableZones.some((z) => z.id === activeEditableZoneId)) {
      setActiveEditableZoneId(editableZones[0].id);
    }
  }, [editableZones, activeEditableZoneId, setActiveEditableZoneId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (
          (e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA'
        ) {
          return;
        }
        deleteSelectedObject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedObject]);

  useEffect(() => {
    if (!canvas) return;

    const handleMoving = (e: any) => {
      const obj = e.target;
      const zone = getZoneForObject(obj);
      if (zone) fitObjectInZone(obj, zone);
      canvas.renderAll();
    };

    const handleScaling = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      bakeTextboxScaleIntoMetrics(obj);
      const zone = getZoneForObject(obj);
      if (zone) fitObjectInZone(obj, zone);
      canvas.renderAll();
    };

    const handleRotating = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      const zone = getZoneForObject(obj);
      if (!zone) return;
      fitObjectInZone(obj, zone);
      canvas.renderAll();
    };

    const handleModified = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      bakeTextboxScaleIntoMetrics(obj);
      const zone = getZoneForObject(obj);
      if (zone) fitObjectInZone(obj, zone);
      canvas.renderAll();
    };

    const handleAdded = (e: any) => {
      const obj = e.target as { type?: string; isBackground?: boolean };
      if (!obj || obj.isBackground) return;

      const zone = getZoneForObject(obj);
      if (zone) {
        fitObjectInZone(obj as any, zone);
      }

      const t = obj.type;
      if (
        (t === 'textbox' || t === 'i-text') &&
        !textFitListenerAttached.current.has(obj)
      ) {
        textFitListenerAttached.current.add(obj);
        (obj as any).on('changed', () => {
          const z = getZoneForObject(obj);
          if (z) {
            fitObjectInZone(obj as any, z);
            canvas.requestRenderAll();
          }
        });
      }

      canvas.renderAll();
    };

    canvas.on('object:moving', handleMoving);
    canvas.on('object:scaling', handleScaling);
    canvas.on('object:rotating', handleRotating);
    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleAdded);

    return () => {
      canvas.off('object:moving', handleMoving);
      canvas.off('object:scaling', handleScaling);
      canvas.off('object:rotating', handleRotating);
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleAdded);
    };
  }, [canvas, getZoneForObject]);

  useEffect(() => {
    if (!canvas) return;
    const scheduleOverlaySync = () => {
      if (viewportRafRef.current != null) return;
      viewportRafRef.current = requestAnimationFrame(() => {
        viewportRafRef.current = null;
        setViewportTick((n) => n + 1);
      });
    };
    canvas.on('after:render', scheduleOverlaySync);
    return () => {
      canvas.off('after:render', scheduleOverlaySync);
      if (viewportRafRef.current != null) {
        cancelAnimationFrame(viewportRafRef.current);
        viewportRafRef.current = null;
      }
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const upper = canvas.upperCanvasEl;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomGesture = e.ctrlKey || e.metaKey;

      if (zoomGesture) {
        let zoomFactor = canvas.getZoom();
        if (e.deltaY < 0) zoomFactor *= 1.1;
        else zoomFactor /= 1.1;
        zoomFactor = Math.max(0.1, Math.min(4, zoomFactor));
        const point = canvas.getViewportPoint(e);
        canvas.zoomToPoint(point, zoomFactor);
        setZoom(Math.round(zoomFactor * 100));
      } else {
        canvas.relativePan(new Point(-e.deltaX, -e.deltaY));
      }
      canvas.requestRenderAll();
    };

    upper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      upper.removeEventListener('wheel', handleWheel as EventListener);
    };
  }, [canvas, setZoom]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      spacePanRef.current = true;
      const upper = canvas?.upperCanvasEl;
      if (upper) upper.style.cursor = 'grab';
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      spacePanRef.current = false;
      if (!isPanningRef.current && canvas?.upperCanvasEl) {
        canvas.upperCanvasEl.style.cursor = '';
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const upper = canvas.upperCanvasEl;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1 || (spacePanRef.current && e.button === 0)) {
        e.preventDefault();
        isPanningRef.current = true;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        try {
          upper.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        canvas.selection = false;
        canvas.discardActiveObject();
        setSelectedObject(null);
        upper.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      e.preventDefault();
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      canvas.relativePan(new Point(dx, dy));
      canvas.requestRenderAll();
    };

    const endPan = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      try {
        upper.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      canvas.selection = true;
      upper.style.cursor = spacePanRef.current ? 'grab' : '';
    };

    upper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endPan);
    window.addEventListener('pointercancel', endPan);

    return () => {
      upper.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endPan);
      window.removeEventListener('pointercancel', endPan);
    };
  }, [canvas, setSelectedObject]);

  const recalcDemoSelection = useCallback(() => {
    if (!canvas || !selectedProduct || !backgroundImgRef.current) return;
    const bgImg = backgroundImgRef.current;
    const imgWidth = (bgImg.width || 0) * (bgImg.scaleX || 1);
    const imgHeight = (bgImg.height || 0) * (bgImg.scaleY || 1);

    const selectionX = (bgImg.left || 0) + (imgWidth * selectedProduct.selectionArea.xPercent) / 100;
    const selectionY = (bgImg.top || 0) + (imgHeight * selectedProduct.selectionArea.yPercent) / 100;
    const selectionWidth = (imgWidth * selectedProduct.selectionArea.widthPercent) / 100;
    const selectionHeight = (imgHeight * selectedProduct.selectionArea.heightPercent) / 100;

    const zone: EditableZoneCanvas = {
      id: 'demo',
      label: 'Print area',
      type: 'text',
      x: selectionX,
      y: selectionY,
      width: selectionWidth,
      height: selectionHeight,
      bleed: selectedProduct.bleed,
    };
    setEditableZones([zone]);
  }, [canvas, selectedProduct, setEditableZones]);

  const relayoutFitContainer = useCallback(() => {
    if (!canvas || !containerRef.current) return;
    const container = containerRef.current;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoom(100);

    canvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const bg = backgroundImgRef.current;
    const src = sourceImgRef.current;
    if (!bg || !src) {
      canvas.requestRenderAll();
      return;
    }

    const padding = 40;
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    const maxW = Math.max(1, cw - padding * 2);
    const maxH = Math.max(1, ch - padding * 2);
    const nw = src.naturalWidth || src.width;
    const nh = src.naturalHeight || src.height;
    const scale = Math.min(maxW / nw, maxH / nh, 1);
    const imgW = nw * scale;
    const imgH = nh * scale;
    const newLeft = (cw - imgW) / 2;
    const newTop = (ch - imgH) / 2;

    const oldLeft = bg.left ?? 0;
    const oldTop = bg.top ?? 0;
    const oldW = (bg.width ?? 0) * (bg.scaleX ?? 1);
    const oldH = (bg.height ?? 0) * (bg.scaleY ?? 1);
    const r = oldW > 0 && oldH > 0 ? imgW / oldW : 1;

    for (const obj of canvas.getObjects()) {
      if ((obj as any).isBackground) continue;
      obj.set({
        left: newLeft + ((obj.left ?? 0) - oldLeft) * r,
        top: newTop + ((obj.top ?? 0) - oldTop) * r,
        scaleX: (obj.scaleX ?? 1) * r,
        scaleY: (obj.scaleY ?? 1) * r,
      });
      obj.setCoords?.();
    }

    bg.set({
      scaleX: scale,
      scaleY: scale,
      left: newLeft,
      top: newTop,
    });

    if (editorSource === 'demo' && selectedProduct) {
      recalcDemoSelection();
    } else if (editorSource === 'product' && customizationSlice) {
      const zones: EditableZoneCanvas[] = customizationSlice.editableAreas.map((area) => {
        const m = mapEditableAreaToCanvas(area, newLeft, newTop, imgW, imgH);
        return {
          id: area.id,
          label: area.label,
          type: area.type,
          x: m.x,
          y: m.y,
          width: m.width,
          height: m.height,
          bleed: 0,
          maxLength: area.maxLength,
          fontSize: area.fontSize,
          textColor: area.textColor,
          fontFamily: area.fontFamily,
          rotation: area.rotation,
        };
      });
      setEditableZones(zones);
    }

    canvas.requestRenderAll();
    updateLayers();
  }, [
    canvas,
    setZoom,
    editorSource,
    selectedProduct,
    customizationSlice,
    recalcDemoSelection,
    setEditableZones,
    updateLayers,
  ]);

  useEffect(() => {
    registerFitCanvasHandler(() => relayoutFitContainer);
    return () => registerFitCanvasHandler(null);
  }, [registerFitCanvasHandler, relayoutFitContainer]);

  useEffect(() => {
    if (!canvas || !containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      if (!backgroundImgRef.current || !sourceImgRef.current) {
        canvas.setDimensions({
          width: el.clientWidth,
          height: el.clientHeight,
        });
        canvas.requestRenderAll();
        return;
      }
      relayoutFitContainer();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas, relayoutFitContainer]);

  useEffect(() => {
    if (!canvas) return;

    if (editorSource === 'product' && customizationSlice) {
      setImageLoaded(false);
      const url = resolveProductAssetUrl(customizationSlice.baseImage);
      setBackgroundImage(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.getObjects().slice().forEach((o) => canvas.remove(o));
        backgroundImgRef.current = null;
        sourceImgRef.current = img;

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

        (fabricImg as any).isBackground = true;

        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        fabricImg.set({
          left: (canvas.width! - imgWidth) / 2,
          top: (canvas.height! - imgHeight) / 2,
        });

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
        canvas.sendObjectToBack(fabricImg);
        backgroundImgRef.current = fabricImg;

        const zones: EditableZoneCanvas[] = customizationSlice.editableAreas.map((area) => {
          const m = mapEditableAreaToCanvas(
            area,
            fabricImg.left!,
            fabricImg.top!,
            imgWidth,
            imgHeight
          );
          return {
            id: area.id,
            label: area.label,
            type: area.type,
            x: m.x,
            y: m.y,
            width: m.width,
            height: m.height,
            bleed: 0,
            maxLength: area.maxLength,
            fontSize: area.fontSize,
            textColor: area.textColor,
            fontFamily: area.fontFamily,
            rotation: area.rotation,
          };
        });
        setEditableZones(zones);

        setImageLoaded(true);
        canvas.renderAll();
        updateLayers();
      };

      img.onerror = () => {
        console.error('Failed to load product customization image:', url);
      };

      img.src = url;
      return;
    }

    if (editorSource === 'demo' && selectedProduct) {
      setImageLoaded(false);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.getObjects().slice().forEach((o) => canvas.remove(o));
        backgroundImgRef.current = null;
        sourceImgRef.current = img;

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

        (fabricImg as any).isBackground = true;

        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        fabricImg.set({
          left: (canvas.width! - imgWidth) / 2,
          top: (canvas.height! - imgHeight) / 2,
        });

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
        canvas.sendObjectToBack(fabricImg);
        backgroundImgRef.current = fabricImg;

        const selectionX =
          fabricImg.left! + (imgWidth * selectedProduct.selectionArea.xPercent) / 100;
        const selectionY =
          fabricImg.top! + (imgHeight * selectedProduct.selectionArea.yPercent) / 100;
        const selectionWidth = (imgWidth * selectedProduct.selectionArea.widthPercent) / 100;
        const selectionHeight = (imgHeight * selectedProduct.selectionArea.heightPercent) / 100;

        setEditableZones([
          {
            id: 'demo',
            label: 'Print area',
            type: 'text',
            x: selectionX,
            y: selectionY,
            width: selectionWidth,
            height: selectionHeight,
            bleed: selectedProduct.bleed,
          },
        ]);

        setImageLoaded(true);
        canvas.renderAll();
        updateLayers();
      };

      img.onerror = () => {
        console.error('Failed to load product image:', selectedProduct.image);
      };

      img.src = selectedProduct.image;
    }
  }, [
    canvas,
    editorSource,
    customizationSlice,
    selectedProduct,
    setBackgroundImage,
    setEditableZones,
    setImageLoaded,
    updateLayers,
    selectedVariantId,
  ]);

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

  void viewportTick;

  return (
    <div ref={containerRef} className="flex-1 relative bg-editor-bg overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {imageLoaded && (
        <p className="pointer-events-none absolute bottom-3 left-3 z-10 hidden max-w-[min(240px,45vw)] text-[10px] leading-snug text-muted-foreground/85 sm:block">
          Scroll to pan · Ctrl/⌘ + scroll to zoom · Space-drag or middle-click to pan
        </p>
      )}

      {!selectedProduct && editorSource === 'demo' && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading product...</h2>
          </div>
        </div>
      )}

      {editorSource === 'product' && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading design...</h2>
          </div>
        </div>
      )}

      {editableZones.map((zone) => {
        const bleed = zone.bleed;
        const vpt = canvas?.viewportTransform as Mat2D | undefined;
        const outer =
          canvas && vpt
            ? sceneRectToViewportCss(vpt, zone.x - bleed, zone.y - bleed, zone.width + bleed * 2, zone.height + bleed * 2)
            : { left: 0, top: 0, width: 0, height: 0 };
        const inner =
          canvas && vpt
            ? sceneRectToViewportCss(vpt, zone.x, zone.y, zone.width, zone.height)
            : { left: 0, top: 0, width: 0, height: 0 };
        const labelPos =
          canvas && vpt
            ? new Point(zone.x + zone.width / 2, zone.y).transform(vpt)
            : new Point(0, 0);

        return (
          <div
            key={zone.id}
            className="absolute pointer-events-none"
            style={{
              left: `${outer.left}px`,
              top: `${outer.top}px`,
              width: `${outer.width}px`,
              height: `${outer.height}px`,
            }}
          >
            <div
              className={cn(
                'absolute inset-0 border-2 border-dashed rounded-sm',
                zone.type === 'text' ? 'border-sky-400/70' : 'border-emerald-400/70'
              )}
            />
            <div
              className="absolute border-2 border-dashed rounded-sm border-white/40"
              style={{
                left: `${inner.left - outer.left}px`,
                top: `${inner.top - outer.top}px`,
                width: `${inner.width}px`,
                height: `${inner.height}px`,
              }}
            />
            <span
              className={cn(
                'absolute text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap bg-editor-bg/90',
                zone.type === 'text' ? 'text-sky-400' : 'text-emerald-400'
              )}
              style={{
                left: `${labelPos.x - outer.left}px`,
                top: `${labelPos.y - outer.top - 20}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {zone.label}
            </span>
          </div>
        );
      })}

      {editorSource === 'demo' && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-editor-panel/95 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-lg',
            isMobile ? 'bottom-28' : 'bottom-4'
          )}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrevProduct}>
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
                  'w-10 h-10 rounded-lg overflow-hidden border-2 transition-all',
                  idx === productIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNextProduct}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {editorSource === 'product' && customizationVariantOptions.length > 1 && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 max-w-[95vw] bg-editor-panel/95 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-lg',
            isMobile ? 'bottom-28' : 'bottom-4'
          )}
        >
          {customizationVariantOptions.map((v) => {
            const isRoot = v.id === ROOT_CUSTOMIZATION_VARIANT_ID;
            const chipSelected =
              (isRoot && selectedVariantId === null) ||
              (!isRoot && selectedVariantId === v.id);
            return (
            <button
              key={v.id || 'root'}
              type="button"
              onClick={() => setSelectedVariantId(isRoot ? null : v.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                chipSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {v.colorCode ? (
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                  style={{ backgroundColor: v.colorCode }}
                  aria-hidden
                />
              ) : null}
              {!v.colorCode && v.colorImage ? (
                <img
                  src={resolveProductAssetUrl(v.colorImage)}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-border shrink-0"
                />
              ) : null}
              <span>{v.label}</span>
            </button>
          );
          })}
        </div>
      )}

      {editorSource === 'product' && editableZones.length > 1 && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 flex flex-wrap gap-2 justify-center max-w-[95vw]',
            customizationVariantOptions.length > 1 ? (isMobile ? 'bottom-48' : 'bottom-20') : isMobile ? 'bottom-28' : 'bottom-4'
          )}
        >
          {editableZones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setActiveEditableZoneId(z.id)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] border transition-colors',
                activeEditableZoneId === z.id
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border bg-editor-panel/90 text-muted-foreground hover:text-foreground'
              )}
            >
              {z.label}{' '}
              <span className="opacity-70">({z.type})</span>
            </button>
          ))}
        </div>
      )}

      {cropState.isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-slate-900/35" />
          <div
            className="absolute border-2 border-primary border-dashed"
            style={{
              left: '10%',
              top: '10%',
              right: '10%',
              bottom: '10%',
            }}
          >
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
