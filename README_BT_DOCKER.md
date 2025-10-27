# 宝塔面板 Docker 部署指南

本指南将帮助您在宝塔面板上部署 AutoPriceTag 项目。

## 📋 前置准备

### 1. 宝塔面板要求
- 宝塔面板版本 7.x 或更高
- 已安装 Docker 管理器插件
- 已安装 Nginx
- 确保服务器有至少 2GB 可用内存

### 2. 检查 Docker 是否安装
```bash
docker --version
docker-compose --version
```

如果没有安装 Docker，可通过宝塔面板的「软件商店」安装「Docker 管理器」。

---

## 🚀 部署步骤

### 步骤 1: 准备项目文件

#### 方式 A: 使用宝塔面板文件管理
1. 登录宝塔面板
2. 进入「文件」管理
3. 在 `/www/wwwroot/` 下创建项目目录 `autopricetag`
4. 上传项目文件到该目录（或通过 SSH 上传）

#### 方式 B: 使用 SSH 命令行
```bash
cd /www/wwwroot/
git clone https://github.com/yourusername/autopricetag.git
cd autopricetag
```

### 步骤 2: 配置环境变量

创建 `.env.production` 文件：

```bash
cd /www/wwwroot/autopricetag
nano .env.production
```

添加以下内容（请根据实际情况修改）：

```env
NODE_ENV=production
PORT=3000

# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 其他配置（可选）
# NEXT_PUBLIC_API_URL=https://api.example.com
```

保存文件（Ctrl+O, Enter, Ctrl+X）

### 步骤 3: 更新 docker-compose.yml

使用宝塔面板的文件编辑器打开 `docker-compose.yml`，取消注释环境变量文件部分：

```yaml
version: '3.8'

services:
  autopricetag:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: autopricetag
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    # 取消下面的注释，启用环境变量文件
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 步骤 4: 使用 Docker Compose 部署

#### 方式 A: 使用宝塔面板 Docker 管理器

1. 打开宝塔面板「软件商店」→「Docker 管理器」
2. 点击「创建容器」，选择「Compose 编排」
3. 在「Compose 编排」界面中：
   - **Compose 文件路径**: `/www/wwwroot/autopricetag/docker-compose.yml`
   - 点击「创建」按钮

#### 方式 B: 使用 SSH 命令（推荐）

```bash
cd /www/wwwroot/autopricetag

# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

等待构建完成（首次构建可能需要 5-10 分钟）

### 步骤 5: 配置 Nginx 反向代理

#### 方式 A: 使用宝塔面板（推荐）

1. 登录宝塔面板
2. 进入「网站」→「添加站点」
3. 填写信息：
   - **域名**: 您的域名（如 `autopricetag.com`）
   - **根目录**: `/www/wwwroot/autopricetag`
4. 点击「提交」
5. 点击站点「设置」→「配置文件」
6. 修改配置为：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改为您的域名
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

7. 保存并重启 Nginx

#### 方式 B: 使用 SSH

```bash
# 复制配置文件
sudo cp /www/wwwroot/autopricetag/nginx.conf /etc/nginx/sites-available/autopricetag

# 创建软链接
sudo ln -s /etc/nginx/sites-available/autopricetag /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 6: 配置 SSL 证书（HTTPS）

在宝塔面板中：

1. 进入「网站」→ 找到您的站点 →「设置」
2. 点击「SSL」标签
3. 选择「Let's Encrypt」
4. 勾选域名，点击「申请」
5. 申请成功后，开启「强制 HTTPS」

### 步骤 7: 验证部署

打开浏览器访问：
- HTTP: `http://your-domain.com`
- HTTPS: `https://your-domain.com`

---

## 🔧 常用命令

### 查看容器状态
```bash
docker ps
```

### 查看日志
```bash
# 实时查看日志
docker-compose logs -f autopricetag

# 查看最近 100 行日志
docker-compose logs --tail=100 autopricetag
```

### 重启服务
```bash
cd /www/wwwroot/autopricetag
docker-compose restart
```

### 停止服务
```bash
cd /www/wwwroot/autopricetag
docker-compose stop
```

### 启动服务
```bash
cd /www/wwwroot/autopricetag
docker-compose start
```

