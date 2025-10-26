# 数据处理原则

## 概述

本文档描述了可拖拽标签编辑器的数据处理原则和架构设计理念。

**最后更新时间：** 2024-01-15

## 最近的改动

1. **UI 优化**：
   - "商品信息" → "标签信息"
   - "商品名称 - 字体设置" → "商品名称区"
   - 移除字体设置的折叠，直接展示所有属性
   - Toast 提示更醒目（绿色/红色背景）

2. **字体功能增强**：
   - 添加更多中文字体：微软雅黑、宋体、黑体、楷体、仿宋、思源系列等
   - 字体选择器支持实时预览
   - 鼠标离开下拉框时恢复到选择前的字体
   - 只有点击确认时才应用新字体

## 核心原则

### 1. 实时双向同步

**预览区（DraggableLabelCanvas）和右侧属性面板使用相同的数据源。**

- 修改右侧属性（商品名称、价格、品牌等）→ 实时更新到预览区
- 修改预览区元素（拖拽位置、双击编辑文字）→ 实时更新到右侧显示
- 选中元素 → 右侧显示对应的字体设置面板

**数据流示意图：**
```
右侧属性区 ↔ useLabelDesign hook ↔ 画布预览区
     ↑              ↓                     ↑
     └──────────────┴─────────────────────┘
           同一数据源，双向同步
```

### 2. 编辑状态独立

**画布内部的拖拽和编辑是独立的本地状态，不立即写入数据表。**

```typescript
// 画布内部状态
const [elements, setElements] = useState<DraggableElement[]>([]);

// 拖拽时只更新本地状态
setElements(prev => prev.map(el => el.id === selectedId ? { ...el, x, y } : el));
```

- 拖拽元素 → 只更新画布内部 `elements` 状态
- 双击编辑文字 → 只更新画布内部 `elements` 状态
- 这些修改不会触发数据表的更新

### 3. 保存时打包快照

**只有在点击"保存标签"时，才将所有状态打包为完整的 JSON 快照。**

```typescript
const handleSave = () => {
  // 1. 从画布获取最新的元素位置
  const currentElements = getElementsRef.current?.() || [];
  
  // 2. 打包所有数据
  const completeDesign: LabelDesign = {
    ...design,                    // 产品数据、字体配置、设置
    layout: {
      elements: currentElements.map(el => ({  // 元素的实际位置
        id: el.id,
        x: el.x,
        y: el.y,
        text: el.text
      }))
    },
    updatedAt: new Date().toISOString()
  };
  
  // 3. 保存到 LocalStorage
  localStorage.setItem('auto-price-tag-label-design', JSON.stringify(completeDesign));
};
```

**快照包含：**
- 产品数据（名称、价格、品牌、卖点、规格等）
- 标签尺寸
- 元素位置（x, y, text）
- 字体配置（每个元素的字体、大小、颜色、对齐等）
- 其他设置

### 4. 加载时完整恢复

**加载时从 JSON 快照恢复所有状态，并实时更新到预览区。**

```typescript
const handleSelectDesign = (selectedDesign: LabelDesign) => {
  // 1. 导入到数据表（会触发更新）
  importDesign(selectedDesign);
  
  // 2. 画布会检测到 savedLayout 变化
  // 3. 直接使用保存的元素位置，不重新计算布局
  <DraggableLabelCanvas
    savedLayout={design.layout}  // ← 传递保存的布局
    ...other props
  />
};
```

## 数据结构

### 完整的设计数据（LabelDesign）

```typescript
interface LabelDesign {
  // 基本信息
  labelId?: string;
  labelName?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 标签尺寸
  labelSize: {
    width: number;
    height: number;
  };
  
  // 产品数据（右侧属性区的数据源）
  productData: {
    name: string;
    price: number;
    brand: string;
    sellingPoints: string[];
    specs: Record<string, string>;
    customFields: Record<string, any>;
  };
  
  // 布局数据（元素的实际位置）
  layout: {
    elements: Array<{
      id: string;
      x: number;
      y: number;
      text: string;
    }>;
  };
  
  // 字体配置（每个元素的样式）
  fontConfigs: Record<string, {
    fontSize: number;
    fontWeight: number;
    fontStyle: string;
    color: string;
    textAlign: string;
    fontFamily: string;
  }>;
  
  // 其他设置
  settings: {
    editable?: boolean;
    [key: string]: any;
  };
}
```

