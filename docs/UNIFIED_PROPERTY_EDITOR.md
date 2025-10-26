# 统一元素属性编辑器

## 设计理念

所有文字元素都共用同一个属性编辑器，提供一致的编辑体验。

## 组件结构

### ElementPropertyEditor 组件

```typescript
interface ElementPropertyEditorProps {
  elementId: string | null;                    // 元素ID
  position: { x: number; y: number } | null;   // 位置
  labelSize: { width: number; height: number }; // 标签尺寸
  fontConfig: FontConfig | null;                // 字体配置
  elementText?: string;                         // 文本内容
  onPositionChange: (x: number, y: number) => void;
  onFontConfigChange: (config: FontConfig) => void;
  onDelete?: (elementId: string) => void;
  onTextChange?: (newText: string) => void;
}
```

### 包含的编辑功能

1. **位置控制** (PositionControl)
   - 相对位置（百分比格式，0-100）
   - X、Y 坐标独立调整

2. **字体样式** (FontCustomizer)
   - 字体大小
   - 字体粗细
   - 字体样式（正常/斜体）
   - 文本对齐
   - 字体颜色
   - 字体族

3. **文本编辑** (可选)
   - 多行文本编辑
   - 双击画布也可编辑

4. **删除功能** (可选)
   - 隐藏元素
   - 保留数据

## 统一性

### 所有元素使用同一个编辑器

无论是：
- ✅ 商品名称 (product_name)
- ✅ 价格 (product_price)
- ✅ 品牌 (brand)
- ✅ 卖点 (selling_point_0)
- ✅ 规格 (spec_color)
- ✅ 自定义字段 (custom_origin)

都使用 **ElementPropertyEditor** 组件，提供完全一致的编辑体验。

## 使用流程

### 1. 选中元素

用户点击画布上的元素 → 元素被选中 → 右侧显示属性编辑器

### 2. 编辑属性

**位置调整**：
- 拖动元素
- 或在属性区输入百分比

**样式编辑**：
- 调整字体大小
- 选择颜色
- 修改对齐方式
- 等...

**文本编辑**：
- 双击画布上的元素
- 或在属性区编辑文本区域

### 3. 删除元素

点击删除按钮 → 元素隐藏 → 数据保留

## 代码实现

### 创建统一编辑器

```typescript
// src/components/editor/ElementPropertyEditor.tsx
export default function ElementPropertyEditor({
  elementId,
  position,
  labelSize,
  fontConfig,
  elementText,
  onPositionChange,
  onFontConfigChange,
  onDelete,
  onTextChange
}: ElementPropertyEditorProps) {
  if (!elementId) {
    return <EmptyState />; // 未选中状态
  }

  return (
    <div className="property-editor">
      {/* 头部 */}
      <Header elementId={elementId} onDelete={onDelete} />
      
      {/* 位置控制 */}
      {position && (
        <PositionControl {...positionProps} />
      )}
      
      {/* 字体样式 */}
      {fontConfig && (
        <FontCustomizer {...fontProps} />
      )}
      
      {/* 文本编辑 */}
      {onTextChange && (
        <TextEditor value={elementText} onChange={onTextChange} />
      )}
    </div>
  );
}
```

### 在页面中使用

```typescript
// src/app/draggable-editor/page.tsx
<ElementPropertyEditor
  elementId={selectedElementId}
  position={selectedElementPosition}
  labelSize={labelSize}
  fontConfig={fontConfigs?.[selectedElementId]}
  elementText={getElementText(selectedElementId)}
  onPositionChange={handlePositionChange}
  onFontConfigChange={handleFontConfigChange}
  onDelete={handleDeleteElement}
/>
```

## 优势

### 1. 一致性

✅ 所有元素使用相同的编辑界面  
✅ 统一的交互逻辑  
✅ 一致的用户体验  

### 2. 可维护性

✅ 单一组件负责所有属性编辑  
✅ 修改功能时只需更新一处  
✅ 易于扩展新功能  

### 3. 可扩展性

✅ 添加新属性类型只需扩展组件  
✅ 新元素类型自动支持  
✅ 保持向后兼容  

## 属性说明

### 位置属性

- **x, y**: 相对位置（百分比，0-100）
- **作用**: 控制元素在画布上的位置
- **编辑方式**: 拖动或输入百分比

### 样式属性

- **fontSize**: 字体大小（8-48px）
- **fontWeight**: 字体粗细（100-900）
- **fontStyle**: 字体样式（normal/italic）
- **textAlign**: 文本对齐（left/center/right）
- **color**: 文本颜色
- **fontFamily**: 字体族

### 内容属性

- **text**: 显示的文本内容
- **作用**: 元素实际显示的文字
- **编辑方式**: 双击或属性区编辑

## 未来扩展

可以添加更多属性：

```typescript
interface ExtendedElementPropertyEditorProps extends ElementPropertyEditorProps {
  // 背景属性
  backgroundColor?: string;
  backgroundPadding?: number;
  
  // 边框属性
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  
  // 高级样式
  opacity?: number;
  lineHeight?: number;
  letterSpacing?: number;
  
  // 变换属性
  rotation?: number;
  scale?: number;
}
```

## 总结

通过统一的 **ElementPropertyEditor** 组件，所有文字元素现在都具备完整且一致的属性编辑功能：

- ✅ 位置控制
- ✅ 字体样式
- ✅ 文本编辑
- ✅ 删除功能
- ✅ 统一的用户界面

系统现在提供真正的"像 Photoshop 一样"的编辑体验！

