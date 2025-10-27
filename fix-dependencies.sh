#!/bin/bash

# AutoPriceTag 依赖修复脚本
# 用于修复缺失依赖的问题

set -e

echo "==================== 修复依赖问题 ===================="

PROJECT_DIR="/www/wwwroot/autopricelabel"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR"
    echo "请修改脚本中的 PROJECT_DIR 变量"
    exit 1
fi

cd $PROJECT_DIR

echo "1. 检查 Node.js 和 npm 版本..."
node -v
npm -v

echo ""
echo "2. 清理旧的依赖..."
rm -rf node_modules .next package-lock.json
npm cache clean --force

echo ""
echo "3. 重新安装所有依赖（这可能需要 3-5 分钟）..."
npm install

echo ""
echo "4. 检查依赖是否完整..."
npm list --depth=0

echo ""
echo "5. 重新构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 修复成功！"
    echo ""
    echo "6. 重启应用..."
    pm2 restart autopricetag || pm2 start ecosystem.config.js
    echo ""
    echo "修复完成！应用已重启"
else
    echo ""
    echo "✗ 构建失败，请检查错误信息"
    exit 1
fi

echo ""
echo "==================== 修复完成 ===================="

