const fs = require('fs');
const path = require('path');

// 读取 .env.production 文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.production');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key) {
        const value = valueParts.join('=');
        env[key.trim()] = value.trim();
      }
    }
  });

  return env;
}

const envVars = loadEnvFile();

module.exports = {
  apps: [{
    name: 'autopricetag',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // 从 .env.production 加载的环境变量
      ...envVars,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};

