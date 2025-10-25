import { LabelTemplate } from '../types';

// 基础简约款模板
export const simpleTemplate: LabelTemplate = {
  id: 'simple_template',
  name: '基础简约款',
  type: 'simple',
  size: { width: 80, height: 60 },
  background: {
    type: 'solid',
    color: '#FFFFFF',
  },
  elements: [
    // 1. 商品名称
    {
      id: 'product_name',
      type: 'text',
      content: '{{product.name}}',
      position: { x: 5, y: 5 },
      size: { width: 90, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 2. 商品价格
    {
      id: 'product_price',
      type: 'text',
      content: '¥{{product.price}}',
      position: { x: 5, y: 25 },
      size: { width: 90, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E88E5',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 3. 品牌
    {
      id: 'brand',
      type: 'text',
      content: '{{product.brand}}',
      position: { x: 5, y: 45 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#666666',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 4. 卖点说明
    {
      id: 'selling_points',
      type: 'text',
      content: '{{product.sellingPoints.0}}',
      position: { x: 5, y: 55 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 9,
        fontWeight: 'normal',
        color: '#888888',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 5. 规格参数
    {
      id: 'specs',
      type: 'text',
      content: '{{product.specs}}',
      position: { x: 5, y: 65 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#999999',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 促销活动款模板
export const promotionTemplate: LabelTemplate = {
  id: 'promotion_template',
  name: '促销活动款',
  type: 'promotion',
  size: { width: 80, height: 60 },
  background: {
    type: 'gradient',
    gradient: {
      start: '#FF9800',
      end: '#FF5722',
      direction: 'diagonal',
    },
  },
  elements: [
    // 促销标签
    {
      id: 'promotion_badge',
      type: 'text',
      content: '促销',
      position: { x: 5, y: 5 },
      size: { width: 20, height: 12 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#F44336',
        borderRadius: 4,
        textAlign: 'center',
      },
      locked: true,
      editable: false,
    },
    // 1. 商品名称
    {
      id: 'product_name',
      type: 'text',
      content: '{{product.name}}',
      position: { x: 5, y: 20 },
      size: { width: 90, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 2. 商品价格
    {
      id: 'product_price',
      type: 'text',
      content: '¥{{product.price}}',
      position: { x: 5, y: 35 },
      size: { width: 90, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFF00',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 3. 品牌
    {
      id: 'brand',
      type: 'text',
      content: '{{product.brand}}',
      position: { x: 5, y: 50 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#FFFFFF',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 4. 卖点说明
    {
      id: 'selling_points',
      type: 'text',
      content: '{{product.sellingPoints.0}}',
      position: { x: 5, y: 60 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 9,
        fontWeight: 'normal',
        color: '#FFE0B2',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 5. 规格参数
    {
      id: 'specs',
      type: 'text',
      content: '{{product.specs}}',
      position: { x: 5, y: 70 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#FFCCBC',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 高端质感款模板
export const premiumTemplate: LabelTemplate = {
  id: 'premium_template',
  name: '高端质感款',
  type: 'premium',
  size: { width: 80, height: 60 },
  background: {
    type: 'gradient',
    gradient: {
      start: '#E8EAF6',
      end: '#C5CAE9',
      direction: 'vertical',
    },
  },
  elements: [
    // 品牌Logo区域
    {
      id: 'brand_logo',
      type: 'shape',
      content: '',
      position: { x: 5, y: 5 },
      size: { width: 15, height: 15 },
      style: {
        backgroundColor: '#1E88E5',
        borderRadius: 8,
      },
      locked: true,
      editable: false,
    },
    // 1. 商品名称
    {
      id: 'product_name',
      type: 'text',
      content: '{{product.name}}',
      position: { x: 25, y: 5 },
      size: { width: 70, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E88E5',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 2. 商品价格
    {
      id: 'product_price',
      type: 'text',
      content: '¥{{product.price}}',
      position: { x: 5, y: 25 },
      size: { width: 90, height: 15 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 3. 品牌
    {
      id: 'brand',
      type: 'text',
      content: '{{product.brand}}',
      position: { x: 5, y: 45 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#666666',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 4. 卖点说明
    {
      id: 'selling_points',
      type: 'text',
      content: '{{product.sellingPoints.0}}',
      position: { x: 5, y: 55 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 9,
        fontWeight: 'normal',
        color: '#888888',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
    // 5. 规格参数
    {
      id: 'specs',
      type: 'text',
      content: '{{product.specs}}',
      position: { x: 5, y: 65 },
      size: { width: 90, height: 10 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#999999',
        textAlign: 'left',
      },
      locked: false,
      editable: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 导出所有模板
export const defaultTemplates: LabelTemplate[] = [
  simpleTemplate,
  promotionTemplate,
  premiumTemplate,
];

// 根据ID获取模板
export const getTemplateById = (id: string): LabelTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
};

// 根据类型获取模板
export const getTemplatesByType = (type: 'simple' | 'promotion' | 'premium'): LabelTemplate[] => {
  return defaultTemplates.filter(template => template.type === type);
};