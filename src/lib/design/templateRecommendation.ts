import { LabelTemplate, ProductData } from '../types';
import { recommendColorScheme } from './colorSystem';

// 模板推荐结果
export interface TemplateRecommendation {
  template: LabelTemplate;
  score: number; // 推荐分数 (0-1)
  reasons: string[]; // 推荐理由
  confidence: number; // 信心度 (0-1)
}

// 商品分析结果
interface ProductAnalysis {
  category: 'food' | 'electronics' | 'clothing' | 'books' | 'other';
  priceRange: 'low' | 'medium' | 'high' | 'luxury';
  urgency: 'normal' | 'promotion' | 'clearance';
  textLength: 'short' | 'medium' | 'long';
  brandPresence: boolean;
  sellingPointsCount: number;
  specsCount: number;
}

// 模板评分权重
interface TemplateWeights {
  category: number;
  priceRange: number;
  urgency: number;
  textLength: number;
  brandPresence: number;
  sellingPointsCount: number;
  specsCount: number;
}

const DEFAULT_WEIGHTS: TemplateWeights = {
  category: 0.25,
  priceRange: 0.20,
  urgency: 0.20,
  textLength: 0.15,
  brandPresence: 0.10,
  sellingPointsCount: 0.05,
  specsCount: 0.05,
};

/**
 * 分析商品信息
 */
