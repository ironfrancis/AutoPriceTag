# 整页排版数据结构和存储文档

## 概述

整页排版功能允许用户将多个标签组合排列到标准尺寸画布（如A4、A3等），并支持保存、加载和导出整个排版设计。本文档详细说明整页排版的数据结构、存储方案和使用流程。

## 数据结构

### 1. PageLayoutDesign（整页排版设计）

完整的整页排版数据结构，包含画布信息和所有标签实例。

```typescript
interface PageLayoutDesign {
  layoutId: string;              // 排版唯一标识符
  layoutName: string;            // 排版名称（用户自定义）
  canvasPreset: CanvasPreset;    // 画布预设尺寸信息
  instances: PlacedLabelInstance[]; // 所有已放置的标签实例
  createdAt: string;             // 创建时间（ISO 8601格式）
  updatedAt: string;             // 更新时间（ISO 8601格式）
}
```

**字段说明**：
- `layoutId`: 自动生成的唯一ID，格式为 `layout_${timestamp}`
- `layoutName`: 用户输入的排版名称，默认为 `排版_日期`
- `canvasPreset`: 画布预设对象，包含画布的尺寸信息
- `instances`: 标签实例数组，包含每个标签的设计和位置
- `createdAt/updatedAt`: ISO 8601格式的时间戳

### 2. CanvasPreset（画布预设）

画布尺寸预设信息。

```typescript
interface CanvasPreset {
  id: string;          // 预设ID（如 'a4', 'a3'）
  name: string;        // 显示名称（如 'A4纸张'）
  width: number;       // 宽度（毫米）
  height: number;      // 高度（毫米）
  description?: string; // 可选描述
}
```

**预设示例**：
```javascript
{
  id: 'a4',
  name: 'A4纸张',
  width: 210,
  height: 297,
  description: '标准A4纸张（210×297mm）'
}
```

### 3. PlacedLabelInstance（已放置的标签实例）

画布上单个标签的完整信息。

```typescript
interface PlacedLabelInstance {
  id: string;              // 实例唯一标识符
  labelDesign: LabelDesign; // 完整的标签设计数据
  position: {               // 在画布上的位置（毫米）
    x: number;
    y: number;
  };
  scale?: number;           // 可选的缩放比例
  isSelected?: boolean;     // 是否被选中
  rotate?: number;          // 可选的旋转角度
}
```

**字段说明**：
- `id`: 自动生成的实例ID，格式为 `instance_${timestamp}_${index}`
- `labelDesign`: 完整的标签设计对象（参考 `LABEL_DESIGN_DATA_STRUCTURE.md`）
- `position`: 标签左上角在画布上的绝对位置，单位为毫米
- `scale/rotate`: 预留字段，用于未来扩展

## JSON 格式示例

### 完整排版 JSON

```json
{
  "layoutId": "layout_1703001234567",
  "layoutName": "2025年1月促销价签排版",
  "canvasPreset": {
    "id": "a4",
    "name": "A4纸张",
    "width": 210,
    "height": 297
  },
  "instances": [
    {
      "id": "instance_1703001234567_0",
      "labelDesign": {
        "labelId": "label_1703001000000",
        "labelName": "苹果价签",
        "labelSize": {
          "width": 50,
          "height": 30
        },
        "productData": {
          "name": "红富士苹果",
          "price": 12.8,
          "brand": "烟台产"
        },
        "layout": {
          "elements": [...]
        },
        "elementStyles": {...},
        "settings": {}
      },
      "position": {
        "x": 5,
        "y": 5
      }
    },
    {
      "id": "instance_1703001234567_1",
      "labelDesign": {
        "labelId": "label_1703001100000",
        "labelName": "香蕉价签",
        "labelSize": {
          "width": 50,
          "height": 30
        },
        "productData": {
          "name": "进口香蕉",
          "price": 8.5
        },
        "layout": {
          "elements": [...]
        },
        "elementStyles": {...},
        "settings": {}
      },
      "position": {
        "x": 56,
        "y": 5
      }
    }
  ],
  "createdAt": "2025-01-20T10:30:45.678Z",
  "updatedAt": "2025-01-20T14:22:15.234Z"
}
```

## 存储方案

### Supabase 数据库存储

整页排版**仅使用 Supabase 数据库存储**，不再使用 LocalStorage。

#### 数据库表结构

