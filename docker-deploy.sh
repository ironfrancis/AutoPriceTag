#!/bin/bash

# AutoPriceTag Docker 部署脚本

set -e

echo "==================== Docker 部署脚本 ===================="

# 配置
IMAGE_NAME="autopricetag"
CONTAINER_NAME="autopricetag"
PORT="3000"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装（可选）
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    USE_COMPOSE=true
    echo "使用 Docker Compose 部署"
else
    USE_COMPOSE=false
    echo "Docker Compose 未安装，使用 Docker 命令部署"
fi

# 停止并删除旧容器
echo ""
echo "1. 清理旧容器..."
if [ "$USE_COMPOSE" = true ]; then
    docker-compose down 2>/dev/null || true
else
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# 构建镜像
echo ""
echo "2. 构建 Docker 镜像..."
if [ "$USE_COMPOSE" = true ]; then
    docker-compose build --no-cache
else
    docker build -t $IMAGE_NAME:latest .
fi

# 运行容器
echo ""
echo "3. 启动容器..."
if [ "$USE_COMPOSE" = true ]; then
    docker-compose up -d
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
else
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        --restart unless-stopped \
        $IMAGE_NAME:latest
    
    echo ""
    echo "查看日志: docker logs -f $CONTAINER_NAME"
    echo "停止服务: docker stop $CONTAINER_NAME"
fi

echo ""
echo "==================== 部署完成！ ===================="
echo "应用地址: http://localhost:$PORT"
echo ""
echo "常用命令："
echo "  查看日志: docker logs -f $CONTAINER_NAME"
echo "  查看状态: docker ps"
echo "  进入容器: docker exec -it $CONTAINER_NAME sh"
echo "  重启: docker restart $CONTAINER_NAME"
echo "  停止: docker stop $CONTAINER_NAME"