### 更新应用
```bash
cd /www/wwwroot/autopricetag

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

---

## 📝 宝塔面板可视化操作

### 通过宝塔面板管理容器

1. **查看容器状态**
   - 进入「Docker 管理器」→「容器」
   - 可以看到 `autopricetag` 容器的运行状态

2. **查看日志**
   - 点击容器右侧的「日志」按钮
   - 可以实时查看应用日志

3. **启动/停止容器**
   - 点击「启动」或「停止」按钮

4. **删除容器**
   - 先停止容器，然后点击「删除」

### 配置定时备份

1. 进入宝塔面板「计划任务」
2. 添加任务：
   - **任务类型**: Shell 脚本
   - **执行周期**: 每天凌晨 3 点
   - **脚本内容**:
   ```bash
   #!/bin/bash
   cd /www/wwwroot/autopricetag
   docker-compose stop
   tar -czf /www/backup/autopricetag-$(date +%Y%m%d).tar.gz ./data
   docker-compose start
   ```

---

## 🐛 故障排查

### 问题 1: 容器启动失败

**检查日志**:
```bash
docker-compose logs autopricetag
```

**常见原因**:
- 端口 3000 被占用
- 环境变量未正确配置
- 内存不足

**解决方法**:
```bash
# 检查端口占用
netstat -tulpn | grep 3000

# 修改端口
# 编辑 docker-compose.yml，将 "3000:3000" 改为 "3001:3000"
```

### 问题 2: 无法访问网站

**检查清单**:
1. 容器是否运行: `docker ps`
2. Nginx 是否运行: `systemctl status nginx`
3. 防火墙端口是否开放（宝塔面板「安全」）
4. 域名解析是否正确

### 问题 3: 构建失败

**可能原因**:
- Docker 内存不足
- 网络问题导致依赖下载失败

**解决方法**:
```bash
# 清理未使用的镜像
docker system prune -a

# 增加构建内存限制
# 在宝塔面板 Docker 设置中增加内存限制
```

### 问题 4: 容器频繁重启

**检查健康状态**:
```bash
docker inspect autopricetag | grep Health -A 10
```

**查看容器退出原因**:
```bash
docker inspect --format='{{.State.Error}}' autopricetag
```

---

## 📊 性能优化

### 限制容器资源

编辑 `docker-compose.yml`，添加资源限制：

```yaml
services:
  autopricetag:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 启用数据卷

已配置数据持久化：
```yaml
volumes:
  - ./data:/app/data
```

确保目录存在：
```bash
mkdir -p /www/wwwroot/autopricetag/data
chmod 755 /www/wwwroot/autopricetag/data
```

### Nginx 缓存优化

在宝塔面板 Nginx 配置中添加：

```nginx
# 浏览器缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Gzip 压缩
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 🔒 安全建议

### 1. 配置防火墙
- 在宝塔面板「安全」中，只开放必要端口（80, 443）
- 如需 SSH，只开放特定 IP

### 2. 定期更新
```bash
# 更新系统
apt update && apt upgrade -y

# 更新 Docker 镜像
docker-compose pull
docker-compose up -d --build
```

### 3. 日志监控
- 配置宝塔面板「日志」
- 监控异常访问

### 4. 使用非 root 用户（已配置）
Dockerfile 中已创建 `nextjs` 用户，以非 root 身份运行

---

## 📈 监控和维护

### 查看资源使用

```bash
# 查看容器资源使用
docker stats autopricetag

# 查看磁盘使用
df -h

# 查看系统负载
top
```

### 定期清理

```bash
# 清理未使用的 Docker 资源
docker system prune -a -f

# 清理旧镜像
docker image prune -a -f
```

### 设置监控告警

在宝塔面板「计划任务」中设置：

```bash
# 检查容器是否运行
#!/bin/bash
if [ "$(docker ps -q -f name=autopricetag)" ]; then
    echo "Container is running"
else
    echo "Container is down, restarting..."
    cd /www/wwwroot/autopricetag
    docker-compose up -d
fi
```

---

## 📞 获取帮助

- **项目文档**: 查看 `docs/` 目录
- **GitHub Issues**: 提交问题报告
- **Docker 文档**: [https://docs.docker.com](https://docs.docker.com)
- **宝塔面板文档**: [https://www.bt.cn/bbs](https://www.bt.cn/bbs)

---

## ✅ 部署检查清单

- [ ] Docker 已安装并运行
- [ ] 项目文件已上传到服务器
- [ ] 环境变量已配置（.env.production）
- [ ] docker-compose.yml 已更新
- [ ] 容器已成功启动
- [ ] Nginx 反向代理已配置
- [ ] SSL 证书已配置（生产环境）
- [ ] 防火墙端口已开放
- [ ] 域名解析正确
- [ ] 网站可以正常访问
- [ ] 日志正常无错误

---

**祝您部署顺利！** 🎉


