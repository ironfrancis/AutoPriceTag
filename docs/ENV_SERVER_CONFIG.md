# 服务器环境变量配置指南

## 环境变量文件说明

### 文件名称

在服务器上，环境变量文件应该命名为：**`.env.production`**

这个文件名会被正确解析，因为：
1. `ecosystem.config.js` 会读取 `.env.production` 文件
2. Next.js 在生产环境中会自动加载 `.env.production` 文件
3. PM2 会从配置文件中读取环境变量并传递给应用

### 文件位置

环境变量文件应放在项目根目录：

```
/var/www/autopricetag/
├── .env.production    ← 环境变量文件在这里
├── package.json
├── ecosystem.config.js
└── ...
```

## 配置步骤

### 1. 创建环境变量文件

```bash
cd /var/www/autopricetag
nano .env.production
```

### 2. 添加配置内容

```env
# 生产环境配置
NODE_ENV=production
PORT=3000

# Supabase 云存储配置（可选）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 保存文件并重启应用

```bash
# 保存文件（Ctrl+O, Enter, Ctrl+X）

# 重启 PM2 应用以加载新环境变量
pm2 restart autopricetag

# 查看应用状态
pm2 status

# 查看日志确认环境变量已加载
pm2 logs autopricetag
```

## 验证配置

### 方法一：查看 PM2 进程环境变量

```bash
pm2 env 0  # 0 是应用 ID
```

应该能看到 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 变量。

### 方法二：查看应用日志

```bash
pm2 logs autopricetag --lines 50
```

如果配置正确，应用启动时不会有 Supabase 相关的错误。

### 方法三：在浏览器中检查

访问应用后，打开浏览器开发者工具（F12）：
1. 打开 Console 标签
2. 应该能看到应用正常运行
3. 如果是未配置 Supabase 的情况，云同步按钮会显示"云同步未配置"
4. 如果已配置，云同步按钮会显示"未连接"或用户状态

## 工作原理

### 1. ecosystem.config.js

```javascript
const fs = require('fs');
const path = require('path');

// 读取 .env.production 文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.production');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  // ... 读取文件内容
  return env;
}

const envVars = loadEnvFile();

module.exports = {
  apps: [{
    name: 'autopricetag',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      ...envVars,  // 这里会加载所有环境变量
    },
  }]
};
```

### 2. Next.js 环境变量加载顺序

在生产环境中，Next.js 会按以下顺序加载环境变量：

1. `.env.production.local` （优先级最高，git 忽略）
2. `.env.production`
3. `.env.local` （git 忽略）
4. `.env`

### 3. PM2 环境变量传递

PM2 会将这些环境变量传递给 Node.js 进程，Next.js 可以在运行时访问它们。

## 常见问题

### Q: `.env.production` 文件会被 Git 追踪吗？

A: 不会被追踪。`.env.production` 已经在 `.gitignore` 中被排除。

### Q: 修改 `.env.production` 后需要做什么？

A: 需要重启 PM2 应用：

```bash
pm2 restart autopricetag
```

### Q: 如何在不同环境使用不同的配置？

- **开发环境**: 使用 `.env.local`
- **生产环境**: 使用 `.env.production`
- **Docker**: 通过 `docker-compose.yml` 中的 `env_file` 配置

### Q: 环境变量修改后不生效？

检查清单：
1. 文件是否命名为 `.env.production`（不是 `.env.prod` 或其他）
2. 文件是否在项目根目录
3. 是否重启了 PM2 应用
4. 变量名是否正确（必须是 `NEXT_PUBLIC_` 开头才能在客户端访问）

### Q: 如何临时禁用 Supabase？

在 `.env.production` 中注释掉相关变量：

```env
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

然后重启应用：

```bash
pm2 restart autopricetag
```

应用会自动使用 localStorage 存储，云同步功能将被禁用。

## 安全建议

1. **永远不要提交 `.env.production` 到 Git**
   - 文件已配置在 `.gitignore` 中

2. **保护你的 Supabase 密钥**
   - 不要将密钥分享给他人
   - 定期更换密钥

3. **使用最小权限原则**
   - 只授予必要的数据库权限

## 示例配置文件

### 最小配置（不使用 Supabase）

```env
NODE_ENV=production
PORT=3000
```

### 完整配置（使用 Supabase）

```env
# 生产环境配置
NODE_ENV=production
PORT=3000

# Supabase 云存储配置
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzQzMzIxMDAsImV4cCI6MTk0OTkwODEwMH0.abc123def456...
```

## 总结

- ✅ 文件名：`.env.production`
- ✅ 位置：项目根目录
- ✅ 配置后需要：`pm2 restart autopricetag`
- ✅ 验证方法：`pm2 env 0` 或查看日志

