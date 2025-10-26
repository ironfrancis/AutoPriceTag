import { useState, useCallback, useEffect } from 'react';
import { LabelDesign, ProductData, FontConfig, LayoutElement } from '@/lib/types';

const STORAGE_KEY = 'auto-price-tag-label-design';

/**
 * 标签设计数据管理 Hook
 * 提供统一的数据表结构，支持保存、加载和同步
 */
export function useLabelDesign() {
  // 获取初始设计数据（从 LocalStorage 或默认值）
  const getInitialDesign = (): LabelDesign => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const designData: LabelDesign = JSON.parse(storedData);
        return designData;
      }
    } catch (error) {
      console.error('加载 LocalStorage 失败:', error);
    }
    
    // 返回默认值
    return {
      labelId: undefined,
      labelName: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      labelSize: { width: 80, height: 50 },
      productData: {
        name: '',
        price: 0,
        brand: '',
        sellingPoints: [],
        specs: {},
        customFields: {},
      },
      layout: {
        elements: [],
      },
      fontConfigs: {},
      settings: {
        editable: true,
      },
    };
  };

  const [design, setDesign] = useState<LabelDesign>(getInitialDesign);

  // 更新产品数据
  const updateProductData = useCallback((productData: ProductData) => {
    setDesign(prev => ({
      ...prev,
      productData,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新标签尺寸
  const updateLabelSize = useCallback((size: { width: number; height: number }) => {
    setDesign(prev => ({
      ...prev,
      labelSize: size,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新布局元素
  const updateLayoutElements = useCallback((elements: LayoutElement[]) => {
    setDesign(prev => ({
      ...prev,
      layout: { elements },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新单个布局元素
  const updateLayoutElement = useCallback((elementId: string, updates: Partial<LayoutElement>) => {
    setDesign(prev => ({
      ...prev,
      layout: {
        elements: prev.layout.elements.map(el =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新字体配置
  const updateFontConfig = useCallback((elementId: string, config: FontConfig) => {
    setDesign(prev => ({
      ...prev,
      fontConfigs: {
        ...prev.fontConfigs,
        [elementId]: config,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新所有字体配置
  const updateAllFontConfigs = useCallback((configs: Record<string, FontConfig>) => {
    setDesign(prev => ({
      ...prev,
      fontConfigs: configs,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 加载设计数据
  const loadDesign = useCallback((data: LabelDesign) => {
    setDesign({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  // 重置设计
  const resetDesign = useCallback(() => {
    setDesign({
      labelId: undefined,
      labelName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labelSize: { width: 80, height: 50 },
      productData: {
        name: '',
        price: 0,
        brand: '',
        sellingPoints: [],
        specs: {},
        customFields: {},
      },
      layout: {
        elements: [],
      },
      fontConfigs: {},
      settings: {
        editable: true,
      },
    });
  }, []);

  // 导出设计数据（用于保存）
  const exportDesign = useCallback((): LabelDesign => {
    return {
      ...design,
      updatedAt: new Date().toISOString(),
    };
  }, [design]);

  // 导入设计数据（用于加载）
  const importDesign = useCallback((data: LabelDesign) => {
    loadDesign(data);
  }, [loadDesign]);

  // 保存到 LocalStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const designData = {
        ...design,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designData));
      return true;
    } catch (error) {
      console.error('保存到 LocalStorage 失败:', error);
      return false;
    }
  }, [design]);

  // 从 LocalStorage 加载
  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const designData: LabelDesign = JSON.parse(storedData);
        loadDesign(designData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('从 LocalStorage 加载失败:', error);
      return false;
    }
  }, [loadDesign]);

  // 检查是否有保存的设计
  const hasStoredDesign = useCallback(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return !!storedData;
    } catch {
      return false;
    }
  }, []);

  // 注意：不在这里加载，因为初始状态已经使用 getInitialDesign

  return {
    design,
    updateProductData,
    updateLabelSize,
    updateLayoutElements,
    updateLayoutElement,
    updateFontConfig,
    updateAllFontConfigs,
    loadDesign,
    resetDesign,
    exportDesign,
    importDesign,
    saveToLocalStorage,
    loadFromLocalStorage,
    hasStoredDesign,
  };
}

