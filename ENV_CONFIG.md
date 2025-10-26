# 环境变量配置指南

## 快速开始

### 1. 复制环境变量模板

```bash
# 复制示例文件
cp .env.example .env.production
```

### 2. 编辑配置

```bash
# 使用编辑器打开配置文件
nano .env.production
```

### 3. 配置项说明

#### 必需配置

```bash
# Node.js 环境
NODE_ENV=production

# 应用端口（默认 3000）
PORT=3000
```

#### 可选配置（Supabase 云存储）

如果您需要使用云端存储功能，需要配置 Supabase：

1. 访问 https://supabase.com
2. 注册账号并创建项目
3. 在项目设置中获取 API URL 和 Anon Key
4. 填入以下配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**注意**：如果不配置 Supabase，应用仍然可以正常运行，只是无法使用云端存储功能，数据会存储在浏览器的 localStorage 中。

## 环境变量说明

### NEXT_PUBLIC_SUPABASE_URL
- **类型**：字符串
- **必需**：否
- **说明**：Supabase 项目的 API URL
- **示例**：`https://abcdefghijk.supabase.co`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **类型**：字符串  
- **必需**：否
- **说明**：Supabase 的匿名公共密钥
- **示例**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### NODE_ENV
- **类型**：字符串
- **必需**：是
- **可选值**：`development` | `production` | `test`
- **说明**：Node.js 运行环境

### PORT
- **类型**：数字
- **默认**：3000
- **必需**：否
- **说明**：应用监听端口

## 不同环境的配置

### 本地开发环境

创建 `.env.local` 文件：

```bash
NODE_ENV=development
PORT=3000

# 本地开发环境也可以使用 Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 生产环境

创建 `.env.production` 文件：

```bash
NODE_ENV=production
PORT=3000

# 生产环境必须配置正确的 Supabase 凭证
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 如何在服务器上配置

### 方法一：手动配置（推荐）

```bash
# SSH 登录服务器
ssh user@your-server

# 进入项目目录
cd /var/www/autopricelabel

# 复制配置模板
cp .env.example .env.production

# 编辑配置
nano .env.production

# 重启应用
pm2 restart autopricetag
```

### 方法二：使用部署脚本

部署脚本会自动创建 `.env.production` 文件，您只需要编辑它即可：

```bash
bash deploy.sh

# 然后编辑配置
nano .env.production

# 重启应用
pm2 restart autopricetag
```

## 验证配置

```bash
# 检查环境变量是否正确加载
node -e "require('dotenv').config({ path: '.env.production' }); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# 或者在应用运行后查看日志
pm2 logs autopricetag
```

## 安全建议

1. **永远不要将 `.env.production` 文件提交到 Git**
   - 已经配置在 `.gitignore` 中

2. **不要在代码中硬编码密钥**
   - 始终使用环境变量

3. **定期更换密钥**
   - 如果密钥泄露，立即在 Supabase 控制台更换

4. **使用限制权限的密钥**
   - 对于生产环境，考虑使用更严格的行级安全策略

## 常见问题

### Q: 不配置 Supabase 可以运行吗？
A: 可以。应用会将数据存储在浏览器的 localStorage 中，但无法在不同设备间同步。

### Q: 配置后如何测试连接？
A: 启动应用后，尝试保存一个设计，如果成功则说明配置正确。

### Q: 如何获取 Supabase 密钥？
A: 
1. 访问 https://supabase.com
2. 创建/登录账号
3. 新建项目或选择现有项目
4. 进入 Settings > API
5. 复制 Project URL 和 anon public key

### Q: 多个服务器如何共享配置？
A: 使用配置管理工具（如 Vault）或安全的文件共享方式。

