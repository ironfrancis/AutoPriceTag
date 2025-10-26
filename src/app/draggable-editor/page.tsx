'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductData, LabelDesign, LayoutElement } from '@/lib/types';
import { useLabelDesign } from '@/lib/hooks/useLabelDesign';
import ProductForm from '@/components/editor/ProductForm';
import SizeInput from '@/components/editor/SizeInput';
import FontCustomizer, { FontConfig } from '@/components/editor/FontCustomizer';
import PositionControl from '@/components/editor/PositionControl';
import DesignListDialog from '@/components/editor/DesignListDialog';
import ElementPropertyEditor from '@/components/editor/ElementPropertyEditor';
import CloudSyncButton from '@/components/editor/CloudSyncButton';
import { saveDesignToCloud, loadDesignsFromCloud } from '@/lib/storage/cloud-storage';

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
  // 使用统一的数据管理 hook
  const {
    design,
    updateProductData,
    updateLabelSize,
    updateLayoutElements,
    updateLayoutElement,
    updateFontConfig,
    updateAllFontConfigs,
    exportDesign,
    importDesign,
    saveToLocalStorage,
    loadFromLocalStorage,
    hasStoredDesign,
  } = useLabelDesign();

  // UI 状态
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementPosition, setSelectedElementPosition] = useState<{ x: number; y: number } | null>(null);
  const [isProductFormExpanded, setIsProductFormExpanded] = useState(false);
  const [hasStoredDesignState, setHasStoredDesignState] = useState(false);
  const [isDesignListOpen, setIsDesignListOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const getElementsRef = useRef<(() => any[]) | null>(null);
  
  // 监听选中元素的位置变化（拖拽时）
  useEffect(() => {
    if (!selectedElementId) {
      setSelectedElementPosition(null);
      return;
    }
    
    const interval = setInterval(() => {
      if (getElementsRef.current) {
        const elements = getElementsRef.current();
        const element = elements.find(el => el.id === selectedElementId);
        if (element) {
          setSelectedElementPosition({ x: element.x, y: element.y });
        }
      }
    }, 100); // 每100ms检查一次
    
    return () => clearInterval(interval);
  }, [selectedElementId]);
  
  // 处理元素选择
  const handleElementSelect = (elementId: string | null) => {
    setSelectedElementId(elementId);
    
    // 获取元素位置
    if (elementId && getElementsRef.current) {
      const elements = getElementsRef.current();
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setSelectedElementPosition({ x: element.x, y: element.y });
      }
    } else {
      setSelectedElementPosition(null);
    }
  };
  
  // 处理位置改变
  const handlePositionChange = (x: number, y: number) => {
    if (!selectedElementId) return;
    
    // 通过 ref 更新元素位置
    if (getElementsRef.current) {
      const elements = getElementsRef.current();
      const elementIndex = elements.findIndex(el => el.id === selectedElementId);
      if (elementIndex !== -1) {
        // 触发画布重新绘制
        if (canvasInstance && (canvasInstance as any).updateElementPosition) {
          (canvasInstance as any).updateElementPosition(selectedElementId, x, y);
        }
        setSelectedElementPosition({ x, y });
      }
    }
  };
  
  // 画布始终可编辑
  const editable = true;

  // 初始化设计数据（如果没有从 LocalStorage 加载的数据）
  useEffect(() => {
    // 检查是否已有数据
    if (design.productData.name === '' && !hasStoredDesign()) {
      const initialDesign: LabelDesign = {
        labelId: undefined,
        labelName: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        labelSize: { width: 80, height: 50 },
        productData: {
          name: '高端无线蓝牙耳机',
          price: 299,
          brand: 'TechSound',
          sellingPoints: ['降噪技术', '40小时续航'],
          specs: { 颜色: '黑色', 重量: '50g' },
          customFields: {},
        },
        layout: { elements: [] },
        fontConfigs: {
          product_name: {
            fontSize: 16,
            fontWeight: 500,
            fontStyle: 'normal' as const,
            textAlign: 'left' as const,
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          },
          brand: {
            fontSize: 12,
            fontWeight: 400,
            fontStyle: 'normal' as const,
            textAlign: 'left' as const,
            color: '#6B7280',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          },
          product_price: {
            fontSize: 20,
            fontWeight: 600,
            fontStyle: 'normal' as const,
            textAlign: 'center' as const,
            color: '#2563eb',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          },
          selling_points: {
            fontSize: 10,
            fontWeight: 400,
            fontStyle: 'normal' as const,
            textAlign: 'left' as const,
            color: '#4B5563',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          },
          specs: {
            fontSize: 9,
            fontWeight: 400,
            fontStyle: 'normal' as const,
            textAlign: 'left' as const,
            color: '#6B7280',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }
        },
        settings: { editable: true }
      };
      
      importDesign(initialDesign);
    }
  }, [design.productData.name, hasStoredDesign, importDesign]);

  // 检查是否有保存的设计
  useEffect(() => {
    const stored = hasStoredDesign();
    setHasStoredDesignState(stored);
  }, [hasStoredDesign, design]);

  // 使用设计数据
  const productData = design.productData;
  const labelSize = design.labelSize;
  const fontConfigs = design.fontConfigs;

  /**
   * 获取元素显示名称
   * 根据元素ID返回友好的中文名称
   */
  const getElementDisplayName = (elementId: string): string => {
    if (elementId === 'product_name') return '商品名称区';
    if (elementId === 'product_price') return '价格区';
    if (elementId === 'brand') return '品牌区';
    
    // 卖点
    if (elementId.startsWith('selling_point_')) {
      const index = elementId.replace('selling_point_', '');
      return `卖点 ${parseInt(index) + 1}`;
    }
    
    // 规格
    if (elementId.startsWith('spec_')) {
      const fieldKey = elementId.replace('spec_', '').replace(/_/g, ' ');
      return `规格: ${fieldKey}`;
    }
    
    // 自定义字段
    if (elementId.startsWith('custom_')) {
      const fieldKey = elementId.replace('custom_', '').replace(/_/g, ' ');
      return `自定义: ${fieldKey}`;
    }
    
    return elementId;
  };

  const handleProductDataChange = (data: ProductData) => {
    updateProductData(data);
  };

  /**
   * 处理标签尺寸变化
   * 
   * 核心逻辑：
   * 1. 所有元素的位置都保存为相对百分比（0-100）
   * 2. 当尺寸变化时，画布组件会自动根据百分比重新计算像素位置
   * 3. 不需要手动处理位置更新，因为使用相对位置存储
   * 4. 画布的 useEffect 会自动监听 labelSize 变化并重新渲染
   */
  const handleSizeChange = (newSize: { width: number; height: number }) => {
    // 更新标签尺寸
    updateLabelSize(newSize);
    
    // 提示用户元素位置已自动调整
    if (design.layout.elements && design.layout.elements.length > 0) {
      showToastMsg('✅ 标签尺寸已更新，元素位置已自动调整');
    }
  };

  const handleCanvasReady = (stage: any) => {
    setCanvasInstance(stage);
  };

  const handleGetElements = (getElements: () => any[]) => {
    getElementsRef.current = getElements;
  };

  const handleFontConfigChange = (elementId: string, config: FontConfig) => {
    updateFontConfig(elementId, config);
  };

  /**
   * 元素删除功能
   * 
   * 设计理念：
   * 1. 删除实际上是标记元素为不可见（visible: false）
   * 2. 避免破坏已保存的布局数据
   * 3. 用户可以通过重新添加字段来恢复显示
   */
  const handleDeleteElement = (elementId: string) => {
    // 从当前元素列表中找到该元素
    const currentElements = getElementsRef.current?.() || [];
    const element = currentElements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // 更新 layout 中的 elements，标记为不可见
    const updatedElements = design.layout.elements.map(el =>
      el.id === elementId ? { ...el, visible: false } : el
    );
    
    updateLayoutElements(updatedElements);
    
    // 取消选择
    setSelectedElementId(null);
    setSelectedElementPosition(null);
    
    showToastMsg('✅ 元素已隐藏');
  };

  /**
   * 处理元素文本变更
   * 
   * 支持所有类型的元素：
   * 1. 核心字段：直接更新
   * 2. 卖点：按索引更新对应数组元素
   * 3. 规格：按 fieldKey 更新对应键值对
   * 4. 自定义字段：按 fieldKey 更新对应键值对
   */
  const handleTextChange = (elementId: string, newText: string) => {
    // 核心字段
    if (elementId === 'product_name') {
      updateProductData({ ...productData, name: newText });
    } else if (elementId === 'brand') {
      updateProductData({ ...productData, brand: newText });
    } else if (elementId === 'product_price') {
      // 价格需要解析数值
      const price = parseFloat(newText.replace('¥', '').trim()) || 0;
      updateProductData({ ...productData, price });
    } 
    // 卖点：每个卖点独立编辑
    else if (elementId.startsWith('selling_point_')) {
      const index = parseInt(elementId.replace('selling_point_', ''));
      const sellingPoints = productData.sellingPoints || [];
      if (sellingPoints[index] !== undefined) {
        const newSellingPoints = [...sellingPoints];
        newSellingPoints[index] = newText;
        updateProductData({ ...productData, sellingPoints: newSellingPoints });
      }
    }
    // 规格：需要从 layout 获取 fieldKey
    else if (elementId.startsWith('spec_')) {
      const originalElement = design.layout.elements.find(e => e.id === elementId);
      const fieldKey = originalElement?.fieldKey;
      
      if (fieldKey) {
        // 提取规格值（格式："颜色: 黑色" 或直接是值）
        let value = newText;
        if (newText.includes(':')) {
          value = newText.split(':').slice(1).join(':').trim();
        }
        
        const newSpecs = { ...productData.specs };
        newSpecs[fieldKey] = value;
        updateProductData({ ...productData, specs: newSpecs });
      }
    }
    // 自定义字段：需要从 layout 获取 fieldKey
    else if (elementId.startsWith('custom_')) {
      const originalElement = design.layout.elements.find(e => e.id === elementId);
      const fieldKey = originalElement?.fieldKey;
      
      if (fieldKey) {
        // 提取字段值（格式："产地: 中国" 或直接是值）
        let value = newText;
        if (newText.includes(':')) {
          value = newText.split(':').slice(1).join(':').trim();
        }
        
        const newCustomFields = { ...productData.customFields };
        newCustomFields[fieldKey] = value;
        updateProductData({ ...productData, customFields: newCustomFields });
      }
    }
  };

  // Toast 提示函数
  const showToastMsg = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  /**
   * 保存标签设计
   * 
   * 核心设计：
   * 1. 获取画布上所有元素的最新位置
   * 2. 将绝对像素位置转换为相对百分比（0-100）
   * 3. 保存完整的 LabelDesign 结构到 LocalStorage
   * 4. 支持在不同尺寸的标签中复用布局
   * 
   * 数据持久化策略：
   * - 使用百分比格式保存位置，确保可跨尺寸复用
   * - 保存完整的 productData，包括所有字段
   * - 保存每个元素的字体配置
   */
  /**
   * 保存设计 - 每次保存创建新记录
   * 
   * 数据存储格式：
   * - 所有设计记录存储在 'auto-price-tag-designs' 数组中
   * - 每条记录包含 labelId, labelName, createdAt, updatedAt 等元数据
   * - 支持多条记录的存储和加载
   */
  /**
   * 保存到云端
   */
  const handleSaveToCloud = async () => {
    try {
      // 从画布获取最新的元素位置
      const currentElements = getElementsRef.current?.() || [];
      
      // 计算当前画布显示尺寸（转换为像素）
      const labelWidthPx = labelSize.width * 3.7795275591; // mm to px
      const labelHeightPx = labelSize.height * 3.7795275591;
      
      // 构建完整的标签设计数据
      const completeDesign: LabelDesign = {
        ...design,
        labelId: `design_${Date.now()}`,
        labelName: productData.name || `标签设计_${new Date().toLocaleString('zh-CN')}`,
        createdAt: design.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        layout: {
          elements: currentElements.map((el: any) => {
            const originalElement = design.layout.elements.find(e => e.id === el.id);
            return {
              id: el.id,
              type: originalElement?.type,
              x: labelWidthPx > 0 ? (el.x / labelWidthPx * 100) : 0,
              y: labelHeightPx > 0 ? (el.y / labelHeightPx * 100) : 0,
              text: el.text,
              fieldKey: originalElement?.fieldKey,
              visible: originalElement?.visible !== false
            };
          })
        },
      };
      
      // 保存到云端
      const result = await saveDesignToCloud(completeDesign);
      
      if (result.success) {
        showToastMsg('✅ 已保存到云端');
      } else {
        showToastMsg(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('保存到云端失败:', error);
      showToastMsg('❌ 保存失败');
    }
  };

  const handleSave = () => {
    // 从画布获取最新的元素位置
    const currentElements = getElementsRef.current?.() || [];
    
    // 计算当前画布显示尺寸（转换为像素）
    const labelWidthPx = labelSize.width * 3.7795275591; // mm to px
    const labelHeightPx = labelSize.height * 3.7795275591;
    
    // 构建完整的标签设计数据
    const completeDesign: LabelDesign = {
      ...design,
      labelId: `design_${Date.now()}`, // 生成唯一ID
      labelName: productData.name || `标签设计_${new Date().toLocaleString('zh-CN')}`, // 使用商品名或时间戳
      createdAt: design.createdAt || new Date().toISOString(), // 首次创建时间
      updatedAt: new Date().toISOString(), // 更新时间戳
      // 将像素位置转换为相对位置（百分比，0-100）
      // 这样可以在不同尺寸的标签中复用布局
      layout: {
        elements: currentElements.map((el: any) => {
          // 从 layout 中查找对应的原始元素定义
          const originalElement = design.layout.elements.find(e => e.id === el.id);
          
          return {
            id: el.id,
            type: originalElement?.type, // 保持类型信息
            x: labelWidthPx > 0 ? (el.x / labelWidthPx * 100) : 0,  // 转换为百分比
            y: labelHeightPx > 0 ? (el.y / labelHeightPx * 100) : 0, // 转换为百分比
            text: el.text, // 保存当前显示的文本（可被手动编辑过）
            fieldKey: originalElement?.fieldKey, // 保持字段键名
            visible: originalElement?.visible !== false // 保持可见性状态
          };
        })
      },
    };
    
    // 保存到 LocalStorage（添加到记录列表）
    try {
      const storageKey = 'auto-price-tag-designs';
      
      // 读取现有记录
      const existingDesigns: LabelDesign[] = (() => {
        try {
          const stored = localStorage.getItem(storageKey);
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      })();
      
      // 添加新记录到列表开头
      const updatedDesigns = [completeDesign, ...existingDesigns];
      
      // 保存回 LocalStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedDesigns));
      
      // 更新当前设计
      importDesign(completeDesign);
      setHasStoredDesignState(true);
      showToastMsg('✅ 已保存为新记录');
    } catch (error) {
      console.error('保存失败:', error);
      showToastMsg('❌ 保存失败');
    }
  };

  const handleLoad = () => {
    setIsDesignListOpen(true);
  };

  const handleSelectDesign = (selectedDesign: LabelDesign) => {
    importDesign(selectedDesign);
    setHasStoredDesignState(true);
    showToastMsg('✅ 已加载设计');
  };

  const handleExport = async () => {
    // 导出设计数据为 JSON 文件
    const designData = exportDesign();
    
    // 转换为 JSON 并下载
    const jsonStr = JSON.stringify(designData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${productData.name || 'label'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToastMsg('✅ 已导出文件');
  };

  const handleImport = () => {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const designData: LabelDesign = JSON.parse(text);
        
        // 导入设计
        importDesign(designData);
        setHasStoredDesignState(true);
        showToastMsg('✅ 已导入设计');
      } catch (error) {
        console.error('导入失败:', error);
        showToastMsg('❌ 导入失败，请检查文件格式');
      }
    };
    input.click();
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
              {/* 云端同步状态指示器（仅显示，不执行保存） */}
              <CloudSyncButton />
              
              {/* 保存标签按钮（执行保存到云端） */}
              <button 
                onClick={handleSaveToCloud}
                className="btn btn-primary px-4 py-2 text-sm font-medium"
              >
                💾 保存标签
              </button>
              
              <button 
                onClick={handleLoad}
                className="btn btn-outline px-4 py-2 text-sm font-medium"
              >
                📂 加载设计
              </button>
              
              <button 
                onClick={handleExport}
                className="btn btn-outline px-4 py-2 text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                导出JSON
              </button>
              
              {/* 保留导入本地 JSON 文件的按钮 */}
              <button 
                onClick={handleImport}
                className="btn btn-outline px-4 py-2 text-sm font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                导入JSON
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
                  <span className="ml-2 text-xs text-green-600">(点击并拖动元素调整位置)</span>
                </h3>
                <p className="text-caption text-gray-600">
                  拖动元素调整布局，双击元素编辑文字
                </p>
              </div>
              
              {/* 可拖拽画布 */}
              <div className="flex justify-center flex-1 min-h-0">
                <DraggableLabelCanvas
                  key={`${productData.name}-${productData.price}`}
                  labelSize={labelSize}
                  productData={productData}
                  fontConfigs={fontConfigs}
                  editable={editable}
                  savedLayout={design.layout}
                  onCanvasReady={handleCanvasReady}
                  onElementSelect={handleElementSelect}
                  onTextChange={handleTextChange}
                  onGetElements={handleGetElements}
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
              <div className="p-4 space-y-4">
                {/* 商品信息表单 - 可折叠 */}
                <div className="bg-white rounded-lg border border-stone-200">
                  <button
                    onClick={() => setIsProductFormExpanded(!isProductFormExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-900">标签信息</span>
                    {isProductFormExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {isProductFormExpanded && (
                    <div className="px-4 pb-4">
                      <ProductForm
                        initialData={productData}
                        onChange={handleProductDataChange}
                      />
                    </div>
                  )}
                </div>
                
                {/* 统一的元素属性编辑器 */}
                <ElementPropertyEditor
                  elementId={selectedElementId}
                  position={selectedElementPosition}
                  labelSize={labelSize}
                  fontConfig={fontConfigs && selectedElementId && fontConfigs[selectedElementId] ? fontConfigs[selectedElementId]! : null}
                  elementText={(() => {
                    // 获取当前选中元素的文本
                    if (!selectedElementId || !getElementsRef.current) return undefined;
                    const elements = getElementsRef.current();
                    const element = elements.find(el => el.id === selectedElementId);
                    return element?.text;
                  })()}
                  onPositionChange={handlePositionChange}
                  onFontConfigChange={(config) => {
                    if (selectedElementId) {
                      handleFontConfigChange(selectedElementId, config);
                    }
                  }}
                  onDelete={handleDeleteElement}
                />

                {/* 使用提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">💡 使用提示</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 点击元素可选中</li>
                    <li>• 拖动元素调整位置</li>
                    <li>• 双击元素直接编辑文字</li>
                    <li>• 点击"保存到本地"保存完整设计</li>
                    <li>• 点击"加载设计"恢复之前的保存</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 设计列表弹窗 */}
      <DesignListDialog
        isOpen={isDesignListOpen}
        onClose={() => setIsDesignListOpen(false)}
        onSelect={handleSelectDesign}
      />

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`rounded-lg shadow-2xl px-6 py-4 border-2 animate-[fadeIn_0.3s] ${
            toastMessage.includes('✅') 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm font-semibold ${
              toastMessage.includes('✅') ? 'text-green-800' : 'text-red-800'
            }`}>
              {toastMessage}
            </p>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

