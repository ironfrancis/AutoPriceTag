// 智能配色系统
export interface ColorScheme {
  id: string;
  name: string;
  primary: string; // 主色
  secondary: string; // 辅助色
  accent: string; // 强调色
  background: string; // 背景色
  text: string; // 文字色
  textSecondary: string; // 次要文字色
  category: string; // 适用类别
  mood: 'professional' | 'playful' | 'elegant' | 'bold' | 'minimal'; // 风格
}

// 预设配色方案
export const COLOR_SCHEMES: ColorScheme[] = [
  // 食品类配色
  {
    id: 'warm-orange',
    name: '温暖橙',
    primary: '#FF9800',
    secondary: '#FFB74D',
    accent: '#FF5722',
    background: '#FFF3E0',
    text: '#E65100',
    textSecondary: '#BF360C',
    category: 'food',
    mood: 'playful'
  },
  {
    id: 'vibrant-red',
    name: '活力红',
    primary: '#F44336',
    secondary: '#EF5350',
    accent: '#D32F2F',
    background: '#FFEBEE',
    text: '#C62828',
    textSecondary: '#B71C1C',
    category: 'food',
    mood: 'bold'
  },
  
  // 电子类配色
  {
    id: 'tech-blue',
    name: '科技蓝',
    primary: '#2196F3',
    secondary: '#64B5F6',
    accent: '#1976D2',
    background: '#E3F2FD',
    text: '#1565C0',
    textSecondary: '#0D47A1',
    category: 'electronics',
    mood: 'professional'
  },
  {
    id: 'electric-blue',
    name: '电光蓝',
    primary: '#00BCD4',
    secondary: '#4DD0E1',
    accent: '#0097A7',
    background: '#E0F2F1',
    text: '#00695C',
    textSecondary: '#004D40',
    category: 'electronics',
    mood: 'bold'
  },
  
  // 服装类配色
  {
    id: 'fashion-purple',
    name: '时尚紫',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#7B1FA2',
    background: '#F3E5F5',
    text: '#6A1B9A',
    textSecondary: '#4A148C',
    category: 'clothing',
    mood: 'elegant'
  },
  {
    id: 'bright-pink',
    name: '亮粉',
    primary: '#E91E63',
    secondary: '#F06292',
    accent: '#C2185B',
    background: '#FCE4EC',
    text: '#AD1457',
    textSecondary: '#880E4F',
    category: 'clothing',
    mood: 'playful'
  },
  
  // 图书类配色
  {
    id: 'academic-green',
    name: '学术绿',
    primary: '#4CAF50',
    secondary: '#81C784',
    accent: '#388E3C',
    background: '#E8F5E8',
    text: '#2E7D32',
    textSecondary: '#1B5E20',
    category: 'books',
    mood: 'minimal'
  },
  {
    id: 'forest-green',
    name: '森林绿',
    primary: '#689F38',
    secondary: '#8BC34A',
    accent: '#558B2F',
    background: '#F1F8E9',
    text: '#33691E',
    textSecondary: '#1B5E20',
    category: 'books',
    mood: 'professional'
  },
  
  // 通用配色
  {
    id: 'neutral-gray',
    name: '中性灰',
    primary: '#607D8B',
    secondary: '#90A4AE',
    accent: '#455A64',
    background: '#ECEFF1',
    text: '#37474F',
    textSecondary: '#263238',
    category: 'other',
    mood: 'minimal'
  },
  {
    id: 'golden-yellow',
    name: '金黄',
    primary: '#FFC107',
    secondary: '#FFD54F',
    accent: '#F57F17',
    background: '#FFFDE7',
    text: '#F57C00',
    textSecondary: '#E65100',
    category: 'other',
    mood: 'bold'
  },
  {
    id: 'deep-red',
    name: '深红',
    primary: '#D32F2F',
    secondary: '#F44336',
    accent: '#B71C1C',
    background: '#FFEBEE',
    text: '#C62828',
    textSecondary: '#B71C1C',
    category: 'other',
    mood: 'elegant'
  },
  {
    id: 'burgundy',
    name: '酒红',
    primary: '#8E24AA',
    secondary: '#AB47BC',
    accent: '#6A1B9A',
    background: '#F3E5F5',
    text: '#7B1FA2',
    textSecondary: '#4A148C',
    category: 'other',
    mood: 'elegant'
  },
  {
    id: 'charcoal',
    name: '炭黑',
    primary: '#424242',
    secondary: '#616161',
    accent: '#212121',
    background: '#FAFAFA',
    text: '#212121',
    textSecondary: '#000000',
    category: 'other',
    mood: 'professional'
  },
  {
    id: 'dark-blue',
    name: '深蓝',
    primary: '#1976D2',
    secondary: '#42A5F5',
    accent: '#0D47A1',
    background: '#E3F2FD',
    text: '#1565C0',
    textSecondary: '#0D47A1',
    category: 'other',
    mood: 'professional'
  }
];

