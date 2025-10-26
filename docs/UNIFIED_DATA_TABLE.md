# 统一数据表结构 - 使用说明

## 概述

现在整个应用使用统一的数据表结构（`LabelDesign`）来管理和保存所有标签设计信息。

## 主要组件

### 1. 数据类型定义 (`src/lib/types.ts`)

定义了以下核心接口：
- `LabelDesign`: 标签设计完整数据结构
- `ProductData`: 产品信息
- `LayoutElement`: 布局元素
- `FontConfig`: 字体配置

### 2. 数据管理 Hook (`src/lib/hooks/useLabelDesign.ts`)

提供以下功能：
- `design`: 当前设计数据
- `updateProductData`: 更新产品数据
- `updateLabelSize`: 更新标签尺寸
- `updateLayoutElements`: 更新所有布局元素
- `updateLayoutElement`: 更新单个布局元素
- `updateFontConfig`: 更新字体配置
- `updateAllFontConfigs`: 更新所有字体配置
- `loadDesign`: 加载设计数据
- `resetDesign`: 重置设计
- `exportDesign`: 导出设计数据
- `importDesign`: 导入设计数据

## 数据流程

```
用户操作 → 更新对应的数据 → 自动同步到 LabelDesign → 触发界面更新
```

### 例如：修改产品名称

1. 用户在表单中修改名称
2. 调用 `updateProductData({ ...productData, name: newName })`
3. `useLabelDesign` 自动更新 `design.productData` 和 `design.updatedAt`
4. 页面自动重新渲染，显示新名称

## 数据保存结构

所有设计数据现在都保存在 `LabelDesign` 对象中，结构如下：

```typescript
{
  labelId: string,           // 可选：标签ID
  labelName: string,         // 可选：标签名称
  createdAt: string,          // 创建时间
  updatedAt: string,          // 更新时间
  labelSize: { width, height },  // 标签尺寸
  productData: {             // 产品数据
    name, price, brand, sellingPoints, specs, customFields
  },
  layout: {                  // 布局信息
    elements: [{ id, x, y, text }]
  },
  fontConfigs: {             // 字体配置
    [elementId]: { fontSize, fontWeight, ... }
  },
  settings: {                // 其他设置
    editable: true
  }
}
```

## 优势

1. **数据一致性**：所有修改都通过统一的数据管理接口
2. **自动时间戳**：每次修改自动更新 `updatedAt`
3. **易于保存**：整个设计可以一键导出为 JSON
4. **易于加载**：可以加载之前保存的设计
5. **类型安全**：TypeScript 类型检查确保数据结构正确

## 保存和加载

### 保存设计

点击 "保存设计" 按钮，会自动导出包含所有信息的 JSON 文件。

### 加载设计

将来可以实现文件上传功能，直接加载之前保存的设计。

## 当前状态

- ✅ 统一数据结构已定义
- ✅ 数据管理 Hook 已创建
- ✅ 页面已集成使用
- ✅ 保存功能已实现（导出 JSON）
- ⏳ 加载功能待实现（需要添加文件上传 UI）

## 下一步

可以添加以下功能：
1. 添加上传按钮，允许用户加载保存的设计文件
2. 添加设计列表，显示所有保存的设计
3. 添加云端存储，自动保存和同步
4. 添加撤销/重做功能，基于数据状态变化

