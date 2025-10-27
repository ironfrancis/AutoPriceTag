module.exports = {
  apps: [{
    name: 'autopricetag-dev',
    script: 'node_modules/next/dist/bin/next',
    args: 'dev',
    instances: 1,
    exec_mode: 'fork',  // 开发模式使用 fork
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    error_file: './logs/dev-err.log',
    out_file: './logs/dev-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: true,  // 自动重启（可选）
    ignore_watch: ['node_modules', '.next', '.git'],
  }]
};

