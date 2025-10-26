# 标签设计结构和交互优化

## 设计理念

### 核心原则

1. **所有有效字段都显示**：只要 `productData` 中有值，就应该被创建为可拖拽元素
2. **初始位置可见**：所有元素的初始位置都在标签预览的可见区域之内
3. **用户可控删除**：元素可以被用户手动删除，但默认都会显示
4. **跨尺寸复用**：使用相对位置（百分比）保存，确保在不同尺寸标签中复用

## 数据结构优化

### JSON 保存结构

```typescript
interface LabelDesign {
  // 基本信息
  labelId?: string;
  labelName?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 标签尺寸（mm）
  labelSize: {
    width: number;
    height: number;
  };
  
  // 产品数据（完整的商品信息）
  productData: ProductData;
  
  // 元素布局（所有可拖拽元素的位置）
  // 关键：位置保存为百分比（0-100），而非绝对像素
  layout: {
    elements: LayoutElement[];
  };
  
  // 字体配置（每个元素的独立样式）
  fontConfigs: Record<string, FontConfig>;
  
  // 其他配置
  settings: {
    editable?: boolean;
  };
}
```

### 位置保存策略

**设计原则**：使用百分比而非绝对像素

```typescript
// 保存时：像素 → 百分比
x: (el.x / labelWidthPx * 100)  // 0-100

// 加载时：百分比 → 像素
x: (savedEl.x / 100) * displaySize.width
```

**优势**：
1. 在不同尺寸标签中复用布局
2. 缩放自适应
3. 数据更轻量

## 可见性保证

### 1. 初始位置计算

```typescript
// 使用内边距（padding）确保不贴边
const paddingPx = mmToPixels(4); // 默认4mm内边距

// 可用区域（去掉内边距）
const availableWidth = widthPx - paddingPx * 2;
const availableHeight = heightPx - paddingPx * 2;
```

### 2. 元素间距

```typescript
// 元素间距（默认2mm）
const spacingPx = mmToPixels(2);

// 总间距计算
const totalSpacing = (elements.length - 1) * spacingPx;
```

### 3. 权重分配系统

```typescript
// 元素权重定义
const ELEMENTS = [
  { id: 'product_name', weight: 0.35 },   // 35% 空间
  { id: 'product_price', weight: 0.25 }, // 25% 空间
  { id: 'brand', weight: 0.15 },          // 15% 空间
  { id: 'selling_points', weight: 0.15 }, // 15% 空间
  { id: 'specs', weight: 0.10 },          // 10% 空间
];

// 分配高度
const allocatedHeight = (element.weight / totalWeight) * availableHeight;
```

**效果**：
- 重要信息（商品名、价格）获得更多空间
- 次要信息（规格）分配较少空间
- 所有元素都在可见区域内

## 元素创建逻辑

### 有效字段检测

```typescript
function getValidElements(productData: ProductData) {
  return ELEMENTS.filter(element => {
    const content = getElementContent(element.key, productData);
    // 只包含有内容的字段
    return content && content.trim().length > 0;
  });
}
```

**规则**：
1. 如果字段有值 → 创建元素
2. 如果字段为空 → 不创建元素
3. 用户可以手动删除元素（未来功能）

### 字段优先级

```typescript
const ELEMENTS = [
  { id: 'product_name', priority: 1 },    // 最高优先级
  { id: 'brand', priority: 2 },
  { id: 'product_price', priority: 3 },
  { id: 'selling_points', priority: 4 },
  { id: 'specs', priority: 5 },           // 最低优先级
];
```

## 代码注释位置

### 1. 类型定义（src/lib/types.ts）

```typescript
/**
 * 产品数据结构
 * 
 * 设计原则：
 * 1. 所有字段都应该是可选的
 * 2. 只要有值，就应该被创建为可拖拽元素
 * 3. customFields 允许用户添加任意自定义字段
 */
export interface ProductData { ... }

/**
 * 产品布局元素
 * 
 * 存储结构：
 * - x, y: 相对位置（百分比格式，0-100）
 * - text: 显示的文本内容
 * - id: 元素标识符
 * 
 * 保存策略：
 * 1. 使用百分比而非绝对像素，确保在不同尺寸标签中复用
 * 2. 文本内容实时从 productData 获取
 */
export interface LayoutElement { ... }
```

