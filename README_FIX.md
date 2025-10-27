# 修复服务器依赖问题

## 问题描述

如果您在服务器上遇到以下错误：

```
Error: Cannot find module '@jridgewell/sourcemap-codec'
```

这通常是因为依赖安装不完整导致的。

## 快速修复

### 方法一：使用修复脚本（推荐）

```bash
# 1. 登录服务器
ssh user@your-server

# 2. 下载修复脚本
cd /www/wwwroot/autopricelabel
wget https://gitee.com/mmsdfrancis/autopricelabel/raw/main/fix-dependencies.sh
chmod +x fix-dependencies.sh

# 3. 运行修复脚本（如果脚本在项目根目录）
bash fix-dependencies.sh
```

### 方法二：手动修复

```bash
# 1. 进入项目目录
cd /www/wwwroot/autopricelabel

# 2. 清理旧的依赖
rm -rf node_modules package-lock.json .next
npm cache clean --force

# 3. 重新安装依赖
npm install

# 4. 重新构建
npm run build

# 5. 重启应用
pm2 restart autopricetag
```

### 方法三：完全重新部署

```bash
# 1. 停止应用
pm2 stop autopricetag

# 2. 删除项目目录
rm -rf /www/wwwroot/autopricelabel

# 3. 重新克隆并部署
git clone https://gitee.com/mmsdfrancis/autopricelabel.git /www/wwwroot/autopricelabel
cd /www/wwwroot/autopricelabel
chmod +x deploy.sh
bash deploy.sh
```

## 常见问题

### Q1: 为什么会出现这个错误？

**A:** 可能是因为：
1. 使用 `npm install --production` 只安装了生产依赖
2. 依赖安装过程中断
3. node_modules 目录损坏

### Q2: 如何避免这个问题？

**A:** 确保：
1. 使用 `npm install`（不是 `--production`）
2. 不要中断安装过程
3. 使用最新的部署脚本

### Q3: 修复后还是报错怎么办？

**A:** 尝试：
1. 检查 Node.js 版本（需要 Node.js 16+）
2. 更新 npm: `npm install -g npm@latest`
3. 完全重新部署

### Q4: 安装依赖太慢怎么办？

**A:** 使用 npm 国内镜像：
```bash
# 临时使用镜像
npm install --registry=https://registry.npmmirror.com

# 永久配置镜像
npm config set registry https://registry.npmmirror.com
```

## 验证修复

修复完成后，检查应用状态：

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs autopricetag

# 检查端口
netstat -tulpn | grep 3000
```

如果日志中没有错误，应用正常运行，说明修复成功！

## 最佳实践

1. **定期备份**
   ```bash
   tar -czf backup-$(date +%Y%m%d).tar.gz /www/wwwroot/autopricelabel
   ```

2. **监控依赖版本**
   ```bash
   npm outdated
   npm update
   ```

3. **使用正确的安装命令**
   - ❌ `npm install --production` (会缺少依赖)
   - ✅ `npm install` (安装所有依赖)

## 联系支持

如果以上方法都无法解决问题，请提供：
1. Node.js 版本：`node -v`
2. npm 版本：`npm -v`
3. 完整的错误日志：`pm2 logs autopricetag --lines 100`
4. 操作系统信息：`uname -a`

