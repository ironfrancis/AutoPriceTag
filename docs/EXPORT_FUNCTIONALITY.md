# 导出功能技术文档

## 概述

AutoPriceTag 的导出功能支持将设计好的标签导出为三种格式：PNG、JPG 和 PDF。所有导出功能均基于 HTML5 Canvas 实现，确保高质量输出。

## 架构设计

### 核心组件

```
src/lib/export/index.ts - 导出核心库
├── exportCanvasAsImage() - PNG/JPG 导出
├── exportCanvasAsPDF() - PDF 导出
├── exportElementAsImage() - 从HTML元素导出
├── ExportManager - 导出管理器类
└── downloadFile() - 文件下载工具
```

### 数据流程

```
用户点击导出
    ↓
验证画布状态
    ↓
等待渲染完成 (200ms)
    ↓
检查画布内容
    ↓
调用导出函数
    ├── PNG/JPG: exportCanvasAsImage()
    └── PDF: exportCanvasAsPDF()
    ↓
创建高质量画布/PDF
    ↓
转换为 Blob
    ↓
触发下载
```

## 实现细节

### 1. Canvas 到图像的转换

**功能**: `exportCanvasAsImage()`

**关键参数**:
- `format`: 'png' | 'jpg' - 输出格式
- `quality`: 0-1 - 图片质量（JPG 有效）
- `dpi`: 300 - 输出分辨率

**实现步骤**:
1. 验证原画布尺寸和内容
2. 计算缩放比例：`multiplier = dpi / 96`
3. 创建高分辨率导出画布
4. 启用高质量图像平滑
5. 使用 `drawImage()` 复制内容
6. 转换为 Blob

**代码示例**:
```typescript
export async function exportCanvasAsImage(options: CanvasExportOptions): Promise<Blob> {
  const { canvas, format = 'png', quality = 1, dpi = 300 } = options;
  
  // 验证画布
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas has zero dimensions');
  }
  
  // 创建高分辨率画布
  const exportCanvas = document.createElement('canvas');
  const multiplier = dpi / 96;
  exportCanvas.width = canvas.width * multiplier;
  exportCanvas.height = canvas.height * multiplier;
  
  // 高质量渲染
  const exportCtx = exportCanvas.getContext('2d');
  exportCtx.imageSmoothingEnabled = true;
  exportCtx.imageSmoothingQuality = 'high';
  
  // 复制内容
  exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  
  // 转换为 Blob
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, `image/${format}`, quality);
  });
}
```

### 2. Canvas 到 PDF 的转换

**功能**: `exportCanvasAsPDF()`

**关键参数**:
- `dpi`: 300 - 输出分辨率
- `filename`: 输出文件名

**实现步骤**:
1. 获取画布尺寸（像素）
2. 转换为毫米：`widthMM = canvasWidth / 3.7795275591`
3. 创建 jsPDF 实例
4. 获取 Canvas DataURL
5. 使用 `addImage()` 添加到 PDF
6. 输出为 Blob

**代码示例**:
```typescript
export async function exportCanvasAsPDF(options: CanvasExportOptions): Promise<Blob> {
  const { canvas } = options;
  
  // 转换尺寸为毫米
  const widthMM = canvas.width / 3.7795275591;
  const heightMM = canvas.height / 3.7795275591;
  
  // 创建 PDF
  const pdf = new jsPDF({
    orientation: widthMM > heightMM ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMM, heightMM],
    compress: true
  });
  
  // 添加 Canvas 图片
  const dataURL = canvas.toDataURL('image/png', 1);
  pdf.addImage(dataURL, 'PNG', 0, 0, widthMM, heightMM, undefined, 'FAST');
  
  return pdf.output('blob');
}
```

### 3. DPI 和分辨率处理

**标准设置**:
- **屏幕显示**: 96 DPI
- **打印质量**: 300 DPI
- **mm 转 px**: `1mm = 3.7795275591px`

**缩放计算**:
```typescript
const multiplier = targetDPI / 96;
const exportWidth = canvas.width * multiplier;
const exportHeight = canvas.height * multiplier;
```

**优势**:
- 3倍分辨率确保打印清晰
- 自动适配不同输出设备
- 保持宽高比不变

### 4. 导出管理器

**类**: `ExportManager`

**主要方法**:
- `setCanvas(canvas)`: 设置目标画布
- `export(options)`: 执行导出
- `exportHighQuality(options)`: 高质量导出
- `forceRender()`: 强制重新渲染

**使用示例**:
```typescript
const exportManager = new ExportManager();
exportManager.setCanvas(canvas);

// 标准导出
await exportManager.export({
  format: 'png',
  productName: 'Product Name',
  quality: 1,
  dpi: 300
});

// 高质量导出
await exportManager.exportHighQuality({
  format: 'pdf',
  productName: 'Product Name'
});
```

