import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useEditor } from '@pixel/contexts/EditorContext';
import { Button } from '@pixel/components/ui/button';
import { Input } from '@pixel/components/ui/input';
import { FabricImage } from 'fabric';
import { ScrollArea } from '@pixel/components/ui/scroll-area';
import { fitObjectInZone } from '@pixel/lib/canvasZoneFit';

interface StickerCategory {
  id: string;
  name: string;
  items: string[];
}

const stickerCategories: StickerCategory[] = [
  {
    id: 'emoji',
    name: 'Emoji',
    items: ['😀', '😎', '🥳', '😍', '🤩', '😂', '🥰', '😇', '🤗', '🤔', '😴', '🥺', '😈', '👻', '🎃', '✨'],
  },
  {
    id: 'emoticon',
    name: 'Emoticon',
    items: ['😊', '😋', '😜', '🤪', '😏', '😌', '😔', '😢', '😭', '😤', '🥵', '🥶', '😱', '🤯', '😵', '🤠'],
  },
  {
    id: 'hands',
    name: 'Hands',
    items: ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟', '🤘', '👌'],
  },
  {
    id: 'animals',
    name: 'Animals',
    items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'],
  },
  {
    id: 'food',
    name: 'Food',
    items: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🥑', '🌮', '🍕'],
  },
  {
    id: 'objects',
    name: 'Objects',
    items: ['⭐', '🌟', '✨', '💫', '🔥', '💥', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '🎯'],
  },
  {
    id: 'nature',
    name: 'Nature',
    items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍀', '🍁', '🍂', '🌴', '🌵', '🌲', '🌳', '🌾', '🌱'],
  },
  {
    id: 'sports',
    name: 'Sports',
    items: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🥊', '🎿', '⛳'],
  },
];

export const StickerPanel: React.FC = () => {
  const {
    setActiveTool,
    canvas,
    pushHistory,
    selectionArea,
    updateLayers,
    isMobile,
    setIsPanelOpen,
    activeEditableZoneId,
    editableZones,
  } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleClose = () => {
    setActiveTool(null);
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const addSticker = async (emoji: string) => {
    if (!canvas) return;

    // Create a canvas element to render the emoji with high resolution
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    tempCanvas.width = size;
    tempCanvas.height = size;

    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.font = `${size * 0.75}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);

    // Create a fabric image from the canvas
    const dataUrl = tempCanvas.toDataURL('image/png');
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      // Position in selection area if available
      let left = canvas.width! / 2;
      let top = canvas.height! / 2;

      if (selectionArea) {
        left = selectionArea.x + selectionArea.width / 2;
        top = selectionArea.y + selectionArea.height / 2;
      }

      const fabricImg = new FabricImage(img, {
        left: left,
        top: top,
        originX: 'center',
        originY: 'center',
        scaleX: 0.4,
        scaleY: 0.4,
      });
      
      (fabricImg as any).customName = 'Sticker';
      const zone =
        editableZones.find((z) => z.id === activeEditableZoneId) ?? editableZones[0];
      if (zone) {
        (fabricImg as any).editableZoneId = zone.id;
      }

      canvas.add(fabricImg);
      if (zone) {
        fitObjectInZone(fabricImg, zone);
      }
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      pushHistory();
      updateLayers();
      if (isMobile) {
        setIsPanelOpen(false);
      }
    };
  };

  const filteredCategories = stickerCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      searchQuery === '' || item.includes(searchQuery)
    ),
  })).filter(category => category.items.length > 0);

  return (
    <div className="w-full md:w-72 bg-editor-panel border-r border-border h-full flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold">Stickers</h2>
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
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="editor-input pl-9 w-full"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{category.name}</h3>
                <button 
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="text-xs text-primary hover:underline"
                >
                  {expandedCategory === category.id ? 'Less' : `More (${category.items.length})`}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(expandedCategory === category.id ? category.items : category.items.slice(0, 8)).map((sticker, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSticker(sticker)}
                    className="sticker-item aspect-square text-2xl flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
