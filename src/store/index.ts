import { create } from 'zustand';
import { LabelTemplate, ProductData, PrintCanvas, UserSettings, PlacedLabel } from '@/lib/types';

// 编辑器状态
interface EditorState {
  currentTemplate: LabelTemplate | null;
  productData: ProductData;
  isDirty: boolean;
  canvasInstance: any; // Fabric.js 实例
  
  // Actions
  setCurrentTemplate: (template: LabelTemplate) => void;
  updateProductData: (data: Partial<ProductData>) => void;
  setCanvasInstance: (instance: any) => void;
  markDirty: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentTemplate: null,
  productData: {
    name: '',
    price: 0,
    originalPrice: undefined,
    discount: undefined,
    sellingPoints: [],
    specs: {},
    logo: undefined,
    barcode: '',
    customFields: {},
  },
  isDirty: false,
  canvasInstance: null,

  setCurrentTemplate: (template) => set({ currentTemplate: template, isDirty: true }),
  updateProductData: (data) => set((state) => ({ 
    productData: { ...state.productData, ...data }, 
    isDirty: true 
  })),
  setCanvasInstance: (instance) => set({ canvasInstance: instance }),
  markDirty: () => set({ isDirty: true }),
  reset: () => set({
    currentTemplate: null,
    productData: {
      name: '',
      price: 0,
      originalPrice: undefined,
      discount: undefined,
      sellingPoints: [],
      specs: {},
      logo: undefined,
      barcode: '',
      customFields: {},
    },
    isDirty: false,
    canvasInstance: null,
  }),
}));

// 排版状态
interface LayoutState {
  printCanvas: PrintCanvas | null;
  selectedLabels: string[];
  
  // Actions
  setPrintCanvas: (canvas: PrintCanvas) => void;
  addLabelToCanvas: (labelId: string, position: { x: number; y: number }) => void;
  removeLabelFromCanvas: (labelId: string) => void;
  updateLabelPosition: (labelId: string, position: { x: number; y: number }) => void;
  selectLabels: (labelIds: string[]) => void;
  clearSelection: () => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  printCanvas: null,
  selectedLabels: [],

  setPrintCanvas: (canvas) => set({ printCanvas: canvas }),
  addLabelToCanvas: (labelId, position) => {
    const state = get();
    if (!state.printCanvas) return;
    
    const newLabel = {
      labelId,
      position,
      rotation: 0,
      productData: {} as ProductData, // 这里需要从编辑器获取
    };
    
    set({
      printCanvas: {
        ...state.printCanvas,
        labels: [...state.printCanvas.labels, newLabel],
      },
    });
  },
  removeLabelFromCanvas: (labelId) => {
    const state = get();
    if (!state.printCanvas) return;
    
    set({
      printCanvas: {
        ...state.printCanvas,
        labels: state.printCanvas.labels.filter((label: PlacedLabel) => label.labelId !== labelId),
      },
    });
  },
  updateLabelPosition: (labelId, position) => {
    const state = get();
    if (!state.printCanvas) return;
    
    set({
      printCanvas: {
        ...state.printCanvas,
    labels: state.printCanvas.labels.map((label: PlacedLabel) =>
      label.labelId === labelId ? { ...label, position } : label
    ),
      },
    });
  },
  selectLabels: (labelIds) => set({ selectedLabels: labelIds }),
  clearSelection: () => set({ selectedLabels: [] }),
}));

// 应用设置状态
interface AppState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSettings: (settings: UserSettings) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    defaultPaperSize: { name: 'A4', width: 210, height: 297, dpi: 300 },
    defaultLabelSize: { width: 40, height: 30 },
    recentTemplates: [],
    autoSaveEnabled: true,
    language: 'zh-CN',
  },
  isLoading: false,
  error: null,

  setSettings: (settings) => set({ settings }),
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