### 2. 布局算法（src/lib/layout/simpleLayout.ts）

```typescript
/**
 * 元素定义（按优先级排序）
 * 
 * 核心设计理念：
 * 1. 所有在 productData 中有值的字段都应该被创建为可拖拽元素
 * 2. 元素按优先级排序：商品名 > 价格 > 品牌 > 卖点 > 规格 > 自定义字段
 * 3. 权重用于分配垂直空间
 */
const ELEMENTS = [...];

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
function layoutAllElements(...) { ... }
```

### 3. 页面保存逻辑（src/app/draggable-editor/page.tsx）

```typescript
/**
 * 保存标签设计
 * 
 * 核心设计：
 * 1. 获取画布上所有元素的最新位置
 * 2. 将绝对像素位置转换为相对百分比（0-100）
 * 3. 保存完整的 LabelDesign 结构到 LocalStorage
 * 4. 支持在不同尺寸的标签中复用布局
 * 
 * 数据持久化策略：
 * - 使用百分比格式保存位置，确保可跨尺寸复用
 * - 保存完整的 productData，包括所有字段
 * - 保存每个元素的字体配置
 */
const handleSave = () => { ... }
```

### 4. 画布初始化（src/components/editor/DraggableLabelCanvas.tsx）

```typescript
/**
 * 初始化画布元素
 * 
 * 核心逻辑：
 * 1. 如果有保存的布局（savedLayout），加载并恢复元素位置
 * 2. 否则，使用自动布局算法生成初始位置
 * 3. 确保所有有效字段都被创建为可拖拽元素
 * 4. 所有元素的初始位置都在可见区域内
 * 
 * 可见性保证：
 * - 使用内边距（padding）确保元素不贴边
 * - 使用权重系统分配空间，确保所有元素都有合理位置
 * - 元素间距（spacing）确保不重叠
 */
useEffect(() => { ... })
```

## 使用示例

### 完整的产品数据

```typescript
const productData: ProductData = {
  name: "高端无线蓝牙耳机",
  price: 299,
  brand: "TechSound",
  sellingPoints: [
    "降噪技术",
    "40小时续航",
    "快充支持",
    "防水设计"
  ],
  specs: {
    "颜色": "黑色",
    "重量": "50g",
    "尺寸": "15×15cm",
    "电池": "2000mAh",
    "接口": "Type-C"
  },
  customFields: {
    "保修期": "1年",
    "产地": "中国"
  }
};
```

### 保存的 JSON 结构

```json
{
  "labelId": "label-001",
  "labelName": "耳机标签",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "labelSize": {
    "width": 80,
    "height": 50
  },
  "productData": { ... },
  "layout": {
    "elements": [
      {
        "id": "product_name",
        "x": 10.5,   // 百分比格式
        "y": 5.0,    // 百分比格式
        "text": "高端无线蓝牙耳机"
      },
      {
        "id": "brand",
        "x": 10.5,
        "y": 20.0,
        "text": "TechSound"
      },
      {
        "id": "product_price",
        "x": 40.0,   // 居中对齐
        "y": 35.0,
        "text": "¥299"
      },
      {
        "id": "selling_points",
        "x": 10.5,
        "y": 50.0,
        "text": "降噪技术 40小时续航 快充支持"
      },
      {
        "id": "specs",
        "x": 10.5,
        "y": 65.0,
        "text": "颜色: 黑色 重量: 50g 尺寸: 15×15cm"
      }
    ]
  },
  "fontConfigs": { ... },
  "settings": {
    "editable": true
  }
}
```

## 改进总结

### ✅ 已实现

1. **所有有效字段显示**：自动检测有值的字段并创建元素
2. **初始位置可见**：使用权重和内边距确保在可见区域
3. **百分比位置保存**：支持跨尺寸复用
4. **详细代码注释**：说明设计理念和数据结构

### 🚧 未来计划

1. **元素删除功能**：允许用户隐藏不需要的元素
2. **自定义字段支持**：动态创建 customFields 的元素
3. **元素添加功能**：允许用户手动添加元素
4. **多元素布局**：支持水平、网格等布局方式