## 使用指南

### 在组件中使用

```typescript
// 1. 初始化导出管理器
const [exportManager] = useState(() => new ExportManager());

// 2. 设置画布
const handleCanvasReady = (canvas: HTMLCanvasElement) => {
  exportManager.setCanvas(canvas);
};

// 3. 执行导出
const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
  try {
    await exportManager.export({
      format,
      productName: productData.name,
      quality: format === 'jpg' ? 0.9 : 1,
      dpi: 300
    });
  } catch (error) {
    console.error('导出失败:', error);
  }
};
```

### 导出前验证

```typescript
// 验证画布状态
if (!canvasInstance) {
  alert('画布未准备就绪');
  return;
}

// 验证画布内容
const ctx = canvasInstance.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const hasContent = imageData.data.some(pixel => pixel !== 0);

if (!hasContent) {
  console.warn('Canvas is empty, waiting...');
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

## 常见问题排查

### 问题1: 导出空白图片

**可能原因**:
1. Canvas 渲染未完成
2. Canvas 被清空或重置
3. 分辨率计算错误

**解决方案**:
```typescript
// 1. 等待渲染完成
await new Promise(resolve => setTimeout(resolve, 200));

// 2. 验证内容
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const hasContent = imageData.data.some(pixel => pixel !== 0);

// 3. 添加详细日志
console.log('Export canvas:', {
  size: { width: canvas.width, height: canvas.height },
  hasContent,
  pixelCount: imageData.data.length
});
```

### 问题2: PDF 尺寸不正确

**可能原因**:
- mm 转 px 计算错误
- jsPDF 参数设置错误

**解决方案**:
```typescript
// 使用正确的转换公式
const widthMM = canvas.width / 3.7795275591;
const heightMM = canvas.height / 3.7795275591;

// 确保 PDF 格式正确
const pdf = new jsPDF({
  unit: 'mm',
  format: [widthMM, heightMM] // 必须使用数组格式
});
```

### 问题3: JPG 质量不佳

**解决方案**:
```typescript
// JPG 质量应设置为 0.9-1.0
exportManager.export({
  format: 'jpg',
  quality: 0.9, // 0-1 之间
  dpi: 300
});

// PNG 质量固定为 1.0
exportManager.export({
  format: 'png',
  quality: 1.0,
  dpi: 300
});
```

## 最佳实践

### 1. 导出前等待

```typescript
// 确保内容已渲染
await new Promise(resolve => setTimeout(resolve, 200));
```

### 2. 验证画布内容

```typescript
// 检查是否为空画布
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
if (!imageData.data.some(pixel => pixel !== 0)) {
  throw new Error('Cannot export empty canvas');
}
```

### 3. 错误处理

```typescript
try {
  await exportManager.export({ format, ... });
} catch (error) {
  console.error('导出失败:', error);
  alert(`导出失败: ${error.message}`);
}
```

### 4. 性能优化

```typescript
// 使用 'FAST' 模式添加图片（PDF）
pdf.addImage(dataURL, 'PNG', 0, 0, width, height, undefined, 'FAST');

// 启用压缩（PDF）
const pdf = new jsPDF({
  compress: true
});
```

## API 参考

### ExportOptions

```typescript
interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf';
  quality?: number;      // 0-1，默认 1
  dpi?: number;          // 默认 300
  filename?: string;     // 可选文件名
}
```

### CanvasExportOptions

```typescript
interface CanvasExportOptions extends ExportOptions {
  canvas: HTMLCanvasElement;  // 必填：目标画布
}
```

### ExportManager 方法

```typescript
class ExportManager {
  setCanvas(canvas: HTMLCanvasElement): void;
  forceRender(): boolean;
  export(options: ExportOptions & { productName?: string }): Promise<void>;
  exportHighQuality(options: Omit<ExportOptions, 'quality' | 'dpi'>): Promise<void>;
}
```

## 技术规范

- **标准分辨率**: 300 DPI
- **最大尺寸**: 无限制（受浏览器限制）
- **支持格式**: PNG, JPG, PDF
- **压缩**: PDF 自动启用
- **图片质量**: PNG=无损, JPG=0.9, PDF=300 DPI

## 更新日志

### v1.0.0 (2024)
- 初始实现导出功能
- 支持 PNG, JPG, PDF 三种格式
- 300 DPI 高分辨率输出
- 添加画布内容验证
- 改进错误处理和日志

### 待实现功能
- [ ] 批量导出多个标签
- [ ] 自定义 DPI 设置
- [ ] SVG 导出支持
- [ ] 导出进度条
- [ ] 导出预设模板

