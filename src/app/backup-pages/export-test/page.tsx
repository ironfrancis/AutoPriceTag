'use client';

import { useRef, useEffect, useState } from 'react';
import { ExportManager } from '@/lib/export';

export default function ExportTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportManager] = useState(() => new ExportManager());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 400;
    canvas.height = 300;

    // 绘制测试内容
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // 绘制文本
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('测试标签', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '16px Arial';
    ctx.fillText('Test Label', canvas.width / 2, canvas.height / 2 + 20);

    // 绘制一些图形
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 50, 50, 50);
    
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(200, 100, 30, 0, 2 * Math.PI);
    ctx.fill();

    // 设置导出管理器
    exportManager.setCanvas(canvas);
    setIsReady(true);
  }, [exportManager]);

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!isReady) {
      alert('画布未准备就绪');
      return;
    }

    try {
      await exportManager.export({
        format,
        productName: 'test-label',
        quality: format === 'jpg' ? 0.9 : 1,
        dpi: 300,
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">导出功能测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">测试画布</h2>
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="border border-gray-300"
              style={{ width: '400px', height: '300px' }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            画布尺寸: 400x300 像素
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">导出测试</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleExport('png')}
              disabled={!isReady}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              导出 PNG
            </button>
            <button
              onClick={() => handleExport('jpg')}
              disabled={!isReady}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              导出 JPG
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={!isReady}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              导出 PDF
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>状态: {isReady ? '✅ 准备就绪' : '⏳ 初始化中...'}</p>
            <p>说明: 点击按钮测试不同格式的导出功能</p>
          </div>
        </div>
      </div>
    </div>
  );
}
