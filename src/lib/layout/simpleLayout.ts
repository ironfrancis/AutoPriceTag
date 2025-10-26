import { ProductData } from '../types';

// 简洁布局结果接口
export interface SimpleLayoutElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  lines: number;
  text: string;
  area: 'text' | 'price'; // 所属区域
}

export interface SimpleLayoutResult {
  elements: SimpleLayoutElement[];
  textAreaWidth: number; // 文字区域宽度
  priceAreaWidth: number; // 价格区域宽度
  priceAreaHeight: number; // 价格区域高度（正方形）
}

// 简洁布局配置
interface SimpleLayoutConfig {
  padding: number; // 内边距 (mm)
  elementSpacing: number; // 元素间距 (mm)
  minFontSize: number; // 最小字体大小
  maxFontSize: number; // 最大字体大小
  lineHeight: number; // 行高倍数
  textAreaRatio: number; // 文字区域占比 (0.65 = 65%)
}

// 默认配置
const SIMPLE_DEFAULT_CONFIG: SimpleLayoutConfig = {
  padding: 2,
  elementSpacing: 1,
  minFontSize: 8,
  maxFontSize: 28, // 增加最大字体大小，让价格可以更大
  lineHeight: 1.2,
  textAreaRatio: 0.65, // 65% 文字区域
};

// 极简风格配置
const MINIMALIST_CONFIG: SimpleLayoutConfig = {
  padding: 4, // 增加内边距，营造留白
  elementSpacing: 2, // 增加元素间距
  minFontSize: 10,
  maxFontSize: 32,
  lineHeight: 1.4, // 增加行高，提升可读性
  textAreaRatio: 0.6, // 轻微调整比例
};

// 文字区域元素定义（按优先级排序）
const TEXT_ELEMENTS = [
  { id: 'product_name', key: 'name', priority: 1, weight: 0.4 },
  { id: 'brand', key: 'brand', priority: 2, weight: 0.2 },
  { id: 'selling_points', key: 'sellingPoints', priority: 3, weight: 0.25 },
  { id: 'specs', key: 'specs', priority: 4, weight: 0.15 },
];

/**
 * 计算简洁布局
 */
export function calculateSimpleLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: SimpleLayoutConfig = MINIMALIST_CONFIG, // 使用极简配置作为默认
  textAreaRatio: number = 0.6 // 使用更平衡的比例
): SimpleLayoutResult {
  // 转换为像素单位
  const widthPx = mmToPixels(labelWidth);
  const heightPx = mmToPixels(labelHeight);
  const paddingPx = mmToPixels(config.padding);
  const spacingPx = mmToPixels(config.elementSpacing);

  // 计算区域划分（使用自定义比例）
  const textAreaWidth = widthPx * textAreaRatio - paddingPx;
  const priceAreaWidth = widthPx * (1 - textAreaRatio) - paddingPx;
  const priceAreaHeight = Math.min(priceAreaWidth, heightPx - paddingPx * 2); // 正方形
  
  // 计算文字区域可用高度
  const textAreaHeight = heightPx - paddingPx * 2;

  // 获取有效的文字元素
  const validTextElements = getValidTextElements(productData);
  
  const elements: SimpleLayoutElement[] = [];
  
  // 布局文字区域
  if (validTextElements.length > 0) {
    const textElements = layoutTextArea(
      validTextElements,
      productData,
      textAreaWidth,
      textAreaHeight,
      paddingPx,
      spacingPx,
      config
    );
    elements.push(...textElements);
  }

  // 布局价格区域
  const priceElement = layoutPriceArea(
    productData,
    priceAreaWidth,
    priceAreaHeight,
    widthPx - priceAreaWidth - paddingPx, // 价格区域起始X位置
    paddingPx,
    config
  );
  if (priceElement) {
    elements.push(priceElement);
  }

  return {
    elements,
    textAreaWidth,
    priceAreaWidth,
    priceAreaHeight
  };
}

/**
 * 获取有效的文字元素
 */
