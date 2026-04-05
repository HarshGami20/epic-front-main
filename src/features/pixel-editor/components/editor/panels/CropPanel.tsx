import React, { useState } from 'react';
import { X, RotateCw, FlipHorizontal, FlipVertical, Link2, Link2Off } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Input } from '@pixel/components/ui/input';
import { Slider } from '@pixel/components/ui/slider';
import { cn } from '@pixel/lib/utils';

const aspectRatios = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '9:16', label: '9:16', ratio: 9/16 },
  { id: '16:9', label: '16:9', ratio: 16/9 },
  { id: '10:16', label: '10:16', ratio: 10/16 },
  { id: '16:10', label: '16:10', ratio: 16/10 },
  { id: '2:3', label: '2:3', ratio: 2/3 },
  { id: '3:2', label: '3:2', ratio: 3/2 },
  { id: '3:4', label: '3:4', ratio: 3/4 },
  { id: '4:3', label: '4:3', ratio: 4/3 },
  { id: '4:5', label: '4:5', ratio: 4/5 },
  { id: '5:4', label: '5:4', ratio: 5/4 },
];

const presets = {
  instagram: [
    { name: 'Square Post', ratio: '1:1' },
    { name: 'Landscape Post', ratio: '1.91:1' },
    { name: 'Portrait Post', ratio: '4:5' },
  ],
  facebook: [
    { name: 'Square Post', ratio: '1:1' },
    { name: 'Shared Image', ratio: '1.91:1' },
    { name: 'Video Landscape', ratio: '16:9' },
  ],
  twitter: [
    { name: 'In-stream Photo', ratio: '16:9' },
    { name: 'Profile Header', ratio: '3:1' },
    { name: 'Video', ratio: '16:9' },
  ],
};

export const CropPanel: React.FC = () => {
  const { setActiveTool, cropState, setCropState, canvas, pushHistory } = useEditor();
  const [activeTab, setActiveTab] = useState<'ratio' | 'resize'>('ratio');
  const [isLocked, setIsLocked] = useState(false);
  const [rotation, setRotation] = useState([0]);

  const handleClose = () => {
    setActiveTool(null);
  };

  const handleAspectRatioChange = (ratio: string) => {
    setCropState({ ...cropState, aspectRatio: ratio });
  };

  const handleRotate = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      obj.rotate((obj.angle || 0) + 90);
    });
    canvas.renderAll();
    pushHistory();
  };

  const handleFlipH = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      obj.set('flipX', !obj.flipX);
    });
    canvas.renderAll();
    pushHistory();
  };

  const handleFlipV = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      obj.set('flipY', !obj.flipY);
    });
    canvas.renderAll();
    pushHistory();
  };

  const handleStraighten = (value: number[]) => {
    if (!canvas) return;
    setRotation(value);
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'image') {
        obj.rotate(value[0]);
      }
    });
    canvas.renderAll();
  };

  const handleApplyCrop = () => {
    pushHistory();
    setActiveTool(null);
  };

  const handleReset = () => {
    setRotation([0]);
    setCropState({ ...cropState, aspectRatio: 'free', rotation: 0 });
    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj.type === 'image') {
          obj.rotate(0);
          obj.set({ flipX: false, flipY: false });
        }
      });
      canvas.renderAll();
    }
  };

  return (
    <div className="w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Crop</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Crop Area */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-3">Crop Area</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-14">Width</label>
              <Input
                type="number"
                value={cropState.width}
                onChange={(e) => setCropState({ ...cropState, width: parseInt(e.target.value) || 0 })}
                className="editor-input flex-1"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-14">Height</label>
              <Input
                type="number"
                value={cropState.height}
                onChange={(e) => setCropState({ ...cropState, height: parseInt(e.target.value) || 0 })}
                className="editor-input flex-1"
              />
              <span className="text-xs text-muted-foreground">px</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLocked(!isLocked)}
                className="h-8 w-8"
              >
                {isLocked ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'ratio' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ratio')}
            className="flex-1"
          >
            Aspect Ratio
          </Button>
          <Button
            variant={activeTab === 'resize' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('resize')}
            className="flex-1"
          >
            Resize
          </Button>
        </div>

        {/* Aspect Ratios Grid */}
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              onClick={() => handleAspectRatioChange(ar.id)}
              className={cn(
                'aspect-ratio-card',
                cropState.aspectRatio === ar.id && 'selected'
              )}
            >
              <div className="w-8 h-8 border border-current rounded flex items-center justify-center mb-1">
                <div 
                  className="border border-current"
                  style={{
                    width: ar.ratio ? (ar.ratio > 1 ? 20 : 20 * ar.ratio) : 16,
                    height: ar.ratio ? (ar.ratio > 1 ? 20 / ar.ratio : 20) : 16,
                  }}
                />
              </div>
              <span className="text-xs">{ar.label}</span>
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="space-y-4">
          {Object.entries(presets).map(([platform, items]) => (
            <div key={platform}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium capitalize">{platform}</h4>
                <span className="text-xs text-muted-foreground">More ({items.length})</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {items.map((preset, idx) => (
                  <button
                    key={idx}
                    className="flex-shrink-0 w-16 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="w-8 h-8 mx-auto mb-1 bg-muted rounded flex items-center justify-center">
                      <span className="text-[10px]">📷</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground line-clamp-2">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Straighten</span>
          <Slider
            value={rotation}
            onValueChange={handleStraighten}
            min={-45}
            max={45}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-foreground w-10 text-right">{rotation[0]}°</span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleRotate} className="h-9 w-9">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFlipH} className="h-9 w-9">
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFlipV} className="h-9 w-9">
              <FlipVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="default" size="sm" onClick={handleApplyCrop}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
