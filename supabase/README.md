# Supabase 数据库配置指南

## 快速开始

### 1. 创建数据表

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. 复制 `supabase/migrations/001_create_projects_table.sql` 的内容
6. 粘贴到 SQL Editor
7. 点击 **Run** 执行

### 2. 验证数据表

1. 点击左侧菜单的 **Table Editor**
2. 应该能看到 `projects` 表
3. 检查表的列和权限是否正确

### 3. 配置环境变量

在你的项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

如何获取这些值：
1. 在 Supabase Dashboard
2. 点击 **Settings** → **API**
3. 复制 **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. 复制 **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. 测试连接

在项目根目录运行：

```bash
npm run dev
```

访问应用，点击"登录云端"按钮，测试连接是否正常。

## 数据表结构

### projects 表

| 列名 | 类型 | 说明 |
|------|------|------|
| id | bigserial | 主键，自增 |
| user_id | uuid | 用户ID，外键关联 auth.users |
| label_id | text | 设计ID，唯一标识 |
| name | text | 设计名称 |
| data | text | 设计数据（JSON字符串） |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 索引

- `projects_user_id_idx` - 用户ID索引
- `projects_label_id_idx` - 设计ID索引

### Row Level Security (RLS)

所有策略都基于 `auth.uid() = user_id`，确保用户只能：
- 查看自己的数据
- 插入自己的数据
- 更新自己的数据
- 删除自己的数据

## 故障排除

### 问题：无法保存数据

- 检查 RLS 策略是否启用
- 检查用户是否已登录
- 查看浏览器控制台错误信息

### 问题：SQL 执行失败

- 确保在正确的数据库中执行
- 检查 SQL 语法是否正确
- 查看 Supabase Dashboard 的错误信息

### 问题：环境变量未生效

- 重启开发服务器 `npm run dev`
- 检查 `.env.local` 文件是否在项目根目录
- 检查变量名是否以 `NEXT_PUBLIC_` 开头

## 更多信息

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)

