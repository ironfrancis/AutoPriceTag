# 多阶段构建 Dockerfile for AutoPriceTag

# 阶段 1: 依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 阶段 2: 构建应用
FROM node:18-alpine AS builder
WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用（设置环境变量）
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 阶段 3: 运行环境
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 public 文件夹
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 standalone 构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 如果需要读取 .env 文件，取消下面注释
# COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["node", "server.js"]

