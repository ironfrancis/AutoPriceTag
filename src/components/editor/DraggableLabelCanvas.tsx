'use client';

import { useRef, useEffect, useState } from 'react';
import { ProductData } from '@/lib/types';
import { calculateSimpleLayout, SimpleLayoutResult } from '@/lib/layout/simpleLayout';
import { FontConfig } from './FontCustomizer';

interface DraggableLabelCanvasProps {
  labelSize: { width: number; height: number };
  productData: ProductData;
  fontConfigs?: Record<string, FontConfig>;
  onCanvasReady?: (stage: any) => void;
  className?: string;
  editable?: boolean; // 是否开启编辑模式
  onLayoutChange?: (layout: SimpleLayoutResult) => void;
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
  draggable: boolean;
  selected: boolean;
}

export default function DraggableLabelCanvas({
  labelSize,
  productData,
  fontConfigs,
  onCanvasReady,
  className = '',
  editable = false,
  onLayoutChange
}: DraggableLabelCanvasProps) {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [elements, setElements] = useState<DraggableElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [KonvaComponents, setKonvaComponents] = useState<any>(null);

  // 动态加载 Konva 组件（只在客户端）
  useEffect(() => {
    import('react-konva').then((module) => {
      setKonvaComponents({
        Stage: module.Stage,
        Layer: module.Layer,
        Text: module.Text,
        Rect: module.Rect,
        Group: module.Group,
      });
      setIsClient(true);
    });
  }, []);

  // mm转像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
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

  // 初始化：从布局计算生成可拖拽元素
  useEffect(() => {
    if (!labelSize || !productData || labelSize.width <= 0 || labelSize.height <= 0) return;

    try {
      // 使用现有的布局计算逻辑
      const layoutResult = calculateSimpleLayout(
        labelSize.width,
        labelSize.height,
        productData
      );

      // 转换为可拖拽元素
      const draggableElements: DraggableElement[] = layoutResult.elements.map(el => ({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        text: el.text,
        fontSize: fontConfigs?.[el.id]?.fontSize || el.fontSize,
        fontWeight: fontConfigs?.[el.id]?.fontWeight || 400,
        fontStyle: fontConfigs?.[el.id]?.fontStyle || 'normal',
        color: fontConfigs?.[el.id]?.color || '#111827',
        align: el.align,
        draggable: editable, // 只有编辑模式下才可拖拽
        selected: false
      }));

      setElements(draggableElements);

      // 通知外部布局变化
      if (onLayoutChange) {
        onLayoutChange(layoutResult);
      }
    } catch (error) {
      console.error('Layout calculation failed:', error);
    }
  }, [labelSize, productData, fontConfigs, editable, onLayoutChange]);

  // 初始化Stage
  useEffect(() => {
    if (stageRef.current && onCanvasReady) {
      onCanvasReady(stageRef.current);
    }
  }, [onCanvasReady]);

  // 监听容器尺寸变化，计算缩放
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

  const displaySize = calculateDisplaySize(labelSize.width, labelSize.height);

  // 处理元素拖拽
  const handleDragEnd = (id: string) => (e: any) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    setElements(prev => 
      prev.map(el => 
        el.id === id ? { ...el, x: newX, y: newY } : el
      )
    );

    console.log(`Element ${id} moved to:`, { x: newX, y: newY });
  };

  // 处理元素选择
  const handleSelect = (id: string) => () => {
    if (!editable) return;
    
    setSelectedId(id);
    setElements(prev =>
      prev.map(el => ({
        ...el,
        selected: el.id === id
      }))
    );
  };

  // 点击背景取消选择
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setElements(prev => prev.map(el => ({ ...el, selected: false })));
    }
  };

  // 导出Canvas方法（供父组件使用）
  const exportAsCanvas = (): HTMLCanvasElement | null => {
    if (!stageRef.current) return null;
    
    const stage = stageRef.current;
    // Konva的toCanvas方法会返回HTMLCanvasElement
    return stage.toCanvas();
  };

  // 将导出方法暴露给父组件
  useEffect(() => {
    if (stageRef.current && onCanvasReady) {
      // 给Stage添加自定义方法
      stageRef.current.getExportCanvas = exportAsCanvas;
    }
  }, []);

  // 如果不在客户端或Konva组件未加载，显示加载状态
  if (!isClient || !KonvaComponents) {
    return (
      <div 
        ref={containerRef} 
        className={`relative ${className}`} 
        style={{ width: '100%', height: '100%' }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">正在加载画布...</p>
          </div>
        </div>
      </div>
    );
  }

  const { Stage, Layer, Text, Rect, Group } = KonvaComponents;

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`} 
      style={{ width: '100%', height: '100%' }}
    >
      <div className="h-full flex items-center justify-center">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          <Stage
            ref={stageRef}
            width={displaySize.width}
            height={displaySize.height}
            onClick={handleStageClick}
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px'
            }}
          >
            <Layer>
              {/* 背景 */}
              <Rect
                x={0}
                y={0}
                width={displaySize.width}
                height={displaySize.height}
                fill="#FFFFFF"
                strokeWidth={0.5}
                stroke="rgba(0, 0, 0, 0.08)"
                cornerRadius={2}
              />

              {/* 可拖拽元素 */}
              {elements.map((element) => (
                <Group key={element.id}>
                  {/* 选中时的高亮背景 */}
                  {element.selected && editable && (
                    <Rect
                      x={element.x - 4}
                      y={element.y - 4}
                      width={element.width + 8}
                      height={element.height + 8}
                      fill="rgba(59, 130, 246, 0.1)"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dash={[5, 5]}
                      cornerRadius={4}
                    />
                  )}

                  {/* 文本元素 */}
                  <Text
                    id={element.id}
                    x={element.x}
                    y={element.y}
                    text={element.text}
                    fontSize={element.fontSize}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontStyle={element.fontStyle}
                    fill={element.color}
                    width={element.width}
                    align={element.align}
                    draggable={element.draggable}
                    onClick={handleSelect(element.id)}
                    onDragEnd={handleDragEnd(element.id)}
                    onMouseEnter={(e: any) => {
                      if (editable) {
                        const container = e.target.getStage()?.container();
                        if (container) {
                          container.style.cursor = 'move';
                        }
                      }
                    }}
                    onMouseLeave={(e: any) => {
                      const container = e.target.getStage()?.container();
                      if (container) {
                        container.style.cursor = 'default';
                      }
                    }}
                  />
                </Group>
              ))}
            </Layer>
          </Stage>
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

