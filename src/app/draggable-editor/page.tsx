'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, Download } from 'lucide-react';
import { ProductData } from '@/lib/types';
import ProductForm from '@/components/editor/ProductForm';
import SizeInput from '@/components/editor/SizeInput';
import FontCustomizer, { FontConfig } from '@/components/editor/FontCustomizer';

// 动态导入 Konva 组件，禁用 SSR
const DraggableLabelCanvas = dynamic(
  () => import('@/components/editor/DraggableLabelCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">正在加载画布...</p>
        </div>
      </div>
    )
  }
);

export default function DraggableEditorPage() {
  const [productData, setProductData] = useState<ProductData>({
    name: '高端无线蓝牙耳机',
    price: 299,
    brand: 'TechSound',
    sellingPoints: ['降噪技术', '40小时续航'],
    specs: { 颜色: '黑色', 重量: '50g' },
    customFields: {},
  });
  
  const [labelSize, setLabelSize] = useState({ width: 80, height: 50 });
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  const [editable, setEditable] = useState(true); // 编辑模式开关
  
  const [fontConfigs, setFontConfigs] = useState<Record<string, FontConfig>>({
    product_name: {
      fontSize: 16,
      fontWeight: 500,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    brand: {
      fontSize: 12,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#6B7280',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    product_price: {
      fontSize: 20,
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#2563eb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    selling_points: {
      fontSize: 10,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#4B5563',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    specs: {
      fontSize: 9,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#6B7280',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  });

  const handleProductDataChange = (data: ProductData) => {
    setProductData(data);
  };

  const handleSizeChange = (size: { width: number; height: number }) => {
    setLabelSize(size);
  };

  const handleCanvasReady = (stage: any) => {
    setCanvasInstance(stage);
  };

  const handleFontConfigChange = (field: string, config: FontConfig) => {
    setFontConfigs(prev => ({
      ...prev,
      [field]: config
    }));
  };

  const handleExport = async () => {
    if (!canvasInstance) {
      alert('画布未准备就绪');
      return;
    }

    try {
      // Konva的导出方法
      const dataURL = canvasInstance.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 3 // 高DPI导出
      });

      // 下载
      const link = document.createElement('a');
      link.download = `${productData.name || 'label'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  return (
    <div className="h-screen bg-stone-50 flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <nav className="bg-stone-100 border-b border-stone-200 shadow-sm flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/editor"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">返回标准编辑器</span>
              </Link>
              <div className="h-6 w-px bg-stone-300"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-heading text-gray-900">可拖拽标签编辑器</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 编辑模式切换 */}
              <button
                onClick={() => setEditable(!editable)}
                className={`btn px-4 py-2 text-sm font-medium ${
                  editable 
                    ? 'btn-primary' 
                    : 'btn-outline'
                }`}
              >
                {editable ? (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    编辑模式
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    预览模式
                  </>
                )}
              </button>
              
              <button 
                onClick={handleExport}
                className="btn btn-outline px-4 py-2 text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                导出PNG
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧预览区 - 3/4 宽度 */}
        <div className="flex-[3] flex flex-col min-w-0">
          {/* 画布预览区域 - 固定80%高度 */}
          <div className="h-[80%] bg-stone-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full h-full flex flex-col">
              <div className="text-center mb-3 flex-shrink-0">
                <h3 className="text-subheading text-gray-900 mb-1">
                  可拖拽标签预览
                  {editable && <span className="ml-2 text-xs text-green-600">(点击并拖动元素调整位置)</span>}
                </h3>
                <p className="text-caption text-gray-600">
                  {editable ? '拖动元素调整布局，点击切换到预览模式' : '切换到编辑模式以调整布局'}
                </p>
              </div>
              
              {/* 可拖拽画布 */}
              <div className="flex justify-center flex-1 min-h-0">
                <DraggableLabelCanvas
                  labelSize={labelSize}
                  productData={productData}
                  fontConfigs={fontConfigs}
                  editable={editable}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
            </div>
          </div>

          {/* 尺寸控制区 - 固定20%高度 */}
          <div className="h-[20%] bg-stone-50 border-t border-stone-200 p-3 overflow-y-auto">
            <div className="flex items-start justify-center h-full">
              <div className="w-full max-w-lg">
                <SizeInput
                  currentSize={labelSize}
                  onSizeChange={handleSizeChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧操作区 - 1/4 宽度 */}
        <div className="flex-1 bg-stone-50 border-l border-stone-200 shadow-sm overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-stone-200 bg-stone-100">
              <h2 className="text-subheading text-gray-900">商品信息编辑</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">
                {/* 商品信息表单 */}
                <ProductForm
                  initialData={productData}
                  onChange={handleProductDataChange}
                />
                
                {/* 字体自定义 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">字体设置</h3>
                  
                  <FontCustomizer
                    title="商品名称"
                    config={fontConfigs.product_name}
                    onChange={(config) => handleFontConfigChange('product_name', config)}
                  />
                  
                  <FontCustomizer
                    title="品牌"
                    config={fontConfigs.brand}
                    onChange={(config) => handleFontConfigChange('brand', config)}
                  />
                  
                  <FontCustomizer
                    title="价格"
                    config={fontConfigs.product_price}
                    onChange={(config) => handleFontConfigChange('product_price', config)}
                  />
                  
                  <FontCustomizer
                    title="卖点"
                    config={fontConfigs.selling_points}
                    onChange={(config) => handleFontConfigChange('selling_points', config)}
                  />
                  
                  <FontCustomizer
                    title="规格"
                    config={fontConfigs.specs}
                    onChange={(config) => handleFontConfigChange('specs', config)}
                  />
                </div>

                {/* 使用提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">💡 使用提示</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 点击元素可选中</li>
                    <li>• 拖动元素调整位置</li>
                    <li>• 切换到预览模式查看最终效果</li>
                    <li>• 导出功能保留当前布局</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

