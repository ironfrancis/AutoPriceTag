'use client';

import { useState, useEffect, useRef } from 'react';
import { PlacedLabelInstance } from '@/lib/types';
import PlacedLabelItem from './PlacedLabelItem';
import { ZoomIn, ZoomOut, RotateCcw, Grid } from 'lucide-react';

interface PageCanvasProps {
  canvasSize: { width: number; height: number };
  instances: PlacedLabelInstance[];
  onInstanceSelect: (instance: PlacedLabelInstance) => void;
  onInstanceUpdate: (instance: PlacedLabelInstance) => void;
  onInstanceDelete: (instance: PlacedLabelInstance) => void;
  selectedInstance?: PlacedLabelInstance;
  showGrid?: boolean;
}

/**
 * PageCanvas 组件
 * 
 * 功能：
 * - 渲染整页画布
 * - 显示网格辅助线
 * - 支持缩放和平移
 * - 处理标签实例的拖拽
 * - 显示标签边界
 */
export default function PageCanvas({
  canvasSize,
  instances,
  onInstanceSelect,
  onInstanceUpdate,
  onInstanceDelete,
  selectedInstance,
  showGrid = false
}: PageCanvasProps) {
  // 初始缩放值（服务端和客户端统一）
  const [zoom, setZoom] = useState(0.3); // 默认30%缩放
  const [isMounted, setIsMounted] = useState(false);

  // 组件挂载后计算合适的缩放比例
  useEffect(() => {
    setIsMounted(true);
    
    // 计算初始缩放（自动适应容器大小）
    const calculateInitialZoom = () => {
      // A4纸张（210×297mm）按100dpi计算
      const canvasWidthPx = canvasSize.width * 3.7795275591; // mm转px
      const canvasHeightPx = canvasSize.height * 3.7795275591;
      
      // 获取容器最大可用尺寸（留50px边距）
      const maxWidth = (window.innerWidth * 0.7) - 100; // 70%宽度
      const maxHeight = window.innerHeight - 200;
      
      // 计算缩放比例以适合容器
      const scaleX = maxWidth / canvasWidthPx;
      const scaleY = maxHeight / canvasHeightPx;
      
      // 取较小的值，确保画布完整显示
      const initialZoom = Math.min(scaleX, scaleY, 1.5); // 最大不超过150%
      
      return Math.max(0.3, initialZoom); // 最小30%
    };
    
    const initialZoom = calculateInitialZoom();
    setZoom(initialZoom);
  }, [canvasSize.width, canvasSize.height]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 计算显示尺寸（考虑缩放）
  // 注意：画布尺寸是 mm，需要转换为像素再缩放显示
  const mmToPx = 3.7795275591; // mm转像素
  
  const displaySize = {
    width: canvasSize.width * mmToPx * zoom,
    height: canvasSize.height * mmToPx * zoom
  };

  // 自动居中画布
  useEffect(() => {
    const updatePan = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const displayWidth = displaySize.width;
      const displayHeight = displaySize.height;
      
      // 计算居中所需的偏移量（因为容器使用了flex居中，所以不需要额外的偏移）
      setPanX(0);
      setPanY(0);
    };

    // 初始设置
    updatePan();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updatePan);
    return () => window.removeEventListener('resize', updatePan);
  }, [canvasSize.width, canvasSize.height, zoom]);

  // 鼠标滚轮缩放
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.min(Math.max(0.1, prev + delta), 2));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // 处理画布拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 标签实例拖拽处理
  const [dragInstance, setDragInstance] = useState<PlacedLabelInstance | null>(null);

  const handleInstanceDragStart = (instance: PlacedLabelInstance, e: React.DragEvent) => {
    setDragInstance(instance);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleInstanceDragEnd = () => {
    setDragInstance(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragInstance) return;

    // 计算新的位置
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;

      const updatedInstance = {
        ...dragInstance,
        position: { x, y }
      };

      onInstanceUpdate(updatedInstance);
    }
  };

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleResetView = () => {
    // 计算初始缩放（自动适应容器大小）
    const calculateInitialZoom = () => {
      // A4纸张（210×297mm）按100dpi计算
      const canvasWidthPx = canvasSize.width * 3.7795275591; // mm转px
      const canvasHeightPx = canvasSize.height * 3.7795275591;
      
      // 获取容器最大可用尺寸（留50px边距）
      const maxWidth = (window.innerWidth * 0.7) - 100; // 70%宽度
      const maxHeight = window.innerHeight - 200;
      
      // 计算缩放比例以适合容器
      const scaleX = maxWidth / canvasWidthPx;
      const scaleY = maxHeight / canvasHeightPx;
      
      // 取较小的值，确保画布完整显示
      const initialZoom = Math.min(scaleX, scaleY, 1.5); // 最大不超过150%
      
      return Math.max(0.3, initialZoom); // 最小30%
    };
    
    // 重置为初始缩放
    const initialZoom = calculateInitialZoom();
    setZoom(initialZoom);
    // 重置偏移量（让flex容器自动居中）
    setPanX(0);
    setPanY(0);
  };

  // 绘制网格
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 10 * zoom; // 10mm网格
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* 工具栏 */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="放大"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="重置视图"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 画布 */}
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`,
            transform: `translate(${panX}px, ${panY}px)`,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* 网格层 */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent ${10 * zoom - 1}px, #e5e7eb ${10 * zoom - 1}px, #e5e7eb ${10 * zoom}px),
                  repeating-linear-gradient(90deg, transparent, transparent ${10 * zoom - 1}px, #e5e7eb ${10 * zoom - 1}px, #e5e7eb ${10 * zoom}px)
                `
              }}
            />
          )}

          {/* 标签实例列表 */}
          {instances.map(instance => (
            <PlacedLabelItem
              key={instance.id}
              instance={instance}
              isSelected={selectedInstance?.id === instance.id}
              onSelect={onInstanceSelect}
              onDragStart={handleInstanceDragStart}
              onDragEnd={handleInstanceDragEnd}
              onDelete={onInstanceDelete}
              scale={zoom}
            />
          ))}
        </div>
      </div>

      {/* 状态栏 */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md z-20">
        <div className="text-sm text-gray-600">
          画布: {canvasSize.width}×{canvasSize.height}mm | 
          缩放: {Math.round(zoom * 100)}% | 
          标签数: {instances.length}
        </div>
        <div className="text-sm text-gray-600">
          按住 Shift + 拖拽 平移画布
        </div>
      </div>
    </div>
  );
}
