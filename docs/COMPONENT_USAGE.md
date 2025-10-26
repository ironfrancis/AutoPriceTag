# 组件使用指南

## 概述

现在项目已经将标签预览功能拆分成独立的、可复用的组件：

1. **LabelPreview** - 独立的单标签预览组件
2. **LabelCanvas** - 完整的画布组件（包含交互功能）
3. **TemplateRenderer** - 模板渲染引擎
4. **TemplateConfig** - 模板配置系统

## 组件架构

```
LabelPreview (轻量级预览)
├── 支持模板系统
├── 支持自定义字体配置
└── 独立的渲染逻辑

LabelCanvas (完整画布)
├── 基于 LabelPreview
├── 支持拖拽调整
├── 支持导出功能
└── 集成布局信息显示

TemplateRenderer (模板引擎)
├── 模板配置管理
├── 字体配置合并
└── 布局计算

TemplateConfig (配置系统)
├── 预设模板配置
├── 自定义模板创建
└── 模板查找和管理
```

## 使用示例

### 1. 基础使用 - LabelPreview

在任意页面中导入使用：

```tsx
import LabelPreview from '@/components/editor/LabelPreview';
import { ProductData } from '@/lib/types';

const MyPage = () => {
  const [productData, setProductData] = useState<ProductData>({
    name: '测试商品',
    price: 99.99,
    brand: '测试品牌'
  });

  return (
    <div>
      <LabelPreview
        labelSize={{ width: 80, height: 60 }}
        productData={productData}
      />
    </div>
  );
};
```

### 2. 使用模板系统

```tsx
import LabelCanvas from '@/components/editor/LabelCanvas';
import { getTemplateConfigById } from '@/components/editor/TemplateConfig';

const EditorWithTemplate = () => {
  return (
    <LabelCanvas
      labelSize={{ width: 80, height: 60 }}
      productData={productData}
      templateId="promotion-default" // 使用促销模板
    />
  );
};
```

### 3. 自定义模板配置

```tsx
import LabelCanvas from '@/components/editor/LabelCanvas';
import { createCustomTemplateConfig, getTemplateConfigById } from '@/components/editor/TemplateConfig';

const CustomTemplateExample = () => {
  // 获取基础模板
  const baseTemplate = getTemplateConfigById('simple-default');
  
  // 创建自定义模板
  const customTemplate = createCustomTemplateConfig(baseTemplate, {
    layoutParams: {
      textAreaRatio: 0.7, // 更大的文字区域
      padding: 5, // 更大的内边距
    },
    fontConfigs: {
      product_price: {
        fontSize: 28,
        fontWeight: 700,
        color: '#FF0000'
      }
    }
  });

  return (
    <LabelCanvas
      labelSize={{ width: 80, height: 60 }}
      productData={productData}
      templateConfig={customTemplate}
    />
  );
};
```

### 4. 动态切换模板

```tsx
const TemplateSwitcher = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('simple-default');

  const templates = [
    { id: 'simple-default', name: '基础布局' },
    { id: 'promotion-default', name: '促销布局' },
    { id: 'premium-default', name: '高端布局' },
    { id: 'two-column-default', name: '双栏布局' }
  ];

  return (
    <div>
      {/* 模板选择器 */}
      <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* 使用选中的模板 */}
      <LabelCanvas
        labelSize={{ width: 80, height: 60 }}
        productData={productData}
        templateId={selectedTemplate}
        onLayoutChange={(layout) => {
          console.log('布局已更新:', layout);
        }}
      />
    </div>
  );
};
```

### 5. 在Gallery页面复用

```tsx
// src/app/gallery/page.tsx
import LabelPreview from '@/components/editor/LabelPreview';

const GalleryPage = () => {
  const labels = [
    { id: '1', productData: {...}, size: {...} },
    { id: '2', productData: {...}, size: {...} },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {labels.map(label => (
        <div key={label.id} className="border rounded-lg p-4">
          <LabelPreview
            labelSize={label.size}
            productData={label.productData}
            templateId="simple-default"
          />
        </div>
      ))}
    </div>
  );
};
```

### 6. 批量预览多个标签

```tsx
const BatchPreview = ({ labels }: { labels: Array<{size, productData}> }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {labels.map((label, index) => (
        <div key={index} className="border rounded p-4">
          <LabelPreview
            labelSize={label.size}
            productData={label.productData}
            templateId="simple-default"
          />
          <button onClick={() => exportLabel(index)}>导出</button>
        </div>
      ))}
    </div>
  );
};
```

## 组件Props说明

### LabelPreview

```typescript
interface LabelPreviewProps {
  labelSize: { width: number; height: number }; // 标签尺寸(mm)
  productData: ProductData; // 商品数据
  fontConfigs?: Record<string, FontConfig>; // 字体配置
  onCanvasReady?: (canvas: HTMLCanvasElement) => void; // 画布准备就绪回调
  className?: string; // 额外CSS类
  isExporting?: boolean; // 是否正在导出
  style?: React.CSSProperties; // 内联样式
  layout?: 'simple' | 'template'; // 布局模式
  templateId?: string; // 模板ID
  textAreaRatio?: number; // 文字区域比例
}
```

### LabelCanvas

```typescript
interface LabelCanvasProps extends LabelPreviewProps {
  templateConfig?: TemplateConfig; // 直接传入模板配置
  onLayoutChange?: (layout: SimpleLayoutResult) => void; // 布局变化回调
}
```

## 可用的模板

1. **simple-default** - 基础布局
   - 文字区域：65%
   - 适合：常规商品标签

2. **promotion-default** - 促销布局
   - 文字区域：55%
   - 突出价格显示
   - 适合：促销活动标签

3. **premium-default** - 高端布局
   - 文字区域：60%
   - 注重美感和留白
   - 适合：高端商品标签

4. **two-column-default** - 双栏布局
   - 文字区域：50%
   - 左右均衡
   - 适合：对称布局需求

## 最佳实践

1. **复用组件**：使用 `LabelPreview` 在其他页面展示标签预览
2. **模板系统**：使用 `TemplateConfig` 创建和管理自定义模板
3. **动态配置**：根据需求动态切换模板和调整布局参数
4. **导出功能**：结合 `onCanvasReady` 回调实现导出功能
5. **性能优化**：批量渲染时考虑使用虚拟滚动

## 扩展自定义模板

```typescript
// 创建新的模板配置
const myCustomTemplate: TemplateConfig = {
  id: 'my-custom-template',
  name: '我的自定义模板',
  type: 'simple',
  description: '这是一个自定义模板',
  layoutParams: {
    textAreaRatio: 0.7,
    padding: 5,
    elementSpacing: 2,
    lineHeight: 1.5
  },
  fontConfigs: {
    product_name: {
      fontSize: 18,
      fontWeight: 600,
      color: '#000000'
    },
    // ... 其他字段
  }
};

// 使用自定义模板
<LabelCanvas
  labelSize={{ width: 80, height: 60 }}
  productData={productData}
  templateConfig={myCustomTemplate}
/>
```

