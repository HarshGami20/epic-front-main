import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas as FabricCanvas, FabricImage, Point, Textbox, Rect, type FabricObject } from 'fabric';
import { useEditor, products, type EditableZoneCanvas } from '@pixel/contexts/EditorContext';
import {
  resolveProductAssetUrl,
  mapEditableAreaToCanvas,
  getCustomizationVariantOptions,
  ROOT_CUSTOMIZATION_VARIANT_ID,
} from '@pixel/lib/productCustomization';
import { ChevronLeft, ChevronRight, ImageIcon, Type } from 'lucide-react';
import { Button } from '@pixel/components/ui/button';
import { cn } from '@pixel/lib/utils';
import { fitObjectInZone } from '@pixel/lib/canvasZoneFit';
import { bakeTextboxScaleIntoMetrics, fitSingleLineTextInZone } from '@pixel/lib/textAdaptiveSizing';

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
    customizationSlice,
    customizationDesignSize,
    usesStyleVariants,
    setEditableZones,
    editableZones,
    activeEditableZoneId,
    setActiveEditableZoneId,
    registerFitCanvasHandler,
  } = useEditor();

  const [productIndex, setProductIndex] = React.useState(0);
  const [canvasScale, setCanvasScale] = React.useState(1);
  const [logicalSize, setLogicalSize] = React.useState({ width: 520, height: 520 });
  /** Bumps when the canvas viewport changes so zone overlays stay aligned while panning/zooming. */
  /** Bumps on every Fabric `after:render` so zone overlays stay in sync with pan/zoom (no rAF delay). */
  const [viewportTick, setViewportTick] = React.useState(0);

  const customizationVariantOptions = useMemo(
    () => getCustomizationVariantOptions(editorProduct),
    [editorProduct]
  );

  const showColorVariantBar =
    editorSource === 'product' && customizationVariantOptions.length > 1 && !usesStyleVariants;
  const showZoneStrip = false;

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
      allowTouchScrolling: true,
    });
    fabricCanvas.upperCanvasEl.classList.add('editor-fabric-upper');
    fabricCanvas.lowerCanvasEl.classList.add('editor-fabric-upper');

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

    const constrainImageInZone = (obj: FabricObject, zone: any) => {
      if ((obj as { isBackground?: boolean }).isBackground) return;
      obj.setCoords();
      const br = obj.getBoundingRect();

      const bleed = zone.bleed ?? 0;
      const minX = zone.x - bleed;
      const minY = zone.y - bleed;
      const maxX = zone.x + zone.width + bleed;
      const maxY = zone.y + zone.height + bleed;

      const overlap = 20; // Maintain at least 20px overlap
      let dx = 0;
      let dy = 0;

      if (br.left + br.width < minX + overlap) {
        dx = (minX + overlap) - (br.left + br.width);
      } else if (br.left > maxX - overlap) {
        dx = (maxX - overlap) - br.left;
      }

      if (br.top + br.height < minY + overlap) {
        dy = (minY + overlap) - (br.top + br.height);
      } else if (br.top > maxY - overlap) {
        dy = (maxY - overlap) - br.top;
      }

      if (dx !== 0 || dy !== 0) {
        obj.set({
          left: (obj.left ?? 0) + dx,
          top: (obj.top ?? 0) + dy,
        });
        obj.setCoords();
      }
    };

    const applyClipPathToObject = (obj: any, zone: EditableZoneCanvas) => {
      if (obj.type === 'image') {
        obj.set({
          clipPath: new Rect({
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
            absolutePositioned: true,
          }),
        });
      }
    };

    const fitObjInExactArea = (obj: any, zone: EditableZoneCanvas) => {
      const tf = zone.textFields?.find(f => f.id === obj.textFieldId);
      if (tf) {
        fitObjectInZone(obj, { x: tf.x, y: tf.y, width: tf.width, height: tf.height, bleed: 0 });
      } else {
        if (obj.type === 'image') {
          constrainImageInZone(obj, zone);
        } else {
          fitObjectInZone(obj, zone);
        }
      }
    };

    const handleMoving = (e: any) => {
      const obj = e.target;
      const zone = getZoneForObject(obj);
      if (zone) fitObjInExactArea(obj, zone);
      canvas.renderAll();
    };

    const handleScaling = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      bakeTextboxScaleIntoMetrics(obj);
      const zone = getZoneForObject(obj);
      if (zone) fitObjInExactArea(obj, zone);
      canvas.renderAll();
    };

    const handleRotating = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      const zone = getZoneForObject(obj);
      if (!zone) return;
      fitObjInExactArea(obj, zone);
      canvas.renderAll();
    };

    const handleModified = (e: any) => {
      const obj = e.target;
      if (!obj || (obj as any).isBackground) return;
      bakeTextboxScaleIntoMetrics(obj);
      const zone = getZoneForObject(obj);
      if (zone) {
        fitObjInExactArea(obj, zone);
      }
      canvas.renderAll();
    };

    const handleAdded = (e: any) => {
      const obj = e.target as { type?: string; isBackground?: boolean };
      if (!obj || obj.isBackground) return;

      if (obj.type === 'image') {
        (obj as any).setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
        });
      }

      const zone = getZoneForObject(obj);
      if (zone) {
        applyClipPathToObject(obj, zone);
        fitObjInExactArea(obj as any, zone);
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
            let currentText = String((obj as any).text || '').replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ');
            let modified = /[\r\n\u2028\u2029]/.test(String((obj as any).text || ''));

            const tf = z.textFields?.find(f => f.id === (obj as any).textFieldId);
            const effMaxLength = tf?.maxLength ?? z.maxLength;
            const effMaxWords = tf?.maxWords ?? z.maxWords;

            if (effMaxLength && currentText.length > effMaxLength) {
              currentText = currentText.substring(0, effMaxLength);
              modified = true;
            }

            if (effMaxWords) {
              const words = currentText.split(/\s+/) as string[];
              if (words.length > effMaxWords) {
                const match = currentText.match(new RegExp(`^\\s*(?:\\S+\\s+){0,${effMaxWords - 1}}\\S+`));
                if (match) {
                  currentText = match[0];
                } else {
                  currentText = words.slice(0, effMaxWords).join(' ');
                }
                modified = true;
              }
            }

            if (modified) {
              (obj as any).set('text', currentText);
              if ((obj as any).hiddenTextarea) {
                (obj as any).hiddenTextarea.value = currentText;
              }
            }

            fitObjInExactArea(obj as any, z);
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

    let active = true;
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (!active || !canvas) return;
        canvas.getObjects().forEach((obj) => {
          if (obj.type === 'textbox' || obj.type === 'i-text') {
            const z = getZoneForObject(obj);
            if (z) {
              fitObjInExactArea(obj, z);
            }
          }
        });
        canvas.requestRenderAll();
      });
    }

    return () => {
      active = false;
      canvas.off('object:moving', handleMoving);
      canvas.off('object:scaling', handleScaling);
      canvas.off('object:rotating', handleRotating);
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleAdded);
    };
  }, [canvas, getZoneForObject]);

  useEffect(() => {
    if (!canvas) return;
    const syncOverlays = () => {
      setViewportTick((n) => n + 1);
    };
    canvas.on('after:render', syncOverlays);
    return () => {
      canvas.off('after:render', syncOverlays);
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
        zoomFactor = Math.max(1, Math.min(4, zoomFactor));
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
    let initialTouchDistance = 0;
    let lastPanPos = { x: 0, y: 0 };
    let isTouchPanning = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialTouchDistance = Math.sqrt(dx * dx + dy * dy);

        lastPanPos = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        isTouchPanning = true;
        canvas.selection = false;
        canvas.discardActiveObject();
        setSelectedObject(null);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isTouchPanning) {
        e.preventDefault();

        // Handle Pan
        const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const panX = currentMidX - lastPanPos.x;
        const panY = currentMidY - lastPanPos.y;
        lastPanPos = { x: currentMidX, y: currentMidY };
        canvas.relativePan(new Point(panX, panY));

        // Handle Zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        if (initialTouchDistance > 0) {
          const scaleDiff = currentDistance / initialTouchDistance;
          let newZoom = canvas.getZoom() * scaleDiff;
          newZoom = Math.max(1, Math.min(4, newZoom));

          const point = new Point(currentMidX, currentMidY);
          canvas.zoomToPoint(point, newZoom);
          setZoom(Math.round(newZoom * 100));
        }
        initialTouchDistance = currentDistance;

        canvas.requestRenderAll();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isTouchPanning = false;
        canvas.selection = true;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by touch events
      if (e.button === 1 || (spacePanRef.current && e.button === 0)) {
        e.preventDefault();
        isPanningRef.current = true;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        try {
          upper.setPointerCapture(e.pointerId);
        } catch { }
        canvas.selection = false;
        canvas.discardActiveObject();
        setSelectedObject(null);
        upper.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !isPanningRef.current) return;
      e.preventDefault();
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      canvas.relativePan(new Point(dx, dy));
      canvas.requestRenderAll();
    };

    const endPan = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      try {
        upper.releasePointerCapture(e.pointerId);
      } catch { }
      canvas.selection = true;
      upper.style.cursor = spacePanRef.current ? 'grab' : '';
    };

    upper.addEventListener('touchstart', onTouchStart, { passive: false });
    upper.addEventListener('touchmove', onTouchMove, { passive: false });
    upper.addEventListener('touchend', onTouchEnd);
    upper.addEventListener('touchcancel', onTouchEnd);

    upper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endPan);
    window.addEventListener('pointercancel', endPan);

    return () => {
      upper.removeEventListener('touchstart', onTouchStart);
      upper.removeEventListener('touchmove', onTouchMove);
      upper.removeEventListener('touchend', onTouchEnd);
      upper.removeEventListener('touchcancel', onTouchEnd);

      upper.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endPan);
      window.removeEventListener('pointercancel', endPan);
    };
  }, [canvas, setSelectedObject, setZoom]);

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

    const isMobileDevice = container.clientWidth < 520;
    const cw = isMobileDevice ? 520 : container.clientWidth;
    const ch = isMobileDevice ? 520 : container.clientHeight;

    setLogicalSize({ width: cw, height: ch });
    setCanvasScale(isMobileDevice ? container.clientWidth / 520 : 1);

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoom(100);

    canvas.setDimensions({
      width: cw,
      height: ch,
    });

    const bg = backgroundImgRef.current;
    const src = sourceImgRef.current;
    if (!bg || !src) {
      canvas.requestRenderAll();
      return;
    }

    const padding = isMobile ? 0 : 10;
    const maxW = Math.max(1, cw - padding * 2);
    const maxH = Math.max(1, ch - padding * 2);
    const nw = src.naturalWidth || src.width;
    const nh = src.naturalHeight || src.height;
    const scale = Math.min(maxW / nw, maxH / nh);
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
      const mappedZones: EditableZoneCanvas[] = customizationSlice.editableAreas.map((area) => {
        const m = mapEditableAreaToCanvas(
          area,
          newLeft,
          newTop,
          imgW,
          imgH,
          customizationDesignSize.width,
          customizationDesignSize.height
        );
        const mappedTextFields = area.textFields?.map(tf => {
          const tfM = mapEditableAreaToCanvas(
            tf as any,
            newLeft,
            newTop,
            imgW,
            imgH,
            customizationDesignSize.width,
            customizationDesignSize.height
          );
          return {
            ...tf,
            x: tfM.x,
            y: tfM.y,
            width: tfM.width,
            height: tfM.height,
          };
        });
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
          maxWords: area.maxWords,
          maxElements: area.maxElements,
          allowedColors: area.allowedColors,
          allowedFonts: area.allowedFonts,
          fontSize: area.fontSize,
          textColor: area.textColor,
          fontFamily: area.fontFamily,
          rotation: area.rotation,
          textFields: mappedTextFields,
        };
      });
      setEditableZones(mappedZones);

      canvas.getObjects().forEach((obj) => {
        if ((obj as any).isBackground) return;
        const zoneId = (obj as any).editableZoneId;
        if (!zoneId) return;
        const z = mappedZones.find((item: EditableZoneCanvas) => item.id === zoneId);
        if (z && obj.type === 'image') {
          obj.set({
            clipPath: new Rect({
              left: z.x,
              top: z.y,
              width: z.width,
              height: z.height,
              absolutePositioned: true,
            }),
          });
        }
      });
    }

    if (editorSource === 'demo') {
      canvas.getObjects().forEach((obj) => {
        if ((obj as any).isBackground) return;
        const zoneId = (obj as any).editableZoneId;
        if (!zoneId) return;
        const z = editableZones.find((item: EditableZoneCanvas) => item.id === zoneId);
        if (z && obj.type === 'image') {
          obj.set({
            clipPath: new Rect({
              left: z.x,
              top: z.y,
              width: z.width,
              height: z.height,
              absolutePositioned: true,
            }),
          });
        }
      });
    }

    canvas.requestRenderAll();
    updateLayers();
  }, [
    canvas,
    setZoom,
    editorSource,
    selectedProduct,
    customizationSlice,
    customizationDesignSize,
    recalcDemoSelection,
    setEditableZones,
    updateLayers,
    isMobile,
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
        const isMobileDevice = el.clientWidth < 520;
        const cw = isMobileDevice ? 520 : el.clientWidth;
        const ch = isMobileDevice ? 520 : el.clientHeight;
        setLogicalSize({ width: cw, height: ch });
        setCanvasScale(isMobileDevice ? el.clientWidth / 520 : 1);
        canvas.setDimensions({
          width: cw,
          height: ch,
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

        const padding = isMobile ? 0 : 10;
        const maxWidth = canvas.width! - padding * 2;
        const maxHeight = canvas.height! - padding * 2;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

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
            imgHeight,
            customizationDesignSize.width,
            customizationDesignSize.height
          );
          const mappedTextFields = area.textFields?.map(tf => {
            const tfM = mapEditableAreaToCanvas(
              tf as any,
              fabricImg.left!,
              fabricImg.top!,
              imgWidth,
              imgHeight,
              customizationDesignSize.width,
              customizationDesignSize.height
            );
            return {
              ...tf,
              x: tfM.x,
              y: tfM.y,
              width: tfM.width,
              height: tfM.height,
            };
          });
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
            maxWords: area.maxWords,
            maxElements: area.maxElements,
            allowedColors: area.allowedColors,
            allowedFonts: area.allowedFonts,
            fontSize: area.fontSize,
            textColor: area.textColor,
            fontFamily: area.fontFamily,
            rotation: area.rotation,
            textFields: mappedTextFields,
          };
        });
        setEditableZones(zones);

        zones.forEach((zone) => {
          if (zone.type === 'text') {
            if (zone.textFields && zone.textFields.length > 0) {
              zone.textFields.forEach((tf) => {
                // Auto-fit: derive max font size from the field's own height (not admin-set fontSize).
                // Binary search in fitSingleLineTextInZone will grow short text to fill
                // the full area and shrink long text automatically.
                const autoMaxFontSize = Math.max(8, Math.floor(tf.height * 0.85));
                const text = new Textbox(tf.text || tf.label || 'Text', {
                  left: tf.x + tf.width / 2,
                  top: tf.y + tf.height / 2,
                  originX: 'center',
                  originY: 'center',
                  fontSize: autoMaxFontSize,
                  fontFamily: tf.fontFamily || zone.fontFamily || 'Arial',
                  fill: tf.textColor || zone.textColor || '#000000',
                  width: tf.width,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  splitByGrapheme: false,
                  dynamicMinWidth: 0,
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                  hasControls: false,
                  editable: false,
                  selectable: false,
                  evented: false,
                });
                (text as any).editableZoneId = zone.id;
                (text as any).textFieldId = tf.id;
                (text as any).zoneMaxFontSize = autoMaxFontSize;
                canvas.add(text);
                fitSingleLineTextInZone(text, { width: tf.width, height: tf.height }, autoMaxFontSize);
                fitObjectInZone(text, { x: tf.x, y: tf.y, width: tf.width, height: tf.height, bleed: 0 });
              });
            } else {
              // Auto-fit: derive max font size from zone height — no admin fontSize needed.
              const autoMaxFontSize = Math.max(8, Math.floor(zone.height * 0.85));
              const text = new Textbox(zone.label || 'Text', {
                left: zone.x + zone.width / 2,
                top: zone.y + zone.height / 2,
                originX: 'center',
                originY: 'center',
                fontSize: autoMaxFontSize,
                fontFamily: zone.fontFamily || 'Arial',
                fill: zone.textColor || '#000000',
                width: zone.width,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                splitByGrapheme: false,
                dynamicMinWidth: 0,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: false,
                editable: false,
                selectable: false,
                evented: false,
              });
              (text as any).editableZoneId = zone.id;
              (text as any).zoneMaxFontSize = autoMaxFontSize;
              canvas.add(text);
              fitSingleLineTextInZone(text, { width: zone.width, height: zone.height }, autoMaxFontSize);
              fitObjectInZone(text, zone);
            }
          }
        });

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
    customizationDesignSize,
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
    <div ref={containerRef} className="flex-1 relative bg-editor-bg overflow-hidden min-h-0 touch-pan-y flex items-center justify-center">
      <div
        style={{
          width: logicalSize.width,
          height: logicalSize.height,
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />

        {editableZones.map((zone) => {
          const bleed = zone.bleed;
          const vpt = canvas?.viewportTransform as Mat2D | undefined;
          const isZoneActive = zone.id === activeEditableZoneId;
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

          const tone =
            zone.type === 'text'
              ? 'shadow-[0_0_0_1px_hsl(var(--editor-zone-text)/0.35)]'
              : 'shadow-[0_0_0_1px_hsl(var(--editor-zone-image)/0.35)]';

          return (
            <div
              key={zone.id}
              className="absolute pointer-events-none z-[5]"
              style={{
                left: `${outer.left}px`,
                top: `${outer.top}px`,
                width: `${outer.width}px`,
                height: `${outer.height}px`,
              }}
            >
              <div
                className={cn(
                  'absolute inset-0 ',
                  bleed > 0 ? 'border border-dashed border-foreground/15 bg-foreground/[0.02]' : 'opacity-0'
                )}
              />
              <div
                className={cn(
                  'absolute ',
                  tone,
                  isZoneActive
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-100 bg-primary/8 shadow-md'
                    : zone.type === 'text'
                      ? 'bg-red-500/[0.07] border-2 border-dashed border-sky-500/50'
                      : 'bg-emerald-500/[0.07] border-2 border-dashed border-emerald-500/50'
                )}
                style={{
                  left: `${inner.left - outer.left}px`,
                  top: `${inner.top - outer.top}px`,
                  width: `${inner.width}px`,
                  height: `${inner.height}px`,
                }}
              />
              {isZoneActive && (
                <div
                  className={cn(
                    'absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-sm flex items-center gap-1 uppercase tracking-wide whitespace-nowrap',
                    zone.type === 'text' ? 'bg-sky-500' : 'bg-emerald-500'
                  )}
                  style={{
                    left: `${labelPos.x - outer.left}px`,
                    top: `${labelPos.y - outer.top - 20}px`,
                  }}
                >
                  {zone.type === 'text' ? <Type className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                  <span>{zone.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

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


      {editorSource === 'demo' && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 bg-editor-panel/95 backdrop-blur-md rounded-full px-2 sm:px-4 py-2 border border-border shadow-lg max-w-[calc(100vw-1rem)]',
            isMobile ? 'bottom-3' : 'bottom-4'
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

      {showColorVariantBar && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-[calc(100vw-0.75rem)] bg-editor-panel/95 backdrop-blur-md rounded-2xl px-2 sm:px-4 py-2 border border-border shadow-lg',
            showZoneStrip ? (isMobile ? 'bottom-[4.25rem]' : 'bottom-16') : isMobile ? 'bottom-3' : 'bottom-4'
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
                  'inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] px-3 sm:min-h-0 sm:py-1.5',
                  chipSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-[0.98]'
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

      {showZoneStrip && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-20 flex flex-wrap gap-2 justify-center max-w-[calc(100vw-0.75rem)] px-1',
            isMobile ? 'bottom-3' : 'bottom-4'
          )}
        >
          <div className="flex  flex-wrap justify-center gap-2 rounded-sm bg-editor-panel/95 backdrop-blur-md border border-border shadow-lg p-0.5">
            <span className="sr-only">Print areas — tap to choose where you edit</span>
            {editableZones.map((z) => {
              const active = activeEditableZoneId === z.id;
              const Icon = z.type === 'text' ? Type : ImageIcon;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setActiveEditableZoneId(z.id)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-sm p-0 border-2 text-left transition-all min-h-[48px] px-3 sm:min-h-[40px] active:scale-[0.98]',
                    active
                      ? 'border-primary bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]'
                      : 'border-border bg-background/90 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm',
                      z.type === 'text' ? 'bg-sky-500/15 text-sky-600' : 'bg-emerald-500/15 text-emerald-700'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold leading-tight truncate max-w-[9rem] sm:max-w-[11rem]">
                      {z.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">
                      {z.type === 'text' ? 'Text layer' : 'Image layer'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
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
