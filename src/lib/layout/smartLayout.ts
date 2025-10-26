import { ProductData } from '../types';

// 增强的布局结果接口
export interface SmartLayoutElement extends LayoutElement {
  importance: number; // 重要性评分 (0-1)
  visualWeight: number; // 视觉权重
  colorScheme: string; // 推荐配色方案
  animation?: string; // 动画效果
}

export interface SmartLayoutResult extends LayoutResult {
  elements: SmartLayoutElement[];
  recommendedTemplate: string; // 推荐模板ID
  colorScheme: string; // 整体配色方案
  visualStyle: 'minimal' | 'bold' | 'elegant' | 'playful'; // 视觉风格
  confidence: number; // 布局信心度 (0-1)
}

// 内容分析结果
interface ContentAnalysis {
  textLength: 'short' | 'medium' | 'long';
  language: 'chinese' | 'english' | 'mixed';
  category: 'food' | 'electronics' | 'clothing' | 'books' | 'other';
  priceRange: 'low' | 'medium' | 'high' | 'luxury';
  urgency: 'normal' | 'promotion' | 'clearance';
}

// 智能布局配置
interface SmartLayoutConfig extends LayoutConfig {
  enableAI: boolean;
  colorBlindnessSupport: boolean;
  accessibilityMode: boolean;
  brandConsistency: boolean;
}

// 默认智能配置
const SMART_DEFAULT_CONFIG: SmartLayoutConfig = {
  padding: 2,
  elementSpacing: 1,
  minFontSize: 8,
  maxFontSize: 20,
  lineHeight: 1.2,
  enableAI: true,
  colorBlindnessSupport: false,
  accessibilityMode: false,
  brandConsistency: true,
};

/**
 * 智能内容分析
 */
function analyzeContent(productData: ProductData): ContentAnalysis {
  const name = productData.name || '';
  const price = productData.price || 0;
  
  // 文本长度分析
  let textLength: 'short' | 'medium' | 'long' = 'medium';
  if (name.length <= 6) textLength = 'short';
  else if (name.length > 12) textLength = 'long';
  
  // 语言分析
  let language: 'chinese' | 'english' | 'mixed' = 'chinese';
  const chineseRegex = /[\u4e00-\u9fff]/;
  const englishRegex = /[a-zA-Z]/;
  const hasChinese = chineseRegex.test(name);
  const hasEnglish = englishRegex.test(name);
  
  if (hasChinese && hasEnglish) language = 'mixed';
  else if (hasEnglish) language = 'english';
  
  // 商品类别分析（基于关键词）
  let category: 'food' | 'electronics' | 'clothing' | 'books' | 'other' = 'other';
  const categoryKeywords = {
    food: ['食品', '零食', '饮料', '水果', '蔬菜', '肉类', 'food', 'snack', 'drink'],
    electronics: ['手机', '电脑', '电视', '耳机', '充电器', 'phone', 'computer', 'tv', 'headphone'],
    clothing: ['衣服', '鞋子', '帽子', '包', 'clothes', 'shoes', 'hat', 'bag'],
    books: ['书', '杂志', '教材', 'book', 'magazine', 'textbook']
  };
  
  const lowerName = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      category = cat as any;
      break;
    }
  }
  
  // 价格区间分析
  let priceRange: 'low' | 'medium' | 'high' | 'luxury' = 'medium';
  if (price < 50) priceRange = 'low';
  else if (price > 500) priceRange = 'high';
  else if (price > 1000) priceRange = 'luxury';
  
  // 促销状态分析
  let urgency: 'normal' | 'promotion' | 'clearance' = 'normal';
  const discount = (productData as any).discount;
  const originalPrice = (productData as any).originalPrice;
  
  if (discount && discount > 20) {
    urgency = 'promotion';
  }
  if (originalPrice && productData.price < originalPrice * 0.5) {
    urgency = 'clearance';
  }
  
  return {
    textLength,
    language,
    category,
    priceRange,
    urgency
  };
}

/**
 * 智能重要性评分
 */
