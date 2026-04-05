import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';

export type Tool = 'crop' | 'adjust' | 'filter' | 'text' | 'shapes' | 'sticker' | 'apps' | 'picture' | 'layers';

export interface Adjustments {
  brightness: number;
  saturation: number;
  contrast: number;
  gamma: number;
  clarity: number;
  exposure: number;
  shadows: number;
  highlights: number;
  blacks: number;
  whites: number;
  temperature: number;
  sharpness: number;
}

export interface FilterState {
  name: string | null;
  intensity: number;
}

export interface CropState {
  width: number;
  height: number;
  aspectRatio: string;
  rotation: number;
  isActive: boolean;
}

export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  bleed: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  selectionArea: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
  bleed: number;
}

export interface HistoryState {
  canvasState: string;
  timestamp: number;
}

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

interface EditorContextType {
  canvas: FabricCanvas | null;
  setCanvas: (canvas: FabricCanvas | null) => void;
  activeTool: Tool | null;
  setActiveTool: (tool: Tool | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  adjustments: Adjustments;
  setAdjustments: (adjustments: Adjustments) => void;
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  cropState: CropState;
  setCropState: (state: CropState) => void;
  selectedObject: FabricObject | null;
  setSelectedObject: (obj: FabricObject | null) => void;
  history: HistoryState[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
  originalImage: HTMLImageElement | null;
  setOriginalImage: (img: HTMLImageElement | null) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  isMobile: boolean;
  backgroundImage: string | null;
  setBackgroundImage: (url: string | null) => void;
  selectionArea: SelectionArea | null;
  setSelectionArea: (area: SelectionArea | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  layers: LayerItem[];
  updateLayers: () => void;
  deleteSelectedObject: () => void;
  duplicateSelectedObject: () => void;
  bringForward: () => void;
  sendBackward: () => void;
}

const defaultAdjustments: Adjustments = {
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

// Pre-defined products with selection areas
export const products: Product[] = [
  {
    id: 'tshirt-white',
    name: 'White T-Shirt',
    image: '/product/product.png',
    selectionArea: { xPercent: 30, yPercent: 25, widthPercent: 40, heightPercent: 45 },
    bleed: 15,
  },
  {
    id: 'tshirt-front',
    name: 'T-Shirt Front',
    image: '/product/product1.webp',
    selectionArea: { xPercent: 28, yPercent: 22, widthPercent: 44, heightPercent: 50 },
    bleed: 15,
  },
  {
    id: 'tshirt-model',
    name: 'T-Shirt on Model',
    image: '/product/product2.webp',
    selectionArea: { xPercent: 32, yPercent: 28, widthPercent: 36, heightPercent: 40 },
    bleed: 10,
  },
];

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [zoom, setZoom] = useState(100);
  const [adjustments, setAdjustments] = useState<Adjustments>(defaultAdjustments);
  const [filter, setFilter] = useState<FilterState>({ name: null, intensity: 100 });
  const [cropState, setCropState] = useState<CropState>({
    width: 1920,
    height: 1080,
    aspectRatio: 'free',
    rotation: 0,
    isActive: false,
  });
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const isHistoryAction = useRef(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateLayers = useCallback(() => {
    if (!canvas) {
      setLayers([]);
      return;
    }
    
    const objects = canvas.getObjects();
    const layerItems: LayerItem[] = objects
      .filter(obj => !(obj as any).isBackground) // Exclude background
      .map((obj, index) => ({
        id: (obj as any).id || `layer-${index}`,
        name: (obj as any).customName || getObjectTypeName(obj.type || 'object'),
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: !obj.selectable,
        object: obj,
      }))
      .reverse(); // Reverse to show top layer first
    
    setLayers(layerItems);
  }, [canvas]);

  const getObjectTypeName = (type: string): string => {
    const names: Record<string, string> = {
      'textbox': 'Text',
      'i-text': 'Text',
      'image': 'Image',
      'rect': 'Rectangle',
      'circle': 'Circle',
      'triangle': 'Triangle',
      'polygon': 'Shape',
      'line': 'Line',
      'path': 'Path',
    };
    return names[type] || 'Object';
  };

  const pushHistory = useCallback(() => {
    if (!canvas || isHistoryAction.current) return;
    
    const state = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ canvasState: state, timestamp: Date.now() });
    
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    updateLayers();
  }, [canvas, history, historyIndex, updateLayers]);

  const undo = useCallback(() => {
    if (!canvas || historyIndex <= 0) return;
    
    isHistoryAction.current = true;
    const prevState = history[historyIndex - 1];
    canvas.loadFromJSON(JSON.parse(prevState.canvasState)).then(() => {
      canvas.renderAll();
      setHistoryIndex(historyIndex - 1);
      isHistoryAction.current = false;
      updateLayers();
    });
  }, [canvas, history, historyIndex, updateLayers]);

  const redo = useCallback(() => {
    if (!canvas || historyIndex >= history.length - 1) return;
    
    isHistoryAction.current = true;
    const nextState = history[historyIndex + 1];
    canvas.loadFromJSON(JSON.parse(nextState.canvasState)).then(() => {
      canvas.renderAll();
      setHistoryIndex(historyIndex + 1);
      isHistoryAction.current = false;
      updateLayers();
    });
  }, [canvas, history, historyIndex, updateLayers]);

  const deleteSelectedObject = useCallback(() => {
    if (!canvas || !selectedObject) return;
    if ((selectedObject as any).isBackground) return; // Prevent deleting background
    
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();
    pushHistory();
    updateLayers();
  }, [canvas, selectedObject, pushHistory, updateLayers]);

  const duplicateSelectedObject = useCallback(() => {
    if (!canvas || !selectedObject) return;
    if ((selectedObject as any).isBackground) return;

    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (selectedObject.left || 0) + 20,
        top: (selectedObject.top || 0) + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      pushHistory();
      updateLayers();
    });
  }, [canvas, selectedObject, pushHistory, updateLayers]);

  const bringForward = useCallback(() => {
    if (!canvas || !selectedObject) return;
    if ((selectedObject as any).isBackground) return;
    
    canvas.bringObjectForward(selectedObject);
    canvas.renderAll();
    pushHistory();
    updateLayers();
  }, [canvas, selectedObject, pushHistory, updateLayers]);

  const sendBackward = useCallback(() => {
    if (!canvas || !selectedObject) return;
    if ((selectedObject as any).isBackground) return;
    
    // Find background and make sure we don't go behind it
    const objects = canvas.getObjects();
    const bgIndex = objects.findIndex(obj => (obj as any).isBackground);
    const currentIndex = objects.indexOf(selectedObject);
    
    if (currentIndex > bgIndex + 1) {
      canvas.sendObjectBackwards(selectedObject);
      canvas.renderAll();
      pushHistory();
      updateLayers();
    }
  }, [canvas, selectedObject, pushHistory, updateLayers]);

  const value: EditorContextType = {
    canvas,
    setCanvas,
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    adjustments,
    setAdjustments,
    filter,
    setFilter,
    cropState,
    setCropState,
    selectedObject,
    setSelectedObject,
    history,
    historyIndex,
    pushHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    imageLoaded,
    setImageLoaded,
    originalImage,
    setOriginalImage,
    isPanelOpen,
    setIsPanelOpen,
    isMobile,
    backgroundImage,
    setBackgroundImage,
    selectionArea,
    setSelectionArea,
    selectedProduct,
    setSelectedProduct,
    layers,
    updateLayers,
    deleteSelectedObject,
    duplicateSelectedObject,
    bringForward,
    sendBackward,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
