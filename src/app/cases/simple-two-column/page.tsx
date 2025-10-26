'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Tag, Palette, Settings, Copy } from 'lucide-react';

export default function SimpleTwoColumnDemo() {
  const [selectedTheme, setSelectedTheme] = useState('经典粉红');
  const [selectedSize, setSelectedSize] = useState('中号');

  // 颜色主题
  const colorThemes = [
    {
      name: '经典粉红',
      colors: {
        border: '#FFB6C1',
        text: '#000000',
        price: '#DC143C',
        brand: '#999999'
      }
    },
    {
      name: '商务蓝',
      colors: {
        border: '#B3D9FF',
        text: '#000000',
        price: '#1976D2',
        brand: '#666666'
      }
    },
    {
      name: '清新绿',
      colors: {
        border: '#C8E6C9',
        text: '#000000',
        price: '#388E3C',
        brand: '#666666'
      }
    }
  ];

  // 尺寸变体
  const sizeVariants = [
    {
      name: '小号',
      size: { width: 40, height: 24 },
      ratio: '5:3'
    },
    {
      name: '中号',
      size: { width: 50, height: 30 },
      ratio: '5:3'
    },
    {
      name: '大号',
      size: { width: 60, height: 36 },
      ratio: '5:3'
    }
  ];

  const currentTheme = colorThemes.find(t => t.name === selectedTheme) || colorThemes[0];
  const currentSize = sizeVariants.find(s => s.name === selectedSize) || sizeVariants[1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/cases" className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">返回案例</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                编辑器
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                文档
              </Link>
              <Link href="/layout-templates" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                布局模板
              </Link>
              <Link href="/cases" className="text-blue-600 font-medium text-sm">
                案例展示
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            简洁双栏标价签设计
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于您提供的设计案例，我们创建了这个简洁优雅的双栏布局标价签模板
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：设计预览 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                设计预览
              </h2>
              
              {/* 标价签预览 */}
              <div className="flex justify-center mb-6">
                <div 
                  className="bg-white border-2 rounded-lg shadow-lg relative overflow-hidden"
                  style={{ 
                    width: `${currentSize.size.width * 4}px`, 
                    height: `${currentSize.size.height * 4}px`,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  {/* 左侧栏 */}
                  <div className="absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center items-center">
                    <div 
                      className="text-xs mb-2"
                      style={{ color: currentTheme.colors.brand }}
                    >
                      品牌
                    </div>
                    <div 
                      className="text-lg font-bold text-center"
                      style={{ color: currentTheme.colors.text }}
                    >
                      爱好
                    </div>
                  </div>
                  
                  {/* 分割线 */}
                  <div 
                    className="absolute left-1/2 top-0 w-px h-full"
                    style={{ backgroundColor: '#E0E0E0' }}
                  />
                  
                  {/* 右侧栏 */}
                  <div className="absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center">
                    <div 
                      className="text-xs mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      热可擦 红
                    </div>
                    <div 
                      className="text-lg font-bold text-center"
                      style={{ color: currentTheme.colors.price }}
                    >
                      3元
                    </div>
                  </div>
                </div>
              </div>

              {/* 尺寸信息 */}
              <div className="text-center text-sm text-gray-600">
                {currentSize.size.width} × {currentSize.size.height} mm ({currentSize.ratio})
              </div>
            </div>

            {/* 设计特点 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">设计特点</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">简洁的双栏布局，信息层次清晰</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">品牌和价格信息突出显示</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">适合小商品和文具用品</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">多种颜色主题可选</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：自定义选项 */}
          <div className="space-y-6">
            {/* 颜色主题选择 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-blue-600" />
                颜色主题
              </h3>
              <div className="space-y-3">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme.name)}
                    className={`w-full p-3 rounded-lg border-2 transition-colors ${
                      selectedTheme === theme.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{theme.name}</span>
                      <div className="flex space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: theme.colors.border }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: theme.colors.price }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: theme.colors.text }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸选择 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                尺寸选择
              </h3>
              <div className="space-y-3">
                {sizeVariants.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`w-full p-3 rounded-lg border-2 transition-colors ${
                      selectedSize === size.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{size.name}</span>
                      <span className="text-sm text-gray-600">
                        {size.size.width} × {size.size.height} mm ({size.ratio})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">开始使用</h3>
              <div className="space-y-3">
                <Link
                  href="/editor?template=simple-two-column"
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  使用此模板
                </Link>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  <Copy className="h-5 w-5 mr-2" />
                  复制模板
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition-colors">
                  <Download className="h-5 w-5 mr-2" />
                  下载模板
                </button>
              </div>
            </div>

            {/* 适用场景 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">适用场景</h3>
              <div className="flex flex-wrap gap-2">
                {['文具店', '日用品', '小商品', '便利店', '杂货店'].map((scene) => (
                  <span
                    key={scene}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            设计说明
          </h2>
          <div className="max-w-4xl mx-auto text-gray-600 space-y-4">
            <p>
              这个简洁双栏标价签设计灵感来源于您提供的案例，采用了经典的双栏布局结构。
              左侧栏突出显示品牌信息，右侧栏重点展示价格，通过视觉分割线清晰区分不同信息区域。
            </p>
            <p>
              设计特点包括：简洁的视觉层次、突出的价格显示、适合小尺寸打印、多种颜色主题可选。
              特别适合文具用品、日用品等小商品的标价需求。
            </p>
            <p>
              您可以根据实际需求调整颜色主题、尺寸规格，或者直接在编辑器中修改文字内容和样式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