function calculateImportance(element: any, productData: ProductData, analysis: ContentAnalysis): number {
  const baseImportance = element.weight;
  let multiplier = 1;
  
  switch (element.key) {
    case 'name':
      // 商品名称的重要性基于文本长度和类别
      if (analysis.textLength === 'short') multiplier = 1.2;
      else if (analysis.textLength === 'long') multiplier = 0.8;
      break;
      
    case 'price':
      // 价格的重要性基于价格区间
      if (analysis.priceRange === 'luxury') multiplier = 1.3;
      else if (analysis.priceRange === 'low') multiplier = 1.1;
      break;
      
    case 'brand':
      // 品牌重要性基于品牌知名度（这里简化处理）
      if (productData.brand && productData.brand.length > 0) {
        multiplier = 1.1;
      }
      break;
      
    case 'sellingPoints':
      // 卖点重要性基于促销状态
      if (analysis.urgency === 'promotion') multiplier = 1.2;
      break;
  }
  
  return Math.min(1, baseImportance * multiplier);
}

/**
 * 智能配色方案推荐
 */
function recommendColorScheme(analysis: ContentAnalysis, urgency: string): string {
  const schemes = {
    // 食品类
    food: {
      normal: 'warm-orange',
      promotion: 'vibrant-red',
      clearance: 'deep-red'
    },
    // 电子类
    electronics: {
      normal: 'tech-blue',
      promotion: 'electric-blue',
      clearance: 'dark-blue'
    },
    // 服装类
    clothing: {
      normal: 'fashion-purple',
      promotion: 'bright-pink',
      clearance: 'burgundy'
    },
    // 图书类
    books: {
      normal: 'academic-green',
      promotion: 'forest-green',
      clearance: 'dark-green'
    },
    // 其他
    other: {
      normal: 'neutral-gray',
      promotion: 'golden-yellow',
      clearance: 'charcoal'
    }
  };
  
  const categorySchemes = schemes[analysis.category] || schemes.other;
  return (categorySchemes as any)[urgency] || categorySchemes.normal;
}

/**
 * 智能视觉风格推荐
 */
function recommendVisualStyle(analysis: ContentAnalysis): 'minimal' | 'bold' | 'elegant' | 'playful' {
  if (analysis.priceRange === 'luxury') return 'elegant';
  if (analysis.urgency === 'promotion') return 'bold';
  if (analysis.category === 'books') return 'minimal';
  if (analysis.category === 'clothing') return 'playful';
  return 'minimal';
}

/**
 * 智能模板推荐
 */
function recommendTemplate(analysis: ContentAnalysis): string {
  if (analysis.urgency === 'promotion') return 'promotion_template';
  if (analysis.priceRange === 'luxury') return 'premium_template';
  return 'simple_template';
}

/**
 * 智能字体大小计算
 */
function calculateSmartFontSize(
  element: any,
  content: string,
  availableWidth: number,
  availableHeight: number,
  importance: number,
  analysis: ContentAnalysis,
  config: SmartLayoutConfig
): number {
  // 基础字体大小计算
  let fontSize = calculateOptimalFontSize(content, availableWidth, availableHeight, config);
  
  // 基于重要性的调整
  fontSize *= (0.8 + importance * 0.4); // 重要性越高，字体越大
  
  // 基于文本长度的调整
  if (analysis.textLength === 'short') {
    fontSize *= 1.1; // 短文本可以稍微大一些
  } else if (analysis.textLength === 'long') {
    fontSize *= 0.9; // 长文本需要小一些
  }
  
  // 基于语言的调整
  if (analysis.language === 'english') {
    fontSize *= 1.05; // 英文通常需要稍微大一些
  } else if (analysis.language === 'mixed') {
    fontSize *= 0.95; // 中英混合需要平衡
  }
  
  // 确保在合理范围内
  return Math.max(config.minFontSize, Math.min(config.maxFontSize, fontSize));
}

/**
 * 智能对齐方式
 */
function calculateSmartAlignment(
  element: any,
  analysis: ContentAnalysis,
  labelWidth: number,
  labelHeight: number
): 'left' | 'center' | 'right' {
  // 基于商品类别的对齐偏好
  const categoryAlignment = {
    food: 'center',
    electronics: 'left',
    clothing: 'center',
    books: 'left',
    other: 'center'
  };
  
  const preferredAlignment = categoryAlignment[analysis.category] || 'center';
  
  // 基于标签尺寸的调整
  const aspectRatio = labelWidth / labelHeight;
  if (aspectRatio > 2) {
    return 'center'; // 横版标签居中
  } else if (aspectRatio < 0.8) {
    return 'left'; // 竖版标签左对齐
  }
  
  return preferredAlignment as any;
}

