'use client';

import { useRef, useEffect, useState } from 'react';
import { ProductData } from '@/lib/types';
import { FontConfig } from './FontCustomizer';
import { calculateSimpleLayout, SimpleLayoutResult } from '@/lib/layout/simpleLayout';

interface LabelPreviewProps {
  labelSize: { width: number; height: number };
  productData: ProductData;
  fontConfigs?: Record<string, FontConfig>;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
  isExporting?: boolean;
  style?: React.CSSProperties;
  // 布局模式
  layout?: 'simple' | 'template';
  // 模板ID（可选）
  templateId?: string;
  // 自定义布局比例
  textAreaRatio?: number;
}

/**
 * 独立的热销标签预览组件
 * 支持多种布局模式和模板系统
 */
export default function LabelPreview({
  labelSize,
  productData,
  fontConfigs,
  onCanvasReady,
  className = '',
  isExporting = false,
  style,
  layout = 'simple',
  templateId,
  textAreaRatio = 0.65
}: LabelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [layoutResult, setLayoutResult] = useState<SimpleLayoutResult | null>(null);

  // 初始化画布
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算预览尺寸
    const previewSize = calculatePreviewSize(labelSize.width, labelSize.height);
    const renderScale = 2;
    
    canvas.width = previewSize.width * renderScale;
    canvas.height = previewSize.height * renderScale;
    canvas.style.width = `${previewSize.width}px`;
    canvas.style.height = `${previewSize.height}px`;

    ctx.scale(renderScale, renderScale);
    setIsLoading(false);

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [labelSize, onCanvasReady]);

  // 处理画布尺寸变化
  useEffect(() => {
    if (!canvasRef.current || !labelSize || labelSize.width <= 0 || labelSize.height <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewSize = calculatePreviewSize(labelSize.width, labelSize.height);
    const renderScale = 2;
    const canvasWidth = previewSize.width * renderScale;
    const canvasHeight = previewSize.height * renderScale;
    
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${previewSize.width}px`;
      canvas.style.height = `${previewSize.height}px`;
      ctx.scale(renderScale, renderScale);
    }
  }, [labelSize]);

  // 计算布局
  useEffect(() => {
    if (!labelSize || !productData || labelSize.width <= 0 || labelSize.height <= 0) return;

    const isSizeChange = labelSize.width !== 0 && labelSize.height !== 0;
    if (isSizeChange && !isExporting) {
      setIsRendering(true);
    }

    try {
      const result = calculateSimpleLayout(
        labelSize.width,
        labelSize.height,
        productData,
        undefined,
        textAreaRatio
      );

      setLayoutResult(result);
      renderLayoutToCanvas(result, labelSize);

      if (isSizeChange && !isExporting) {
        setTimeout(() => setIsRendering(false), 100);
      }
    } catch (error) {
      console.error('Layout calculation failed:', error);
      setIsRendering(false);
    }
  }, [labelSize, productData, textAreaRatio, fontConfigs, isExporting]);

  // 监听布局结果变化，重新渲染
  useEffect(() => {
    if (layoutResult && labelSize.width > 0 && labelSize.height > 0) {
      renderLayoutToCanvas(layoutResult, labelSize);
    }
  }, [layoutResult, labelSize, fontConfigs]);

  // 计算预览尺寸
  const calculatePreviewSize = (width: number, height: number) => {
    const maxWidth = 500;
    const maxHeight = 350;
    
    const aspectRatio = width / height;
    
    let previewWidth = maxWidth;
    let previewHeight = previewWidth / aspectRatio;
    
    if (previewHeight > maxHeight) {
      previewHeight = maxHeight;
      previewWidth = previewHeight * aspectRatio;
    }
    
    return { width: previewWidth, height: previewHeight };
  };

  // 绘制背景
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  };

  // 渲染布局到画布
  const renderLayoutToCanvas = (layout: SimpleLayoutResult, size: { width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewSize = calculatePreviewSize(size.width, size.height);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground(ctx, previewSize.width, previewSize.height);

    // 绘制区域分割线
    const textAreaWidth = previewSize.width * textAreaRatio;
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(textAreaWidth, 0);
    ctx.lineTo(textAreaWidth, previewSize.height);
    ctx.stroke();

    // 渲染元素
    layout.elements.forEach(element => {
      renderElement(ctx, element, previewSize, size, fontConfigs);
    });
  };

  // 渲染单个元素
  const renderElement = (
    ctx: CanvasRenderingContext2D,
    element: any,
    previewSize: { width: number; height: number },
    realSize: { width: number; height: number },
    fontConfigs?: Record<string, FontConfig>
  ) => {
    if (!element.text) return;

    const scale = Math.min(
      previewSize.width / mmToPixels(realSize.width), 
      previewSize.height / mmToPixels(realSize.height)
    );

    const fontConfig = fontConfigs?.[element.id] || {
      fontSize: element.fontSize,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const scaledFontSize = fontConfig.fontSize * scale;
    
    ctx.font = `${fontConfig.fontStyle} ${fontConfig.fontWeight} ${scaledFontSize}px ${fontConfig.fontFamily}`;
    ctx.fillStyle = fontConfig.color;
    ctx.textAlign = fontConfig.textAlign as CanvasTextAlign;
    ctx.textBaseline = 'top';

    const lines = element.text.split('\n');
    const lineHeight = scaledFontSize * 1.4;

    lines.forEach((line: string, index: number) => {
      const scaledX = element.x * scale;
      const scaledY = element.y * scale + index * lineHeight;
      
      let x = scaledX;
      if (element.align === 'center') {
        const textWidth = ctx.measureText(line).width;
        x = scaledX + (element.width * scale - textWidth) / 2;
      } else if (element.align === 'right') {
        const textWidth = ctx.measureText(line).width;
        x = scaledX + element.width * scale - textWidth;
      }

      const textWidth = ctx.measureText(line).width;
      if (x >= 0 && x + textWidth <= previewSize.width && 
          scaledY >= 0 && scaledY + scaledFontSize <= previewSize.height) {
        ctx.fillText(line, x, scaledY);
      }
    });
  };

  // mm转像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
  };

  if (labelSize.width <= 0 || labelSize.height <= 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-subheading text-gray-600 mb-2">请设置标签尺寸</div>
          <div className="text-caption text-gray-500">在下方输入宽度和高度来开始设计</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-caption text-gray-600">正在排版文字...</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-caption text-gray-600">正在加载画布...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="border-0 rounded-lg shadow-lg bg-white"
        style={{ 
          width: 'auto', 
          height: 'auto',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      />
    </div>
  );
}

