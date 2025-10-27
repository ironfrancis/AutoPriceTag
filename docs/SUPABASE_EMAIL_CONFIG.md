# Supabase 邮箱确认配置指南（国内用户优化）

## 问题说明

在国内网络环境下，Supabase 默认的邮件确认服务可能无法正常访问，导致用户无法完成邮箱确认，从而无法登录。

## 解决方案

### 方案一：禁用邮箱确认（推荐用于内测/小规模使用）

这是最简单的解决方案，适合内测环境或小规模使用。

#### 步骤：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** → **Settings**
4. 找到 **Auth Settings** 部分
5. 关闭 **"Enable email confirmations"** 选项
6. 保存更改

#### 优点：
- 配置简单，无需额外设置
- 用户注册后立即可用
- 无需处理邮件配置

#### 缺点：
- 安全性较低（邮箱地址不会验证）
- 可能导致垃圾注册

### 方案二：自定义邮件模板和重定向URL（适合生产环境）

如果必须使用邮箱确认，可以配置自定义的邮件模板和重定向URL。

#### 步骤：

1. 登录 Supabase Dashboard
2. 进入 **Authentication** → **Email Templates**
3. 自定义邮件模板，将确认链接改为你的应用URL
4. 配置 **Site URL**：
   - 进入 **Authentication** → **URL Configuration**
   - 设置 **Site URL** 为你的应用地址
   - 设置 **Redirect URLs** 添加允许的重定向地址

#### 示例配置：

```env
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # 开发环境
# NEXT_PUBLIC_SITE_URL=https://your-domain.com  # 生产环境
```

### 方案三：使用第三方邮件服务（适合大规模生产环境）

如果您需要使用邮箱确认功能，可以配置自定义的 SMTP 邮件服务器，使用国内可访问的邮件服务商。

#### 支持的服务商：

- **阿里云邮件推送**
- **腾讯云企业邮**
- **SendCloud**
- **其他支持 SMTP 的邮件服务**

#### 配置步骤：

1. 登录 Supabase Dashboard
2. 进入 **Authentication** → **Settings**
3. 找到 **SMTP Settings** 部分
4. 配置以下参数：
   - **Enable Custom SMTP**: 开启
   - **SMTP Host**: 邮件服务器地址
   - **SMTP Port**: 通常是 465 (SSL) 或 587 (TLS)
   - **SMTP User**: 发件人邮箱
   - **SMTP Password**: SMTP 密码
   - **Sender Email**: 发件人地址
   - **Sender Name**: 发件人名称

#### 示例配置（阿里云）：

```env
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
SENDER_EMAIL=your-email@example.com
SENDER_NAME=AutoPriceTag
```

### 方案四：使用本地邮箱确认（仅限开发环境）

如果您在本地开发，可以查看 Supabase Dashboard 的邮件日志。

#### 步骤：

1. 登录 Supabase Dashboard
2. 进入 **Authentication** → **Users**
3. 找到未确认的用户
4. 点击用户，查看邮件发送日志
5. 复制确认链接，手动在浏览器中打开

## 推荐配置（针对不同场景）

### 场景一：内测/小规模使用

**推荐方案**：禁用邮箱确认

```bash
# 在 Supabase Dashboard 操作
1. Authentication → Settings
2. 关闭 "Enable email confirmations"
3. 保存
```

**优点**：
- 配置简单
- 用户体验好
- 无需额外成本

### 场景二：正式生产环境

**推荐方案**：使用国内邮件服务商 + 自定义SMTP

```bash
# 配置 Supabase SMTP
1. 选择一个国内邮件服务商（如阿里云）
2. 获取 SMTP 配置信息
3. 在 Supabase Dashboard 配置 SMTP
4. 测试发送邮件
```

**优点**：
- 邮件可送达
- 安全性高
- 适合生产环境

### 场景三：混合方案

**推荐方案**：开发环境禁用 + 生产环境启用

```typescript
// 可以根据环境变量决定是否启用邮箱确认
const isProduction = process.env.NODE_ENV === 'production';
```

## 当前项目配置

根据您的需求，建议采用以下配置：

### 开发环境
- 禁用邮箱确认
- 便于快速测试和开发

### 生产环境
- 如果访问用户主要为国内用户：禁用邮箱确认
- 如果访问用户为国际用户：启用邮箱确认

## 实施步骤

### 立即实施的配置（禁用邮箱确认）

1. 访问 Supabase Dashboard: https://app.supabase.com
2. 选择您的项目
3. 导航到 **Authentication** → **Settings**
4. 在 **Auth Settings** 部分找到 **"Enable email confirmations"**
5. **取消勾选**此选项
6. 点击 **Save**
7. 完成后，新用户注册将不再需要邮箱确认

### 验证配置

1. 注册一个新用户
2. 确认用户可以立即登录，无需邮箱确认
3. 检查控制台，应该能看到用户状态为 "confirmed"

## 注意事项

1. **安全性**：禁用邮箱确认会降低安全性，恶意用户可能注册虚假邮箱
2. **用户验证**：考虑添加其他验证方式（如短信验证码、人工审核等）
3. **监控**：定期检查注册用户，发现异常及时处理
4. **备份方案**：保留邮箱确认功能作为可选功能

## 常见问题

### Q: 禁用邮箱确认后，现有未确认用户怎么办？

A: 可以在 Supabase Dashboard 手动确认这些用户，或者使用 SQL：

```sql
-- 在 Supabase SQL Editor 中执行
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### Q: 如何切换回邮箱确认？

A: 在 Supabase Dashboard 重新启用 "Enable email confirmations" 选项即可。

### Q: 用户已经注册但没有收到确认邮件？

A: 
1. 检查 Supabase Dashboard 的邮件日志
2. 如果邮件服务正常，检查垃圾邮件文件夹
3. 如果确认邮件无法送达，建议禁用邮箱确认功能

## 相关文件

- `supabase/migrations/002_disable_email_confirm.sql` - 关于禁用邮箱确认的说明
- `src/lib/supabase/client.ts` - Supabase 客户端配置
- `ENV_CONFIG.md` - 环境变量配置指南

## 更多资源

- [Supabase Authentication 文档](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-templates)
- [Supabase SMTP 配置](https://supabase.com/docs/guides/auth/auth-smtp)
