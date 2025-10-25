'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Download, HelpCircle, ArrowLeft } from 'lucide-react';
import { ProductData } from '@/lib/types';
import { ExportManager } from '@/lib/export';
import LabelCanvas from '@/components/editor/LabelCanvas';
import ProductForm from '@/components/editor/ProductForm';
import SizeInput from '@/components/editor/SizeInput';

export default function EditorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<ProductData>({
    name: '示例商品',
    price: 99.00,
    brand: '示例品牌',
    sellingPoints: ['优质材料', '精美包装'],
    specs: { '规格': '标准版', '颜色': '经典黑' },
    customFields: {},
  });
  const [labelSize, setLabelSize] = useState({ width: 80, height: 50 });
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  const [exportManager] = useState(() => new ExportManager());

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleProductDataChange = (data: ProductData) => {
    setProductData(data);
  };

  const handleSizeChange = (size: { width: number; height: number }) => {
    setLabelSize(size);
  };

  const handleCanvasReady = (canvas: any) => {
    setCanvasInstance(canvas);
    exportManager.setCanvas(canvas);
  };

  const handleSave = () => {
    // TODO: 实现保存功能
    console.log('保存价签设计', { labelSize, productData });
  };

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!canvasInstance) {
      alert('画布未准备就绪');
      return;
    }

    try {
      await exportManager.export({
        format,
        productName: productData.name || 'price_tag',
        quality: format === 'jpg' ? 0.9 : 1,
        dpi: 300,
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载编辑器...</p>
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
                <span className="text-xl font-bold text-gray-900">智能标签编辑器</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSave}
                className="btn btn-outline px-4 py-2"
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </button>
              
              <div className="relative">
                <button className="btn btn-outline px-4 py-2">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleExport('png')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                  >
                    PNG 图片
                  </button>
                  <button
                    onClick={() => handleExport('jpg')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    JPG 图片
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg"
                  >
                    PDF 文档
                  </button>
                </div>
              </div>
              <button className="btn btn-outline px-4 py-2">
                <HelpCircle className="h-4 w-4 mr-2" />
                帮助
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左侧操作区 */}
        <div className="w-80 bg-white border-r shadow-sm overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* 商品信息表单 */}
            <ProductForm
              initialData={productData}
              onChange={handleProductDataChange}
            />
          </div>
        </div>

        {/* 右侧预览区 */}
        <div className="flex-1 flex flex-col">
          {/* 尺寸输入区域 */}
          <div className="bg-white border-b p-4">
            <SizeInput
              currentSize={labelSize}
              onSizeChange={handleSizeChange}
            />
          </div>

          {/* 画布预览区域 */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">智能标签预览</h3>
                <p className="text-sm text-gray-600">系统自动计算最优布局和字体大小</p>
              </div>
              
              {/* 智能画布 */}
              <div className="flex justify-center">
                <LabelCanvas
                  labelSize={labelSize}
                  productData={productData}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部功能区 */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">快速导出:</span>
              <button 
                onClick={() => handleExport('png')}
                className="btn btn-outline px-3 py-1 text-sm"
              >
                PNG
              </button>
              <button 
                onClick={() => handleExport('jpg')}
                className="btn btn-outline px-3 py-1 text-sm"
              >
                JPG
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="btn btn-outline px-3 py-1 text-sm"
              >
                PDF
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>标签尺寸: {labelSize.width}×{labelSize.height}mm</span>
            <span>•</span>
            <span>智能排版已启用</span>
          </div>
        </div>
      </div>
    </div>
  );
}