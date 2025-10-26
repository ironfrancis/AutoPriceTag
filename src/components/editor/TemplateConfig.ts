import { ProductData } from '@/lib/types';

/**
 * 布局模式定义
 */
export type LayoutMode = 'simple' | 'two-column' | 'promotion' | 'premium';

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  id: string;
  name: string;
  type: LayoutMode;
  description?: string;
  // 布局参数
  layoutParams: {
    textAreaRatio?: number; // 文字区域占比
    padding?: number; // 内边距
    elementSpacing?: number; // 元素间距
    lineHeight?: number; // 行高倍数
  };
  // 样式配置
  styles?: {
    backgroundColor?: string;
    textColors?: Record<string, string>; // 各元素的颜色
    borderColor?: string;
    borderRadius?: number;
  };
  // 字体配置
  fontConfigs?: Record<string, {
    fontSize?: number;
    fontWeight?: number;
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    fontFamily?: string;
  }>;
}

/**
 * 默认模板配置
 */
export const defaultTemplateConfigs: TemplateConfig[] = [
  {
    id: 'simple-default',
    name: '基础布局',
    type: 'simple',
    description: '经典的两栏布局，文字在左，价格在右',
    layoutParams: {
      textAreaRatio: 0.65,
      padding: 4,
      elementSpacing: 2,
      lineHeight: 1.4
    },
    fontConfigs: {
      product_name: {
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'left',
        color: '#111827'
      },
      brand: {
        fontSize: 12,
        fontWeight: 400,
        textAlign: 'left',
        color: '#6B7280'
      },
      selling_points: {
        fontSize: 10,
        fontWeight: 400,
        textAlign: 'left',
        color: '#4B5563'
      },
      product_price: {
        fontSize: 20,
        fontWeight: 600,
        textAlign: 'center',
        color: '#2563eb'
      }
    }
  },
  {
    id: 'promotion-default',
    name: '促销布局',
    type: 'promotion',
    description: '突出价格的促销风格布局',
    layoutParams: {
      textAreaRatio: 0.55,
      padding: 3,
      elementSpacing: 1.5,
      lineHeight: 1.3
    },
    fontConfigs: {
      product_name: {
        fontSize: 15,
        fontWeight: 600,
        textAlign: 'left',
        color: '#111827'
      },
      brand: {
        fontSize: 11,
        fontWeight: 500,
        textAlign: 'left',
        color: '#374151'
      },
      selling_points: {
        fontSize: 10,
        fontWeight: 400,
        textAlign: 'left',
        color: '#6B7280'
      },
      product_price: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
        color: '#DC2626'
      }
    }
  },
  {
    id: 'premium-default',
    name: '高端布局',
    type: 'premium',
    description: '注重美感和留白的高端布局',
    layoutParams: {
      textAreaRatio: 0.6,
      padding: 5,
      elementSpacing: 3,
      lineHeight: 1.5
    },
    fontConfigs: {
      product_name: {
        fontSize: 17,
        fontWeight: 500,
        textAlign: 'left',
        color: '#111827'
      },
      brand: {
        fontSize: 13,
        fontWeight: 400,
        textAlign: 'left',
        color: '#6B7280'
      },
      selling_points: {
        fontSize: 11,
        fontWeight: 400,
        textAlign: 'left',
        color: '#4B5563'
      },
      product_price: {
        fontSize: 22,
        fontWeight: 600,
        textAlign: 'center',
        color: '#1E88E5'
      }
    }
  },
  {
    id: 'two-column-default',
    name: '双栏布局',
    type: 'two-column',
    description: '文字和价格各占一半的双栏布局',
    layoutParams: {
      textAreaRatio: 0.5,
      padding: 3,
      elementSpacing: 1.5,
      lineHeight: 1.35
    },
    fontConfigs: {
      product_name: {
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'left',
        color: '#111827'
      },
      brand: {
        fontSize: 12,
        fontWeight: 400,
        textAlign: 'left',
        color: '#6B7280'
      },
      selling_points: {
        fontSize: 10,
        fontWeight: 400,
        textAlign: 'left',
        color: '#4B5563'
      },
      product_price: {
        fontSize: 22,
        fontWeight: 600,
        textAlign: 'center',
        color: '#2563eb'
      }
    }
  }
];

/**
 * 根据ID获取模板配置
 */
export const getTemplateConfigById = (id: string): TemplateConfig | undefined => {
  return defaultTemplateConfigs.find(config => config.id === id);
};

/**
 * 根据类型获取模板配置
 */
export const getTemplateConfigsByType = (type: LayoutMode): TemplateConfig[] => {
  return defaultTemplateConfigs.filter(config => config.type === type);
};

/**
 * 创建自定义模板配置
 */
export const createCustomTemplateConfig = (baseConfig: TemplateConfig, overrides: Partial<TemplateConfig>): TemplateConfig => {
  return {
    ...baseConfig,
    ...overrides,
    layoutParams: {
      ...baseConfig.layoutParams,
      ...overrides.layoutParams
    },
    fontConfigs: {
      ...baseConfig.fontConfigs,
      ...overrides.fontConfigs
    }
  };
};

