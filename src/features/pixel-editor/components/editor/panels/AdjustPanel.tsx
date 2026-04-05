import React from 'react';
import { X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useEditor, Adjustments } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Slider } from '@pixel/components/ui/slider';
import { Input } from '@pixel/components/ui/input';
import { FabricImage } from 'fabric';
import { filters } from 'fabric';

interface AdjustmentSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  label,
  value,
  onChange,
  min = -100,
  max = 100,
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-24">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-16 editor-input text-center px-2"
        min={min}
        max={max}
      />
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={1}
        className="flex-1"
      />
    </div>
  );
};

export const AdjustPanel: React.FC = () => {
  const { setActiveTool, adjustments, setAdjustments, canvas, pushHistory, selectedObject } = useEditor();
  const [showPreview, setShowPreview] = React.useState(true);

  const handleClose = () => {
    setActiveTool(null);
  };

  const handleReset = () => {
    const defaultAdj: Adjustments = {
      brightness: 0,
      saturation: 0,
      contrast: 0,
      gamma: 0,
      clarity: 0,
      exposure: 0,
      shadows: 0,
      highlights: 0,
      blacks: 0,
      whites: 0,
      temperature: 0,
      sharpness: 0,
    };
    setAdjustments(defaultAdj);
    applyAdjustments(defaultAdj);
    pushHistory();
  };

  const applyAdjustments = (adj: Adjustments) => {
    if (!canvas) return;

    // Only apply to selected object, not all objects
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      return;
    }

    const obj = activeObject;
        const fabricFilters: any[] = [];
        
        // Brightness: -100 to 100 -> -1 to 1
        if (adj.brightness !== 0) {
          fabricFilters.push(new filters.Brightness({ brightness: adj.brightness / 100 }));
        }
        
        // Contrast: -100 to 100 -> -1 to 1
        if (adj.contrast !== 0) {
          fabricFilters.push(new filters.Contrast({ contrast: adj.contrast / 100 }));
        }
        
        // Saturation: -100 to 100 -> -1 to 1
        if (adj.saturation !== 0) {
          fabricFilters.push(new filters.Saturation({ saturation: adj.saturation / 100 }));
        }
        
        // Gamma: -100 to 100 -> adjust gamma values
        if (adj.gamma !== 0) {
          const gammaValue = 1 + adj.gamma / 100;
          fabricFilters.push(new filters.Gamma({ gamma: [gammaValue, gammaValue, gammaValue] }));
        }

        // Exposure using Brightness (simplified)
        if (adj.exposure !== 0) {
          fabricFilters.push(new filters.Brightness({ brightness: adj.exposure / 200 }));
        }

        // Temperature using ColorMatrix (warm/cool shift)
        if (adj.temperature !== 0) {
          const t = adj.temperature / 100;
          // Warm = more red/yellow, Cool = more blue
          fabricFilters.push(new filters.ColorMatrix({
            matrix: [
              1 + t * 0.2, 0, 0, 0, 0,
              0, 1, 0, 0, 0,
              0, 0, 1 - t * 0.2, 0, 0,
              0, 0, 0, 1, 0
            ]
          }));
        }

        // Sharpness using Convolute
        if (adj.sharpness !== 0 && adj.sharpness > 0) {
          const amount = adj.sharpness / 100;
          fabricFilters.push(new filters.Convolute({
            matrix: [
              0, -amount, 0,
              -amount, 1 + 4 * amount, -amount,
              0, -amount, 0
            ]
          }));
        }

        // Clarity (local contrast enhancement using Convolute)
        if (adj.clarity !== 0) {
          const c = adj.clarity / 200;
          fabricFilters.push(new filters.Convolute({
            matrix: [
              -c, -c, -c,
              -c, 1 + 8 * c, -c,
              -c, -c, -c
            ]
          }));
        }

        // Shadows/Highlights/Blacks/Whites - simplified using brightness adjustments
        // These are approximate implementations
        if (adj.shadows !== 0 || adj.highlights !== 0 || adj.blacks !== 0 || adj.whites !== 0) {
          // Combined adjustment using ColorMatrix for tonal range
          const shadowVal = adj.shadows / 500;
          const highlightVal = adj.highlights / 500;
          const blacksVal = adj.blacks / 300;
          const whitesVal = adj.whites / 300;
          
          const combinedBrightness = shadowVal + highlightVal + blacksVal + whitesVal;
          if (combinedBrightness !== 0) {
            fabricFilters.push(new filters.Brightness({ brightness: combinedBrightness }));
          }
        }

    obj.filters = fabricFilters;
    obj.applyFilters();
    canvas.renderAll();
  };

  const handleAdjustmentChange = (key: keyof Adjustments, value: number) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    if (showPreview) {
      applyAdjustments(newAdjustments);
    }
  };

  const basicAdjustments: Array<{ key: keyof Adjustments; label: string }> = [
    { key: 'brightness', label: 'Brightness' },
    { key: 'saturation', label: 'Saturation' },
    { key: 'contrast', label: 'Contrast' },
    { key: 'gamma', label: 'Gamma' },
  ];

  const refinements: Array<{ key: keyof Adjustments; label: string }> = [
    { key: 'clarity', label: 'Clarity' },
    { key: 'exposure', label: 'Exposure' },
    { key: 'shadows', label: 'Shadows' },
    { key: 'highlights', label: 'Highlights' },
    { key: 'blacks', label: 'Blacks' },
    { key: 'whites', label: 'Whites' },
    { key: 'temperature', label: 'Temperature' },
    { key: 'sharpness', label: 'Sharpness' },
  ];

  return (
    <div className="w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Adjustments</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 w-8"
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!selectedObject || !(selectedObject instanceof FabricImage) ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No image selected
            </p>
            <p className="text-xs text-muted-foreground">
              Select an image in the selection area to apply adjustments
            </p>
          </div>
        ) : (
          <>
        {/* Basic */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Basic</h3>
          <div className="space-y-4">
            {basicAdjustments.map(({ key, label }) => (
              <AdjustmentSlider
                key={key}
                label={label}
                value={adjustments[key]}
                onChange={(value) => handleAdjustmentChange(key, value)}
              />
            ))}
          </div>
        </div>

        {/* Refinements */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Refinements</h3>
          <div className="space-y-4">
            {refinements.map(({ key, label }) => (
              <AdjustmentSlider
                key={key}
                label={label}
                value={adjustments[key]}
                onChange={(value) => handleAdjustmentChange(key, value)}
              />
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
