import { ProductData } from '../types';

// 布局结果接口
export interface LayoutElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  lines: number;
  text: string;
}

export interface LayoutResult {
  elements: LayoutElement[];
  totalHeight: number;
}

// 布局配置
interface LayoutConfig {
  padding: number; // 内边距 (mm)
  elementSpacing: number; // 元素间距 (mm)
  minFontSize: number; // 最小字体大小
  maxFontSize: number; // 最大字体大小
  lineHeight: number; // 行高倍数
}

// 默认配置
const DEFAULT_CONFIG: LayoutConfig = {
  padding: 2,
  elementSpacing: 1,
  minFontSize: 8,
  maxFontSize: 20,
  lineHeight: 1.2,
};

// 核心元素定义
const CORE_ELEMENTS = [
  { id: 'product_name', key: 'name', priority: 1, weight: 0.3 },
  { id: 'product_price', key: 'price', priority: 2, weight: 0.25 },
  { id: 'brand', key: 'brand', priority: 3, weight: 0.15 },
  { id: 'selling_points', key: 'sellingPoints', priority: 4, weight: 0.2 },
  { id: 'specs', key: 'specs', priority: 5, weight: 0.1 },
];

/**
 * 计算最优布局
 */
export function calculateOptimalLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: LayoutConfig = DEFAULT_CONFIG
): LayoutResult {
  // 转换为像素单位
  const widthPx = mmToPixels(labelWidth);
  const heightPx = mmToPixels(labelHeight);
  const paddingPx = mmToPixels(config.padding);
  const spacingPx = mmToPixels(config.elementSpacing);

  // 计算可用空间
  const availableWidth = widthPx - paddingPx * 2;
  const availableHeight = heightPx - paddingPx * 2;

  // 获取有效元素（有内容的）
  const validElements = getValidElements(productData);
  
  if (validElements.length === 0) {
    return { elements: [], totalHeight: 0 };
  }

  // 计算每个元素的权重和优先级
  const elementsWithWeight = validElements.map(element => ({
    ...element,
    content: getElementContent(element.key, productData),
    weight: element.weight,
  }));

  // 智能分配垂直空间
  const spaceAllocation = allocateVerticalSpace(
    elementsWithWeight,
    availableHeight,
    spacingPx,
    config
  );

  // 计算每个元素的具体布局
  const elements: LayoutElement[] = [];
  let currentY = paddingPx;

  for (const element of elementsWithWeight) {
    const allocatedHeight = spaceAllocation[element.id];
    const fontSize = calculateOptimalFontSize(
      element.content,
      availableWidth,
      allocatedHeight,
      config
    );

    const { lines, text } = calculateTextLayout(
      element.content,
      availableWidth,
      fontSize
    );

    const actualHeight = fontSize * lines * config.lineHeight;

    elements.push({
      id: element.id,
      x: paddingPx,
      y: currentY,
      width: availableWidth,
      height: actualHeight,
      fontSize,
      align: getOptimalAlignment(labelWidth, labelHeight),
      lines,
      text,
    });

    currentY += actualHeight + spacingPx;
  }

  return {
    elements,
    totalHeight: currentY - spacingPx + paddingPx,
  };
}

/**
 * 获取有效元素（有内容的）
 */
function getValidElements(productData: ProductData) {
  return CORE_ELEMENTS.filter(element => {
    const content = getElementContent(element.key, productData);
    return content && content.trim().length > 0;
  });
}

/**
 * 获取元素内容
 */
function getElementContent(key: string, productData: ProductData): string {
  switch (key) {
    case 'name':
      return productData.name || '';
    case 'price':
      return productData.price ? `¥${productData.price.toFixed(2)}` : '';
    case 'brand':
      return productData.brand || '';
    case 'sellingPoints':
      return productData.sellingPoints?.[0] || '';
    case 'specs':
      return productData.specs ? Object.values(productData.specs).join(' ') : '';
    default:
      return '';
  }
}

/**
 * 智能分配垂直空间
 */
function allocateVerticalSpace(
  elements: any[],
  availableHeight: number,
  spacing: number,
  config: LayoutConfig
): Record<string, number> {
  const totalSpacing = (elements.length - 1) * spacing;
  const contentHeight = availableHeight - totalSpacing;
  
  // 按权重分配空间
  const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);
  const allocation: Record<string, number> = {};

  for (const element of elements) {
    const baseHeight = (element.weight / totalWeight) * contentHeight;
    const minHeight = config.minFontSize * config.lineHeight;
    const maxHeight = config.maxFontSize * config.lineHeight * 3; // 最多3行
    
    allocation[element.id] = Math.max(minHeight, Math.min(maxHeight, baseHeight));
  }

  return allocation;
}

/**
 * 计算最优字体大小
 */
function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  config: LayoutConfig
): number {
  // 创建临时canvas来测量文本
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return config.minFontSize;

  let fontSize = config.maxFontSize;
  
  while (fontSize >= config.minFontSize) {
    ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * config.lineHeight;
    
    // 检查是否适合
    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 1;
  }
  
  return config.minFontSize;
}

/**
 * 计算文本布局（换行等）
 */
function calculateTextLayout(
  text: string,
  maxWidth: number,
  fontSize: number
): { lines: number; text: string } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { lines: 1, text };

  ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`;
  
  // 如果文本很短，不需要换行
  const textWidth = ctx.measureText(text).width;
  if (textWidth <= maxWidth) {
    return { lines: 1, text };
  }

  // 需要换行
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const testWidth = ctx.measureText(testLine).width;
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        // 单个字符就超宽，强制添加
        lines.push(char);
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  // 限制最多3行
  if (lines.length > 3) {
    lines.splice(3);
    lines[2] = lines[2].substring(0, lines[2].length - 3) + '...';
  }

  return {
    lines: lines.length,
    text: lines.join('\n'),
  };
}

/**
 * 获取最优对齐方式
 */
function getOptimalAlignment(width: number, height: number): 'left' | 'center' | 'right' {
  const aspectRatio = width / height;
  
  if (aspectRatio > 2) {
    // 横版标签，居中对齐
    return 'center';
  } else if (aspectRatio < 0.8) {
    // 竖版标签，左对齐
    return 'left';
  } else {
    // 方形标签，居中对齐
    return 'center';
  }
}

/**
 * mm转像素
 */
function mmToPixels(mm: number): number {
  // 1mm ≈ 3.78px (96 DPI)
  return mm * 3.78;
}

/**
 * 像素转mm
 */
export function pixelsToMm(pixels: number): number {
  return pixels / 3.78;
}