/**
 * 智能布局计算（增强版）
 */
export function calculateSmartLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: SmartLayoutConfig = SMART_DEFAULT_CONFIG
): SmartLayoutResult {
  // 内容分析
  const analysis = analyzeContent(productData);
  
  // 推荐配色方案和视觉风格
  const colorScheme = recommendColorScheme(analysis, analysis.urgency);
  const visualStyle = recommendVisualStyle(analysis);
  const recommendedTemplate = recommendTemplate(analysis);
  
  // 获取有效元素
  const validElements = getValidElements(productData);
  
  if (validElements.length === 0) {
    return {
      elements: [],
      totalHeight: 0,
      recommendedTemplate,
      colorScheme,
      visualStyle,
      confidence: 0
    };
  }
  
  // 转换为像素单位
  const widthPx = mmToPixels(labelWidth);
  const heightPx = mmToPixels(labelHeight);
  const paddingPx = mmToPixels(config.padding);
  const spacingPx = mmToPixels(config.elementSpacing);
  
  const availableWidth = widthPx - paddingPx * 2;
  const availableHeight = heightPx - paddingPx * 2;
  
  // 计算智能布局元素
  const elements: SmartLayoutElement[] = [];
  let currentY = paddingPx;
  let totalConfidence = 0;
  
  for (const element of validElements) {
    const content = getElementContent(element.key, productData);
    const importance = calculateImportance(element, productData, analysis);
    
    // 智能字体大小
    const fontSize = calculateSmartFontSize(
      element,
      content,
      availableWidth,
      availableHeight / validElements.length,
      importance,
      analysis,
      config
    );
    
    // 智能对齐
    const align = calculateSmartAlignment(element, analysis, labelWidth, labelHeight);
    
    // 文本布局
    const { lines, text } = calculateTextLayout(content, availableWidth, fontSize);
    const actualHeight = fontSize * lines * config.lineHeight;
    
    // 视觉权重计算
    const visualWeight = importance * fontSize / config.maxFontSize;
    
    elements.push({
      id: element.id,
      x: paddingPx,
      y: currentY,
      width: availableWidth,
      height: actualHeight,
      fontSize,
      align,
      lines,
      text,
      importance,
      visualWeight,
      colorScheme,
    });
    
    currentY += actualHeight + spacingPx;
    totalConfidence += importance;
  }
  
  // 计算整体信心度
  const confidence = totalConfidence / validElements.length;
  
  return {
    elements,
    totalHeight: currentY - spacingPx + paddingPx,
    recommendedTemplate,
    colorScheme,
    visualStyle,
    confidence
  };
}

// 重新导出原有的函数和接口
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
 * 计算最优布局（保持向后兼容）
 */
export function calculateOptimalLayout(
  labelWidth: number,
  labelHeight: number,
  productData: ProductData,
  config: LayoutConfig = DEFAULT_CONFIG
): LayoutResult {
  // 使用智能布局，但只返回基础结果
  const smartResult = calculateSmartLayout(labelWidth, labelHeight, productData, {
    ...config,
    enableAI: false,
    colorBlindnessSupport: false,
    accessibilityMode: false,
    brandConsistency: true
  });
  
  return {
    elements: smartResult.elements.map(el => ({
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
    totalHeight: smartResult.totalHeight
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
 * 计算最优字体大小
 */
function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  config: LayoutConfig
): number {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时返回估算值
    return Math.min(config.maxFontSize, Math.max(config.minFontSize, maxHeight / config.lineHeight));
  }
  
  // 创建临时canvas来测量文本
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return config.minFontSize;

  let fontSize = config.maxFontSize;
  
  while (fontSize >= config.minFontSize) {
    ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * config.lineHeight;
    
    // 检查是否适合
    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 0.5; // 更精细的字体大小调整
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

  // 需要换行 - 按字符分割而不是按字分割，更好地处理中文
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
  // 1mm ≈ 3.7795275591px (96 DPI)
  // 使用更精确的转换系数
  return mm * 3.7795275591;
}

/**
 * 像素转mm
 */
export function pixelsToMm(pixels: number): number {
  return pixels / 3.7795275591;
}