```sql
CREATE TABLE page_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_id TEXT UNIQUE NOT NULL,
  layout_name TEXT NOT NULL,
  canvas_preset JSONB NOT NULL,
  instances JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**字段说明**：
- `id`: 数据库主键，自动生成
- `user_id`: 用户ID，关联到 Supabase Auth
- `layout_id`: 排版的唯一标识符（来自 `PageLayoutDesign.layoutId`）
- `layout_name`: 排版名称
- `canvas_preset`: 画布预设的 JSON 数据
- `instances`: 标签实例数组的 JSON 数据
- `created_at/updated_at`: 自动管理的时间戳

#### 安全策略

启用行级安全策略（RLS），确保：
- 用户只能查看自己的排版
- 用户只能修改自己的排版
- 用户只能删除自己的排版

## API 接口

### 1. savePageLayout

保存排版到 Supabase 数据库。

```typescript
async function savePageLayout(
  layout: PageLayoutDesign
): Promise<{ success: boolean; error?: string }>
```

**使用示例**：
```typescript
const layout: PageLayoutDesign = {
  layoutId: 'layout_1703001234567',
  layoutName: '促销价签排版',
  canvasPreset: CANVAS_PRESETS[0],
  instances: [...],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const result = await savePageLayout(layout);
if (result.success) {
  console.log('保存成功');
} else {
  console.error('保存失败:', result.error);
}
```

**注意事项**：
- 使用 `upsert` 操作，如果 `layout_id` 已存在则更新
- 需要用户已登录
- 自动更新 `updated_at` 字段

### 2. loadPageLayouts

从 Supabase 加载所有排版。

```typescript
async function loadPageLayouts(): Promise<{
  layouts: PageLayoutDesign[];
  error?: string;
}>
```

**使用示例**：
```typescript
const result = await loadPageLayouts();
if (!result.error) {
  console.log('加载到', result.layouts.length, '个排版');
  result.layouts.forEach(layout => {
    console.log(layout.layoutName);
  });
} else {
  console.error('加载失败:', result.error);
}
```

**注意事项**：
- 按 `updated_at` 降序排序（最新的在前）
- 需要用户已登录
- 自动解析 JSON 字段

### 3. deletePageLayout

从 Supabase 删除排版。

```typescript
async function deletePageLayout(
  layoutId: string
): Promise<{ success: boolean; error?: string }>
```

**使用示例**：
```typescript
const result = await deletePageLayout('layout_1703001234567');
if (result.success) {
  console.log('删除成功');
}
```

### 4. exportPageLayoutJSON

导出排版为 JSON 文件。

```typescript
function exportPageLayoutJSON(layout: PageLayoutDesign): void
```

**使用示例**：
```typescript
exportPageLayoutJSON(layout);
// 自动下载文件: 排版名称_时间戳.json
```

**注意事项**：
- 在浏览器中触发文件下载
- 文件名格式：`{layoutName}_{timestamp}.json`
- 不需要用户登录

### 5. importPageLayoutJSON

从 JSON 文件导入排版，并自动保存到数据库。

```typescript
async function importPageLayoutJSON(
  jsonString: string
): Promise<{ layout?: PageLayoutDesign; error?: string }>
```

**使用示例**：
```typescript
const jsonString = await file.text();
const result = await importPageLayoutJSON(jsonString);

if (result.layout) {
  console.log('导入成功:', result.layout.layoutName);
  // 排版已自动保存到数据库
} else {
  console.error('导入失败:', result.error);
}
```

**注意事项**：
- 验证 JSON 格式和必需字段
- 自动生成新的 `layoutId` 避免冲突
- 在排版名称后添加 `(副本)` 标识
- 自动保存到数据库，需要用户已登录

## 使用流程

### 创建新排版

1. 在整页排版页面选择画布尺寸
2. 从右侧标签列表选择标签添加到画布
3. 系统自动布局或手动调整位置
4. 点击"保存"按钮
5. 输入排版名称
6. 保存到 Supabase 数据库

### 加载已保存排版

1. 点击"加载"按钮
2. 从对话框中选择要加载的排版
3. 系统自动设置画布尺寸和标签位置
4. 可以继续编辑或导出

### 导出和导入 JSON

**导出**：
1. 点击"导出JSON"按钮（下载图标）
2. 自动下载 JSON 文件

**导入**：
1. 点击"导入JSON"按钮（上传图标）
2. 选择 JSON 文件
3. 系统验证并导入
4. 自动保存到数据库

### 导出图片/PDF

1. 点击"导出图片"按钮
2. 选择格式（PNG/JPG/PDF）
3. 系统渲染完整画布并导出

## 数据迁移

### 运行数据库迁移

```bash
# 在 Supabase 项目中执行迁移文件
supabase migration up 003_create_page_layouts_table
```

或在 Supabase Dashboard 的 SQL 编辑器中执行 `supabase/migrations/003_create_page_layouts_table.sql`。

## 最佳实践

### 1. 排版命名

- 使用描述性名称，如"2025年1月促销"
- 包含日期或用途信息
- 避免使用特殊字符

### 2. 标签组织

- 按商品类别分组排版
- 使用相同尺寸的标签获得更整齐的排列
- 合理利用画布空间

### 3. 定期备份

- 定期导出 JSON 文件作为备份
- JSON 文件可以在不同账号间共享
- 保留重要排版的多个版本

### 4. 性能优化

- 避免在单个排版中放置过多标签（建议 ≤ 50）
- 复杂排版可分成多个文件
- 定期清理不需要的旧排版

## 故障排除

### 保存失败

**可能原因**：
- 用户未登录
- 网络连接问题
- 数据库权限问题

**解决方案**：
1. 检查是否已登录 Supabase
2. 检查网络连接
3. 尝试导出 JSON 作为临时备份
4. 联系管理员检查数据库配置

### 加载失败

**可能原因**：
- 数据格式不兼容
- JSON 数据损坏
- 引用的标签不存在

**解决方案**：
1. 检查浏览器控制台的错误信息
2. 验证 JSON 格式
3. 确保所有引用的标签都存在
4. 尝试重新导入 JSON

### 导入 JSON 失败

**可能原因**：
- JSON 格式错误
- 缺少必需字段
- 数据类型不匹配

**解决方案**：
1. 使用 JSON 验证工具检查格式
2. 参考本文档的 JSON 格式示例
3. 确保包含所有必需字段
4. 检查数据类型是否正确

## 相关文档

- [整页排版使用说明](./整页排版使用说明.md)
- [标签设计数据结构](./LABEL_DESIGN_DATA_STRUCTURE.md)
- [自动布局算法](./整页排版自动布局算法.md)
- [Supabase 邮箱配置](./SUPABASE_EMAIL_CONFIG.md)

## 技术支持

如有问题或建议，请查看项目 README 或提交 Issue。

