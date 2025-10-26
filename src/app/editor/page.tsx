'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Download, HelpCircle, ArrowLeft, FolderOpen } from 'lucide-react';
import { ProductData } from '@/lib/types';
import { ExportManager } from '@/lib/export';
import { saveLabel } from '@/lib/db';
import LabelCanvas from '@/components/editor/LabelCanvas';
import ProductForm from '@/components/editor/ProductForm';
import SizeInput from '@/components/editor/SizeInput';
import SavedLabelsDialog from '@/components/editor/SavedLabelsDialog';
import FontCustomizer, { FontConfig } from '@/components/editor/FontCustomizer';

export default function EditorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    price: 0,
    brand: '',
    sellingPoints: [''],
    specs: {},
    customFields: {},
  });
  const [labelSize, setLabelSize] = useState({ width: 65, height: 35 });
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  const [exportManager] = useState(() => new ExportManager());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showSavedLabels, setShowSavedLabels] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // 字体配置状态
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
    price: {
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

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // 超过200ms才显示加载动画
    const animationTimer = setTimeout(() => {
      setShowLoadingAnimation(true);
    }, 200);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  // 点击外部区域关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as Element;
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

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

  const handleFontConfigChange = (field: string, config: FontConfig) => {
    setFontConfigs(prev => ({
      ...prev,
      [field]: config
    }));
  };

  const handleLoadLabel = (label: any) => {
    setProductData(label.productData);
    setLabelSize(label.labelSize);
    setSaveMessage('标签加载成功！');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!canvasInstance || !productData.name.trim()) {
      alert('请先填写商品名称');
      return;
    }

    if (labelSize.width <= 0 || labelSize.height <= 0) {
      alert('请先设置标签尺寸');
      return;
    }

    setIsSaving(true);
    try {
      // 生成缩略图
      const thumbnail = canvasInstance.toDataURL('image/png', 0.3);
      
      // 保存标签
      const labelName = productData.name || `标签_${new Date().toLocaleString()}`;
      await saveLabel({
        name: labelName,
        labelSize,
        productData,
        thumbnail,
      });

      setSaveMessage('标签保存成功！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!canvasInstance) {
      alert('画布未准备就绪');
      return;
    }

    if (labelSize.width <= 0 || labelSize.height <= 0) {
      alert('请先设置标签尺寸');
      return;
    }

    if (!productData.name.trim()) {
      alert('请先填写商品名称');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Starting export with:', {
        format,
        productName: productData.name,
        labelSize,
        canvasSize: { width: canvasInstance.width, height: canvasInstance.height }
      });

      // 确保画布内容已完全渲染（增加等待时间确保渲染完成）
      await new Promise(resolve => setTimeout(resolve, 200));

      // 验证Canvas内容
      const ctx = canvasInstance.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvasInstance.width, canvasInstance.height);
        const hasContent = imageData.data.some((pixel: number, index: number) => {
          // 检查非alpha通道的像素
          return index % 4 !== 3 && pixel !== 0;
        });
        
        console.log('Canvas content validation:', { 
          hasContent, 
          width: canvasInstance.width, 
          height: canvasInstance.height 
        });
        
        if (!hasContent) {
          throw new Error('Canvas内容为空，请稍后重试');
        }
      }

      await exportManager.export({
        format,
        productName: productData.name || 'price_tag',
        quality: format === 'jpg' ? 0.9 : 1,
        dpi: 300,
      });

      console.log('Export completed successfully');
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          {showLoadingAnimation && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在加载编辑器...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-50 flex flex-col overflow-hidden">
      {/* 顶部导航栏 - 固定高度 */}
      <nav className="bg-stone-100 border-b border-stone-200 shadow-sm flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">返回首页</span>
              </Link>
              <div className="h-6 w-px bg-stone-300"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">APT</span>
                </div>
                <span className="text-heading text-gray-900">智能标签编辑器</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 预设尺寸选择器 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">预设尺寸:</span>
                <select
                  value={`${labelSize.width}x${labelSize.height}`}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number);
                    handleSizeChange({ width, height });
                  }}
                  className="text-sm font-medium border border-stone-300 rounded px-2 py-1 bg-white text-gray-700"
                >
                  <option value="50x30">小标签 (50×30)</option>
                  <option value="80x50">标准标签 (80×50)</option>
                  <option value="100x60">大标签 (100×60)</option>
                  <option value="120x40">横版标签 (120×40)</option>
                  <option value="60x100">竖版标签 (60×100)</option>
                  <option value="80x80">方形标签 (80×80)</option>
                </select>
              </div>
              
              <div className="h-6 w-px bg-stone-300"></div>
              
              <button 
                onClick={() => setShowSavedLabels(true)}
                className="btn btn-outline px-4 py-2 text-sm font-medium"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                我的标签
              </button>
              
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '保存中...' : '保存标签'}
              </button>
              
              <div className="relative export-menu-container">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="btn btn-outline px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? '导出中...' : '导出'}
                </button>
                <div className={`absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${showExportMenu ? 'block' : 'hidden'}`}>
                  <button
                    onClick={() => {
                      handleExport('png');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                  >
                    PNG 图片
                  </button>
                  <button
                    onClick={() => {
                      handleExport('jpg');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    JPG 图片
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg"
                  >
                    PDF 文档
                  </button>
                </div>
              </div>
              
              <button className="btn btn-outline px-4 py-2 text-sm font-medium">
                <HelpCircle className="h-4 w-4 mr-2" />
                帮助
              </button>
              
              {saveMessage && (
                <div className="text-sm text-green-600 font-medium">
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 - 占据剩余空间 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧预览区 - 3/4 宽度 */}
        <div className="flex-[3] flex flex-col min-w-0">
          {/* 画布预览区域 - 固定80%高度 */}
          <div className="h-[80%] bg-stone-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full h-full flex flex-col">
              <div className="text-center mb-3 flex-shrink-0">
                <h3 className="text-subheading text-gray-900 mb-1">智能标签预览</h3>
                <p className="text-caption text-gray-600">系统自动计算最优布局和字体大小</p>
              </div>
              
              {/* 智能画布 */}
              <div className="flex justify-center flex-1 min-h-0">
                <LabelCanvas
                  labelSize={labelSize}
                  productData={productData}
                  fontConfigs={fontConfigs}
                  isExporting={isExporting}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
            </div>
          </div>

          {/* 尺寸控制区 - 固定20%高度 */}
          <div className="h-[20%] bg-stone-50 border-t border-stone-200 p-3 overflow-y-auto">
            <div className="flex items-start justify-center h-full">
              {/* 尺寸编辑器 */}
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
                    config={fontConfigs.price}
                    onChange={(config) => handleFontConfigChange('price', config)}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 已保存标签对话框 */}
      <SavedLabelsDialog
        isOpen={showSavedLabels}
        onClose={() => setShowSavedLabels(false)}
        onLoadLabel={handleLoadLabel}
      />
    </div>
  );
}