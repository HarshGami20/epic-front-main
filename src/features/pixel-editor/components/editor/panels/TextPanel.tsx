import React, { useState } from 'react';
import { X, Search, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Input } from '@pixel/components/ui/input';
import { Textbox } from 'fabric';
import { fitObjectInZone } from '@pixel/lib/canvasZoneFit';
import { computeAdaptiveFontSizeForZone } from '@pixel/lib/textAdaptiveSizing';

const textPresets = [
  { id: 'title', label: 'Title', fontSize: 72, fontWeight: 'bold' },
  { id: 'heading', label: 'Heading', fontSize: 48, fontWeight: 'bold' },
  { id: 'paragraph', label: 'Paragraph', fontSize: 24, fontWeight: 'normal' },
];

const fontCombinations = [
  { id: 1, name: 'Modern', fonts: ['Helvetica', 'Arial'] },
  { id: 2, name: 'Classic', fonts: ['Georgia', 'Times'] },
  { id: 3, name: 'Bold', fonts: ['Impact', 'Arial Black'] },
  { id: 4, name: 'Elegant', fonts: ['Playfair Display', 'Lato'] },
];

const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Oswald',
  'Playfair Display', 'Raleway', 'Ubuntu', 'Merriweather', 'PT Sans'
];

export const TextPanel: React.FC = () => {
  const {
    setActiveTool,
    canvas,
    pushHistory,
    selectedObject,
    isMobile,
    setIsPanelOpen,
    editableZones,
    activeEditableZoneId,
  } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'combinations'>('text');

  const handleClose = () => {
    setActiveTool(null);
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const addText = (preset: typeof textPresets[0]) => {
    if (!canvas) return;

    const activeZone =
      editableZones.find((z) => z.id === activeEditableZoneId) ?? editableZones[0];

    let left = canvas.width! / 2 - 100;
    let top = canvas.height! / 2 - 50;
    let width = 200;
    let fontSize = preset.fontSize;
    let fill = '#000000';
    let fontFamily = 'Arial';
    let originX: 'left' | 'center' = 'left';
    let originY: 'top' | 'center' = 'top';

    if (activeZone) {
      width = Math.max(80, activeZone.width * 0.92);
      fontSize = computeAdaptiveFontSizeForZone(activeZone, preset.fontSize);
      left = activeZone.x + activeZone.width / 2;
      top = activeZone.y + activeZone.height / 2;
      originX = 'center';
      originY = 'center';
      if (activeZone.type === 'text') {
        if (activeZone.textColor) fill = activeZone.textColor;
        if (activeZone.fontFamily) fontFamily = activeZone.fontFamily;
      }
    }

    const text = new Textbox(preset.label, {
      left,
      top,
      originX,
      originY,
      fontSize,
      fontWeight: preset.fontWeight,
      fontFamily,
      fill,
      width,
      textAlign: 'center',
    });

    if (activeZone) {
      (text as any).editableZoneId = activeZone.id;
    }

    canvas.add(text);
    if (activeZone) {
      fitObjectInZone(text, activeZone);
    }
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushHistory();
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const updateSelectedText = (property: string, value: any) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;

    (selectedObject as any).set(property, value);
    canvas.renderAll();
    pushHistory();
  };

  const isTextSelected = selectedObject?.type === 'textbox';
  const textObject = selectedObject as Textbox | null;

  return (
    <div className="w-full md:w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Text</h2>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Text Presets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Text</h3>
            <span className="text-xs text-muted-foreground">More (3)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {textPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => addText(preset)}
                className="aspect-square rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
              >
                <span 
                  className="text-foreground"
                  style={{ 
                    fontSize: preset.fontSize / 4, 
                    fontWeight: preset.fontWeight === 'bold' ? 700 : 400 
                  }}
                >
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Combinations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Font Combinations</h3>
            <span className="text-xs text-muted-foreground">More (21)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {fontCombinations.map((combo) => (
              <button
                key={combo.id}
                className="aspect-square rounded-lg bg-secondary hover:bg-secondary/80 flex flex-col items-center justify-center p-2 transition-colors"
              >
                <span className="text-xs text-foreground font-bold">{combo.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Controls (when text is selected) */}
        {isTextSelected && textObject && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium">Text Properties</h3>
            
            {/* Font Family */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Font</label>
              <select 
                className="editor-input w-full"
                value={textObject.fontFamily}
                onChange={(e) => updateSelectedText('fontFamily', e.target.value)}
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Size</label>
              <Input
                type="number"
                value={textObject.fontSize}
                onChange={(e) => updateSelectedText('fontSize', parseInt(e.target.value))}
                className="editor-input"
              />
            </div>

            {/* Style Buttons */}
            <div className="flex gap-2">
              <Button
                variant={textObject.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => updateSelectedText('fontWeight', textObject.fontWeight === 'bold' ? 'normal' : 'bold')}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={textObject.fontStyle === 'italic' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => updateSelectedText('fontStyle', textObject.fontStyle === 'italic' ? 'normal' : 'italic')}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <Button
                variant={textObject.textAlign === 'left' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => updateSelectedText('textAlign', 'left')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={textObject.textAlign === 'center' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => updateSelectedText('textAlign', 'center')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={textObject.textAlign === 'right' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => updateSelectedText('textAlign', 'right')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textObject.fill as string || '#000000'}
                  onChange={(e) => updateSelectedText('fill', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  type="text"
                  value={textObject.fill as string || '#000000'}
                  onChange={(e) => updateSelectedText('fill', e.target.value)}
                  className="editor-input flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
