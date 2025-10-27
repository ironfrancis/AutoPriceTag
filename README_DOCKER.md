# Docker 部署指南

## 快速开始

### 方法一：使用 Docker Compose（推荐）

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 停止服务
docker-compose down
```

### 方法二：使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t autopricetag:latest .

# 2. 运行容器
docker run -d \
  --name autopricetag \
  -p 3000:3000 \
  --restart unless-stopped \
  autopricetag:latest

# 3. 查看日志
docker logs -f autopricetag

# 4. 停止容器
docker stop autopricetag
docker rm autopricetag
```

## 环境变量配置

### 使用环境变量文件

1. 创建 `.env.production` 文件：

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. 修改 `docker-compose.yml`，取消注释 env_file 部分：

```yaml
services:
  autopricetag:
    # ...
    env_file:
      - .env.production
```

3. 重启容器：

```bash
docker-compose down
docker-compose up -d
```

### 使用命令行环境变量

```bash
docker run -d \
  --name autopricetag \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  autopricetag:latest
```

## 持久化数据

如果需要持久化数据，在 `docker-compose.yml` 中已配置了数据卷：

```yaml
volumes:
  - ./data:/app/data
```

确保本地有 `data` 目录：

```bash
mkdir -p ./data
```

## 生产环境配置

### 使用 Nginx 反向代理

1. 创建 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. 重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f autopricetag

# 查看状态
docker-compose ps

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 查看服务资源使用
docker-compose top
```

## 高级配置

### 多阶段构建优化

Dockerfile 使用多阶段构建，最终镜像只包含运行时需要的文件，镜像大小更小。

### 健康检查

`docker-compose.yml` 中配置了健康检查，Docker 会自动监控应用状态。

### 自动重启

使用 `restart: unless-stopped` 确保容器自动重启。

## 安全建议

1. **使用非 root 用户**：Dockerfile 中已创建 `nextjs` 用户运行应用

2. **限制资源使用**：

```yaml
services:
  autopricetag:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

3. **使用 Docker Secrets**（生产环境）：

```yaml
services:
  autopricetag:
    # ...
    secrets:
      - supabase_url
      - supabase_key

secrets:
  supabase_url:
    file: ./secrets/supabase_url.txt
  supabase_key:
    file: ./secrets/supabase_key.txt
```

## 故障排查

### 查看日志

```bash
# Docker Compose
docker-compose logs -f

# Docker 命令
docker logs -f autopricetag
```

### 进入容器调试

```bash
docker exec -it autopricetag sh
```

### 检查端口

```bash
# 检查容器端口映射
docker port autopricetag

# 检查端口占用
netstat -tulpn | grep 3000
```

### 查看资源使用

```bash
docker stats autopricetag
```

## 更新应用

```bash
# 方法一：使用 Docker Compose
git pull
docker-compose down
docker-compose up -d --build

# 方法二：使用 Docker 命令
git pull
docker stop autopricetag
docker rm autopricetag
docker build -t autopricetag:latest .
docker run -d --name autopricetag -p 3000:3000 autopricetag:latest
```

## 备份和恢复

### 备份数据

```bash
# 导出镜像
docker save autopricetag:latest | gzip > autopricetag-backup.tar.gz

# 备份数据卷
tar -czf data-backup.tar.gz ./data
```

### 恢复

```bash
# 导入镜像
docker load < autopricetag-backup.tar.gz

# 恢复数据
tar -xzf data-backup.tar.gz
```

## 最佳实践

1. **定期更新基础镜像**：

```bash
docker pull node:18-alpine
```

2. **清理未使用的镜像**：

```bash
docker system prune -a
```

3. **监控容器健康**：

```bash
docker inspect --format='{{.State.Health.Status}}' autopricetag
```

4. **使用 Docker 网络**（多容器场景）：

```yaml
services:
  autopricetag:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 与现有部署方式对比

| 特性 | Docker | PM2 | 直接 npm |
|------|--------|-----|----------|
| **环境隔离** | ✅ 优秀 | ❌ 无 | ❌ 无 |
| **易迁移** | ✅ 优秀 | ⚠️ 一般 | ❌ 困难 |
| **资源隔离** | ✅ 是 | ❌ 否 | ❌ 否 |
| **安全性** | ✅ 高 | ⚠️ 中 | ❌ 低 |
| **性能开销** | ⚠️ 略高 | ✅ 低 | ✅ 低 |
| **推荐场景** | 生产环境 | 简单部署 | 本地开发 |

## 下一步

1. 配置环境变量
2. 设置 Nginx 反向代理
3. 配置 SSL 证书（HTTPS）
4. 设置监控和日志收集

