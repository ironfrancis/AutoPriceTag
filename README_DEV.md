# 开发模式 vs 生产模式

## 快速对比

| 特性 | 开发模式 (`npm run dev`) | 生产模式 (`npm run start`) |
|------|------------------------|---------------------------|
| **命令** | `next dev` | `next start` |
| **性能** | 较慢（开发特性） | 快速（优化后） |
| **热重载** | ✅ 支持 | ❌ 不支持 |
| **源代码** | 未编译 | 已编译优化 |
| **调试信息** | 详细 | 最小 |
| **适用场景** | 本地开发、调试 | 生产部署 |

## 本地开发

### 启动开发服务器

```bash
# 方法一：使用 npm 脚本
npm run dev

# 方法二：直接使用 next
npx next dev

# 方法三：指定端口
npm run dev -- -p 3001
```

### 访问应用

打开浏览器访问：http://localhost:3000

## 服务器上的模式选择

### 生产模式（推荐）

```bash
# 1. 构建生产版本
npm run build

# 2. 使用 PM2 启动（使用生产配置）
pm2 start ecosystem.config.js

# 或者直接启动
npm run start
```

**优点**：
- 性能最佳
- 代码已优化
- 适合实际使用

### 开发模式（仅用于调试）

```bash
# 使用开发配置
pm2 start ecosystem.dev.config.js

# 或者直接运行
npm run dev
```

**优点**：
- 支持热重载
- 更详细的错误信息
- 实时看到代码更改

**警告**：
- 性能较差
- 不适合生产环境
- 不推荐在生产服务器使用

## 如何切换模式

### 从生产切换到开发

```bash
# 停止生产模式
pm2 stop autopricetag

# 启动开发模式
pm2 start ecosystem.dev.config.js

# 查看日志
pm2 logs autopricetag-dev
```

### 从开发切换回生产

```bash
# 停止开发模式
pm2 stop autopricetag-dev

# 重新构建
npm run build

# 启动生产模式
pm2 start ecosystem.config.js
```

## 环境变量配置

### 开发环境

创建 `.env.local` 文件：

```bash
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-key
```

### 生产环境

创建 `.env.production` 文件：

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-key
```

## 常见问题

### Q1: 为什么服务器上不能直接用 `npm run dev`？

**A:** `next dev` 是用于开发环境的，性能较差且不适合并发访问。生产环境应该：
1. 先用 `npm run build` 构建
2. 然后用 `npm run start` 或 PM2 启动

### Q2: 如何在服务器上调试？

**A:** 临时使用开发模式：
```bash
# 使用开发配置启动
pm2 start ecosystem.dev.config.js

# 调试完后切换回生产
pm2 stop autopricetag-dev
npm run build
pm2 start ecosystem.config.js
```

### Q3: 开发模式性能差怎么办？

**A:** 开发模式本来就是这样，用于开发调试。实际使用时请使用生产模式。

### Q4: 可以同时运行开发和生产模式吗？

**A:** 可以，使用不同端口：
```bash
# 开发模式 - 端口 3000
npm run dev

# 生产模式 - 端口 3001
PORT=3001 npm run start
```

## 推荐实践

### 本地开发

```bash
npm run dev  # 启动开发服务器
```

### 服务器部署

```bash
# 构建
npm run build

# 使用 PM2 管理生产进程
pm2 start ecosystem.config.js

# 查看状态
pm2 status
pm2 logs autopricetag
```

### 临时调试

仅在确实需要时使用开发模式，调试完成后立即切回生产模式。

## PM2 管理命令

```bash
# 查看所有进程
pm2 list

# 查看特定进程
pm2 show autopricetag

# 查看日志
pm2 logs autopricetag

# 重启
pm2 restart autopricetag

# 停止
pm2 stop autopricetag

# 删除
pm2 delete autopricetag

# 监控
pm2 monit
```

