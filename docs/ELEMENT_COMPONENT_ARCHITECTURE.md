# 元素组件化架构完整说明

## 架构设计

### 核心概念

**元素组件（Element Component）**：标签上的每个可独立操作的文字元素

```
标签组件 (Label)
├── 核心元素组件 (Core Elements)
│   ├── product_name - 商品名称
│   ├── product_price - 价格
│   └── brand - 品牌
│
├── 动态元素组件 (Dynamic Elements)
│   ├── 卖点元素 (selling_point_0, selling_point_1, ...)
│   ├── 规格元素 (spec_color, spec_weight, ...)
│   └── 自定义字段元素 (custom_origin, custom_warranty, ...)
│
└── 元素属性 (Element Properties)
    ├── 位置 (x, y)
    ├── 文本 (text)
    ├── 样式 (fontSize, color, ...)
    └── 可见性 (visible)
```

## 数据流

### 1. 数据源 → 元素

```
ProductData → generateElementDefinitions() → Element[]

productData.sellingPoints = ["降噪", "续航"]
  ↓
[selling_point_0: "降噪", selling_point_1: "续航"]

productData.specs = { "颜色": "黑", "重量": "50g" }
  ↓
[spec_color: "颜色: 黑", spec_weight: "重量: 50g"]
```

### 2. 用户操作 → 数据更新

```
用户双击编辑 → handleTextChange()
  ↓
识别元素类型 → 更新对应数据源
  ↓
productData 变化 → 重新生成元素定义
  ↓
保留位置样式 → 更新文本内容
```

### 3. 保存加载

```
保存: 元素位置(像素) → 元素位置(百分比) → JSON
加载: JSON → 元素位置(百分比) → 元素位置(像素) → 画布
```

## 完整功能

### 1. 元素创建

**自动创建**：
- 当 productData 中有值时自动创建元素
- 每个卖点、规格、自定义字段都是独立元素

**元素标识**：
- ID: `selling_point_0`, `spec_color`, `custom_origin`
- Type: `core`, `selling_point`, `spec`, `custom_field`
- FieldKey: 原始字段键名（用于规格和自定义字段）

### 2. 元素显示

**初始位置**：
- 使用权重系统分配垂直空间
- 所有元素都在可见区域内
- 使用内边距确保不贴边

**可见性控制**：
- `visible` 字段控制是否显示
- 默认所有元素可见
- 删除操作为标记不可见

### 3. 元素编辑

**拖动**：
- 点击并拖动画布上的元素
- 实时更新位置
- 位置保存为百分比格式

**双击编辑**：
- 双击元素进入编辑模式
- 修改文本后更新到数据源
- 支持所有类型的元素

**属性编辑**：
- 位置控制：右侧属性区调整位置（百分比）
- 字体设置：调整字体大小、粗细、颜色等
- 删除按钮：隐藏元素（标记为不可见）

### 4. 数据同步

**实时同步**：
- productData 变化 → 重新生成元素
- 保留已有元素的位置和样式
- 新增元素使用默认位置
- 删除元素从画布移除

**数据持久化**：
- 保存到 LocalStorage
- 导出 JSON 文件
- 支持加载和恢复

## 代码结构

### 类型定义 (src/lib/types.ts)

```typescript
// 元素样式配置（扩展）
interface ElementStyleConfig extends FontConfig {
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

// 布局元素
interface LayoutElement {
  id: string;
  type?: 'core' | 'selling_point' | 'spec' | 'custom_field';
  x: number;
  y: number;
  text: string;
  fieldKey?: string;
  visible?: boolean;
}
```

### 布局算法 (src/lib/layout/simpleLayout.ts)

```typescript
function generateElementDefinitions(productData: ProductData): ElementDefinition[] {
  // 核心字段
  // 卖点：每个独立元素
  // 规格：每个键值对独立元素
  // 自定义字段：每个独立元素
}
```

### 画布组件 (src/components/editor/DraggableLabelCanvas.tsx)

```typescript
// 动态元素识别
const getElementText = (elementId: string, fieldKey?: string): string => {
  // 核心字段、卖点、规格、自定义字段
}

// 数据变化监听
useEffect(() => {
  // 重新生成元素定义
  // 保留位置和样式
  // 更新文本内容
}, [productData])
```

### 页面交互 (src/app/draggable-editor/page.tsx)

```typescript
// 文本变更处理
const handleTextChange = (elementId: string, newText: string) => {
  // 根据元素类型更新数据源
  // 核心字段、卖点、规格、自定义字段
}

// 元素删除
const handleDeleteElement = (elementId: string) => {
  // 标记为不可见
  // 保留数据
}

// 保存设计
const handleSave = () => {
  // 保存完整结构
  // 包括位置、样式、可见性
}
```

## 使用流程

### 1. 创建标签

```
1. 在右侧表单输入商品信息
   - 商品名称、价格、品牌
   - 添加卖点
   - 添加规格参数
   - 添加自定义字段

2. 系统自动生成元素
   - 每个字段自动创建为可拖拽元素
   - 初始位置由布局算法计算

3. 调整布局
   - 点击并拖动元素调整位置
   - 双击元素编辑文本
   - 在右侧属性区调整样式
```

### 2. 编辑元素

```
1. 选中元素（点击画布上的元素）
   - 显示高亮边框
   - 右侧显示属性编辑区

2. 编辑位置
   - 拖动元素
   - 或在属性区输入百分比（0-100）

3. 编辑样式
   - 调整字体大小、粗细、颜色
   - 选择字体族

4. 编辑文本
   - 双击元素进入编辑模式
   - 修改文本后自动同步到数据源

5. 删除元素
   - 点击右侧删除按钮
   - 元素隐藏但仍保留数据
```

### 3. 保存加载

```
1. 保存设计
   - 点击"保存标签"
   - 保存到 LocalStorage
   - 位置转换为百分比格式

2. 导出JSON
   - 点击"导出JSON"
   - 下载完整设计文件

3. 加载设计
   - 点击"加载设计"
   - 选择保存的设计
   - 恢复所有元素位置和样式
```

## 优势

### 1. 完全元素化

✅ 每个字段都是独立组件  
✅ 可独立拖动、编辑、删除  
✅ 保持数据完整性  

### 2. 动态灵活

✅ 不限制元素数量  
✅ 自动识别字段类型  
✅ 智能命名规则  

### 3. 用户友好

✅ 直观的可视化编辑  
✅ 完整的属性控制  
✅ 撤销和恢复支持  

### 4. 数据持久化

✅ 百分比格式支持跨尺寸  
✅ 完整的结构信息  
✅ 向后兼容  

## 技术亮点

1. **智能元素生成**：根据数据自动创建所有元素
2. **动态数据同步**：数据变化时智能更新元素
3. **完整属性控制**：位置、样式、文本、可见性
4. **向后兼容**：支持旧数据格式
5. **性能优化**：使用 Map 和 ref 优化性能

## 总结

本次重构实现了真正的"元素组件化架构"：

- ✅ 所有字段自动实例化为独立元素
- ✅ 每个元素可独立操作和编辑
- ✅ 完整的属性编辑功能
- ✅ 数据实时同步
- ✅ 保存加载支持
- ✅ 向后兼容性

系统现在是一个功能完整的标签设计工具，用户可以像使用 Photoshop 一样自由设计标签。

