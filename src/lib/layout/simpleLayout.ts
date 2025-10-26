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
  priority: number; // 优先级，用于排序
}

export interface SimpleLayoutResult {
  elements: SimpleLayoutElement[];
  totalWidth: number; // 总宽度
  totalHeight: number; // 总高度
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

/**
 * 元素定义接口
 */
interface ElementDefinition {
  id: string;
  type: 'core' | 'selling_point' | 'spec' | 'custom_field';
  key: string;
  priority: number;
  weight: number;
  fieldKey?: string;
  text?: string;
}

/**
 * 核心元素定义（固定元素）
 * 
 * 核心设计理念：
 * 1. 所有在 productData 中有值的字段都应该被创建为可拖拽元素
 * 2. 每个卖点、规格、自定义字段都是独立的元素组件
 * 3. 元素按优先级排序：商品名 > 价格 > 品牌 > 卖点 > 规格 > 自定义字段
 * 4. 权重用于分配垂直空间
 */
const CORE_ELEMENTS = [
  { id: 'product_name', type: 'core' as const, key: 'name', priority: 1, weight: 0.25 },
  { id: 'product_price', type: 'core' as const, key: 'price', priority: 2, weight: 0.20 },
  { id: 'brand', type: 'core' as const, key: 'brand', priority: 3, weight: 0.15 },
];

/**
 * 从 ProductData 生成所有元素定义
 * 每个卖点、规格、自定义字段都是独立元素
 * 
 * 元素 ID 规则：
 * - 核心字段: product_name, product_price, brand
 * - 卖点: selling_point_0, selling_point_1, ...
 * - 规格: spec_color, spec_weight, ... (使用键名的小写+下划线)
 * - 自定义字段: custom_field_name, custom_origin, ...
 */
function generateElementDefinitions(productData: ProductData): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  
  // 核心字段
  elements.push(...CORE_ELEMENTS);
  
  // 卖点：每个独立元素
  (productData.sellingPoints || []).forEach((point, index) => {
    if (point && point.trim()) {
      elements.push({
        id: `selling_point_${index}`,
        type: 'selling_point',
        key: `sellingPoints[${index}]`,
        priority: 4 + index * 0.01,
        weight: 0.08,
        text: point
      });
    }
  });
  
  // 规格：每个键值对独立元素
  Object.entries(productData.specs || {}).forEach(([key, value], index) => {
    if (key && value) {
      // 规范化 key：转小写、空格替换为下划线
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
      elements.push({
        id: `spec_${normalizedKey}`,
        type: 'spec',
        key: `specs.${key}`,
        fieldKey: key,
        priority: 5 + index * 0.01,
        weight: 0.06,
        text: `${key}: ${value}`
      });
    }
  });
  
  // 自定义字段：每个独立元素
  Object.entries(productData.customFields || {}).forEach(([key, value], index) => {
    if (key && value) {
      // 规范化 key：转小写、空格替换为下划线
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
      elements.push({
        id: `custom_${normalizedKey}`,
        type: 'custom_field',
        key: `customFields.${key}`,
        fieldKey: key,
        priority: 6 + index * 0.01,
        weight: 0.06,
        text: `${key}: ${value}`
      });
    }
  });
  
  return elements;
}

/**
 * 计算简洁布局（统一垂直布局，无分割）
 */
export function calculateSimpleLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: SimpleLayoutConfig = MINIMALIST_CONFIG,
  textAreaRatio: number = 0.6 // 保留参数以兼容旧代码
): SimpleLayoutResult {
  // 转换为像素单位
  const widthPx = mmToPixels(labelWidth);
  const heightPx = mmToPixels(labelHeight);
  const paddingPx = mmToPixels(config.padding);
  const spacingPx = mmToPixels(config.elementSpacing);

  // 计算可用区域（去掉内边距）
  const availableWidth = widthPx - paddingPx * 2;
  const availableHeight = heightPx - paddingPx * 2;

  // 获取所有有效元素
  const validElements = getValidElements(productData);
  
  // 布局所有元素（统一垂直排列）
  const elements = layoutAllElements(
    validElements,
    productData,
    availableWidth,
    availableHeight,
    paddingPx,
    paddingPx, // startX
    paddingPx, // startY
    spacingPx,
    config
  );

  return {
    elements,
    totalWidth: widthPx,
    totalHeight: heightPx
  };
}

