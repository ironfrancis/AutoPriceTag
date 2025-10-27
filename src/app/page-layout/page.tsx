'use client';

import { useState, useEffect } from 'react';
import { Download, Grid, Layout, Trash2 } from 'lucide-react';
import { PlacedLabelInstance, LabelDesign } from '@/lib/types';
import { CANVAS_PRESETS } from '@/lib/layout/canvasPresets';
import { calculateAutoLayout } from '@/lib/layout/pageLayout';
import PageCanvas from '@/components/editor/PageCanvas';
import LabelSelector from '@/components/editor/LabelSelector';
import AppNavbar from '@/components/shared/AppNavbar';
import { exportCanvasAsImage, exportCanvasAsPDF, downloadFile } from '@/lib/export';

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
      spacing: 2, // 2mm 间距
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
    if (confirm('确定要清空画布上的所有标签吗？')) {
      setInstances([]);
      setSelectedInstance(undefined);
    }
  };

  // 处理导出
  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (instances.length === 0) {
      alert('画布上还没有标签');
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
      const scale = 2; // 高分辨率
      const width = canvasSize.width * mmToPx * scale;
      const height = canvasSize.height * mmToPx * scale;

      canvas.width = width;
      canvas.height = height;

      // 填充白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 绘制所有标签
      for (const instance of instances) {
        const labelWidth = instance.labelDesign.labelSize.width * mmToPx * scale;
        const labelHeight = instance.labelDesign.labelSize.height * mmToPx * scale;
        const x = instance.position.x * mmToPx * scale;
        const y = instance.position.y * mmToPx * scale;

        // 绘制标签矩形
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, labelWidth, labelHeight);

        // 这里应该绘制标签内容，简化处理
        ctx.fillStyle = '#000000';
        ctx.font = `${14 * scale}px Arial`;
        ctx.fillText(instance.labelDesign.productData.name || 'Label', x + 5 * scale, y + 20 * scale);
      }

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

      alert('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
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

        <button
          onClick={handleClearAll}
          disabled={instances.length === 0}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="清空画布"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* 导出按钮 */}
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
        <div className="flex-[7] flex flex-col min-w-0">
          <PageCanvas
            canvasSize={canvasSize}
            instances={instances}
            onInstanceSelect={handleInstanceSelect}
            onInstanceUpdate={handleInstanceUpdate}
            onInstanceDelete={handleInstanceDelete}
            selectedInstance={selectedInstance}
            showGrid={showGrid}
          />
        </div>

        {/* 右侧标签管理面板 (30%) */}
        <div className="flex-[3] bg-white border-l border-gray-200">
          <LabelSelector onAddLabels={handleAddLabels} />
        </div>
      </div>
    </div>
  );
}