function getValidTextElements(productData: ProductData) {
  return TEXT_ELEMENTS.filter(element => {
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
 * 布局文字区域
 */
function layoutTextArea(
  elements: any[],
  productData: ProductData,
  areaWidth: number,
  areaHeight: number,
  startX: number,
  startY: number,
  config: SimpleLayoutConfig
): SimpleLayoutElement[] {
  const result: SimpleLayoutElement[] = [];
  let currentY = startY;
  
  // 计算每个元素的高度分配
  const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);
  const totalSpacing = (elements.length - 1) * mmToPixels(config.elementSpacing);
  const availableHeight = areaHeight - totalSpacing;
  
  for (const element of elements) {
    const content = getElementContent(element.key, productData);
    if (!content) continue;
    
    // 根据权重分配高度
    const allocatedHeight = (element.weight / totalWeight) * availableHeight;
    
    // 计算最优字体大小
    const fontSize = calculateOptimalFontSizeForArea(
      content,
      areaWidth,
      allocatedHeight,
      config
    );
    
    // 计算文本布局
    const { lines, text } = calculateTextLayout(content, areaWidth, fontSize);
    const actualHeight = fontSize * lines * config.lineHeight;
    
    result.push({
      id: element.id,
      x: startX,
      y: currentY,
      width: areaWidth,
      height: actualHeight,
      fontSize,
      align: 'left',
      lines,
      text,
      area: 'text'
    });
    
    currentY += actualHeight + mmToPixels(config.elementSpacing);
  }
  
  return result;
}

/**
 * 布局价格区域
 */
function layoutPriceArea(
  productData: ProductData,
  areaWidth: number,
  areaHeight: number,
  startX: number,
  startY: number,
  config: SimpleLayoutConfig
): SimpleLayoutElement | null {
  if (!productData.price) return null;
  
  const priceText = `¥${productData.price.toFixed(2)}`;
  
  // 计算价格字体大小（使用更大的字体，适合价格显示）
  const fontSize = calculatePriceFontSize(
    priceText,
    areaWidth,
    areaHeight,
    config
  );
  
  // 计算文本布局
  const { lines, text } = calculateTextLayout(priceText, areaWidth, fontSize);
  
  // 计算垂直居中位置
  const textHeight = fontSize * lines * config.lineHeight;
  const verticalCenter = startY + (areaHeight - textHeight) / 2;
  
  return {
    id: 'product_price',
    x: startX,
    y: verticalCenter,
    width: areaWidth,
    height: textHeight,
    fontSize,
    align: 'center',
    lines,
    text,
    area: 'price'
  };
}

/**
 * 计算价格字体大小（专门为价格优化）
 */
function calculatePriceFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  config: SimpleLayoutConfig
): number {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时返回估算值，价格字体更大
    const estimatedFontSize = Math.min(
      config.maxFontSize * 1.2, // 价格字体比普通文字大20%
      Math.max(config.minFontSize * 1.5, maxHeight / config.lineHeight)
    );
    return Math.min(estimatedFontSize, maxWidth / (text.length * 0.5));
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return config.minFontSize * 1.5;

  // 价格字体从更大的尺寸开始
  let fontSize = Math.min(config.maxFontSize * 1.2, maxHeight / config.lineHeight);
  
  while (fontSize >= config.minFontSize * 1.5) {
    // 使用适合价格的字体
    ctx.font = `${fontSize}px "Arial Black", "Helvetica Neue", "Arial", sans-serif`;
    
    // 检查单行是否适合
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize * config.lineHeight;
    
    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 1; // 价格字体调整步长更大
  }
  
  return config.minFontSize * 1.5;
}

/**
 * 计算区域内的最优字体大小
 */
function calculateOptimalFontSizeForArea(
  text: string,
  maxWidth: number,
  maxHeight: number,
  config: SimpleLayoutConfig
): number {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时返回估算值
    const estimatedFontSize = Math.min(
      config.maxFontSize,
      Math.max(config.minFontSize, maxHeight / config.lineHeight)
    );
    return Math.min(estimatedFontSize, maxWidth / (text.length * 0.6));
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return config.minFontSize;

  let fontSize = config.maxFontSize;
  
  while (fontSize >= config.minFontSize) {
    ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
    
    // 检查单行是否适合
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize * config.lineHeight;
    
    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      return fontSize;
    }
    
    // 检查多行是否适合
    const { lines } = calculateTextLayout(text, maxWidth, fontSize);
    const totalHeight = fontSize * lines * config.lineHeight;
    
    if (totalHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 0.5;
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
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时使用简单换行
    const estimatedCharsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    const textLines: string[] = [];
    for (let i = 0; i < text.length; i += estimatedCharsPerLine) {
      textLines.push(text.slice(i, i + estimatedCharsPerLine));
    }
    return { lines: textLines.slice(0, 3).length, text: textLines.slice(0, 3).join('\n') };
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { lines: 1, text };

  ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
  
  // 如果文本很短，不需要换行
  const textWidth = ctx.measureText(text).width;
  if (textWidth <= maxWidth) {
    return { lines: 1, text };
  }

  // 需要换行 - 按字符分割
  const chars = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of chars) {
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
 * mm转像素
 */
function mmToPixels(mm: number): number {
  return mm * 3.7795275591;
}

/**
 * 像素转mm
 */
export function pixelsToMm(pixels: number): number {
  return pixels / 3.7795275591;
}

// 保持向后兼容的接口
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

/**
 * 计算最优布局（保持向后兼容）
 */
export function calculateOptimalLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: any = SIMPLE_DEFAULT_CONFIG
): LayoutResult {
  const simpleResult = calculateSimpleLayout(labelWidth, labelHeight, productData, config);
  
  return {
    elements: simpleResult.elements.map(el => ({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      fontSize: el.fontSize,
      align: el.align,
      lines: el.lines,
      text: el.text
    })),
    totalHeight: labelHeight
  };
}
