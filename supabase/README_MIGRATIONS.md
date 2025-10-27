# Supabase 数据库迁移指南

## 概述

本文档说明如何执行数据库迁移以创建整页排版所需的表。

## 迁移文件列表

1. `001_create_projects_table.sql` - 创建项目表（标签设计）
2. `002_disable_email_confirm.sql` - 禁用邮箱确认
3. `003_create_page_layouts_table.sql` - 创建整页排版表 ⭐ 新增

## 如何运行迁移

### 方法 1: 使用 Supabase Dashboard（推荐）

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **SQL Editor**
4. 点击 **New query**
5. 复制 `003_create_page_layouts_table.sql` 的内容
6. 粘贴到查询编辑器
7. 点击 **Run**

### 方法 2: 使用 Supabase CLI

```bash
# 安装 Supabase CLI（如果尚未安装）
npm install -g supabase

# 登录
supabase login

# 链接到您的项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 方法 3: 直接在数据库中执行

如果您有直接访问数据库的权限：

```bash
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# 然后粘贴迁移文件内容
```

## 验证迁移

在 Supabase Dashboard 中：

1. 进入 **Table Editor**
2. 检查是否出现 `page_layouts` 表
3. 应该包含以下字段：
   - `id` (uuid)
   - `user_id` (uuid)
   - `layout_id` (text)
   - `layout_name` (text)
   - `canvas_preset` (jsonb)
   - `instances` (jsonb)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

## 故障排除

### 表已存在错误

如果遇到"表已存在"错误，可以先删除表：

```sql
DROP TABLE IF EXISTS page_layouts CASCADE;
```

然后重新运行迁移。

### 权限错误

确保您有足够的数据库权限：

- **Owner**: 可以创建表和修改安全策略
- **Admin**: 可以创建表

### RLS 策略已存在

如果遇到策略已存在的错误：

```sql
DROP POLICY IF EXISTS "Users can view their own page layouts" ON page_layouts;
DROP POLICY IF EXISTS "Users can insert their own page layouts" ON page_layouts;
DROP POLICY IF EXISTS "Users can update their own page layouts" ON page_layouts;
DROP POLICY IF EXISTS "Users can delete their own page layouts" ON page_layouts;
```

然后重新运行迁移。

## 数据结构

### page_layouts 表

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

### 索引

- `idx_page_layouts_user_id` - 用户ID索引
- `idx_page_layouts_layout_id` - 排版ID索引
- `idx_page_layouts_updated_at` - 更新时间索引

### RLS 策略

所有 RLS 策略都使用 `auth.uid() = user_id` 条件，确保：
- 用户只能查看自己的排版
- 用户只能修改自己的排版
- 用户只能删除自己的排版

## 后续步骤

运行迁移后：

1. 刷新应用程序
2. 尝试保存一个整页排版
3. 应该不再看到"数据库表不存在"的错误

## 支持

如有问题，请查看：
- [项目 README](../README.md)
- [整页排版数据文档](../docs/PAGE_LAYOUT_DATA_STRUCTURE.md)
- [Supabase 官方文档](https://supabase.com/docs)