function analyzeProduct(productData: ProductData): ProductAnalysis {
  const name = productData.name || '';
  const price = productData.price || 0;
  
  // 商品类别分析
  let category: 'food' | 'electronics' | 'clothing' | 'books' | 'other' = 'other';
  const categoryKeywords = {
    food: ['食品', '零食', '饮料', '水果', '蔬菜', '肉类', 'food', 'snack', 'drink', 'tea', 'coffee'],
    electronics: ['手机', '电脑', '电视', '耳机', '充电器', 'phone', 'computer', 'tv', 'headphone', 'laptop'],
    clothing: ['衣服', '鞋子', '帽子', '包', 'clothes', 'shoes', 'hat', 'bag', 'shirt', 'dress'],
    books: ['书', '杂志', '教材', 'book', 'magazine', 'textbook', 'novel', 'guide']
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
  
  // 文本长度分析
  let textLength: 'short' | 'medium' | 'long' = 'medium';
  if (name.length <= 6) textLength = 'short';
  else if (name.length > 12) textLength = 'long';
  
  // 品牌存在性
  const brandPresence = !!(productData.brand && productData.brand.trim().length > 0);
  
  // 卖点数量
  const sellingPointsCount = productData.sellingPoints?.length || 0;
  
  // 规格数量
  const specsCount = productData.specs ? Object.keys(productData.specs).length : 0;
  
  return {
    category,
    priceRange,
    urgency,
    textLength,
    brandPresence,
    sellingPointsCount,
    specsCount
  };
}

/**
 * 计算模板匹配分数
 */
function calculateTemplateScore(
  template: LabelTemplate,
  analysis: ProductAnalysis,
  weights: TemplateWeights = DEFAULT_WEIGHTS
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // 类别匹配
  const categoryScore = getCategoryScore(template, analysis.category);
  score += categoryScore * weights.category;
  if (categoryScore > 0.7) {
    reasons.push(`适合${analysis.category}类商品`);
  }
  
  // 价格区间匹配
  const priceScore = getPriceRangeScore(template, analysis.priceRange);
  score += priceScore * weights.priceRange;
  if (priceScore > 0.7) {
    reasons.push(`适合${analysis.priceRange}价位商品`);
  }
  
  // 促销状态匹配
  const urgencyScore = getUrgencyScore(template, analysis.urgency);
  score += urgencyScore * weights.urgency;
  if (urgencyScore > 0.7) {
    reasons.push(`适合${analysis.urgency}状态`);
  }
  
  // 文本长度匹配
  const textScore = getTextLengthScore(template, analysis.textLength);
  score += textScore * weights.textLength;
  if (textScore > 0.7) {
    reasons.push(`适合${analysis.textLength}文本`);
  }
  
  // 品牌存在性匹配
  const brandScore = getBrandPresenceScore(template, analysis.brandPresence);
  score += brandScore * weights.brandPresence;
  if (brandScore > 0.7) {
    reasons.push(analysis.brandPresence ? '突出品牌信息' : '简洁设计');
  }
  
  // 卖点数量匹配
  const sellingPointsScore = getSellingPointsScore(template, analysis.sellingPointsCount);
  score += sellingPointsScore * weights.sellingPointsCount;
  if (sellingPointsScore > 0.7) {
    reasons.push(`适合${analysis.sellingPointsCount}个卖点`);
  }
  
  // 规格数量匹配
  const specsScore = getSpecsScore(template, analysis.specsCount);
  score += specsScore * weights.specsCount;
  if (specsScore > 0.7) {
    reasons.push(`适合${analysis.specsCount}个规格`);
  }
  
  return { score: Math.min(1, score), reasons };
}

/**
 * 类别匹配分数
 */
function getCategoryScore(template: LabelTemplate, category: string): number {
  const categoryPreferences = {
    simple: {
      food: 0.8,
      electronics: 0.6,
      clothing: 0.7,
      books: 0.9,
      other: 0.8
    },
    promotion: {
      food: 0.9,
      electronics: 0.7,
      clothing: 0.8,
      books: 0.5,
      other: 0.7
    },
    premium: {
      food: 0.6,
      electronics: 0.9,
      clothing: 0.8,
      books: 0.7,
      other: 0.8
    }
  };
  
  return (categoryPreferences[template.type] as any)?.[category] || 0.5;
}

/**
 * 价格区间匹配分数
 */
function getPriceRangeScore(template: LabelTemplate, priceRange: string): number {
  const pricePreferences = {
    simple: {
      low: 0.9,
      medium: 0.8,
      high: 0.6,
      luxury: 0.4
    },
    promotion: {
      low: 0.8,
      medium: 0.9,
      high: 0.7,
      luxury: 0.5
    },
    premium: {
      low: 0.4,
      medium: 0.6,
      high: 0.8,
      luxury: 0.9
    }
  };
  
  return (pricePreferences[template.type] as any)?.[priceRange] || 0.5;
}

/**
 * 促销状态匹配分数
 */
function getUrgencyScore(template: LabelTemplate, urgency: string): number {
  const urgencyPreferences = {
    simple: {
      normal: 0.9,
      promotion: 0.6,
      clearance: 0.7
    },
    promotion: {
      normal: 0.4,
      promotion: 0.9,
      clearance: 0.8
    },
    premium: {
      normal: 0.8,
      promotion: 0.5,
      clearance: 0.4
    }
  };
  
  return (urgencyPreferences[template.type] as any)?.[urgency] || 0.5;
}

/**
 * 文本长度匹配分数
 */
function getTextLengthScore(template: LabelTemplate, textLength: string): number {
  // 基于模板的元素数量和布局复杂度
  const elementCount = template.elements.length;
  
  if (textLength === 'short') {
    return elementCount <= 3 ? 0.9 : 0.6;
  } else if (textLength === 'long') {
    return elementCount >= 4 ? 0.9 : 0.6;
  } else {
    return 0.8; // 中等长度适合大多数模板
  }
}

/**
 * 品牌存在性匹配分数
 */
function getBrandPresenceScore(template: LabelTemplate, brandPresence: boolean): number {
  // 检查模板是否有品牌元素
  const hasBrandElement = template.elements.some(el => el.id === 'brand');
  
  if (brandPresence && hasBrandElement) return 0.9;
  if (!brandPresence && !hasBrandElement) return 0.9;
  return 0.6;
}

/**
 * 卖点数量匹配分数
 */
function getSellingPointsScore(template: LabelTemplate, sellingPointsCount: number): number {
  const hasSellingPointsElement = template.elements.some(el => el.id === 'selling_points');
  
  if (sellingPointsCount > 0 && hasSellingPointsElement) return 0.9;
  if (sellingPointsCount === 0 && !hasSellingPointsElement) return 0.9;
  return 0.6;
}

/**
 * 规格数量匹配分数
 */
function getSpecsScore(template: LabelTemplate, specsCount: number): number {
  const hasSpecsElement = template.elements.some(el => el.id === 'specs');
  
  if (specsCount > 0 && hasSpecsElement) return 0.9;
  if (specsCount === 0 && !hasSpecsElement) return 0.9;
  return 0.6;
}

/**
 * 智能模板推荐
 */
export function recommendTemplates(
  productData: ProductData,
  availableTemplates: LabelTemplate[],
  maxRecommendations: number = 3
): TemplateRecommendation[] {
  const analysis = analyzeProduct(productData);
  
  // 计算每个模板的推荐分数
  const recommendations: TemplateRecommendation[] = availableTemplates.map(template => {
    const { score, reasons } = calculateTemplateScore(template, analysis);
    
    // 计算信心度（基于分析数据的完整性）
    const confidence = calculateConfidence(analysis);
    
    return {
      template,
      score,
      reasons,
      confidence
    };
  });
  
  // 按分数排序并返回前N个推荐
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);
}

