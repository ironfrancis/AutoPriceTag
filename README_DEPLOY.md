# AutoPriceTag 部署指南

## 快速部署（推荐）

### 方式一：使用自动部署脚本

```bash
# 1. 将项目下载到服务器
git clone https://gitee.com/mmsdfrancis/autopricelabel.git
cd autopricelabel

# 2. 添加执行权限并运行
chmod +x deploy.sh
bash deploy.sh
```

### 方式二：手动部署

```bash
# 1. 安装 Node.js (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 PM2
sudo npm install -g pm2

# 3. 克隆项目
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://gitee.com/mmsdfrancis/autopricelabel.git
cd autopricelabel
sudo chown -R $USER:$USER .

# 4. 安装依赖
npm install

# 5. 配置环境变量（重要！）
# 复制环境变量配置模板
cp .env.example .env.production

# 编辑配置
nano .env.production

# 配置说明：
# - NODE_ENV=production (必需)
# - PORT=3000 (默认端口)
# - NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY (可选)
#   如果需要云存储功能，访问 https://supabase.com 创建项目获取密钥
#   不配置也影响运行，数据会保存在浏览器 localStorage 中

# 6. 构建项目
npm run build

# 7. 启动应用
pm2 start ecosystem.config.js
pm2 save

# 8. 查看状态
pm2 status
pm2 logs autopricetag
```

## Nginx 反向代理配置

### 1. 安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/autopricetag

# 编辑配置（修改域名）
sudo nano /etc/nginx/sites-available/autopricetag

# 创建软链接
sudo ln -s /etc/nginx/sites-available/autopricetag /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 3. 配置防火墙

```bash
# 开放 HTTP 和 HTTPS 端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## SSL 证书配置（HTTPS）

### 使用 Let's Encrypt (免费)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 常用命令

### PM2 管理

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs autopricetag

# 重启应用
pm2 restart autopricetag

# 停止应用
pm2 stop autopricetag

# 查看详细信息
pm2 show autopricetag

# 监控
pm2 monit
```

### 更新代码

```bash
cd /var/www/autopricelabel
git pull origin main
npm install
npm run build
pm2 restart autopricetag
```

## 故障排查

### 1. 查看应用日志

```bash
pm2 logs autopricetag --lines 100
```

### 2. 查看 Nginx 日志

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 3. 检查端口占用

```bash
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000
```

### 4. 重启所有服务

```bash
sudo systemctl restart nginx
pm2 restart all
```

## 环境变量配置

**详细配置说明请查看 `ENV_CONFIG.md`**

### 快速配置

```bash
# 1. 复制配置模板
cp .env.example .env.production

# 2. 编辑配置
nano .env.production

# 3. 最低配置（可以运行）
NODE_ENV=production
PORT=3000

# 4. 完整配置（可选，如需云存储功能）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 5. 重启应用
pm2 restart autopricetag
```

### 重要提示
- 不配置 Supabase 也可以运行，数据会保存在浏览器 localStorage
- 如需跨设备同步，必须配置 Supabase
- 详细说明请参考 `ENV_CONFIG.md` 文件

## 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   ```

2. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **限制 SSH 访问**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # 修改 PermitRootLogin no
   # 修改 Port 22 为其他端口
   sudo systemctl restart sshd
   ```

## 性能优化

1. **启用 Gzip 压缩**（已在 nginx.conf 中配置）
2. **静态资源 CDN**：将静态资源放到 CDN
3. **数据库优化**：如果使用云数据库，配置连接池
4. **监控设置**：配置 PM2 监控和告警

## 备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/autopricetag"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d).tar.gz /var/www/autopricelabel
# 只保留最近7天的备份
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# 添加到定时任务
crontab -e
# 添加: 0 2 * * * /path/to/backup.sh
```

