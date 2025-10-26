# 标签设计数据结构

## 概述

本文档描述了一个统一的数据表结构（`LabelDesign`），用于保存和同步标签的所有设计信息，包括产品数据、元素布局、字体配置等。

## 数据结构

### `LabelDesign` 接口

```typescript
interface LabelDesign {
  // 基本信息
  labelId?: string;           // 标签唯一ID
  labelName?: string;         // 标签名称
  createdAt?: string;         // 创建时间
  updatedAt?: string;         // 更新时间
  
  // 标签尺寸
  labelSize: {
    width: number;
    height: number;
  };
  
  // 产品数据
  productData: ProductData;
  
  // 元素布局数据（画布上的所有元素位置）
  layout: {
    elements: LayoutElement[];
  };
  
  // 字体配置
  fontConfigs: Record<string, FontConfig>;
  
  // 其他配置
  settings: {
    editable?: boolean;
    [key: string]: any;
  };
}
```

### 子接口

#### `ProductData`
```typescript
interface ProductData {
  name: string;
  price: number;
  brand: string;
  sellingPoints: string[];
  specs: Record<string, string>;
  customFields: Record<string, any>;
}
```

#### `LayoutElement`
```typescript
interface LayoutElement {
  id: string;
  x: number;
  y: number;
  text: string;
}
```

#### `FontConfig`
```typescript
interface FontConfig {
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  color: string;
  textAlign: string;
  fontFamily: string;
}
```

## 使用方式

### 1. 初始化设计数据

```typescript
const {
  design,
  updateProductData,
  updateLabelSize,
  updateLayoutElements,
  updateFontConfig,
  exportDesign,
  importDesign,
} = useLabelDesign();
```

### 2. 更新数据

```typescript
// 更新产品数据
updateProductData({
  name: '新产品',
  price: 199,
  brand: '品牌名',
  sellingPoints: ['卖点1', '卖点2'],
  specs: { 颜色: '红色' },
  customFields: {},
});

// 更新标签尺寸
updateLabelSize({ width: 100, height: 60 });

// 更新布局元素
updateLayoutElements([
  { id: 'product_name', x: 10, y: 10, text: '产品名称' },
  { id: 'brand', x: 10, y: 30, text: '品牌' },
]);

// 更新字体配置
updateFontConfig('product_name', {
  fontSize: 16,
  fontWeight: 500,
  fontStyle: 'normal',
  textAlign: 'left',
  color: '#111827',
  fontFamily: 'system-ui, -apple-system, sans-serif'
});
```

### 3. 保存设计

```typescript
// 导出设计数据
const designData = exportDesign();

// 转换为 JSON
const jsonStr = JSON.stringify(designData, null, 2);

// 下载文件
const blob = new Blob([jsonStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `design-${Date.now()}.json`;
link.click();
URL.revokeObjectURL(url);
```

### 4. 加载设计

```typescript
// 读取 JSON 文件
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const jsonStr = e.target.result;
  const designData = JSON.parse(jsonStr);
  
  // 导入设计数据
  importDesign(designData);
};
reader.readAsText(file);
```

## 数据同步

所有数据修改都会自动更新 `updatedAt` 字段，确保数据的一致性。

## 示例

### 完整的设计数据示例

```json
{
  "labelId": "label-001",
  "labelName": "经典布局",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z",
  "labelSize": {
    "width": 80,
    "height": 50
  },
  "productData": {
    "name": "高端无线蓝牙耳机",
    "price": 299,
    "brand": "TechSound",
    "sellingPoints": ["降噪技术", "40小时续航"],
    "specs": {
      "颜色": "黑色",
      "重量": "50g"
    },
    "customFields": {}
  },
  "layout": {
    "elements": [
      {
        "id": "product_name",
        "x": 10,
        "y": 10,
        "text": "高端无线蓝牙耳机"
      },
      {
        "id": "brand",
        "x": 10,
        "y": 30,
        "text": "TechSound"
      }
    ]
  },
  "fontConfigs": {
    "product_name": {
      "fontSize": 16,
      "fontWeight": 500,
      "fontStyle": "normal",
      "textAlign": "left",
      "color": "#111827",
      "fontFamily": "system-ui, -apple-system, sans-serif"
    },
    "brand": {
      "fontSize": 12,
      "fontWeight": 400,
      "fontStyle": "normal",
      "textAlign": "left",
      "color": "#6B7280",
      "fontFamily": "system-ui, -apple-system, sans-serif"
    }
  },
  "settings": {
    "editable": true
  }
}
```

## 优势

1. **统一数据表**：所有设计信息集中在一个数据结构中
2. **易于保存**：整个设计可以直接序列化为 JSON
3. **易于加载**：可以从 JSON 恢复完整的设计状态
4. **版本控制**：通过 `createdAt` 和 `updatedAt` 跟踪修改历史
5. **扩展性强**：`settings` 和 `customFields` 允许添加自定义配置