/**
 * 计算推荐信心度
 */
function calculateConfidence(analysis: ProductAnalysis): number {
  let confidence = 0.5; // 基础信心度
  
  // 基于数据完整性调整信心度
  if (analysis.category !== 'other') confidence += 0.2;
  if (analysis.priceRange !== 'medium') confidence += 0.1;
  if (analysis.urgency !== 'normal') confidence += 0.1;
  if (analysis.textLength !== 'medium') confidence += 0.1;
  
  return Math.min(1, confidence);
}

/**
 * 获取最佳推荐模板
 */
export function getBestTemplate(
  productData: ProductData,
  availableTemplates: LabelTemplate[]
): TemplateRecommendation | null {
  const recommendations = recommendTemplates(productData, availableTemplates, 1);
  return recommendations.length > 0 ? recommendations[0] : null;
}

/**
 * 个性化模板推荐（基于用户历史）
 */
export function getPersonalizedRecommendations(
  productData: ProductData,
  availableTemplates: LabelTemplate[],
  userHistory: { templateId: string; frequency: number }[],
  maxRecommendations: number = 3
): TemplateRecommendation[] {
  const baseRecommendations = recommendTemplates(productData, availableTemplates, maxRecommendations * 2);
  
  // 基于用户历史调整分数
  const personalizedRecommendations = baseRecommendations.map(rec => {
    const historyItem = userHistory.find(h => h.templateId === rec.template.id);
    if (historyItem) {
      // 用户使用过的模板获得额外分数
      rec.score += historyItem.frequency * 0.1;
      rec.reasons.push('您经常使用此模板');
    }
    
    return rec;
  });
  
  // 重新排序并返回
  return personalizedRecommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);
}

/**
 * 模板对比分析
 */
export function compareTemplates(
  templates: LabelTemplate[],
  productData: ProductData
): { template: LabelTemplate; pros: string[]; cons: string[] }[] {
  const analysis = analyzeProduct(productData);
  
  return templates.map(template => {
    const pros: string[] = [];
    const cons: string[] = [];
    
    // 分析优点
    if (template.type === 'promotion' && analysis.urgency === 'promotion') {
      pros.push('突出促销信息');
    }
    if (template.type === 'premium' && analysis.priceRange === 'luxury') {
      pros.push('体现高端品质');
    }
    if (template.type === 'simple' && analysis.textLength === 'long') {
      pros.push('简洁设计，适合长文本');
    }
    
    // 分析缺点
    if (template.type === 'promotion' && analysis.urgency === 'normal') {
      cons.push('可能过于突出');
    }
    if (template.type === 'premium' && analysis.priceRange === 'low') {
      cons.push('可能显得过于奢华');
    }
    if (template.elements.length > 4 && analysis.textLength === 'short') {
      cons.push('元素过多，可能显得拥挤');
    }
    
    return { template, pros, cons };
  });
}
