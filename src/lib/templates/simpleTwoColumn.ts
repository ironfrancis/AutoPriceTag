// 简洁双栏布局模板
// 基于用户提供的设计案例

import { LabelTemplate, LabelElement, ElementStyle, BackgroundStyle } from '../types';

export const simpleTwoColumnTemplate: LabelTemplate = {
  id: 'simple-two-column',
  name: '简洁双栏标价签',
  type: 'simple',
  size: { width: 50, height: 30 }, // 50mm x 30mm
  background: {
    type: 'solid',
    color: '#FFFFFF'
  },
  elements: [
    // 左侧栏 - 品牌区域
    {
      id: 'brand-label',
      type: 'text',
      content: '品牌',
      position: { x: 5, y: 8 }, // 左侧栏顶部
      size: { width: 20, height: 8 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#999999',
        textAlign: 'left'
      },
      locked: false,
      editable: true
    },
    {
      id: 'product-name',
      type: 'text',
      content: '爱好',
      position: { x: 5, y: 15 }, // 左侧栏中央
      size: { width: 20, height: 12 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center'
      },
      locked: false,
      editable: true
    },
    
    // 右侧栏 - 价格区域
    {
      id: 'product-spec',
      type: 'text',
      content: '热可擦 红',
      position: { x: 30, y: 8 }, // 右侧栏顶部
      size: { width: 20, height: 8 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left'
      },
      locked: false,
      editable: true
    },
    {
      id: 'price',
      type: 'text',
      content: '3元',
      position: { x: 30, y: 15 }, // 右侧栏中央
      size: { width: 20, height: 12 },
      style: {
        fontFamily: 'Noto Sans SC',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC143C', // 红色价格
        textAlign: 'center'
      },
      locked: false,
      editable: true
    },
    
    // 边框
    {
      id: 'border',
      type: 'shape',
      content: 'rectangle',
      position: { x: 0, y: 0 },
      size: { width: 50, height: 30 },
      style: {
        color: '#FFB6C1', // 浅粉色边框
        backgroundColor: 'transparent',
        borderRadius: 2
      },
      locked: true,
      editable: false
    },
    
    // 分割线
    {
      id: 'divider',
      type: 'shape',
      content: 'line',
      position: { x: 25, y: 0 },
      size: { width: 1, height: 30 },
      style: {
        color: '#E0E0E0',
        backgroundColor: 'transparent'
      },
      locked: true,
      editable: false
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// 模板配置选项
export const simpleTwoColumnConfig = {
  // 可自定义的字段
  customizableFields: [
    {
      id: 'brand-label',
      label: '品牌标签',
      type: 'text',
      placeholder: '品牌'
    },
    {
      id: 'product-name',
      label: '产品名称',
      type: 'text',
      placeholder: '爱好'
    },
    {
      id: 'product-spec',
      label: '产品规格',
      type: 'text',
      placeholder: '热可擦 红'
    },
    {
      id: 'price',
      label: '价格',
      type: 'text',
      placeholder: '3元'
    }
  ],
  
  // 颜色主题
  colorThemes: [
    {
      name: '经典粉红',
      colors: {
        border: '#FFB6C1',
        text: '#000000',
        price: '#DC143C',
        brand: '#999999'
      }
    },
    {
      name: '商务蓝',
      colors: {
        border: '#B3D9FF',
        text: '#000000',
        price: '#1976D2',
        brand: '#666666'
      }
    },
    {
      name: '清新绿',
      colors: {
        border: '#C8E6C9',
        text: '#000000',
        price: '#388E3C',
        brand: '#666666'
      }
    }
  ],
  
  // 尺寸变体
  sizeVariants: [
    {
      name: '小号',
      size: { width: 40, height: 24 },
      ratio: '5:3'
    },
    {
      name: '中号',
      size: { width: 50, height: 30 },
      ratio: '5:3'
    },
    {
      name: '大号',
      size: { width: 60, height: 36 },
      ratio: '5:3'
    }
  ]
};

// 生成预览数据的函数
export function generateSimpleTwoColumnPreview(data: {
  brand?: string;
  productName?: string;
  spec?: string;
  price?: string;
}) {
  return {
    brand: data.brand || '品牌',
    productName: data.productName || '爱好',
    spec: data.spec || '热可擦 红',
    price: data.price || '3元'
  };
}

// 验证数据完整性
export function validateSimpleTwoColumnData(data: any): boolean {
  return !!(
    data.brand &&
    data.productName &&
    data.spec &&
    data.price
  );
}
