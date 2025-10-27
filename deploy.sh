#!/bin/bash

# AutoPriceTag 自动部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "==================== AutoPriceTag 部署脚本 ===================="

# 配置变量
PROJECT_NAME="autopricetag"
REPO_URL="https://gitee.com/mmsdfrancis/autopricelabel.git"
PROJECT_DIR="/var/www/autopricetag"
NODE_VERSION="18"  # 可以改为 16, 18, 20

echo "1. 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION_INSTALLED=$(node -v)
echo "Node.js 版本: $NODE_VERSION_INSTALLED"

echo ""
echo "2. 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    sudo pm2 startup
fi

echo ""
echo "3. 创建项目目录..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

echo ""
echo "4. 克隆/更新项目代码..."
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "项目已存在，更新代码..."
    cd $PROJECT_DIR
    git pull origin main
else
    echo "首次部署，克隆项目..."
    cd /var/www
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

echo ""
echo "5. 清理旧的依赖并重新安装..."
# 清理缓存和旧的依赖
rm -rf node_modules package-lock.json
npm cache clean --force

echo "正在安装所有依赖（包括开发依赖，这可能需要几分钟）..."
npm install

echo ""
echo "6. 配置环境变量..."
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        echo "从 .env.example 复制配置..."
        cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env.production
    else
        echo "创建默认配置..."
        cat > $PROJECT_DIR/.env.production << EOF
# 生产环境配置
NODE_ENV=production
PORT=3000

# Supabase 配置（可选，如果需要云存储功能）
# 访问 https://supabase.com 创建项目获取密钥
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    fi
    echo ""
    echo "⚠️  重要：请编辑 .env.production 文件配置环境变量"
    echo "运行: nano $PROJECT_DIR/.env.production"
    echo ""
    sleep 3
fi

echo ""
echo "7. 构建项目（这可能需要几分钟）..."
npm run build

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败，请检查错误信息"
    exit 1
fi

echo ""
echo "8. 启动/重启应用..."
if pm2 list | grep -q "$PROJECT_NAME"; then
    echo "应用已在运行，重启中..."
    pm2 restart $PROJECT_NAME
else
    echo "首次启动应用..."
    pm2 start ecosystem.config.js
    pm2 save
fi

echo ""
echo "9. 查看应用状态..."
pm2 status

echo ""
echo "==================== 部署完成！ ===================="
echo "应用地址: http://your-server-ip:3000"
echo "查看日志: pm2 logs $PROJECT_NAME"
echo "停止应用: pm2 stop $PROJECT_NAME"
echo "重启应用: pm2 restart $PROJECT_NAME"
echo ""
echo "下一步：配置 Nginx 反向代理（见 nginx.conf 文件）"

