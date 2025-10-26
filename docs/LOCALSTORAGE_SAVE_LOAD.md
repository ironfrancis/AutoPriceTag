# LocalStorage 保存和加载功能

## 功能概述

现在标签设计数据会自动保存到浏览器的 LocalStorage 中，每次修改后都会自动保存。

## 主要功能

### 1. 自动保存
- 修改设计数据后，系统会在 1 秒后自动保存到 LocalStorage
- 无需手动操作，避免数据丢失

### 2. 自动加载
- 页面打开时自动加载之前保存的设计
- 如果没有保存的设计，则使用默认数据

### 3. 手动保存
- 点击 "保存到本地" 按钮可以立即保存
- 适合在重要修改后立即保存

### 4. 手动加载
- 点击 "加载设计" 按钮可以重新加载之前保存的设计
- 如果没有保存的设计，按钮会被禁用

### 5. 导出为文件
- 点击 "导出JSON" 按钮可以下载设计为 JSON 文件
- 适合备份或分享

## 使用场景

### 场景 1：继续编辑
1. 开始编辑标签
2. 系统自动保存每次修改
3. 关闭页面
4. 重新打开页面
5. 自动加载之前的设计
6. 继续编辑

### 场景 2：回退到之前版本
1. 做了很多修改
2. 想回到之前的状态
3. 点击 "加载设计" 按钮
4. 恢复到最后保存的版本

### 场景 3：备份设计
1. 完成设计后
2. 点击 "导出JSON" 按钮
3. 保存 JSON 文件到电脑
4. 以后可以导入这个文件

## 技术实现

### LocalStorage Key
```typescript
const STORAGE_KEY = 'auto-price-tag-label-design';
```

### 保存逻辑
```typescript
const saveToLocalStorage = useCallback(() => {
  try {
    const designData = {
      ...design,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designData));
    return true;
  } catch (error) {
    console.error('保存到 LocalStorage 失败:', error);
    return false;
  }
}, [design]);
```

### 加载逻辑
```typescript
const loadFromLocalStorage = useCallback(() => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const designData: LabelDesign = JSON.parse(storedData);
      loadDesign(designData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('从 LocalStorage 加载失败:', error);
    return false;
  }
}, [loadDesign]);
```

### 自动保存
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (design.productData.name !== '') {
      saveToLocalStorage();
    }
  }, 1000); // 1秒后保存

  return () => clearTimeout(timer);
}, [design, saveToLocalStorage]);
```

## 数据存储结构

保存到 LocalStorage 的数据结构：

```json
{
  "labelId": "label-12345",
  "labelName": "我的设计",
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
    }
  },
  "settings": {
    "editable": true
  }
}
```

## 限制

1. **存储大小**：LocalStorage 通常限制为 5-10MB
2. **浏览器支持**：现代浏览器都支持
3. **隐私模式**：某些浏览器的隐私模式下可能限制 LocalStorage

## 注意事项

1. 自动保存有 1 秒延迟，避免频繁写入
2. 清空浏览器数据会删除保存的设计
3. 不同域名之间的 LocalStorage 不会共享
4. 建议定期导出 JSON 文件作为备份

## 未来的改进

1. 支持多个设计版本（设计列表）
2. 支持设计命名和分类
3. 云端同步功能
4. 版本历史记录
5. 撤销/重做功能

