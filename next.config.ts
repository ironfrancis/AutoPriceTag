import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 确保静态导出兼容性
  output: 'standalone',
  
  // 图片优化
  images: {
    unoptimized: true,
  },
  
  // 确保客户端组件正确标记
  transpilePackages: ['fabric', 'html2canvas', 'jspdf'],
};

export default nextConfig;
