'use client';

import { useState, useEffect } from 'react';
import { Download, Grid, Layout, Trash2, Save, FolderOpen, Upload } from 'lucide-react';
import { PlacedLabelInstance, LabelDesign, PageLayoutDesign } from '@/lib/types';
import { CANVAS_PRESETS } from '@/lib/layout/canvasPresets';
import { calculateAutoLayout } from '@/lib/layout/pageLayout';
import PageCanvas from '@/components/editor/PageCanvas';
import LabelSelector from '@/components/editor/LabelSelector';
import AppNavbar from '@/components/shared/AppNavbar';
import PageLayoutListDialog from '@/components/editor/PageLayoutListDialog';
import { exportCanvasAsImage, exportCanvasAsPDF, downloadFile } from '@/lib/export';
import { savePageLayout, exportPageLayoutJSON, importPageLayoutJSON } from '@/lib/storage/page-layout-storage';

/**
 * 整页排版页面
 * 
 * 功能：
 * - 选择标准画布尺寸（A4、5寸、6寸、7寸等）
 * - 从已保存标签中多选添加
 * - 自动排列标签
 * - 手动调整标签位置
 * - 导出整页画布
 */
export default function PageLayoutPage() {
  const [canvasPreset, setCanvasPreset] = useState(CANVAS_PRESETS[0]); // 默认A4
  const [instances, setInstances] = useState<PlacedLabelInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<PlacedLabelInstance | undefined>();
  const [showGrid, setShowGrid] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLayoutListOpen, setIsLayoutListOpen] = useState(false);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('');
  
  // Toast 提示状态
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToastState, setShowToastState] = useState(false);

  // Toast 提示函数
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastState(true);
    setTimeout(() => {
      setShowToastState(false);
    }, 3000);
  };

  const canvasSize = {
    width: canvasPreset.width,
    height: canvasPreset.height
  };

  // 处理画布预设切换
  const handlePresetChange = (presetId: string) => {
    const preset = CANVAS_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCanvasPreset(preset);
      // 重新排列现有标签
      if (instances.length > 0) {
        const labelDesigns = instances.map(i => i.labelDesign);
        const newInstances = calculateAutoLayout(labelDesigns, { width: preset.width, height: preset.height });
        setInstances(newInstances);
      }
    }
  };

  // 处理添加标签（追加模式）
  const handleAddLabels = (labels: LabelDesign[]) => {
    console.log('添加标签到画布:', labels.length, '个标签');
    
    // 收集所有现有标签的设计
    const allLabels = instances.map(i => i.labelDesign);
    
    // 添加新标签到列表
    allLabels.push(...labels);
    
    // 重新计算所有标签的布局
    const newInstances = calculateAutoLayout(allLabels, canvasSize, {
      spacing: 1, // 1mm 间距
      margins: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      }
    });
    
    console.log('自动布局计算完成，生成实例:', newInstances.length);
    setInstances(newInstances);
    setSelectedInstance(undefined);
  };

  // 处理标签选择
  const handleInstanceSelect = (instance: PlacedLabelInstance) => {
    setSelectedInstance(instance);
  };

  // 处理标签更新（拖拽后）
  const handleInstanceUpdate = (updatedInstance: PlacedLabelInstance) => {
    setInstances(prev => 
      prev.map(i => i.id === updatedInstance.id ? updatedInstance : i)
    );
  };

  // 处理标签删除
  const handleInstanceDelete = (instance: PlacedLabelInstance) => {
    setInstances(prev => prev.filter(i => i.id !== instance.id));
    if (selectedInstance?.id === instance.id) {
      setSelectedInstance(undefined);
    }
  };

  // 处理自动排列
  const handleAutoLayout = () => {
    if (instances.length === 0) return;

    const labelDesigns = instances.map(i => i.labelDesign);
    const newInstances = calculateAutoLayout(labelDesigns, canvasSize);
    setInstances(newInstances);
  };

  // 处理清除所有
  const handleClearAll = () => {
    setInstances([]);
    setSelectedInstance(undefined);
    setCurrentLayoutId('');
    showToast('已清空画布');
  };

  // 处理保存排版
  const handleSaveLayout = async () => {
    if (instances.length === 0) {
      showToast('❌ 画布上没有标签，无法保存');
      return;
    }

    const layoutName = prompt('请输入排版名称:', currentLayoutId ? undefined : `排版_${new Date().toLocaleDateString()}`);
    if (!layoutName) return;

    const layout: PageLayoutDesign = {
      layoutId: currentLayoutId || `layout_${Date.now()}`,
      layoutName,
      canvasPreset,
      instances,
      createdAt: currentLayoutId ? undefined as any : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await savePageLayout(layout);
    if (result.success) {
      setCurrentLayoutId(layout.layoutId);
      showToast('✅ 保存成功');
    } else {
      showToast(`❌ ${result.error}`);
    }
  };

  // 处理加载排版
  const handleLoadLayout = (layout: PageLayoutDesign) => {
    setCanvasPreset(layout.canvasPreset);
    setInstances(layout.instances);
    setCurrentLayoutId(layout.layoutId);
    setSelectedInstance(undefined);
    showToast('✅ 加载成功');
  };

  // 处理导出JSON
  const handleExportJSON = () => {
    if (instances.length === 0) {
      showToast('❌ 画布上没有标签，无法导出');
      return;
    }

    const layout: PageLayoutDesign = {
      layoutId: currentLayoutId || `layout_${Date.now()}`,
      layoutName: currentLayoutId ? `排版_${Date.now()}` : `排版_${new Date().toLocaleDateString()}`,
      canvasPreset,
      instances,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      exportPageLayoutJSON(layout);
      showToast('✅ JSON 导出成功');
    } catch (error) {
      showToast('❌ 导出失败');
    }
  };

  // 处理导入JSON
  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const result = await importPageLayoutJSON(text);
        
        if (result.error) {
          showToast(`❌ ${result.error}`);
        } else if (result.layout) {
          handleLoadLayout(result.layout);
          showToast('✅ 导入成功并已保存到数据库');
        }
      } catch (error) {
        showToast('❌ 导入失败');
      }
    };

    input.click();
  };

  // 渲染单个标签到Canvas上下文
  const renderLabelToContext = (
    ctx: CanvasRenderingContext2D,
    instance: PlacedLabelInstance,
    baseX: number,
    baseY: number,
    mmToPx: number,
    scale: number
  ) => {
    const { labelDesign } = instance;
    const { labelSize, layout, fontConfigs, elementStyles } = labelDesign;
    
    // 标签尺寸（像素）
    const labelWidth = labelSize.width * mmToPx * scale;
    const labelHeight = labelSize.height * mmToPx * scale;
    
    // 保存上下文状态
    ctx.save();
    
    // 移动到标签位置
    ctx.translate(baseX, baseY);
    
    // 绘制标签背景和边框
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, labelWidth, labelHeight);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(0, 0, labelWidth, labelHeight);
    
    // 获取元素样式配置（优先elementStyles，否则用fontConfigs）
    const styles = elementStyles || fontConfigs;
    
    // 如果没有保存的布局，使用硬编码渲染作为后备
    if (!layout || !layout.elements || layout.elements.length === 0) {
      // 使用默认渲染（向后兼容）
      const { productData } = labelDesign;
      const defaultFontSize = 16 * scale;
      let currentY = 8 * scale;
      
      if (productData.name) {
        ctx.font = `${defaultFontSize * 1.2}px system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000000';
        ctx.fillText(productData.name, 4 * scale, currentY);
        currentY += defaultFontSize * 1.4;
      }
      
      if (productData.price > 0) {
        ctx.font = `bold ${defaultFontSize * 1.5}px system-ui, sans-serif`;
        ctx.fillStyle = '#2563eb';
        ctx.textAlign = 'center';
        ctx.fillText(`¥${productData.price.toFixed(2)}`, labelWidth / 2, currentY);
      }
    } else {
      // 使用保存的布局数据渲染
      const elements = layout.elements.filter(el => el.visible !== false);
      
      for (const element of elements) {
        // 获取该元素的样式配置
        const styleConfig = styles?.[element.id];
        
        if (!styleConfig) {
          console.warn(`No style config for element ${element.id}`);
          continue;
        }
        
        // 计算元素位置（从百分比转为像素）
        const x = (element.x / 100) * labelWidth;
        const y = (element.y / 100) * labelHeight;
        
        // 设置字体样式
        const fontSize = styleConfig.fontSize * scale;
        const fontWeight = styleConfig.fontWeight || 400;
        const fontStyle = styleConfig.fontStyle || 'normal';
        const fontFamily = styleConfig.fontFamily || 'system-ui, -apple-system, sans-serif';
        
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = styleConfig.color || '#000000';
        ctx.textAlign = (styleConfig.textAlign || 'left') as CanvasTextAlign;
        ctx.textBaseline = 'top';
        
        // 处理多行文本
        const lines = element.text.split('\n');
        // lineHeight存在于ElementStyleConfig中，FontConfig中没有，需要兼容处理
        const lineHeightMultiplier = ('lineHeight' in styleConfig ? (styleConfig.lineHeight as number) : 1.4);
        const lineHeight = lineHeightMultiplier * fontSize;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const textY = y + i * lineHeight;
          
          // 绘制文本（ctx.textAlign已经在上面设置好了）
          ctx.fillText(line, x, textY);
        }
      }
    }
    
    // 恢复上下文状态
    ctx.restore();
  };

  // 处理导出
  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (instances.length === 0) {
      showToast('❌ 画布上还没有标签');
      return;
    }

    setIsExporting(true);
    try {
      // 创建一个隐藏的canvas用于导出
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建画布');
      }

      // mm转像素 (1mm = 3.7795275591px at 96 DPI)
      const mmToPx = 3.7795275591;
      const scale = 2; // 高分辨率导出
      const width = canvasSize.width * mmToPx * scale;
      const height = canvasSize.height * mmToPx * scale;

      canvas.width = width;
      canvas.height = height;

      // 填充白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 绘制所有标签（使用完整渲染）
      console.log('开始导出，标签数量:', instances.length);
      for (const instance of instances) {
        const x = instance.position.x * mmToPx * scale;
        const y = instance.position.y * mmToPx * scale;
        console.log('渲染标签:', {
          id: instance.id,
          position: instance.position,
          renderAt: { x, y },
          labelSize: instance.labelDesign.labelSize
        });
        renderLabelToContext(ctx, instance, x, y, mmToPx, scale);
      }
      console.log('导出完成');

      // 导出
      let blob: Blob;
      const filename = `page_layout_${new Date().getTime()}`;

      if (format === 'pdf') {
        blob = await exportCanvasAsPDF({ canvas, format });
        downloadFile(blob, `${filename}.pdf`);
      } else {
        blob = await exportCanvasAsImage({ canvas, format });
        downloadFile(blob, `${filename}.${format}`);
      }

      showToast('✅ 导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      showToast('❌ 导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <AppNavbar 
        title="整页排版"
        backHref="/"
        backLabel="返回首页"
      >
        {/* 画布尺寸选择器 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">画布尺寸:</span>
          <select
            value={canvasPreset.id}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="text-sm font-medium border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
          >
            {CANVAS_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 工具按钮 */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="显示网格"
        >
          <Grid className="w-5 h-5" />
        </button>

        <button
          onClick={handleAutoLayout}
          disabled={instances.length === 0}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="自动排列"
        >
          <Layout className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 保存/加载按钮 */}
        <button
          onClick={handleSaveLayout}
          disabled={instances.length === 0}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-1"
          title="保存排版"
        >
          <Save className="w-5 h-5" />
          <span className="text-sm">保存</span>
        </button>

        <button
          onClick={() => setIsLayoutListOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
          title="加载排版"
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-sm">加载</span>
        </button>

        <button
          onClick={handleImportJSON}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="导入JSON"
        >
          <Upload className="w-5 h-5" />
        </button>

        <button
          onClick={handleExportJSON}
          disabled={instances.length === 0}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="导出JSON"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 导出图片/PDF按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting || instances.length === 0}
            className="btn btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出'}
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
          )}
        </div>
      </AppNavbar>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧画布区域 (70%) */}
        <div className="flex-[7] flex flex-col min-w-0 relative">
          <PageCanvas
            canvasSize={canvasSize}
            instances={instances}
            onInstanceSelect={handleInstanceSelect}
            onInstanceUpdate={handleInstanceUpdate}
            onInstanceDelete={handleInstanceDelete}
            selectedInstance={selectedInstance}
            showGrid={showGrid}
          />
          
          {/* 状态栏 */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md z-20">
            <div className="text-sm text-gray-600">
              画布: {canvasSize.width}×{canvasSize.height}mm | 标签数: {instances.length}
            </div>
            <button
              onClick={handleClearAll}
              disabled={instances.length === 0}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="清空画布"
            >
              清空排版
            </button>
            <div className="text-sm text-gray-600">
              按住 Shift + 拖拽 平移画布
            </div>
          </div>
        </div>

        {/* 右侧标签管理面板 (30%) */}
        <div className="flex-[3] bg-white border-l border-gray-200">
          <LabelSelector onAddLabels={handleAddLabels} />
        </div>
      </div>

      {/* 排版列表对话框 */}
      <PageLayoutListDialog
        isOpen={isLayoutListOpen}
        onClose={() => setIsLayoutListOpen(false)}
        onSelect={handleLoadLayout}
      />

      {/* Toast 提示 */}
      {showToastState && (
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
