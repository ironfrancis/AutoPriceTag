// AutoPriceTag 核心类型定义

export interface SavedLabel {
  id: string;
  name: string;
  labelSize: { width: number; height: number };
  productData: ProductData;
  thumbnail: string; // base64 缩略图
  createdAt: Date;
  updatedAt: Date;
}

export interface LabelTemplate {
  id: string;
  name: string; // 模板名称
  type: 'simple' | 'promotion' | 'premium'; // 模板类型
  size: { width: number; height: number }; // mm单位
  elements: LabelElement[]; // 元素列表
  background: BackgroundStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabelElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode' | 'qrcode';
  content: string | ImageData;
  position: { x: number; y: number }; // 相对位置(百分比)
  size: { width: number; height: number };
  style: ElementStyle;
  locked: boolean; // 是否锁定位置
  editable: boolean; // 用户是否可编辑
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'line-through';
  opacity?: number;
}

export interface BackgroundStyle {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    start: string;
    end: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
  image?: string;
}

export interface ProductData {
  name: string; // 商品名称
  price: number; // 价格
  originalPrice?: number; // 原价
  discount?: number; // 折扣率
  brand?: string; // 品牌
  sellingPoints?: string[]; // 卖点
  specs?: Record<string, string>; // 规格参数
  logo?: File | string; // Logo图片
  barcode?: string; // 条形码
  customFields?: Record<string, any>; // 自定义字段
}

export interface PrintCanvas {
  id: string;
  paperSize: PaperSize; // 纸张尺寸
  labels: PlacedLabel[]; // 已放置的标签
  gridEnabled: boolean; // 网格线显示
  guideEnabled: boolean; // 辅助线显示
  margin: number; // 打印边距(mm)
}

export interface PaperSize {
  name: string; // A4, A5, Letter, Custom
  width: number; // mm
  height: number; // mm
  dpi: number; // 默认300
}

export interface PlacedLabel {
  labelId: string;
  position: { x: number; y: number }; // mm单位
  rotation: number; // 旋转角度
  productData: ProductData;
}

export interface HistoryRecord {
  id: string;
  templateId: string;
  productData: ProductData;
  thumbnail: string; // base64缩略图
  createdAt: Date;
}

export interface UserSettings {
  defaultPaperSize: PaperSize;
  defaultLabelSize: { width: number; height: number };
  recentTemplates: string[]; // 最近使用的3个模板ID
  autoSaveEnabled: boolean;
  language: 'zh-CN' | 'en-US';
}

// 预设纸张尺寸
export const PAPER_SIZES: PaperSize[] = [
  { name: 'A4', width: 210, height: 297, dpi: 300 },
  { name: 'A5', width: 148, height: 210, dpi: 300 },
  { name: 'Letter', width: 216, height: 279, dpi: 300 },
  { name: 'A3', width: 297, height: 420, dpi: 300 },
];

// 预设标签尺寸
export const LABEL_SIZES = [
  { name: '小号', width: 30, height: 20 },
  { name: '中号', width: 40, height: 30 },
  { name: '大号', width: 50, height: 40 },
  { name: '特大', width: 60, height: 50 },
];

// 预设字体
export const FONT_FAMILIES = [
  { name: '思源黑体', value: 'Noto Sans SC' },
  { name: '微软雅黑', value: 'Microsoft YaHei' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times New Roman' },
];

// 颜色主题
export const COLOR_THEMES = {
  primary: '#1E88E5', // 科技蓝
  secondary: '#FF9800', // 活力橙
  success: '#4CAF50', // 成功绿
  warning: '#F44336', // 警示红
  info: '#2196F3', // 信息蓝
  neutral: '#F5F7FA', // 中性灰
};
