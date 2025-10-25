'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Download, Settings, Grid, RotateCcw } from 'lucide-react';

export default function LayoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaperSize, setSelectedPaperSize] = useState('A4');

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载排版工具...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>返回首页</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">APT</span>
                </div>
                <span className="text-xl font-bold text-gray-900">智能排版</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">纸张尺寸:</span>
                <select
                  value={selectedPaperSize}
                  onChange={(e) => setSelectedPaperSize(e.target.value)}
                  className="input py-1 px-3 text-sm"
                >
                  <option value="A4">A4 (210×297mm)</option>
                  <option value="A5">A5 (148×210mm)</option>
                  <option value="Letter">Letter (216×279mm)</option>
                  <option value="A3">A3 (297×420mm)</option>
                </select>
              </div>
              <button className="btn btn-outline px-4 py-2">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </button>
              <button className="btn btn-primary px-4 py-2">
                <Download className="h-4 w-4 mr-2" />
                导出整页
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左侧标签库 */}
        <div className="w-80 bg-white border-r shadow-sm overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">标签库</h2>
              <button className="btn btn-outline px-3 py-1 text-sm">
                <Plus className="h-4 w-4 mr-1" />
                添加
              </button>
            </div>
            
            {/* 已设计的标签列表 */}
            <div className="space-y-3">
              {/* 示例标签1 */}
              <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">基础简约款</p>
                    <p className="text-xs text-gray-500">40×30mm</p>
                  </div>
                </div>
              </div>

              {/* 示例标签2 */}
              <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded flex flex-col justify-between p-2">
                    <div className="text-center">
                      <div className="inline-block bg-red-600 text-white text-xs px-1 py-0.5 rounded mb-1">促销</div>
                      <div className="text-xs font-medium text-white">商品名称</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white line-through">¥199</div>
                      <div className="text-xs font-bold text-yellow-300">¥99</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">促销活动款</p>
                    <p className="text-xs text-gray-500">50×40mm</p>
                  </div>
                </div>
              </div>

              {/* 示例标签3 */}
              <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-gradient-to-b from-gray-100 to-gray-200 rounded flex flex-col justify-between p-2">
                    <div className="flex items-start justify-between">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-blue-600">商品名称</div>
                        <div className="text-xs font-bold text-gray-900">¥299</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">高端品质</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">高端质感款</p>
                    <p className="text-xs text-gray-500">60×50mm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 拖拽提示 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 拖拽标签到右侧画板进行排版
              </p>
            </div>
          </div>
        </div>

        {/* 右侧画板预览区 */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedPaperSize} 纸张排版预览
              </h3>
              <p className="text-sm text-gray-600">智能排版 + 手动调整</p>
            </div>
            
            {/* 画板区域 */}
            <div className="relative">
              {/* A4 纸张比例预览 */}
              <div className="w-96 h-[calc(96*297/210)] bg-white border-2 border-gray-300 rounded-lg shadow-inner relative overflow-hidden">
                {/* 网格背景 */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* 示例标签布局 */}
                <div className="absolute top-4 left-4">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-4 left-24">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-4 left-44">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-4 left-64">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-4 left-84">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                {/* 第二行 */}
                <div className="absolute top-20 left-4">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-24">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-44">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-64">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-84">
                  <div className="w-16 h-12 bg-white border border-gray-200 rounded flex flex-col justify-between p-2 shadow-sm">
                    <div className="text-xs font-medium text-gray-900">商品名称</div>
                    <div className="text-xs font-bold text-blue-600 text-right">¥99.00</div>
                  </div>
                </div>
              </div>
              
              {/* 画板工具栏 */}
              <div className="absolute -top-12 left-0 flex items-center space-x-2">
                <button className="btn btn-outline px-3 py-1 text-sm">
                  <Grid className="h-4 w-4 mr-1" />
                  网格
                </button>
                <button className="btn btn-outline px-3 py-1 text-sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  重置布局
                </button>
                <button className="btn btn-outline px-3 py-1 text-sm">
                  智能排版
                </button>
              </div>
            </div>
            
            {/* 排版信息 */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
                <span>标签数量: <strong className="text-gray-900">10</strong></span>
                <span>纸张利用率: <strong className="text-gray-900">85%</strong></span>
                <span>预计打印页数: <strong className="text-gray-900">1</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部功能区 */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="btn btn-outline px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              添加标签
            </button>
            <button className="btn btn-outline px-4 py-2">
              批量操作
            </button>
            <button className="btn btn-outline px-4 py-2">
              打印预览
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              自动保存: <span className="text-green-600">已启用</span>
            </span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              问题反馈
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