/**
 * 获取有效的元素
 * 
 * 设计原则：
 * 1. 动态生成所有元素：核心字段 + 卖点 + 规格 + 自定义字段
 * 2. 空字符串或 undefined 的字段会被过滤掉（在生成时过滤）
 * 3. 确保所有有效字段都会显示在标签上，除非用户手动删除
 */
function getValidElements(productData: ProductData): ElementDefinition[] {
  // 使用新的动态生成函数
  return generateElementDefinitions(productData);
}

/**
 * 获取有效的文字元素（保留以兼容旧代码）
 */
function getValidTextElements(productData: ProductData) {
  return getValidElements(productData);
}

/**
 * 获取元素内容
 * 
 * 注意：此函数现在主要用于单个元素的文本获取
 * 对于动态元素（卖点、规格、自定义字段），使用 ElementDefinition 中的 text
 */
function getElementContent(key: string, productData: ProductData, elementDef?: ElementDefinition): string {
  // 如果有 elementDef，使用其预生成的 text
  if (elementDef?.text) {
    return elementDef.text;
  }
  
  // 核心字段
  switch (key) {
    case 'name':
      return productData.name || '';
    case 'brand':
      return productData.brand || '';
    case 'price':
      return productData.price ? `¥${productData.price}` : '';
    default:
      return '';
  }
}

/**
 * 布局所有元素（统一垂直布局）
 * 
 * 核心设计：
 * 1. 所有元素按权重分配垂直空间，确保都显示在可见区域内
 * 2. 价格元素特殊处理，使用更大的字体并居中对齐
 * 3. 其他元素左对齐，自动换行
 * 4. 元素间距为 config.elementSpacing（默认2mm）
 * 
 * 可见性保证：
 * - 所有元素的初始 Y 坐标都会计算在内边距范围内
 * - 使用实际高度（actualHeight）而非分配高度，确保元素不溢出
 * - 元素间距确保不重叠
 */
function layoutAllElements(
  elements: any[],
  productData: ProductData,
  areaWidth: number,
  areaHeight: number,
  paddingPx: number,
  startX: number,
  startY: number,
  spacingPx: number,
  config: SimpleLayoutConfig
): SimpleLayoutElement[] {
  const result: SimpleLayoutElement[] = [];
  let currentY = startY;
  
  // 计算每个元素的高度分配
  // 使用权重系统确保所有元素都能显示在可见区域内
  const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);
  const totalSpacing = (elements.length - 1) * spacingPx;
  const availableHeight = areaHeight - totalSpacing;
  
  for (const element of elements) {
    const content = getElementContent(element.key, productData, element);
    if (!content) continue;
    
    // 根据权重分配高度
    // 确保所有元素都有合理的显示空间
    const allocatedHeight = (element.weight / totalWeight) * availableHeight;
    
    // 价格元素使用不同的字体计算（更大更醒目）
    const fontSize = element.id === 'product_price'
      ? calculatePriceFontSize(content, areaWidth, allocatedHeight, config)
      : calculateOptimalFontSizeForArea(content, areaWidth, allocatedHeight, config);
    
    // 计算文本布局（自动换行，最多3行）
    const { lines, text } = calculateTextLayout(content, areaWidth, fontSize);
    // 使用实际高度而非分配高度，确保元素不溢出可见区域
    const actualHeight = fontSize * lines * config.lineHeight;
    
    // 对齐方式：价格居中，其他左对齐
    const align = element.id === 'product_price' ? 'center' : 'left';
    
    result.push({
      id: element.id,
      x: startX, // x坐标固定为起始位置，使用内边距
      y: currentY, // y坐标垂直排列
      width: areaWidth, // 宽度为整个可用区域
      height: actualHeight, // 高度为实际文本高度
      fontSize,
      align,
      lines,
      text,
      priority: element.priority
    });
    
    // 更新当前 Y 坐标，加上元素高度和间距
    currentY += actualHeight + spacingPx;
  }
  
  return result;
}

/**
 * 布局文字区域（保留以兼容旧代码）
 */
function layoutTextArea(
  elements: any[],
  productData: ProductData,
  areaWidth: number,
  areaHeight: number,
  startX: number,
  startY: number,
  spacingPx: number,
  config: SimpleLayoutConfig
): SimpleLayoutElement[] {
  // 简化为调用新函数
  const paddingPx = mmToPixels(config.padding);
  return layoutAllElements(elements, productData, areaWidth, areaHeight, paddingPx, startX, startY, spacingPx, config);
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

// 导出函数供其他模块使用
export { generateElementDefinitions };
export type { ElementDefinition };

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
