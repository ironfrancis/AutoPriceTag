'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductData } from '@/lib/types';
import { calculateOptimalLayout, LayoutElement } from '@/lib/layout/autoLayout';

interface LabelCanvasProps {
  labelSize: { width: number; height: number };
  productData: ProductData;
  onCanvasReady?: (canvas: any) => void;
  className?: string;
}

export default function LabelCanvas({ 
  labelSize, 
  productData, 
  onCanvasReady,
  className = '' 
}: LabelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);

  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初始化画布
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 400;
    canvas.height = 300;

    setIsLoading(false);

    // 通知父组件画布已准备就绪
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [onCanvasReady]);

  // 当尺寸或产品数据变化时，重新计算布局和渲染
  useEffect(() => {
    if (!labelSize || !productData || !canvasRef.current) return;

    setIsRendering(true);

    // 延迟渲染以显示过渡效果
    const timer = setTimeout(() => {
      try {
        // 计算最优布局
        const layoutResult = calculateOptimalLayout(
          labelSize.width,
          labelSize.height,
          productData
        );

        setLayoutElements(layoutResult.elements);

        // 渲染到画布
        renderToCanvas(layoutResult.elements, labelSize);

        // 结束渲染状态
        setTimeout(() => setIsRendering(false), 100);
      } catch (error) {
        console.error('Layout calculation failed:', error);
        setIsRendering(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [labelSize, productData]);

  // 渲染到画布
  const renderToCanvas = (elements: LayoutElement[], size: { width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const scale = 4; // 放大4倍以获得更好的渲染质量
    const canvasWidth = mmToPixels(size.width) * scale;
    const canvasHeight = mmToPixels(size.height) * scale;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth / scale}px`;
    canvas.style.height = `${canvasHeight / scale}px`;

    // 设置高DPI渲染
    ctx.scale(scale, scale);

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth / scale, canvasHeight / scale);

    // 设置背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth / scale, canvasHeight / scale);

    // 渲染每个元素
    elements.forEach(element => {
      renderElement(ctx, element);
    });
  };

  // 渲染单个元素
  const renderElement = (ctx: CanvasRenderingContext2D, element: LayoutElement) => {
    if (!element.text) return;

    // 设置字体
    ctx.font = `${element.fontSize}px "Noto Sans SC", sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    // 处理多行文本
    const lines = element.text.split('\n');
    const lineHeight = element.fontSize * 1.2;

    lines.forEach((line, index) => {
      let x = element.x;
      
      // 根据对齐方式调整x坐标
      if (element.align === 'center') {
        const textWidth = ctx.measureText(line).width;
        x = element.x + (element.width - textWidth) / 2;
      } else if (element.align === 'right') {
        const textWidth = ctx.measureText(line).width;
        x = element.x + element.width - textWidth;
      }

      const y = element.y + index * lineHeight;
      
      // 绘制文本
      ctx.fillText(line, x, y);
    });
  };

  // mm转像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.78;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 渲染状态指示器 */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">正在智能排版...</p>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">正在加载画布...</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded shadow-sm bg-white"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* 尺寸信息 */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>尺寸: {labelSize.width}×{labelSize.height}mm</p>
          <p>元素数量: {layoutElements.length}</p>
        </div>
      </div>
    </div>
  );
}