'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ProductData } from '@/lib/types';
import { calculateSimpleLayout, SimpleLayoutResult, generateElementDefinitions, ElementDefinition } from '@/lib/layout/simpleLayout';
import { FontConfig } from './FontCustomizer';

interface DraggableLabelCanvasProps {
  labelSize: { width: number; height: number };
  productData: ProductData;
  fontConfigs?: Record<string, FontConfig>;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onElementSelect?: (elementId: string | null) => void;
  onTextChange?: (elementId: string, newText: string) => void;
  className?: string;
  editable?: boolean;
  onLayoutChange?: (layout: SimpleLayoutResult) => void;
  onElementsChange?: (elements: DraggableElement[]) => void;
  onGetElements?: (getElements: () => DraggableElement[]) => void;
  savedLayout?: { elements: Array<{ id: string; x: number; y: number; text: string }> };
}

interface DraggableElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  color: string;
  align: 'left' | 'center' | 'right';
  selected: boolean;
  fontFamily?: string;
}

interface Point {
  x: number;
  y: number;
}

export default function DraggableLabelCanvas({
  labelSize,
  productData,
  fontConfigs,
  onCanvasReady,
  onElementSelect,
  onTextChange,
  className = '',
  editable = false,
  onLayoutChange,
  onElementsChange,
  onGetElements,
  savedLayout
}: DraggableLabelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [elements, setElements] = useState<DraggableElement[]>([]);
  
  // 存储可见性映射（元素ID -> 是否可见）
  const [visibleElements, setVisibleElements] = useState<Map<string, boolean>>(new Map());
  
  // 从 savedLayout 初始化可见性
  useEffect(() => {
    if (savedLayout && savedLayout.elements.length > 0) {
      const visibilityMap = new Map<string, boolean>();
      savedLayout.elements.forEach(el => {
        // visible 字段可能在旧数据中不存在，默认为 true
        const isVisible = (el as any).visible !== false;
        visibilityMap.set(el.id, isVisible);
      });
      setVisibleElements(visibilityMap);
    }
  }, [savedLayout]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<{ id: string; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef(false);

  // mm转像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
  };

  /**
   * 计算文本的实际位置和尺寸（统一函数，遵循DRY原则）
   * 
   * 当 labelSize 变化时，所有元素都会自动重新计算位置：
   * 1. 画布组件的 useEffect 监听 labelSize 变化
   * 2. 自动重新计算 displaySize（像素尺寸）
   * 3. 从百分比位置转换为新的像素位置
   * 4. 所有元素按新的像素位置渲染
   */
  const getTextBounds = (element: DraggableElement, ctx: CanvasRenderingContext2D) => {
    // 设置字体以测量文本
    ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily || 'system-ui, -apple-system, sans-serif'}`;
    
    // 测量文本实际尺寸
    const metrics = ctx.measureText(element.text);
    const actualTextWidth = metrics.width;
    const actualTextHeight = element.fontSize;
    
    // 现在element.x已经是文本左边界坐标（在初始化时已调整）
    const textLeft = element.x;
    const textRight = element.x + actualTextWidth;
    const textTop = element.y;
    const textBottom = element.y + actualTextHeight;
    
    // 绘制时的x坐标
    let drawX = element.x;
    if (element.align === 'center') {
      drawX = element.x + actualTextWidth / 2;
    } else if (element.align === 'right') {
      drawX = element.x + actualTextWidth;
    }
    
    return {
      textLeft,
      textRight,
      textTop,
      textBottom,
      actualTextWidth,
      actualTextHeight,
      drawX
    };
  };

  // 计算显示尺寸
  const calculateDisplaySize = (widthMm: number, heightMm: number) => {
    const widthPx = mmToPixels(widthMm);
    const heightPx = mmToPixels(heightMm);
    
    const MAX_WIDTH = 2000;
    const MAX_HEIGHT = 1500;
    
    let displayWidth = widthPx;
    let displayHeight = heightPx;
    
    if (displayWidth > MAX_WIDTH) {
      const scale = MAX_WIDTH / displayWidth;
      displayWidth = MAX_WIDTH;
      displayHeight = displayHeight * scale;
    }
    
    if (displayHeight > MAX_HEIGHT) {
      const scale = MAX_HEIGHT / displayHeight;
      displayHeight = MAX_HEIGHT;
      displayWidth = displayWidth * scale;
    }
    
    return { width: displayWidth, height: displayHeight };
  };

  /**
   * 生成元素文本内容的辅助函数
   * 
   * 支持动态元素识别：
   * - 核心字段：product_name, product_price, brand
   * - 卖点：selling_point_0, selling_point_1, ...
   * - 规格：spec_color, spec_weight, ...
   * - 自定义字段：custom_field_name, ...
   */
  const getElementText = (elementId: string, fieldKey?: string): string => {
    // 核心字段
    if (elementId === 'product_name') return productData?.name || '';
    if (elementId === 'product_price') return productData?.price ? `¥${productData.price}` : '¥0';
    if (elementId === 'brand') return productData?.brand || '';
    
    // 卖点
    if (elementId.startsWith('selling_point_')) {
      const index = parseInt(elementId.replace('selling_point_', ''));
      return productData?.sellingPoints?.[index] || '';
    }
    
    // 规格
    if (elementId.startsWith('spec_') && fieldKey) {
      const value = productData?.specs?.[fieldKey] || '';
      return `${fieldKey}: ${value}`;
    }
    
    // 自定义字段
    if (elementId.startsWith('custom_') && fieldKey) {
      const value = productData?.customFields?.[fieldKey] || '';
      return `${fieldKey}: ${value}`;
    }
    
    return '';
  };

  /**
   * 初始化画布元素
   * 
   * 核心逻辑：
   * 1. 如果有保存的布局（savedLayout），加载并恢复元素位置
   * 2. 否则，使用自动布局算法生成初始位置
   * 3. 确保所有有效字段都被创建为可拖拽元素
   * 4. 所有元素的初始位置都在可见区域内
   * 
   * 可见性保证：
   * - 使用内边距（padding）确保元素不贴边
   * - 使用权重系统分配空间，确保所有元素都有合理位置
   * - 元素间距（spacing）确保不重叠
   */
  useEffect(() => {
    if (!labelSize || !productData || labelSize.width <= 0 || labelSize.height <= 0) return;

    try {
      // 优先加载保存的布局（用户已调整过位置）
      if (savedLayout && savedLayout.elements.length > 0) {
        // 计算当前画布显示尺寸（转换为像素）
        const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);
        
        // 加载保存的布局，恢复元素位置
        const draggableElements: DraggableElement[] = savedLayout.elements.map(savedEl => {
          const fontConfig = fontConfigs?.[savedEl.id];
          
          // 位置格式转换：
          // 新格式：百分比（0-100），需要转换回像素
          // 旧格式：直接像素值（兼容性）
          let x: number, y: number;
          if (savedEl.x >= 0 && savedEl.x <= 100) {
            // 新格式：百分比转换为像素
            // displaySize 是当前画布的实际像素尺寸
            x = (savedEl.x / 100) * displaySize.width;
            y = (savedEl.y / 100) * displaySize.height;
          } else {
            // 旧格式：直接使用像素值（兼容性）
            x = savedEl.x;
            y = savedEl.y;
          }
          
        return {
          id: savedEl.id,
          x,
          y,
          width: 100, // 默认宽度，实际计算时不会使用
          height: fontConfig?.fontSize || 16,
          // 优先使用保存的文本，如果没有则从 productData 实时获取
          text: savedEl.text || getElementText(savedEl.id),
          fontSize: fontConfig?.fontSize || 16,
          fontWeight: fontConfig?.fontWeight || 400,
          fontStyle: fontConfig?.fontStyle || 'normal',
          color: fontConfig?.color || '#111827',
          align: (fontConfig?.textAlign === 'center' ? 'center' : 
                  fontConfig?.textAlign === 'right' ? 'right' : 'left') as 'left' | 'center' | 'right',
          selected: false,
          fontFamily: fontConfig?.fontFamily || 'system-ui, -apple-system, sans-serif'
        };
      });
      setElements(draggableElements);
      isInitializedRef.current = true;
      return;
    }

    // 否则使用自动布局
    const layoutResult = calculateSimpleLayout(
      labelSize.width,
      labelSize.height,
      productData
    );

    const draggableElements: DraggableElement[] = layoutResult.elements.map(el => {
      // 对于居中对齐的元素，布局返回的x是容器左边界，width是容器宽度
      // 我们需要计算文本的实际左边界并更新x坐标
      let adjustedX = el.x;
      
      if (el.align === 'center') {
        // 创建一个临时canvas来计算文本宽度
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.font = `${el.fontSize}px "Helvetica Neue", system-ui, -apple-system, sans-serif`;
          const textWidth = tempCtx.measureText(el.text).width;
          // 文本左边界 = 容器中心 - 文本宽度的一半
          adjustedX = el.x + el.width / 2 - textWidth / 2;
        }
      }
      
      return {
        id: el.id,
        x: adjustedX,
        y: el.y,
        width: el.width,
        height: el.height,
        text: el.text, // 从布局结果获取文本
        fontSize: fontConfigs?.[el.id]?.fontSize || el.fontSize,
        fontWeight: fontConfigs?.[el.id]?.fontWeight || 400,
        fontStyle: fontConfigs?.[el.id]?.fontStyle || 'normal',
        color: fontConfigs?.[el.id]?.color || '#111827',
        align: el.align,
        selected: false,
        fontFamily: fontConfigs?.[el.id]?.fontFamily || 'system-ui, -apple-system, sans-serif'
      };
    });

    setElements(draggableElements);
    isInitializedRef.current = true;

    if (onLayoutChange) {
      onLayoutChange(layoutResult);
    }

    if (onElementsChange) {
      onElementsChange(draggableElements);
    }
  } catch (error) {
    console.error('Layout calculation failed:', error);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [labelSize, productData.name, productData.price, productData.brand, savedLayout, fontConfigs]);

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerRect = container.getBoundingClientRect();
      const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);
      
      const edgePadding = 0.03;
      const scaleX = (containerRect.width * (1 - edgePadding * 2)) / displaySize.width;
      const scaleY = (containerRect.height * (1 - edgePadding * 2)) / displaySize.height;
      
      const calculatedScale = Math.min(scaleX, scaleY);
      const finalScale = Math.max(0.5, Math.min(calculatedScale, 3.0));
      
      setScale(finalScale);
    };
    
    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateScale);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [labelSize]);

  // 初始化canvas尺寸（只执行一次）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);
    const dpr = window.devicePixelRatio || 1;
    // 使用更高的精度倍率（2倍DPR以提高清晰度）
    const qualityMultiplier = Math.max(2, dpr * 1.5);
    
    // 设置canvas实际尺寸为显示尺寸的倍率倍
    canvas.width = displaySize.width * qualityMultiplier;
    canvas.height = displaySize.height * qualityMultiplier;
    
    // 设置canvas显示尺寸
    canvas.style.width = `${displaySize.width}px`;
    canvas.style.height = `${displaySize.height}px`;
    
    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;
    
    // 设置高质量渲染选项
    ctx.textBaseline = 'top';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 缩放上下文以匹配质量倍率（只执行一次）
    ctx.scale(qualityMultiplier, qualityMultiplier);
  }, [labelSize]);

  // 绘制画布
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true 
    });
    if (!ctx) return;

  const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);

    // 清除画布
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);

    // 绘制背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displaySize.width, displaySize.height);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0, 0, displaySize.width, displaySize.height);

    // 绘制元素（只绘制可见的）
    elements.forEach((element) => {
      // 检查元素是否可见
      const isVisible = visibleElements.get(element.id) !== false;
      if (!isVisible) return;
      
      const bounds = getTextBounds(element, ctx);
      
      // 绘制选中高亮
      if (element.selected && editable) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(
          bounds.textLeft - 4,
          bounds.textTop - 4,
          bounds.actualTextWidth + 8,
          bounds.actualTextHeight + 8
        );

        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          bounds.textLeft - 4,
          bounds.textTop - 4,
          bounds.actualTextWidth + 8,
          bounds.actualTextHeight + 8
        );
        ctx.setLineDash([]);
      }

      // 绘制文本
      ctx.fillStyle = element.color;
      ctx.textAlign = element.align;
      ctx.textBaseline = 'top';
      
      // 设置字体（确保与测量时一致）
      ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily || 'system-ui, -apple-system, sans-serif'}`;

      ctx.fillText(element.text, bounds.drawX, element.y);
    });
  }, [elements, labelSize, editable]);

  // 重绘画布
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 当元素变化时通知外部（移除自动通知，避免频繁更新）
  // 注释掉自动通知，只在必要时（如保存时）手动通知
  // useEffect(() => {
  //   if (onElementsChange) {
  //     onElementsChange(elements);
  //   }
  // }, [elements, onElementsChange]);

  // 通知外部canvas就绪
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  // 暴露获取元素的方法
  useEffect(() => {
    if (onGetElements) {
      onGetElements(() => elements);
    }
  }, [elements, onGetElements]);

  // 监听 fontConfigs 变化并更新元素样式（不影响位置）
  useEffect(() => {
    // 跳过初始化阶段
    if (!isInitializedRef.current) return;
    
    if (!fontConfigs || Object.keys(fontConfigs).length === 0) return;
    
    setElements(prev => {
      let hasChanged = false;
      const updated = prev.map(el => {
        const config = fontConfigs[el.id];
        if (config) {
          const newFontSize = config.fontSize || el.fontSize;
          const newFontWeight = config.fontWeight || el.fontWeight;
          const newFontStyle = config.fontStyle || el.fontStyle;
          const newColor = config.color || el.color;
          const newFontFamily = config.fontFamily || el.fontFamily;
          
          // 检查是否有实际变化
          if (newFontSize !== el.fontSize || newFontWeight !== el.fontWeight || 
              newFontStyle !== el.fontStyle || newColor !== el.color || 
              newFontFamily !== el.fontFamily) {
            hasChanged = true;
            return {
              ...el,
              fontSize: newFontSize,
              fontWeight: newFontWeight,
              fontStyle: newFontStyle,
              color: newColor,
              fontFamily: newFontFamily
            };
          }
        }
        return el;
      });
      
      // 只有真正变化时才更新
      return hasChanged ? updated : prev;
    });
  }, [fontConfigs]);

  /**
   * 监听 productData 变化并更新元素
   * 
   * 核心逻辑：
   * 1. 当 productData 变化时，重新生成所有元素定义
   * 2. 保留已有元素的位置和样式，只更新文本
   * 3. 新增元素使用自动布局计算初始位置
   * 4. 删除元素从画布中移除
   */
  useEffect(() => {
    // 跳过初始化阶段
    if (!isInitializedRef.current) return;
    
    if (!productData) return;
    
    // 重新生成所有元素定义
    const newElementDefs = generateElementDefinitions(productData);
    
    setElements(prev => {
      // 创建新元素的映射
      const elementMap = new Map(prev.map(el => [el.id, el]));
      const newElements: DraggableElement[] = [];
      
      // 为每个新元素定义创建或更新元素
      for (const def of newElementDefs) {
        const existing = elementMap.get(def.id);
        
        if (existing) {
          // 元素已存在，保留位置和样式，只更新文本
          newElements.push({
            ...existing,
            text: getElementText(def.id, def.fieldKey)
          });
        } else {
          // 新元素，需要计算初始位置
          // 这里我们使用自动布局的近似位置
          // 实际位置会在下次初始化时计算
          newElements.push({
            id: def.id,
            x: 0,
            y: 0,
            width: 100,
            height: 16,
            text: getElementText(def.id, def.fieldKey),
            fontSize: 14,
            fontWeight: 400,
            fontStyle: 'normal',
            color: '#111827',
            align: def.id === 'product_price' ? 'center' : 'left',
            selected: false,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          });
        }
      }
      
      // 如果元素数量或内容发生变化，触发更新
      if (newElements.length !== prev.length || 
          newElements.some((el, idx) => el.text !== prev[idx]?.text)) {
        return newElements;
      }
      
      return prev;
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData.name, productData.price, productData.brand, 
      productData.sellingPoints, productData.specs, productData.customFields]);

  // 使用 ref 存储最新的 elements，避免闭包问题
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // 获取点击的元素
  const getElementAtPoint = useCallback((x: number, y: number): DraggableElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // 从 ref 中读取最新的 elements
    for (const element of elementsRef.current) {
      const bounds = getTextBounds(element, ctx);
      
      if (
        x >= bounds.textLeft &&
        x <= bounds.textRight &&
        y >= bounds.textTop &&
        y <= bounds.textBottom
      ) {
        return element;
      }
    }
    return null;
  }, []);

  // 双击进入编辑模式
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const element = getElementAtPoint(x, y);
    
    if (element) {
      setEditingText({ id: element.id, text: element.text });
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editable, scale]);

  // 处理鼠标事件
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvasRef.current || editingText) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 计算实际canvas坐标（同时考虑外层scale和DPR）
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const element = getElementAtPoint(x, y);
    
    if (element) {
      setIsDragging(true);
      
      // element.x 现在已经是文本左边界坐标，直接计算偏移
      setDragOffset({
        x: x - element.x,
        y: y - element.y
      });
      
      setSelectedId(element.id);
    setElements(prev =>
      prev.map(el => ({
        ...el,
          selected: el.id === element.id
      }))
    );
      
      // 通知外部选中的元素
      if (onElementSelect) {
        onElementSelect(element.id);
      }
    } else {
      setSelectedId(null);
      setElements(prev => prev.map(el => ({ ...el, selected: false })));
      
      // 通知外部取消选择
      if (onElementSelect) {
        onElementSelect(null);
      }
    }
  }, [editable, editingText, scale, onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !editable || !canvasRef.current || !selectedId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const rawX = (e.clientX - rect.left) / scale - dragOffset.x;
    const rawY = (e.clientY - rect.top) / scale - dragOffset.y;

    // 找到当前元素
    const currentElement = elements.find(el => el.id === selectedId);
    if (!currentElement) return;

    // 使用统一的文本边界计算函数
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bounds = getTextBounds(currentElement, ctx);
    const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);
    
    let x, y;
    
    // 对于所有对齐方式，rawX 都是相对于文本左边界的坐标
    // 我们只需要确保文本在画布内即可
    x = Math.max(0, Math.min(rawX, displaySize.width - bounds.actualTextWidth));
    
    y = Math.max(0, Math.min(rawY, displaySize.height - bounds.actualTextHeight));

    setElements(prev =>
      prev.map(el =>
        el.id === selectedId ? { ...el, x, y } : el
      )
    );
  }, [isDragging, editable, selectedId, dragOffset, elements, labelSize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // 全局鼠标事件处理，确保拖拽不会因鼠标离开canvas而中断
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current || !selectedId) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        const rawX = (e.clientX - rect.left) / scale - dragOffset.x;
        const rawY = (e.clientY - rect.top) / scale - dragOffset.y;

        // 找到当前元素（使用 ref 中的最新元素）
        const currentElement = elementsRef.current.find(el => el.id === selectedId);
        if (!currentElement) return;

        // 使用统一的文本边界计算函数
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const bounds = getTextBounds(currentElement, ctx);
        const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);
        
        let x, y;
        
        // 对于所有对齐方式，rawX 都是相对于文本左边界的坐标
        // 我们只需要确保文本在画布内即可
        x = Math.max(0, Math.min(rawX, displaySize.width - bounds.actualTextWidth));
        
        y = Math.max(0, Math.min(rawY, displaySize.height - bounds.actualTextHeight));

        setElements(prev =>
          prev.map(el =>
            el.id === selectedId ? { ...el, x, y } : el
          )
        );
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, selectedId, dragOffset, elements, labelSize, scale]);

  // 导出canvas
  const exportAsCanvas = useCallback((): HTMLCanvasElement | null => {
    return canvasRef.current;
  }, []);

  // 更新元素位置的方法
  const updateElementPosition = useCallback((elementId: string, x: number, y: number) => {
    setElements(prev =>
      prev.map(el =>
        el.id === elementId ? { ...el, x, y } : el
      )
    );
  }, []);

  // 暴露导出方法和更新位置方法
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      (canvasRef.current as any).getExportCanvas = exportAsCanvas;
      (canvasRef.current as any).updateElementPosition = updateElementPosition;
    }
  }, [onCanvasReady, exportAsCanvas, updateElementPosition]);

  const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`} 
      style={{ width: '100%', height: '100%' }}
    >
      <div className="h-full flex items-center justify-center">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              cursor: editable ? (isDragging ? 'grabbing' : 'default') : 'default'
            }}
          />
          
          {/* 文本编辑输入框 */}
          {editingText && (() => {
            const element = elements.find(el => el.id === editingText.id);
            if (!element) return null;
            
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return null;
            
            ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px system-ui, -apple-system, sans-serif`;
            const actualTextWidth = Math.max(150, Math.min(ctx.measureText(element.text).width + 20, 400));
            const actualTextHeight = element.fontSize * 1.5;
            
            let editX = element.x;
            let editY = element.y - 2;
            
            if (element.align === 'center') {
              editX = element.x + element.width / 2 - actualTextWidth / 2;
            } else if (element.align === 'right') {
              editX = element.x + element.width - actualTextWidth;
            }
            
            return (
              <input
                ref={inputRef}
                type="text"
                value={editingText.text}
                onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
                onBlur={() => {
                  if (editingText && editingText.text !== '') {
                    setElements(prev =>
                      prev.map(el =>
                        el.id === editingText.id ? { ...el, text: editingText.text } : el
                      )
                    );
                    
                    // 通知外部文本变更
                    if (onTextChange) {
                      onTextChange(editingText.id, editingText.text);
                    }
                  }
                  setEditingText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setEditingText(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${editX}px`,
                  top: `${editY}px`,
                  width: `${actualTextWidth}px`,
                  minHeight: `${actualTextHeight}px`,
                  height: 'auto',
                  padding: '4px 8px',
                  border: '2px solid #3B82F6',
                  borderRadius: '4px',
                  fontSize: `${element.fontSize}px`,
                  fontFamily: element.fontFamily || 'system-ui, -apple-system, sans-serif',
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  color: element.color,
                  backgroundColor: 'white',
                  outline: 'none',
                  zIndex: 1000,
                  lineHeight: '1.2'
                }}
              />
            );
          })()}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
        <div className="flex items-center justify-center gap-x-3 text-xs bg-white rounded px-3 py-1">
          <span className="font-medium text-gray-700">
            {labelSize.width > 0 && labelSize.height > 0 
              ? `${labelSize.width}×${labelSize.height}mm` 
              : '未设置尺寸'}
          </span>
          
          {elements.length > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-purple-600">{elements.length}个元素</span>
            </>
          )}
          
          <span className="text-gray-400">•</span>
          <span className="text-orange-600">缩放 {Math.round(scale * 100)}%</span>
          
          {editable && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-green-600">✏️ 编辑模式</span>
            </>
          )}
          
          {selectedId && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-blue-600">已选择: {selectedId}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

