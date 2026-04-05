import React from 'react';
import { X, Square, Circle, Minus, Triangle, Star, Hexagon } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { fitObjectInZone } from '@pixel/lib/canvasZoneFit';
import { Button } from '@pixel/components/ui/button';
import { Input } from '@pixel/components/ui/input';
import { Slider } from '@pixel/components/ui/slider';
import { Rect, Circle as FabricCircle, Line, Triangle as FabricTriangle, Polygon } from 'fabric';

interface ShapeConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const shapes: ShapeConfig[] = [
  { id: 'rectangle', name: 'Rectangle', icon: <Square className="w-6 h-6" /> },
  { id: 'circle', name: 'Circle', icon: <Circle className="w-6 h-6" /> },
  { id: 'line', name: 'Line', icon: <Minus className="w-6 h-6" /> },
  { id: 'triangle', name: 'Triangle', icon: <Triangle className="w-6 h-6" /> },
  { id: 'star', name: 'Star', icon: <Star className="w-6 h-6" /> },
  { id: 'hexagon', name: 'Hexagon', icon: <Hexagon className="w-6 h-6" /> },
];

export const ShapesPanel: React.FC = () => {
  const {
    setActiveTool,
    canvas,
    pushHistory,
    selectedObject,
    selectionArea,
    updateLayers,
    isMobile,
    setIsPanelOpen,
    activeEditableZoneId,
    editableZones,
  } = useEditor();
  const [fillColor, setFillColor] = React.useState('#3b82f6');
  const [strokeColor, setStrokeColor] = React.useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = React.useState(2);
  const [opacity, setOpacity] = React.useState(100);

  const handleClose = () => {
    setActiveTool(null);
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const createPolygonPoints = (sides: number, radius: number): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const angle = (2 * Math.PI) / sides;
    for (let i = 0; i < sides; i++) {
      points.push({
        x: radius * Math.cos(angle * i - Math.PI / 2),
        y: radius * Math.sin(angle * i - Math.PI / 2),
      });
    }
    return points;
  };

  const createStarPoints = (points: number, outerRadius: number, innerRadius: number): { x: number; y: number }[] => {
    const result: { x: number; y: number }[] = [];
    const angle = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      result.push({
        x: radius * Math.cos(angle * i - Math.PI / 2),
        y: radius * Math.sin(angle * i - Math.PI / 2),
      });
    }
    return result;
  };

  const addShape = (shapeId: string) => {
    if (!canvas) return;

    // Position in selection area if available
    let centerX = canvas.width! / 2;
    let centerY = canvas.height! / 2;
    let maxSize = 100;

    if (selectionArea) {
      centerX = selectionArea.x + selectionArea.width / 2;
      centerY = selectionArea.y + selectionArea.height / 2;
      maxSize = Math.min(selectionArea.width, selectionArea.height) * 0.3;
    }

    const size = Math.min(maxSize, 80);
    let shape;

    switch (shapeId) {
      case 'rectangle':
        shape = new Rect({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: size * 1.2,
          height: size,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Rectangle';
        break;
      case 'circle':
        shape = new FabricCircle({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          radius: size / 2,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Circle';
        break;
      case 'line':
        shape = new Line([centerX - size/2, centerY, centerX + size/2, centerY], {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Line';
        break;
      case 'triangle':
        shape = new FabricTriangle({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: size,
          height: size * 0.86,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Triangle';
        break;
      case 'star':
        shape = new Polygon(createStarPoints(5, size/2, size/4), {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Star';
        break;
      case 'hexagon':
        shape = new Polygon(createPolygonPoints(6, size/2), {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity / 100,
        });
        (shape as any).customName = 'Hexagon';
        break;
    }

    if (shape) {
      const zone =
        editableZones.find((z) => z.id === activeEditableZoneId) ?? editableZones[0];
      if (zone) {
        (shape as any).editableZoneId = zone.id;
      }
      canvas.add(shape);
      if (zone) {
        fitObjectInZone(shape, zone);
      }
      canvas.setActiveObject(shape);
      canvas.renderAll();
      pushHistory();
      updateLayers();
      if (isMobile) {
        setIsPanelOpen(false);
      }
    }
  };

  const updateSelectedShape = (property: string, value: any) => {
    if (!canvas || !selectedObject) return;

    selectedObject.set(property as any, value);
    canvas.renderAll();
    pushHistory();
  };

  const isShapeSelected = selectedObject && ['rect', 'circle', 'line', 'triangle', 'polygon'].includes(selectedObject.type || '');

  return (
    <div className="w-full md:w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Shapes</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Shape Grid */}
        <div>
          <h3 className="text-sm font-medium mb-3">Basic Shapes</h3>
          <div className="grid grid-cols-3 gap-3">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => addShape(shape.id)}
                className="aspect-square rounded-lg bg-secondary hover:bg-secondary/80 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                {shape.icon}
                <span className="text-[10px] text-muted-foreground">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shape Properties */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Properties</h3>
          
          {/* Fill Color */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Fill Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value);
                  if (isShapeSelected) updateSelectedShape('fill', e.target.value);
                }}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                type="text"
                value={fillColor}
                onChange={(e) => {
                  setFillColor(e.target.value);
                  if (isShapeSelected) updateSelectedShape('fill', e.target.value);
                }}
                className="editor-input flex-1"
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Stroke Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value);
                  if (isShapeSelected) updateSelectedShape('stroke', e.target.value);
                }}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value);
                  if (isShapeSelected) updateSelectedShape('stroke', e.target.value);
                }}
                className="editor-input flex-1"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Stroke Width</label>
            <div className="flex items-center gap-3">
              <Slider
                value={[strokeWidth]}
                onValueChange={(v) => {
                  setStrokeWidth(v[0]);
                  if (isShapeSelected) updateSelectedShape('strokeWidth', v[0]);
                }}
                min={0}
                max={20}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-foreground w-8 text-right">{strokeWidth}px</span>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Opacity</label>
            <div className="flex items-center gap-3">
              <Slider
                value={[opacity]}
                onValueChange={(v) => {
                  setOpacity(v[0]);
                  if (isShapeSelected) updateSelectedShape('opacity', v[0] / 100);
                }}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-foreground w-10 text-right">{opacity}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