## 工作流程

### 编辑流程

```
用户操作
    ↓
[拖拽元素] → 更新画布内部 elements
[双击编辑文字] → 更新画布内部 elements + onTextChange → 更新 productData
[修改右侧属性] → updateProductData → 画布实时更新
    ↓
（所有修改都在内存中，未保存）
```

### 保存流程

```
用户点击"保存标签"
    ↓
1. 从画布获取当前元素位置（getElementsRef.current()）
    ↓
2. 打包所有数据：
   - productData（从 design 获取）
   - labelSize（从 design 获取）
   - fontConfigs（从 design 获取）
   - layout.elements（从画布获取）
    ↓
3. 序列化为 JSON
    ↓
4. 保存到 LocalStorage
    ↓
✅ 完整快照已保存
```

### 加载流程

```
用户点击"加载设计"
    ↓
1. 从 LocalStorage 读取 JSON
    ↓
2. 调用 importDesign(selectedDesign)
    ↓
3. 更新 design 状态（触发重渲染）
    ↓
4. 画布检测到 savedLayout prop
    ↓
5. 使用保存的元素位置渲染
    ↓
✅ 完整状态已恢复
```

## 技术实现

### 避免频繁同步

**问题：** 之前 `onElementsChange` 会在元素每次变化时通知外部，导致频繁更新。

**解决：** 移除自动同步，只在保存时读取。

```typescript
// ❌ 之前：元素每次变化都通知外部
useEffect(() => {
  if (onElementsChange) {
    onElementsChange(elements);
  }
}, [elements, onElementsChange]);

// ✅ 现在：暴露读取方法，按需调用
useEffect(() => {
  if (onGetElements) {
    onGetElements(() => elements);  // 返回最新元素的函数
  }
}, [elements, onGetElements]);
```

### 避免闭包问题

**问题：** 拖拽后元素无法再次点击，因为使用了过时的 `elements`。

**解决：** 使用 ref 存储最新元素。

```typescript
const elementsRef = useRef(elements);
elementsRef.current = elements;

const getElementAtPoint = useCallback((x: number, y: number) => {
  // 使用 ref 中的最新元素
  for (const element of elementsRef.current) {
    // ...
  }
}, []);
```

### 加载时完整恢复

**实现：** 画布优先使用 `savedLayout`，否则使用自动布局。

```typescript
if (savedLayout && savedLayout.elements.length > 0) {
  // 使用保存的布局
  const draggableElements = savedLayout.elements.map(savedEl => {
    return { /* 恢复元素位置 */ };
  });
  setElements(draggableElements);
  return;
}

// 否则使用自动布局
const layoutResult = calculateSimpleLayout(...);
```

## 优势

1. **性能优化**：编辑时不触发数据表更新，减少不必要的重渲染
2. **用户体验**：拖拽流畅，无卡顿
3. **数据一致性**：保存的快照包含完整的、一致的状态
4. **可恢复性**：加载时完整恢复所有状态
5. **实时同步**：右侧属性和预览区始终一致

## 维护指南

### 修改数据表结构

如果需要在保存的快照中添加新字段：

1. 更新 `src/lib/types.ts` 中的 `LabelDesign` 接口
2. 更新 `src/lib/hooks/useLabelDesign.ts` 中的状态初始化
3. 更新保存逻辑（`handleSave`）以包含新字段
4. 更新加载逻辑以恢复新字段

### 修改画布布局

如果修改了画布元素的布局逻辑：

1. 确保 `savedLayout` 中的数据格式与画布内部 `DraggableElement` 兼容
2. 在 `DraggableLabelCanvas` 的初始化逻辑中，正确处理 `savedLayout` 和自动布局的切换

### 修改同步逻辑

如果需要修改实时同步的行为：

1. 在 `useLabelDesign` hook 中添加新的更新函数
2. 在页面组件中使用这些函数
3. 确保画布接收到新的 props 后会正确重渲染

## 总结

**核心思想：编辑独立，保存打包。**

- 编辑时：各模块独立工作，内部状态自由变化
- 保存时：收集所有状态，打包成完整快照
- 加载时：从快照恢复，所有模块同步更新

这种设计既保证了编辑的流畅性，又确保了数据的一致性。

