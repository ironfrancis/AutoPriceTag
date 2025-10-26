# 元素编辑功能完善

## 问题描述

动态元素（卖点、规格、自定义字段）在双击编辑后，文本更新没有正确同步回数据源，导致：
- 卖点编辑后不更新到 productData.sellingPoints
- 规格编辑后不更新到 productData.specs
- 自定义字段编辑后不更新到 productData.customFields

## 解决方案

### 1. 完善 handleTextChange 函数

根据元素ID识别元素类型，并更新对应的数据源：

```typescript
const handleTextChange = (elementId: string, newText: string) => {
  // 核心字段
  if (elementId === 'product_name') {
    updateProductData({ ...productData, name: newText });
  } else if (elementId === 'brand') {
    updateProductData({ ...productData, brand: newText });
  } else if (elementId === 'product_price') {
    const price = parseFloat(newText.replace('¥', '').trim()) || 0;
    updateProductData({ ...productData, price });
  } 
  
  // 卖点：按索引更新对应数组元素
  else if (elementId.startsWith('selling_point_')) {
    const index = parseInt(elementId.replace('selling_point_', ''));
    const sellingPoints = [...productData.sellingPoints];
    if (sellingPoints[index] !== undefined) {
      sellingPoints[index] = newText;
      updateProductData({ ...productData, sellingPoints });
    }
  }
  
  // 规格：按 fieldKey 更新对应键值对
  else if (elementId.startsWith('spec_')) {
    const originalElement = design.layout.elements.find(e => e.id === elementId);
    const fieldKey = originalElement?.fieldKey;
    
    if (fieldKey) {
      let value = newText;
      // 如果文本包含冒号，提取冒号后的值
      if (newText.includes(':')) {
        value = newText.split(':').slice(1).join(':').trim();
      }
      
      const newSpecs = { ...productData.specs };
      newSpecs[fieldKey] = value;
      updateProductData({ ...productData, specs: newSpecs });
    }
  }
  
  // 自定义字段：按 fieldKey 更新对应键值对
  else if (elementId.startsWith('custom_')) {
    const originalElement = design.layout.elements.find(e => e.id === elementId);
    const fieldKey = originalElement?.fieldKey;
    
    if (fieldKey) {
      let value = newText;
      // 如果文本包含冒号，提取冒号后的值
      if (newText.includes(':')) {
        value = newText.split(':').slice(1).join(':').trim();
      }
      
      const newCustomFields = { ...productData.customFields };
      newCustomFields[fieldKey] = value;
      updateProductData({ ...productData, customFields: newCustomFields });
    }
  }
};
```

### 2. 元素类型识别

系统通过元素ID前缀来识别元素类型：

- `product_name`, `product_price`, `brand` - 核心字段
- `selling_point_0`, `selling_point_1`, ... - 卖点（索引）
- `spec_color`, `spec_weight`, ... - 规格（fieldKey）
- `custom_origin`, `custom_warranty`, ... - 自定义字段（fieldKey）

### 3. 数据同步策略

**卖点编辑**：
- 提取索引：`elementId.replace('selling_point_', '')`
- 更新对应数组元素
- 保持其他卖点不变

**规格编辑**：
- 从 layout.elements 获取 fieldKey
- 解析文本：支持 "颜色: 黑色" 或 "黑色" 两种格式
- 更新 productData.specs[fieldKey]

**自定义字段编辑**：
- 从 layout.elements 获取 fieldKey
- 解析文本：支持 "产地: 中国" 或 "中国" 两种格式
- 更新 productData.customFields[fieldKey]

## 使用示例

### 编辑卖点

```typescript
// 元素ID: selling_point_0
// 用户编辑: "降噪技术"
// 结果: productData.sellingPoints[0] = "降噪技术"
```

### 编辑规格

```typescript
// 元素ID: spec_color
// fieldKey: "颜色"
// 用户编辑: "颜色: 白色" 或 "白色"
// 结果: productData.specs["颜色"] = "白色"
```

### 编辑自定义字段

```typescript
// 元素ID: custom_origin
// fieldKey: "产地"
// 用户编辑: "产地: 中国" 或 "中国"
// 结果: productData.customFields["产地"] = "中国"
```

## 注意事项

1. **fieldKey 的重要性**：规格和自定义字段需要在保存时存储 fieldKey，才能正确更新数据
2. **文本格式兼容**：支持 "键: 值" 和纯值两种格式
3. **数据持久化**：编辑后的数据会同步到 productData，保存时会保存到 JSON

## 测试场景

- [x] 核心字段编辑：商品名称、价格、品牌
- [x] 卖点编辑：双击卖点，修改文本
- [x] 规格编辑：双击规格，修改值
- [x] 自定义字段编辑：双击自定义字段，修改值
- [x] 数据同步：编辑后数据正确更新到 productData
- [x] 保存加载：编辑后的数据正确保存和加载

