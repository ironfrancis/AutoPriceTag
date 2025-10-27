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
  elementStyles?: Record<string, any>; // 元素样式配置（增强版）
  savedLayout?: { elements: Array<{ id: string; x: number; y: number; text: string; visible?: boolean }> }; // 保存的布局
  onCanvasReady?: (canvas: any) => void;
  className?: string;
  isExporting?: boolean; // 添加导出状态
  showMetadata?: boolean; // 是否显示底部元信息（尺寸、元素数量、缩放等）
  disableInternalScaling?: boolean; // 是否禁用内部缩放（用于整页排版）
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
  elementStyles,
  savedLayout,
  onCanvasReady,
  className = '',
  isExporting = false,
  showMetadata = true, // 默认显示元信息
  disableInternalScaling = false, // 默认不禁用内部缩放
  templateId,
  templateConfig,
  textAreaRatio = 0.65,
  onLayoutChange
}: LabelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simpleLayoutResult, setSimpleLayoutResult] = useState<SimpleLayoutResult | null>(null);
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

  // 初始化Canvas（只在组件挂载时执行一次）
  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初始化画布
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(false);

    // 通知父组件画布已准备就绪
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [onCanvasReady]);

  // 统一处理所有变化：尺寸、产品数据、字体配置
  useEffect(() => {
    if (!canvasRef.current || !labelSize || labelSize.width <= 0 || labelSize.height <= 0) return;
    if (!productData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算限制后的显示尺寸
    const limitedSize = disableInternalScaling 
      ? { 
          width: mmToPixels(labelSize.width),
          height: mmToPixels(labelSize.height),
          scale: 1 
        }
      : calculateLimitedDisplaySize(labelSize.width, labelSize.height);
    
    const renderScale = 2;
    const canvasWidth = limitedSize.width * renderScale;
    const canvasHeight = limitedSize.height * renderScale;
    
    // 只在尺寸真正变化时才更新画布尺寸
    const needsResize = canvas.width !== canvasWidth || canvas.height !== canvasHeight;
    
      if (needsResize) {
      console.log('Canvas size changed, resizing:', {
        oldSize: { width: canvas.width, height: canvas.height },
        newSize: { width: canvasWidth, height: canvasHeight }
      });
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // 设置显示尺寸
      // canvas 的实际像素是 limitedSize * renderScale
      // 但显示尺寸是 limitedSize（即实际像素 / renderScale）
      // 这样可以让 canvas 以 retina 清晰度显示
      canvas.style.width = `${limitedSize.width}px`;
      canvas.style.height = `${limitedSize.height}px`;

      // 重新设置高DPI渲染
      ctx.scale(renderScale, renderScale);
    }

    try {
      let simpleResult: SimpleLayoutResult;
      let finalFontConfigs = fontConfigs;

      // 如果有保存的布局，使用保存的布局
      if (savedLayout && savedLayout.elements.length > 0) {
        // 计算实际的显示尺寸（考虑可能有的缩放）
        // limitedSize 是在前面计算的，包含了 scale 信息
        const displayWidth = limitedSize.width;
        const displayHeight = limitedSize.height;

        // 将百分比位置转换为显示尺寸的像素位置
        // 重要：保存的位置是文本左边界的百分比（对于所有对齐方式）
        simpleResult = {
          elements: savedLayout.elements
            .filter(el => el.visible !== false) // 过滤不可见元素
            .map(el => {
              // 从 fontConfigs 或 elementStyles 获取字体配置
              const fontConfig = (elementStyles || fontConfigs)?.[el.id];
              const align = (fontConfig?.textAlign || 'left') as 'left' | 'center' | 'right';
              
              // 计算文本左边界的位置（像素）
              // 保存的百分比位置（0-100）表示文本左边界的百分比位置
              const baseX = (el.x / 100) * displayWidth;
              const baseY = (el.y / 100) * displayHeight;
              
              return {
                id: el.id,
                x: baseX, // 文本左边界位置（所有对齐方式都相同）
                y: baseY, // 文本顶部位置
                width: displayWidth, // 宽度使用显示宽度
                height: fontConfig?.lineHeight ? fontConfig.fontSize * fontConfig.lineHeight : 50,
                fontSize: fontConfig?.fontSize || 16, // 从 fontConfigs 获取
                align, // 对齐方式将在渲染时处理
                lines: 1,
                text: el.text,
                priority: 1
              };
            }),
          totalWidth: displayWidth,
          totalHeight: displayHeight
        };
      } else {
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
      }

      setSimpleLayoutResult(simpleResult);

      // 通知外部布局变化
      if (onLayoutChange) {
        onLayoutChange(simpleResult);
      }

      // 直接渲染到画布，不显示加载动画（避免闪烁）
      // 优先使用 elementStyles，否则使用 finalFontConfigs
      const styles = elementStyles || finalFontConfigs;
      renderSimpleLayoutToCanvas(simpleResult, labelSize, styles, disableInternalScaling);
      
    } catch (error) {
      console.error('Layout calculation or rendering failed:', error);
    }
  }, [labelSize, productData, fontConfigs, elementStyles, savedLayout, textAreaRatio, templateId, templateConfig, onLayoutChange, disableInternalScaling])

  // 监听容器尺寸变化，计算缩放比例
  useEffect(() => {
    // 如果禁用内部缩放，则跳过缩放计算
    if (disableInternalScaling) {
      setScale(1);
      return;
    }

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
  }, [labelSize, disableInternalScaling]); // 添加labelSize依赖，当标签尺寸变化时重新计算

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
  const renderSimpleLayoutToCanvas = (simpleResult: SimpleLayoutResult, size: { width: number; height: number }, fontConfigs?: Record<string, FontConfig>, disableScaling = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderScale = 2; // 高DPI渲染比例

    // 根据是否禁用内部缩放决定使用的尺寸
    const limitedSize = disableScaling
      ? { 
          width: mmToPixels(size.width),
          height: mmToPixels(size.height),
          scale: 1 
        }
      : calculateLimitedDisplaySize(size.width, size.height);
    
    // 获取真实像素尺寸（用于计算布局）
    const realWidthPx = mmToPixels(size.width);
    const realHeightPx = mmToPixels(size.height);
    
    // 用limitedSize来绘制Canvas
    const canvasSize = { width: limitedSize.width, height: limitedSize.height };

    console.log('Rendering to canvas:', {
      canvasSize: { width: canvas.width, height: canvas.height },
      canvasDisplaySize: { width: canvas.style.width, height: canvas.style.height },
      labelSize: size,
      realSizePx: { width: realWidthPx, height: realHeightPx },
      limitedSize: canvasSize,
      renderScale,
      disableScaling,
      elementsCount: simpleResult.elements.length,
      elements: simpleResult.elements
    });
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 使用极简背景
    drawMinimalistBackground(ctx, canvasSize.width, canvasSize.height);

    // 不再绘制分割线（已改为统一垂直布局）

    // 渲染每个简洁元素（需要考虑Canvas的缩放比例）
    // ctx 已经被 ctx.scale(renderScale, renderScale) 缩放过了
    // 所以在绘制时，坐标应该直接使用像素值，不需要再乘以 renderScale
    // 但是需要注意：当 disableScaling=true 时，canvas 会被拉伸
    // 所以我们需要考虑外层容器的缩放比
    const scaleFactor = 1; // 因为 ctx 已经 scale 过了，所以不需要再缩放
    
    simpleResult.elements.forEach((element, index) => {
      console.log(`Rendering element ${index}:`, {
        id: element.id,
        text: element.text,
        fontSize: element.fontSize,
        position: { x: element.x, y: element.y },
        canvasSize,
        labelSizeMm: size,
        scaleFactor
      });
      renderSimpleElementForPreview(ctx, element, canvasSize, size, fontConfigs, scaleFactor);
    });
  };

  // 不再需要拖拽分割线功能（已改为统一垂直布局）

  // 为预览渲染简洁元素（极简风格）
  const renderSimpleElementForPreview = (
    ctx: CanvasRenderingContext2D, 
    element: any, // SimpleLayoutElement
    canvasSize: { width: number; height: number },
    labelSizeMm: { width: number; height: number },
    styles?: Record<string, any>, // 支持 FontConfig 或 ElementStyleConfig
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

    // 获取字体配置（支持 FontConfig 和 ElementStyleConfig）
    const styleConfig = styles?.[element.id] || {
      fontSize: element.fontSize,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    // 如果有扩展样式配置，绘制背景和边框
    if (styleConfig.backgroundColor || styleConfig.borderWidth) {
      const padding = (styleConfig.padding || 0) * scale;
      const x = element.x * scale - padding;
      const y = element.y * scale - padding;
      const width = element.width * scale + padding * 2;
      const height = element.height * scale + padding * 2;

      // 绘制背景
      if (styleConfig.backgroundColor) {
        ctx.fillStyle = styleConfig.backgroundColor;
        ctx.globalAlpha = styleConfig.opacity !== undefined ? styleConfig.opacity : 1;
        ctx.fillRect(x, y, width, height);
      }

      // 绘制边框
      if (styleConfig.borderWidth && styleConfig.borderWidth > 0) {
        const borderWidth = styleConfig.borderWidth * scale;
        ctx.strokeStyle = styleConfig.borderColor || '#000000';
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, width, height);
      }

      // 重置透明度
      ctx.globalAlpha = 1;
    }

    // 设置字体（考虑Canvas缩放）
    const scaledFontSize = styleConfig.fontSize * scale;
    const fontWeight = styleConfig.fontWeight;
    const fontStyle = styleConfig.fontStyle;
    const fontFamily = styleConfig.fontFamily;
    const lineHeight = styleConfig.lineHeight || 1.4;
    
    ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontFamily}`;
    ctx.fillStyle = styleConfig.color;
    ctx.textAlign = styleConfig.textAlign as CanvasTextAlign;
    ctx.textBaseline = 'top';

    // 字间距
    if (styleConfig.letterSpacing) {
      ctx.letterSpacing = `${styleConfig.letterSpacing * scale}px`;
    }

    console.log(`Font settings:`, {
      font: ctx.font,
      fillStyle: ctx.fillStyle,
      textAlign: ctx.textAlign
    });

    // 处理多行文本
    const lines = element.text.split('\n');
    const calculatedLineHeight = scaledFontSize * lineHeight;

    // 计算内边距偏移
    const padding = (styleConfig.padding || 0) * scale;
    const textOffsetX = padding;
    const textOffsetY = padding;

    lines.forEach((line: string, index: number) => {
      // 基础位置（顶部Y坐标）
      const baseY = element.y + index * calculatedLineHeight;
      
      // 测量文本宽度
      const textWidth = ctx.measureText(line).width;
      
      // 处理文本对齐
      // 关键：element.x 是文本左边界位置（来自 DraggableLabelCanvas）
      // 绘制时需要根据对齐方式计算实际的 drawX
      let drawX = element.x;
      
      if (element.align === 'center') {
        // 居中对齐：drawX = 左边界 + 一半文本宽度（与 DraggableLabelCanvas 一致）
        drawX = element.x + textWidth / 2;
      } else if (element.align === 'right') {
        // 右对齐：drawX = 左边界 + 文本宽度
        drawX = element.x + textWidth;
      }
      // left 对齐：drawX = 左边界（直接使用 element.x）
      
      const scaledX = drawX;
      const scaledY = baseY;

      // 确保文本在Canvas区域内
      // 对于居中和右对齐，文本可能会超出边界，但仍然应该绘制
      const isVisible = scaledY >= 0 && scaledY + scaledFontSize <= canvasSize.height;
      
      console.log(`Drawing line ${index}:`, {
        line,
        position: { x: drawX, y: scaledY },
        textWidth,
        scaledFontSize,
        canvasSize,
        isVisible
      });
      
      // 只要 Y 坐标在可见区域内就绘制（X 坐标可能超出，特别是居中和右对齐）
      if (isVisible) {
        ctx.fillText(line, drawX, scaledY);
        console.log(`Text drawn successfully`);
      } else {
        console.log(`Text out of bounds (Y: ${scaledY}, height: ${canvasSize.height}), not drawn`);
      }
    });
  };



  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-caption text-gray-600">正在加载画布...</p>
          </div>
        </div>
      )}
      
      {disableInternalScaling ? (
        // 整页排版模式：直接渲染，不使用内部缩放
        <div style={{ width: '100%', height: '100%' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ 
              display: 'block',
              border: 'none'
            }}
          />
        </div>
      ) : (
        // 单页编辑模式：使用内部缩放适配容器
        <div className="h-full flex flex-col" style={{ position: 'relative', width: '100%', height: '100%', paddingBottom: showMetadata ? '32px' : '0' }}>
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
                  className="border-0 rounded-lg shadow-lg bg-white"
                  style={{ 
                    width: 'auto', 
                    height: 'auto',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
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
          {showMetadata && (
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
                    <span className="text-purple-600">
                      {simpleLayoutResult.elements.length}个元素
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
          )}
        </div>
      )}
    </div>
  );
}