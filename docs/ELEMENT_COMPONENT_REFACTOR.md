# 元素组件化架构重构进度

## 已完成的工作

### 1. 类型定义更新 ✅
- 扩展了 `ElementStyleConfig`，添加背景、边框、内边距等样式属性
- 修改了 `LayoutElement`，添加 `type`、`fieldKey`、`visible` 字段
- 更新了 `LabelDesign`，支持新旧数据格式兼容

### 2. 布局算法重构 ✅
- 创建了 `generateElementDefinitions()` 函数，动态生成所有元素
- 支持独立元素：每个卖点、规格、自定义字段都是独立元素
- 元素 ID 规则：
  - 核心字段: `product_name`, `product_price`, `brand`
  - 卖点: `selling_point_0`, `selling_point_1`, ...
  - 规格: `spec_color`, `spec_weight`, ...
  - 自定义字段: `custom_field_name`, ...

### 3. 画布组件更新 ✅
- 更新了 `getElementText()` 支持动态元素识别
- 实现了动态元素的文本更新逻辑
- 保持了向后兼容性

## 待完成的工作

### 1. 样式编辑器组件
需要创建 `src/components/editor/ElementStyleEditor.tsx`：
- 支持扩展样式属性（背景色、边框、内边距等）
- 复用现有的 `FontCustomizer`
- 添加颜色选择器、数字输入等组件

### 2. 元素删除功能
- 在页面组件中添加删除按钮
- 实现元素隐藏/删除逻辑
- 更新保存/加载处理 `visible` 字段

### 3. 保存/加载逻辑更新
- 保存时处理新的元素结构（type、fieldKey、visible）
- 加载时过滤不可见元素
- 兼容旧数据格式

## 技术要点

### 元素生成逻辑
```typescript
function generateElementDefinitions(productData: ProductData): ElementDefinition[] {
  const elements = [];
  
  // 核心字段
  elements.push(...CORE_ELEMENTS);
  
  // 卖点：每个独立元素
  productData.sellingPoints.forEach((point, index) => {
    elements.push({
      id: `selling_point_${index}`,
      type: 'selling_point',
      key: `sellingPoints[${index}]`,
      priority: 4 + index * 0.01,
      weight: 0.08,
      text: point
    });
  });
  
  // 规格：每个键值对独立元素
  Object.entries(productData.specs || {}).forEach(([key, value], index) => {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
    elements.push({
      id: `spec_${normalizedKey}`,
      type: 'spec',
      key: `specs.${key}`,
      fieldKey: key,
      priority: 5 + index * 0.01,
      weight: 0.06,
      text: `${key}: ${value}`
    });
  });
  
  // 自定义字段：每个独立元素
  Object.entries(productData.customFields || {}).forEach(([key, value], index) => {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
    elements.push({
      id: `custom_${normalizedKey}`,
      type: 'custom_field',
      key: `customFields.${key}`,
      fieldKey: key,
      priority: 6 + index * 0.01,
      weight: 0.06,
      text: `${key}: ${value}`
    });
  });
  
  return elements;
}
```

### 文本获取逻辑
```typescript
const getElementText = (elementId: string, fieldKey?: string): string => {
  // 核心字段
  if (elementId === 'product_name') return productData?.name || '';
  if (elementId === 'product_price') return productData?.price ? `¥${productData.price}` : '¥0';
  if (elementId === 'brand') return productData?.brand || '';
  
  // 卖点
  if (elementId.startsWith('selling_point_')) {
    const index = parseInt(elementId.replace('selling_point_', ''));
    return productData?.sellingPoints?.[index] || '';
  }
  
  // 规格
  if (elementId.startsWith('spec_') && fieldKey) {
    const value = productData?.specs?.[fieldKey] || '';
    return `${fieldKey}: ${value}`;
  }
  
  // 自定义字段
  if (elementId.startsWith('custom_') && fieldKey) {
    const value = productData?.customFields?.[fieldKey] || '';
    return `${fieldKey}: ${value}`;
  }
  
  return '';
};
```

### 元素更新逻辑
- 当 productData 变化时，重新生成元素定义
- 保留已有元素的位置和样式，只更新文本
- 新增元素使用默认位置（后续可通过拖拽调整）
- 删除的元素自动从画布移除

## 下一步计划

1. 创建样式编辑器组件
2. 实现元素删除功能
3. 更新保存/加载逻辑
4. 全面测试各种场景
5. 更新文档

