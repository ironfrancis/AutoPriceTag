'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductData } from '@/lib/types';
import { calculateSimpleLayout, SimpleLayoutResult, LayoutElement } from '@/lib/layout/simpleLayout';

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
  const [simpleLayoutResult, setSimpleLayoutResult] = useState<SimpleLayoutResult | null>(null);
  const [textAreaRatio, setTextAreaRatio] = useState(0.65); // 文字区域比例
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽

  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初始化画布
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 600;
    canvas.height = 450;

    setIsLoading(false);

    // 通知父组件画布已准备就绪
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [onCanvasReady]);

  // 当尺寸或产品数据变化时，重新计算布局和渲染
  useEffect(() => {
    if (!labelSize || !productData || !canvasRef.current || labelSize.width <= 0 || labelSize.height <= 0) return;

    // 只在尺寸变化时显示渲染动画，内容变化时直接渲染
    const isSizeChange = labelSize.width !== 0 && labelSize.height !== 0;
    if (isSizeChange) {
      setIsRendering(true);
    }

    try {
      // 计算简洁布局（使用当前的分割比例）
      const simpleResult = calculateSimpleLayout(
        labelSize.width,
        labelSize.height,
        productData,
        undefined,
        textAreaRatio
      );

      setSimpleLayoutResult(simpleResult);

      // 渲染到画布
      renderSimpleLayoutToCanvas(simpleResult, labelSize);

      // 只在尺寸变化时延迟结束渲染状态
      if (isSizeChange) {
        setTimeout(() => setIsRendering(false), 100);
      }
    } catch (error) {
      console.error('Simple layout calculation failed:', error);
      setIsRendering(false);
    }
  }, [labelSize, productData, textAreaRatio]); // 添加 textAreaRatio 依赖

  // 当简洁布局结果变化时，重新渲染画布（但不重新计算缩放）
  useEffect(() => {
    if (simpleLayoutResult && labelSize.width > 0 && labelSize.height > 0) {
      // 只重新渲染内容，不重新计算缩放
      renderSimpleLayoutToCanvas(simpleLayoutResult, labelSize);
    }
  }, [simpleLayoutResult]);

  // 移除窗口大小变化监听，使用固定预览尺寸
  // 不再监听窗口大小变化，保持预览区域大小稳定

  // 计算基于宽高比的固定预览尺寸
  const calculatePreviewSizeByRatio = (
    labelWidth: number, 
    labelHeight: number
  ) => {
    // 使用固定的最大预览尺寸，确保预览区域大小稳定
    const maxWidth = 500; // 最大宽度
    const maxHeight = 350; // 最大高度
    
    // 使用用户输入的宽高比
    const aspectRatio = labelWidth / labelHeight;
    
    // 按照宽高比缩放到固定尺寸内
    let previewWidth = maxWidth;
    let previewHeight = previewWidth / aspectRatio;
    
    // 如果高度超出，则以高度为基准重新计算
    if (previewHeight > maxHeight) {
      previewHeight = maxHeight;
      previewWidth = previewHeight * aspectRatio;
    }
    
    return { width: previewWidth, height: previewHeight };
  };

  // 绘制优雅的视觉分界效果
  const drawElegantDivider = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // 绘制微妙的阴影效果
    const shadowOffset = 2;
    const shadowBlur = 4;
    
    // 设置阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = shadowOffset;
    ctx.shadowBlur = shadowBlur;
    
    // 绘制标签轮廓（带阴影）
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // 清除阴影设置
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    
    // 添加微妙的内部高光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  };

  // 简洁渲染到画布
  const renderSimpleLayoutToCanvas = (simpleResult: SimpleLayoutResult, size: { width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 使用基于宽高比的固定预览尺寸
    const previewSize = calculatePreviewSizeByRatio(size.width, size.height);
    
    // 设置画布尺寸
    const renderScale = 2; // 渲染质量缩放
    const canvasWidth = previewSize.width * renderScale;
    const canvasHeight = previewSize.height * renderScale;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 设置显示尺寸（使用预览尺寸）
    canvas.style.width = `${previewSize.width}px`;
    canvas.style.height = `${previewSize.height}px`;

    // 设置高DPI渲染
    ctx.scale(renderScale, renderScale);

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth / renderScale, canvasHeight / renderScale);

    // 设置简洁背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth / renderScale, canvasHeight / renderScale);

    // 绘制区域分割线（可拖拽）
    const textAreaWidth = previewSize.width * textAreaRatio;
    ctx.strokeStyle = isDragging ? '#3B82F6' : '#E5E7EB'; // 拖拽时变蓝色
    ctx.lineWidth = isDragging ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(textAreaWidth, 0);
    ctx.lineTo(textAreaWidth, previewSize.height);
    ctx.stroke();
    
    // 绘制拖拽手柄
    if (isDragging) {
      const handleY = previewSize.height / 2;
      const handleSize = 8;
      
      // 绘制圆形手柄
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(textAreaWidth, handleY, handleSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制手柄边框
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 渲染每个简洁元素
    simpleResult.elements.forEach(element => {
      renderSimpleElementForPreview(ctx, element, previewSize, size);
    });

    // 绘制优雅的视觉分界效果
    drawElegantDivider(ctx, previewSize.width, previewSize.height);
  };

  // 为预览渲染简洁元素
  const renderSimpleElementForPreview = (
    ctx: CanvasRenderingContext2D, 
    element: any, // SimpleLayoutElement
    previewSize: { width: number; height: number },
    realSize: { width: number; height: number }
  ) => {
    if (!element.text) return;

    // 计算预览尺寸与真实尺寸的比例
    const scale = Math.min(previewSize.width / mmToPixels(realSize.width), previewSize.height / mmToPixels(realSize.height));

    // 设置字体（按比例缩放）
    const scaledFontSize = element.fontSize * scale;
    ctx.font = `${scaledFontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
    
    // 根据区域设置颜色
    if (element.area === 'price') {
      ctx.fillStyle = '#1E88E5'; // 价格用蓝色
    } else {
      ctx.fillStyle = '#000000'; // 文字用黑色
    }
    
    ctx.textBaseline = 'top';

    // 处理多行文本
    const lines = element.text.split('\n');
    const lineHeight = scaledFontSize * 1.2;

    lines.forEach((line: string, index: number) => {
      // 按比例调整位置
      const scaledX = element.x * scale;
      const scaledY = element.y * scale + index * lineHeight;
      
      // 处理文本对齐
      let x = scaledX;
      if (element.align === 'center') {
        const textWidth = ctx.measureText(line).width;
        x = scaledX + (element.width * scale - textWidth) / 2;
      } else if (element.align === 'right') {
        const textWidth = ctx.measureText(line).width;
        x = scaledX + element.width * scale - textWidth;
      }

      // 确保文本在预览区域内
      const textWidth = ctx.measureText(line).width;
      if (x >= 0 && x + textWidth <= previewSize.width && 
          scaledY >= 0 && scaledY + scaledFontSize <= previewSize.height) {
        ctx.fillText(line, x, scaledY);
      }
    });
  };

  // 为预览渲染单个元素（基于比例调整）
  const renderElementForPreview = (
    ctx: CanvasRenderingContext2D, 
    element: LayoutElement, 
    previewSize: { width: number; height: number },
    realSize: { width: number; height: number }
  ) => {
    if (!element.text) return;

    // 计算预览尺寸与真实尺寸的比例（使用相同的缩放比例确保一致性）
    const scale = Math.min(previewSize.width / mmToPixels(realSize.width), previewSize.height / mmToPixels(realSize.height));

    // 设置字体（按比例缩放）
    const scaledFontSize = element.fontSize * scale;
    ctx.font = `${scaledFontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    // 处理多行文本
    const lines = element.text.split('\n');
    const lineHeight = scaledFontSize * 1.2;

    lines.forEach((line, index) => {
      // 按比例调整位置（使用相同的缩放比例）
      const scaledX = element.x * scale;
      const scaledY = element.y * scale + index * lineHeight;
      
      // 处理文本对齐
      let x = scaledX;
      if (element.align === 'center') {
        const textWidth = ctx.measureText(line).width;
        x = previewSize.width / 2 - textWidth / 2; // 相对于预览区域中心对齐
      } else if (element.align === 'right') {
        const textWidth = ctx.measureText(line).width;
        x = previewSize.width - textWidth - (element.x * scale); // 右对齐
      }

      // 确保文本在预览区域内
      const textWidth = ctx.measureText(line).width;
      if (x >= 0 && x + textWidth <= previewSize.width && 
          scaledY >= 0 && scaledY + scaledFontSize <= previewSize.height) {
        ctx.fillText(line, x, scaledY);
      }
    });
  };

  // 渲染到画布（使用固定比例预览）
  const renderToCanvas = (elements: LayoutElement[], size: { width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 使用基于宽高比的固定预览尺寸
    const previewSize = calculatePreviewSizeByRatio(size.width, size.height);
    
    // 设置画布尺寸
    const renderScale = 2; // 渲染质量缩放
    const canvasWidth = previewSize.width * renderScale;
    const canvasHeight = previewSize.height * renderScale;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 设置显示尺寸（使用预览尺寸）
    canvas.style.width = `${previewSize.width}px`;
    canvas.style.height = `${previewSize.height}px`;

    // 设置高DPI渲染
    ctx.scale(renderScale, renderScale);

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth / renderScale, canvasHeight / renderScale);

    // 设置背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth / renderScale, canvasHeight / renderScale);

    // 渲染每个元素（使用预览尺寸进行布局计算）
    elements.forEach(element => {
      renderElementForPreview(ctx, element, previewSize, size);
    });

    // 绘制优雅的视觉分界效果
    drawElegantDivider(ctx, previewSize.width, previewSize.height);
  };

  // 渲染单个元素
  const renderElement = (ctx: CanvasRenderingContext2D, element: LayoutElement) => {
    if (!element.text) return;

    // 设置字体
    ctx.font = `${element.fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
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

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算预览尺寸
    const previewSize = calculatePreviewSizeByRatio(labelSize.width, labelSize.height);
    const textAreaWidth = previewSize.width * textAreaRatio;
    
    // 检查是否点击在分割线附近（10像素范围内）
    if (Math.abs(x - textAreaWidth) <= 10 && y >= 0 && y <= previewSize.height) {
      setIsDragging(true);
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // 计算预览尺寸
    const previewSize = calculatePreviewSizeByRatio(labelSize.width, labelSize.height);
    
    // 计算新的比例（限制在 0.3 到 0.8 之间）
    const newRatio = Math.max(0.3, Math.min(0.8, x / previewSize.width));
    setTextAreaRatio(newRatio);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // mm转像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 渲染状态指示器 */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-caption text-gray-600">正在排版文字...</p>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-caption text-gray-600">正在加载画布...</p>
          </div>
        </div>
      )}
      
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-0">
          {labelSize.width > 0 && labelSize.height > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="border-0 rounded-lg shadow-lg bg-white cursor-pointer"
                style={{ 
                  width: 'auto', 
                  height: 'auto',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  cursor: isDragging ? 'col-resize' : 'pointer'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-subheading text-gray-600 mb-2">请设置标签尺寸</div>
                <div className="text-caption text-gray-500">在下方输入宽度和高度来开始设计</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 布局信息 */}
        {simpleLayoutResult && (
          <div className="mt-2 text-center text-caption text-gray-500 bg-white rounded px-2 py-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium text-blue-600">
                文字区: {Math.round(textAreaRatio * 100)}%
              </span>
              <span className="mx-1">•</span>
              <span className="text-green-600">
                价格区: {Math.round((1 - textAreaRatio) * 100)}%
              </span>
              <span className="mx-1">•</span>
              <span className="text-purple-600">
                {simpleLayoutResult.elements.length} 个元素
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              拖拽分割线调整比例
            </div>
          </div>
        )}
        
        {/* 尺寸信息 */}
        <div className="mt-2 text-center text-caption text-gray-500 bg-white rounded px-2 py-1">
          <span className="font-medium">
            {labelSize.width > 0 && labelSize.height > 0 ? `${labelSize.width}×${labelSize.height}mm` : '未设置'}
          </span>
        </div>
      </div>
    </div>
  );
}