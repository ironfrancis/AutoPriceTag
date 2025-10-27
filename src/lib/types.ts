/**
 * 产品数据结构
 * 
 * 设计原则：
 * 1. 所有字段都应该是可选的（exceptional cases除外）
 * 2. 只要有值，就应该被创建为可拖拽元素
 * 3. customFields 允许用户添加任意自定义字段
 */
export interface ProductData {
  name: string;              // 商品名称 - 核心字段
  price: number;            // 价格 - 核心字段，会特殊样式处理
  brand?: string;           // 品牌
  sellingPoints?: string[];  // 卖点列表
  specs?: Record<string, string>; // 规格参数（键值对）
  customFields?: Record<string, any>; // 自定义字段（用户可添加任意字段）
  originalPrice?: number;  // 原价
  discount?: number;       // 折扣
  logo?: string;           // 商品logo
  barcode?: string;        // 条码
}

/**
 * 产品布局元素
 * 
 * 存储结构：
 * - x, y: 相对位置（百分比格式，0-100）
 * - text: 显示的文本内容
 * - id: 元素标识符
 * - type: 元素类型（核心字段、卖点、规格、自定义字段）
 * - fieldKey: 原始字段键名（用于 spec 和 custom_field）
 * - visible: 是否可见（删除功能）
 * 
 * 保存策略：
 * 1. 使用百分比而非绝对像素，确保在不同尺寸标签中复用
 * 2. 文本内容实时从 productData 获取
 * 3. 元素类型用于识别和分类管理
 */
export interface LayoutElement {
  id: string;      // 元素ID，如 'product_name', 'selling_point_0', 'spec_color'
  type?: 'core' | 'selling_point' | 'spec' | 'custom_field'; // 元素类型
  x: number;      // 相对位置（百分比，0-100）
  y: number;      // 相对位置（百分比，0-100）
  text: string;   // 显示的文本（可被手动编辑）
  fieldKey?: string;  // 对于 spec 和 custom_field，存储原始键名
  visible?: boolean;  // 是否可见（false 表示已删除/隐藏）
}

/**
 * 字体配置
 * 保持向后兼容，现有代码仍使用 FontConfig
 */
export interface FontConfig {
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  fontFamily: string;
}

/**
 * 元素样式配置（扩展版）
 * 
 * 设计目标：
 * 1. 扩展基础字体样式，添加背景、边框、间距等样式
 * 2. 向后兼容 FontConfig
 * 3. 所有属性可选，缺失时使用默认值
 */
export interface ElementStyleConfig extends FontConfig {
  // 背景和边框
  backgroundColor?: string;      // 背景色
  padding?: number;              // 内边距（统一值，px）
  borderRadius?: number;         // 圆角（px）
  borderWidth?: number;          // 边框宽度（px）
  borderColor?: string;          // 边框颜色
  opacity?: number;              // 透明度 (0-1)
  
  // 高级字体样式
  lineHeight?: number;           // 行高倍数
  letterSpacing?: number;        // 字间距（px）
}

/**
 * 标签设计数据结构（统一保存和加载）
 * 
 * 核心设计理念：
 * 1. 完整的 JSON 结构，包含所有设计数据
 * 2. 位置保存为百分比格式（0-100），便于跨尺寸复用
 * 3. 产品数据和布局数据分离，支持数据更新而布局保持不变
 * 
 * 数据持久化策略：
 * - LocalStorage: 自动保存最近的设计
 * - JSON 导出：支持导出和分享设计
 * - 相对位置：确保在不同尺寸标签中复用布局
 */
export interface LabelDesign {
  // 基本信息（元数据）
  labelId?: string;      // 标签ID（用于多标签管理）
  labelName?: string;    // 标签名称（用户命名）
  createdAt?: string;    // 创建时间（ISO格式）
  updatedAt?: string;    // 更新时间（ISO格式）
  
  // 标签尺寸（mm）
  labelSize: {
    width: number;   // 宽度（mm）
    height: number;  // 高度（mm）
  };
  
  // 产品数据（商品信息）
  productData: ProductData;
  
  // 元素布局数据（画布上的所有元素位置）
  // 位置存储为百分比格式（0-100），确保不同尺寸标签可复用
  layout: {
    elements: LayoutElement[]; // 所有可拖拽元素的相对位置
  };
  
  // 元素样式配置（每个元素独立的样式配置）
  // 兼容旧数据：同时支持 fontConfigs 和 elementStyles
  fontConfigs?: Record<string, FontConfig>;
  elementStyles?: Record<string, ElementStyleConfig>;
  
  // 其他配置（扩展性）
  settings: {
    editable?: boolean; // 是否可编辑
    [key: string]: any;
  };
}

/**
 * 历史记录
 */
export interface HistoryRecord {
  id: string;
  templateId?: string;
  labelName?: string;
  createdAt: string; // ISO格式字符串
}

/**
 * 用户设置
 */
export interface UserSettings {
  id?: string;
  defaultPaperSize: {
    name: string;
    width: number;
    height: number;
    dpi: number;
  };
  defaultLabelSize: {
    width: number;
    height: number;
  };
  recentTemplates: any[];
  autoSaveEnabled: boolean;
  language: string;
}

/**
 * 元素样式
 */
export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  backgroundColor?: string;
  textAlign?: string;
  borderRadius?: number;
  [key: string]: any;
}

/**
 * 背景样式
 */
export interface BackgroundStyle {
  type: 'solid' | 'gradient';
  color?: string;
  gradient?: {
    start: string;
    end: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
}

/**
 * 标签元素
 */
export interface LabelElement {
  id: string;
  type: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ElementStyle;
  locked: boolean;
  editable: boolean;
}

/**
 * 标签模板
 */
export interface LabelTemplate {
  id: string;
  name: string;
  type: 'simple' | 'promotion' | 'premium';
  size: {
    width: number;
    height: number;
  };
  background: BackgroundStyle;
  elements: LabelElement[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 打印画布
 */
export interface PrintCanvas {
  size: {
    width: number;
    height: number;
  };
  labels: PlacedLabel[];
}

/**
 * 已放置的标签
 */
export interface PlacedLabel {
  labelId: string;
  position: { x: number; y: number };
}

/**
 * 整页排版相关类型定义
 */

/**
 * 画布预设尺寸
 */
export interface CanvasPreset {
  id: string;
  name: string;
  width: number;  // 宽度（mm）
  height: number; // 高度（mm）
  description?: string;
}

/**
 * 已放置的标签实例
 * 表示画布上的一个标签实体，包含其在整页画布上的位置和引用
 */
export interface PlacedLabelInstance {
  id: string;              // 实例ID
  labelDesign: LabelDesign; // 引用的标签设计
  position: {               // 在整页画布上的位置（mm）
    x: number;
    y: number;
  };
  scale?: number;           // 缩放比例（0-1，用于缩略显示）
  isSelected?: boolean;     // 是否被选中
  rotate?: number;          // 旋转角度（度）
}

/**
 * 整页布局配置
 */
export interface PageLayout {
  canvasSize: {             // 画布尺寸（mm）
    width: number;
    height: number;
  };
  instances: PlacedLabelInstance[]; // 所有已放置的标签实例
  grid?: {                  // 网格配置（可选）
    enabled: boolean;
    size: number;          // 网格大小（mm）
    color: string;
  };
  margins?: {               // 边距配置（mm）
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * 自动布局选项
 */
export interface AutoLayoutOptions {
  spacing?: number;         // 标签间距（mm，默认2）
  margins?: {              // 画布边距（mm，默认5）
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  orientation?: 'horizontal' | 'vertical'; // 排列方向
}