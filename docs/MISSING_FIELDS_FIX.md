# 缺失字段显示问题修复

## 问题描述

用户反馈某些文字组件没有在预览中显示，特别是：
1. 卖点说明只显示第一个
2. 规格参数显示不完整
3. 自定义字段（customFields）没有显示

## 修复内容

### 1. 卖点显示改进 ✅

**之前**：只显示第一个卖点
```typescript
case 'sellingPoints':
  return productData.sellingPoints?.[0] || '';
```

**现在**：显示前3个卖点，用空格分隔
```typescript
case 'sellingPoints':
  if (productData.sellingPoints && productData.sellingPoints.length > 0) {
    return productData.sellingPoints.slice(0, 3).join(' ');
  }
  return '';
```

### 2. 规格显示改进 ✅

**之前**：只显示所有规格值（不显示键名）
```typescript
case 'specs':
  return productData.specs ? Object.values(productData.specs).join(' ') : '';
```

**现在**：显示规格键值对，最多5个项
```typescript
case 'specs':
  if (productData.specs && Object.keys(productData.specs).length > 0) {
    return Object.entries(productData.specs)
      .slice(0, 5)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' ');
  }
  return '';
```

### 3. 自定义字段显示限制 ⚠️

**当前状态**：`customFields` 暂时不显示在画布上

**原因**：
- 布局算法（`simpleLayout.ts`）只处理预定义的5种元素：
  - `product_name`（商品名称）
  - `brand`（品牌）
  - `product_price`（价格）
  - `selling_points`（卖点）
  - `specs`（规格）

**解决方案**：
如果需要显示自定义字段，有以下方案：

1. **在 specs 中添加**：将自定义字段添加到 `specs` 对象中，它们会显示在规格区域
2. **使用卖点区域**：将自定义信息添加到 `sellingPoints` 数组中
3. **扩展布局算法**（未来计划）：支持动态添加自定义字段元素

## 修改的文件

1. `src/lib/layout/simpleLayout.ts`
   - 修改 `getElementContent` 函数，改进卖点和规格的显示逻辑

2. `src/components/editor/DraggableLabelCanvas.tsx`
   - 修改 `getElementText` 辅助函数
   - 更新 `productData` 变化监听逻辑，同步文本更新

## 效果展示

### 卖点区域
**输入数据**：
```json
{
  "sellingPoints": ["降噪技术", "40小时续航", "快充支持", "防水设计"]
}
```

**显示效果**：
```
降噪技术 40小时续航 快充支持
```

### 规格区域
**输入数据**：
```json
{
  "specs": {
    "颜色": "黑色",
    "重量": "50g",
    "尺寸": "15×15cm",
    "电池": "2000mAh",
    "接口": "Type-C",
    "充电时间": "2小时"
  }
}
```

**显示效果**：
```
颜色: 黑色 重量: 50g 尺寸: 15×15cm 电池: 2000mAh 接口: Type-C
```

注意：超过5个的规格项不会显示（如"充电时间"）。

## 使用建议

### 如果需要显示更多信息

1. **合并到 specs**：
```typescript
const productData: ProductData = {
  name: "蓝牙耳机",
  price: 299,
  brand: "TechSound",
  sellingPoints: ["降噪"],
  specs: {
    "颜色": "黑色",
    "重量": "50g",
    "电池": "2000mAh",
    "接口": "Type-C",
    "充电时间": "2小时",
    // 将自定义字段添加到这里
    "保修期": "1年",
    "产地": "中国"
  },
  customFields: {
    "出厂日期": "2024-01-01"
  }
};
```

2. **重要信息优先**：将最重要的规格放在前5个位置，确保它们能显示

## 注意事项

1. **文本长度限制**：由于标签空间有限，卖点限制为前3个，规格限制为前5个
2. **自动换行**：如果文本过长，会自动换行，最多3行
3. **文本省略**：如果超过3行，末尾会显示 "..."
4. **动态更新**：修改商品数据后，画布上的文本会自动更新

