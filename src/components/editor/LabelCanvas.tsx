'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductData } from '@/lib/types';
import { calculateSimpleLayout, SimpleLayoutResult, LayoutElement } from '@/lib/layout/simpleLayout';
import { FontConfig } from './FontCustomizer';
import { TemplateConfig, getTemplateConfigById } from './TemplateConfig';
import { TemplateRenderer } from './TemplateRenderer';

interface LabelCanvasProps {
  labelSize: { width: number; height: number };
  productData: ProductData;
  fontConfigs?: Record<string, FontConfig>;
  onCanvasReady?: (canvas: any) => void;
  className?: string;
  isExporting?: boolean; // 添加导出状态
  // 模板系统支持
  templateId?: string; // 模板ID
  templateConfig?: TemplateConfig; // 直接传入模板配置
  textAreaRatio?: number; // 自定义比例
  onLayoutChange?: (layout: SimpleLayoutResult) => void; // 布局变化回调
}

export default function LabelCanvas({ 
  labelSize, 
  productData, 
  fontConfigs,
  onCanvasReady,
  className = '',
  isExporting = false,
  templateId,
  templateConfig,
  textAreaRatio = 0.65,
  onLayoutChange
}: LabelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [simpleLayoutResult, setSimpleLayoutResult] = useState<SimpleLayoutResult | null>(null);
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽
  const [scale, setScale] = useState(1); // CSS缩放比例

  // mm转像素的转换函数
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
  };

  // 计算限制后的显示尺寸（避免极端尺寸）
  const calculateLimitedDisplaySize = (widthMm: number, heightMm: number) => {
    // 先转换为像素
    const realWidthPx = mmToPixels(widthMm);
    const realHeightPx = mmToPixels(heightMm);
    
    // 限制最大显示尺寸（防止极端长条形）
    const MAX_DISPLAY_WIDTH = 2000;  // 最大2000px
    const MAX_DISPLAY_HEIGHT = 1500; // 最大1500px
    
    let displayWidth = realWidthPx;
    let displayHeight = realHeightPx;
    
    // 如果超过限制，等比缩小
    if (displayWidth > MAX_DISPLAY_WIDTH) {
      const scale = MAX_DISPLAY_WIDTH / displayWidth;
      displayWidth = MAX_DISPLAY_WIDTH;
      displayHeight = displayHeight * scale;
    }
    
    if (displayHeight > MAX_DISPLAY_HEIGHT) {
      const scale = MAX_DISPLAY_HEIGHT / displayHeight;
      displayHeight = MAX_DISPLAY_HEIGHT;
      displayWidth = displayWidth * scale;
    }
    
    return { 
      width: displayWidth, 
      height: displayHeight,
      scale: displayWidth / realWidthPx // 相对于原始尺寸的缩放比
    };
  };

  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初始化画布
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算限制后的显示尺寸
    const limitedSize = calculateLimitedDisplaySize(labelSize.width, labelSize.height);
    
    const renderScale = 2; // 高DPI渲染
    const canvasWidth = limitedSize.width * renderScale;
    const canvasHeight = limitedSize.height * renderScale;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 设置显示尺寸（限制后的尺寸）
    canvas.style.width = `${limitedSize.width}px`;
    canvas.style.height = `${limitedSize.height}px`;

    // 设置高DPI渲染
    ctx.scale(renderScale, renderScale);

    setIsLoading(false);

    // 通知父组件画布已准备就绪
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [labelSize, onCanvasReady]);

  // 单独处理画布尺寸变化
  useEffect(() => {
    if (!canvasRef.current || !labelSize || labelSize.width <= 0 || labelSize.height <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算限制后的显示尺寸
    const limitedSize = calculateLimitedDisplaySize(labelSize.width, labelSize.height);
    
    const renderScale = 2;
    const canvasWidth = limitedSize.width * renderScale;
    const canvasHeight = limitedSize.height * renderScale;
    
    // 只在尺寸真正变化时才更新画布尺寸
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // 设置显示尺寸（限制后的尺寸）
      canvas.style.width = `${limitedSize.width}px`;
      canvas.style.height = `${limitedSize.height}px`;

      // 重新设置高DPI渲染
      ctx.scale(renderScale, renderScale);
    }
  }, [labelSize]);

  // 当尺寸或产品数据变化时，重新计算布局和渲染
  useEffect(() => {
    if (!labelSize || !productData || !canvasRef.current || labelSize.width <= 0 || labelSize.height <= 0) return;

    // 只在尺寸变化时显示渲染动画，内容变化时直接渲染
    const isSizeChange = labelSize.width !== 0 && labelSize.height !== 0;
    if (isSizeChange && !isExporting) {
      setIsRendering(true);
    }

    try {
      let simpleResult: SimpleLayoutResult;
      let finalFontConfigs = fontConfigs;

      // 检查是否使用模板
      let activeTemplate: TemplateConfig | undefined;
      if (templateConfig) {
        activeTemplate = templateConfig;
      } else if (templateId) {
        activeTemplate = getTemplateConfigById(templateId);
      }

      // 如果使用模板，使用模板渲染器
      if (activeTemplate) {
        const renderer = new TemplateRenderer(activeTemplate, labelSize, productData, fontConfigs);
        simpleResult = renderer.render();
        finalFontConfigs = renderer.getMergedFontConfigs();
      } else {
        // 否则使用简单布局
        simpleResult = calculateSimpleLayout(
        labelSize.width,
        labelSize.height,
        productData,
        undefined,
        textAreaRatio
      );
      }

      setSimpleLayoutResult(simpleResult);

      // 通知外部布局变化
      if (onLayoutChange) {
        onLayoutChange(simpleResult);
      }

      // 渲染到画布（导出时也要渲染）
      // 使用真实尺寸进行渲染
      renderSimpleLayoutToCanvas(simpleResult, labelSize, finalFontConfigs);

      // 只在尺寸变化时延迟结束渲染状态
      if (isSizeChange && !isExporting) {
        setTimeout(() => setIsRendering(false), 100);
      }
    } catch (error) {
      console.error('Simple layout calculation failed:', error);
      setIsRendering(false);
    }
  }, [labelSize, productData, textAreaRatio, fontConfigs, templateId, templateConfig, onLayoutChange]); // 移除 isExporting 依赖

  // 当简洁布局结果变化时，重新渲染画布（但不重新计算缩放）
  useEffect(() => {
    if (simpleLayoutResult && labelSize.width > 0 && labelSize.height > 0) {
      // 只重新渲染内容，不重新计算缩放
      renderSimpleLayoutToCanvas(simpleLayoutResult, labelSize, fontConfigs);
    }
  }, [simpleLayoutResult, labelSize, fontConfigs]);

  // 监听容器尺寸变化，计算缩放比例
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateScale = () => {
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // 获取Canvas的实际显示尺寸（CSS尺寸，不是内部像素）
      const canvasDisplayWidth = parseFloat(canvas.style.width) || 500;
      const canvasDisplayHeight = parseFloat(canvas.style.height) || 350;
      
      // 计算缩放比例（留3%边距，最大化利用空间）
      const edgePadding = 0.03; // 减少边距到3%
      const scaleX = (containerWidth * (1 - edgePadding * 2)) / canvasDisplayWidth;
      const scaleY = (containerHeight * (1 - edgePadding * 2)) / canvasDisplayHeight;
      
      // 取较小的值，确保不超出容器
      const calculatedScale = Math.min(scaleX, scaleY);
      
      // 限制缩放范围：最小0.5倍，最大3.0倍（允许更大的放大）
      const finalScale = Math.max(0.5, Math.min(calculatedScale, 3.0));
      
      console.log('Scale calculation:', {
        containerWidth,
        containerHeight,
        canvasDisplayWidth,
        canvasDisplayHeight,
        calculatedScale,
        finalScale
      });
      
      setScale(finalScale);
    };
    
    // 初始计算
    updateScale();
    
    // 监听resize事件
    const resizeObserver = new ResizeObserver(entries => {
      updateScale();
    });
    
    resizeObserver.observe(container);
    
    // 也监听window resize（作为备用）
    window.addEventListener('resize', updateScale);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [labelSize]); // 添加labelSize依赖，当标签尺寸变化时重新计算

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

  // 绘制极简风格的背景
  const drawMinimalistBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // 绘制纯净白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制微妙的边框 - 极简风格的细线
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    
    // 添加微妙的圆角效果（通过绘制四个角的弧线）
    const cornerRadius = 2;
    
    // 绘制圆角矩形
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(width - cornerRadius, 0);
    ctx.quadraticCurveTo(width, 0, width, cornerRadius);
    ctx.lineTo(width, height - cornerRadius);
    ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
    ctx.lineTo(cornerRadius, height);
    ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  };

  // 简洁渲染到画布
  const renderSimpleLayoutToCanvas = (simpleResult: SimpleLayoutResult, size: { width: number; height: number }, fontConfigs?: Record<string, FontConfig>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算限制后的显示尺寸
    const limitedSize = calculateLimitedDisplaySize(size.width, size.height);
    
    // 获取真实像素尺寸（用于计算布局）
    const realWidthPx = mmToPixels(size.width);
    const realHeightPx = mmToPixels(size.height);
    
    // 但是用限制后的尺寸来绘制Canvas
    const canvasSize = { width: limitedSize.width, height: limitedSize.height };

    console.log('Rendering to canvas:', {
      canvasSize: { width: canvas.width, height: canvas.height },
      canvasDisplaySize: { width: canvas.style.width, height: canvas.style.height },
      labelSize: size,
      realSizePx: { width: realWidthPx, height: realHeightPx },
      limitedSize: canvasSize,
      scaleFactor: limitedSize.scale,
      elementsCount: simpleResult.elements.length,
      elements: simpleResult.elements
    });
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 使用极简背景
    drawMinimalistBackground(ctx, canvasSize.width, canvasSize.height);

    // 绘制区域分割线（更微妙的线条）
    const textAreaWidth = canvasSize.width * textAreaRatio;
    ctx.strokeStyle = isDragging ? '#E5E7EB' : '#F3F4F6';
    ctx.lineWidth = isDragging ? 1.5 : 0.5;
    ctx.beginPath();
    ctx.moveTo(textAreaWidth, 0);
    ctx.lineTo(textAreaWidth, canvasSize.height);
    ctx.stroke();
    
    // 绘制拖拽手柄（更优雅的设计）
    if (isDragging) {
      const handleY = canvasSize.height / 2;
      const handleSize = 6;
      
      ctx.fillStyle = '#6B7280';
      ctx.beginPath();
      ctx.arc(textAreaWidth, handleY, handleSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 渲染每个简洁元素（需要考虑Canvas的缩放比例）
    simpleResult.elements.forEach((element, index) => {
      console.log(`Rendering element ${index}:`, {
        id: element.id,
        text: element.text,
        fontSize: element.fontSize,
        position: { x: element.x, y: element.y },
        canvasSize,
        labelSizeMm: size,
        scaleFactor: limitedSize.scale
      });
      renderSimpleElementForPreview(ctx, element, canvasSize, size, fontConfigs, limitedSize.scale);
    });
  };

  // 鼠标事件处理 - 使用真实像素尺寸
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 使用真实像素尺寸
    const realWidthPx = mmToPixels(labelSize.width);
    const currentTextAreaRatio = textAreaRatio || 0.65;
    const textAreaWidth = realWidthPx * currentTextAreaRatio;
    
    // 检查是否点击在分割线附近（10像素范围内）
    if (Math.abs(x - textAreaWidth) <= 10 && y >= 0 && y <= mmToPixels(labelSize.height)) {
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
    
    // 注意：拖拽功能暂时保留，但需要通过props传递给外部
    // const newRatio = Math.max(0.3, Math.min(0.8, x / realWidthPx));
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 为预览渲染简洁元素（极简风格）
  const renderSimpleElementForPreview = (
    ctx: CanvasRenderingContext2D, 
    element: any, // SimpleLayoutElement
    canvasSize: { width: number; height: number },
    labelSizeMm: { width: number; height: number },
    fontConfigs?: Record<string, FontConfig>,
    scaleFactor: number = 1 // Canvas的缩放比例
  ) => {
    if (!element.text) {
      console.log(`Element ${element.id} has no text, skipping`);
      return;
    }

    console.log(`Rendering text for ${element.id}:`, {
      text: element.text,
      fontSize: element.fontSize,
      position: { x: element.x, y: element.y },
      canvasSize,
      labelSizeMm
    });

    // 元素的位置已经是像素单位（来自layout计算）
    // 需要考虑Canvas的缩放比例
    const scale = scaleFactor; // Canvas的缩放比例

    // 获取字体配置
    const fontConfig = fontConfigs?.[element.id] || {
      fontSize: element.fontSize,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    // 设置字体（考虑Canvas缩放）
    const scaledFontSize = fontConfig.fontSize * scale;
    const fontWeight = fontConfig.fontWeight;
    const fontStyle = fontConfig.fontStyle;
    const fontFamily = fontConfig.fontFamily;
    
    ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontFamily}`;
    ctx.fillStyle = fontConfig.color;
    ctx.textAlign = fontConfig.textAlign as CanvasTextAlign;
    ctx.textBaseline = 'top';

    console.log(`Font settings:`, {
      font: ctx.font,
      fillStyle: ctx.fillStyle,
      textAlign: ctx.textAlign
    });

    // 处理多行文本
    const lines = element.text.split('\n');
    const lineHeight = scaledFontSize * 1.4; // 使用更大的行高

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

      // 确保文本在Canvas区域内
      const textWidth = ctx.measureText(line).width;
      console.log(`Drawing line ${index}:`, {
        line,
        position: { x, y: scaledY },
        textWidth,
        scaledFontSize,
        canvasSize,
        inBounds: x >= 0 && x + textWidth <= canvasSize.width && 
                  scaledY >= 0 && scaledY + scaledFontSize <= canvasSize.height
      });
      
      if (x >= 0 && x + textWidth <= canvasSize.width && 
          scaledY >= 0 && scaledY + scaledFontSize <= canvasSize.height) {
        ctx.fillText(line, x, scaledY);
        console.log(`Text drawn successfully`);
      } else {
        console.log(`Text out of bounds, not drawn`);
      }
    });
  };



  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
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
      
      <div className="h-full flex flex-col" style={{ position: 'relative', width: '100%', height: '100%', paddingBottom: '32px' }}>
        <div className="flex-1 flex items-center justify-center min-h-0 mb-1">
          {labelSize.width > 0 && labelSize.height > 0 ? (
            <div 
              className="relative"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center'
              }}
            >
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
        
        {/* 底部信息栏 - 单行显示所有信息 */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <div className="flex items-center justify-center gap-x-3 text-xs bg-white rounded px-3 py-1">
            {/* 标签尺寸 */}
            <span className="font-medium text-gray-700">
              {labelSize.width > 0 && labelSize.height > 0 ? `${labelSize.width}×${labelSize.height}mm` : '未设置尺寸'}
            </span>
            
            {/* 布局信息 */}
            {simpleLayoutResult && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600">
                  文字: {Math.round((textAreaRatio || 0.65) * 100)}%
                </span>
                <span className="text-green-600">
                  价格: {Math.round((1 - (textAreaRatio || 0.65)) * 100)}%
                </span>
                <span className="text-purple-600">
                  {simpleLayoutResult.elements.length}个
                </span>
              </>
            )}
            
            {/* 缩放信息 */}
            <span className="text-gray-400">•</span>
            <span className="text-orange-600">
              缩放 {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}