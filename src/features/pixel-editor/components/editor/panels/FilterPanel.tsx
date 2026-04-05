import React, { useState } from 'react';
import { X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Slider } from '@pixel/components/ui/slider';
import { cn } from '@pixel/lib/utils';
import { FabricImage } from 'fabric';
import { filters } from 'fabric';

interface FilterPreset {
  id: string;
  name: string;
  gradient: string;
  filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: boolean;
    grayscale?: boolean;
    hueRotate?: number;
    vibrance?: number;
    invert?: boolean;
  };
}

const filterPresets: FilterPreset[] = [
  { 
    id: 'none', 
    name: 'Original', 
    gradient: 'linear-gradient(135deg, #2a2a35 0%, #1a1a1f 100%)',
    filters: {}
  },
  { 
    id: 'plum', 
    name: 'Plum', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    filters: { saturation: 0.2, hueRotate: -10 }
  },
  { 
    id: 'breezy', 
    name: 'Breezy', 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    filters: { brightness: 0.1, saturation: -0.1, contrast: 0.1 }
  },
  { 
    id: 'deep-blue', 
    name: 'Deep Blue', 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    filters: { saturation: 0.3, hueRotate: 20 }
  },
  { 
    id: 'frog', 
    name: 'Frog', 
    gradient: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
    filters: { saturation: 0.4, hueRotate: 60 }
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    filters: { brightness: 0.05, saturation: 0.2, sepia: true }
  },
  { 
    id: '1920', 
    name: '1920 A.D.', 
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    filters: { grayscale: true, contrast: 0.2, sepia: true }
  },
  { 
    id: 'greyed', 
    name: 'Greyed', 
    gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    filters: { grayscale: true }
  },
  { 
    id: 'dusty', 
    name: 'Dusty', 
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    filters: { saturation: -0.2, brightness: 0.05, sepia: true }
  },
  { 
    id: 'litho', 
    name: 'Litho', 
    gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
    filters: { contrast: 0.3, grayscale: true }
  },
  { 
    id: 'sepia', 
    name: 'Sepia', 
    gradient: 'linear-gradient(135deg, #c79081 0%, #dfa579 100%)',
    filters: { sepia: true }
  },
  { 
    id: 'weathered', 
    name: 'Weathered', 
    gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    filters: { saturation: -0.4, contrast: 0.1, brightness: -0.05 }
  },
  { 
    id: 'vivid', 
    name: 'Vivid', 
    gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    filters: { saturation: 0.5, contrast: 0.2, vibrance: 0.3 }
  },
  { 
    id: 'invert', 
    name: 'Invert', 
    gradient: 'linear-gradient(135deg, #000000 0%, #ffffff 100%)',
    filters: { invert: true }
  },
  { 
    id: 'noir', 
    name: 'Noir', 
    gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
    filters: { grayscale: true, contrast: 0.4, brightness: -0.1 }
  },
];

export const FilterPanel: React.FC = () => {
  const { setActiveTool, filter, setFilter, canvas, pushHistory, selectedObject } = useEditor();
  const [showPreview, setShowPreview] = useState(true);

  const handleClose = () => {
    setActiveTool(null);
  };

  const handleReset = () => {
    setFilter({ name: null, intensity: 100 });
    applyFilter(null, 100);
    pushHistory();
  };

  const applyFilter = (filterName: string | null, intensity: number) => {
    if (!canvas) return;

    // Only apply to selected object, not all objects
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      return;
    }

    const obj = activeObject;
    const preset = filterPresets.find(f => f.id === filterName);
    if (!preset || filterName === 'none' || !filterName) {
      obj.filters = [];
    } else {
      const fabricFilters: any[] = [];
      const intensityMultiplier = intensity / 100;
      
      if (preset.filters.brightness !== undefined) {
        fabricFilters.push(new filters.Brightness({ 
          brightness: preset.filters.brightness * intensityMultiplier 
        }));
      }
      
      if (preset.filters.contrast !== undefined) {
        fabricFilters.push(new filters.Contrast({ 
          contrast: preset.filters.contrast * intensityMultiplier 
        }));
      }
      
      if (preset.filters.saturation !== undefined) {
        fabricFilters.push(new filters.Saturation({ 
          saturation: preset.filters.saturation * intensityMultiplier 
        }));
      }
      
      if (preset.filters.grayscale) {
        fabricFilters.push(new filters.Grayscale());
      }
      
      if (preset.filters.sepia) {
        fabricFilters.push(new filters.Sepia());
      }
      
      if (preset.filters.invert) {
        fabricFilters.push(new filters.Invert());
      }
      
      if (preset.filters.hueRotate !== undefined) {
        fabricFilters.push(new filters.HueRotation({ 
          rotation: preset.filters.hueRotate * intensityMultiplier / 180 
        }));
      }
      
      if (preset.filters.vibrance !== undefined) {
        fabricFilters.push(new filters.Vibrance({ 
          vibrance: preset.filters.vibrance * intensityMultiplier 
        }));
      }
      
      obj.filters = fabricFilters;
    }
    obj.applyFilters();
    canvas.renderAll();
  };

  const handleFilterSelect = (filterId: string) => {
    const newFilter = filter.name === filterId ? null : filterId;
    setFilter({ ...filter, name: newFilter });
    if (showPreview) {
      applyFilter(newFilter, filter.intensity);
    }
    pushHistory();
  };

  const handleIntensityChange = (value: number[]) => {
    setFilter({ ...filter, intensity: value[0] });
    if (showPreview) {
      applyFilter(filter.name, value[0]);
    }
  };

  return (
    <div className="w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Filter</h2>
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

      {/* Intensity Slider - Always visible when filter selected */}
      {filter.name && filter.name !== 'none' && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Intensity</span>
            <Slider
              value={[filter.intensity]}
              onValueChange={handleIntensityChange}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-foreground w-8 text-right">{filter.intensity}%</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedObject || !(selectedObject instanceof FabricImage) ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No image selected
            </p>
            <p className="text-xs text-muted-foreground">
              Select an image in the selection area to apply filters
            </p>
          </div>
        ) : (
          filterPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleFilterSelect(preset.id)}
            className={cn(
              'filter-card w-full h-16 relative rounded-lg overflow-hidden transition-all',
              filter.name === preset.id && 'ring-2 ring-primary ring-offset-2 ring-offset-editor-panel'
            )}
          >
            <div 
              className="absolute inset-0"
              style={{ background: preset.gradient }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <span className="absolute bottom-2 left-3 text-white text-sm font-medium drop-shadow-lg">
              {preset.name}
            </span>
            {filter.name === preset.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))
        )}
      </div>
    </div>
  );
};