/**
 * 根据商品信息推荐配色方案
 */
export function recommendColorScheme(
  category: string,
  priceRange: string,
  urgency: string,
  mood?: string
): ColorScheme {
  // 首先根据类别筛选
  let candidates = COLOR_SCHEMES.filter(scheme => 
    scheme.category === category || scheme.category === 'other'
  );
  
  // 如果没有找到对应类别的，使用通用配色
  if (candidates.length === 0) {
    candidates = COLOR_SCHEMES.filter(scheme => scheme.category === 'other');
  }
  
  // 根据价格区间调整
  if (priceRange === 'luxury') {
    candidates = candidates.filter(scheme => 
      scheme.mood === 'elegant' || scheme.mood === 'professional'
    );
  } else if (priceRange === 'low') {
    candidates = candidates.filter(scheme => 
      scheme.mood === 'playful' || scheme.mood === 'bold'
    );
  }
  
  // 根据促销状态调整
  if (urgency === 'promotion') {
    candidates = candidates.filter(scheme => 
      scheme.mood === 'bold' || scheme.mood === 'playful'
    );
  } else if (urgency === 'clearance') {
    candidates = candidates.filter(scheme => 
      scheme.id.includes('red') || scheme.id.includes('burgundy')
    );
  }
  
  // 如果指定了风格偏好
  if (mood) {
    candidates = candidates.filter(scheme => scheme.mood === mood);
  }
  
  // 如果还有多个候选，随机选择一个
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  // 默认返回中性灰
  return COLOR_SCHEMES.find(scheme => scheme.id === 'neutral-gray') || COLOR_SCHEMES[0];
}

/**
 * 获取配色方案
 */
export function getColorScheme(id: string): ColorScheme | undefined {
  return COLOR_SCHEMES.find(scheme => scheme.id === id);
}

/**
 * 检查颜色对比度是否满足可访问性要求
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  // 简化的对比度检查
  // 实际应用中应该使用更精确的算法
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                   (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
}

/**
 * 计算颜色的相对亮度
 */
function getLuminance(color: string): number {
  // 简化的亮度计算
  // 实际应用中应该使用更精确的算法
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 生成渐变色
 */
export function generateGradient(
  colorScheme: ColorScheme,
  direction: 'horizontal' | 'vertical' | 'diagonal' = 'vertical'
): string {
  const { primary, secondary } = colorScheme;
  
  switch (direction) {
    case 'horizontal':
      return `linear-gradient(90deg, ${primary}, ${secondary})`;
    case 'diagonal':
      return `linear-gradient(135deg, ${primary}, ${secondary})`;
    default:
      return `linear-gradient(180deg, ${primary}, ${secondary})`;
  }
}

/**
 * 智能颜色调整（基于环境光）
 */
export function adjustColorForEnvironment(
  color: string,
  environment: 'bright' | 'normal' | 'dark' = 'normal'
): string {
  // 简化的环境光调整
  // 实际应用中应该使用更复杂的算法
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  let factor = 1;
  switch (environment) {
    case 'bright':
      factor = 0.8; // 降低亮度
      break;
    case 'dark':
      factor = 1.2; // 提高亮度
      break;
  }
  
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * 色盲友好的颜色调整
 */
export function adjustForColorBlindness(
  colorScheme: ColorScheme,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' = 'protanopia'
): ColorScheme {
  // 简化的色盲调整
  // 实际应用中应该使用更精确的算法
  const adjustments = {
    protanopia: { r: 0.8, g: 1.2, b: 1.0 },
    deuteranopia: { r: 1.2, g: 0.8, b: 1.0 },
    tritanopia: { r: 1.0, g: 1.0, b: 0.8 }
  };
  
  const adjustment = adjustments[type];
  
  return {
    ...colorScheme,
    primary: adjustColorChannel(colorScheme.primary, adjustment),
    secondary: adjustColorChannel(colorScheme.secondary, adjustment),
    accent: adjustColorChannel(colorScheme.accent, adjustment),
  };
}

/**
 * 调整颜色通道
 */
function adjustColorChannel(color: string, adjustment: { r: number; g: number; b: number }): string {
  const hex = color.replace('#', '');
  const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * adjustment.r));
  const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * adjustment.g));
  const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * adjustment.b));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
