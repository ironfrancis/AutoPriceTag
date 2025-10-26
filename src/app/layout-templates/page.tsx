'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Save, Download, RotateCcw, Plus, Trash2, Settings, Copy } from 'lucide-react';
import Link from 'next/link';
import { 
  LayoutTemplate, 
  LayoutArea, 
  getLayoutTemplates, 
  saveLayoutTemplate, 
  deleteLayoutTemplate,
  createNewTemplate,
  duplicateTemplate
} from '@/lib/layout/layoutTemplates';

export default function LayoutTemplatesPage() {
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<LayoutTemplate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragArea, setDragArea] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // 加载模板
  useEffect(() => {
    const loadedTemplates = getLayoutTemplates();
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0) {
      setCurrentTemplate(loadedTemplates[0]);
    }
  }, []);

  // 内容选项
  const contentOptions = [
    { value: 'product_name', label: '商品名称' },
    { value: 'brand', label: '品牌' },
    { value: 'selling_points', label: '卖点' },
    { value: 'specs', label: '规格' },
    { value: 'price', label: '价格' },
    { value: 'custom', label: '自定义文本' }
  ];

  // 处理拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent, areaId: string) => {
    setIsDragging(true);
    setDragArea(areaId);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // 处理拖拽移动
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragArea || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCurrentTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: prev.areas.map(area => {
          if (area.id === dragArea) {
            const newX = Math.max(0, Math.min(prev.width - area.width, area.x + deltaX));
            const newY = Math.max(0, Math.min(prev.height - area.height, area.y + deltaY));
            return { ...area, x: newX, y: newY };
          }
          return area;
        })
      };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragArea, dragStart]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragArea(null);
  }, []);

  // 添加新区域
  const addArea = () => {
    const newArea: LayoutArea = {
      id: `area-${Date.now()}`,
      x: 10,
      y: 10,
      width: 30,
      height: 20,
      content: 'product_name',
      fontSize: 12,
      fontWeight: 400,
      color: '#111827',
      align: 'left'
    };

    setCurrentTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: [...prev.areas, newArea]
      };
    });
  };

  // 删除区域
  const deleteArea = (areaId: string) => {
    setCurrentTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: prev.areas.filter(area => area.id !== areaId)
      };
    });
  };

  // 更新区域属性
  const updateArea = (areaId: string, updates: Partial<LayoutArea>) => {
    setCurrentTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: prev.areas.map(area => 
          area.id === areaId ? { ...area, ...updates } : area
        )
      };
    });
  };

  // 保存模板
  const saveTemplate = () => {
    if (!currentTemplate) return;
    
    saveLayoutTemplate(currentTemplate);
    const updatedTemplates = getLayoutTemplates();
    setTemplates(updatedTemplates);
  };

  // 删除模板
  const deleteTemplate = (templateId: string) => {
    deleteLayoutTemplate(templateId);
    const updatedTemplates = getLayoutTemplates();
    setTemplates(updatedTemplates);
    
    if (currentTemplate?.id === templateId) {
      setCurrentTemplate(updatedTemplates.length > 0 ? updatedTemplates[0] : null);
    }
  };

  // 复制模板
  const duplicateTemplateHandler = () => {
    if (!currentTemplate) return;
    
    const duplicated = duplicateTemplate(currentTemplate);
    saveLayoutTemplate(duplicated);
    const updatedTemplates = getLayoutTemplates();
    setTemplates(updatedTemplates);
    setCurrentTemplate(duplicated);
  };

  // 创建新模板
  const createNewTemplateHandler = () => {
    const newTemplate = createNewTemplate(`新模板 ${templates.length + 1}`, 80, 50);
    saveLayoutTemplate(newTemplate);
    const updatedTemplates = getLayoutTemplates();
    setTemplates(updatedTemplates);
    setCurrentTemplate(newTemplate);
  };

  // 选择模板
  const selectTemplate = (template: LayoutTemplate) => {
    setCurrentTemplate(template);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 极简导航栏 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">AutoPriceTag</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                首页
              </Link>
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                编辑器
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                文档
              </Link>
              <Link href="/cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                案例
              </Link>
              <Link href="/layout-templates" className="text-blue-600 font-medium text-sm">
                布局模板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">布局模板</h2>
              
              {/* 模板列表 */}
              <div className="space-y-2 mb-6">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => selectTemplate(template)}
                      className={`flex-1 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentTemplate?.id === template.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {template.name}
                    </button>
                    <button
                      onClick={() => duplicateTemplateHandler()}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="复制模板"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {template.id !== 'default' && (
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="删除模板"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button
                  onClick={createNewTemplateHandler}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新建模板
                </button>
                
                <button
                  onClick={addArea}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加区域
                </button>
                
                <button
                  onClick={saveTemplate}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存模板
                </button>
              </div>
            </div>

            {/* 区域属性设置 */}
            {currentTemplate && currentTemplate.areas.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">区域设置</h3>
                <div className="space-y-4">
                  {currentTemplate.areas.map(area => (
                    <div key={area.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">区域 {area.id.slice(-4)}</span>
                        <button
                          onClick={() => deleteArea(area.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* 内容类型 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">内容</label>
                          <select
                            value={area.content}
                            onChange={(e) => updateArea(area.id, { content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {contentOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 字体大小 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">字体大小</label>
                          <input
                            type="number"
                            value={area.fontSize}
                            onChange={(e) => updateArea(area.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="8"
                            max="48"
                          />
                        </div>

                        {/* 字体粗细 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">字体粗细</label>
                          <select
                            value={area.fontWeight}
                            onChange={(e) => updateArea(area.id, { fontWeight: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={300}>细体</option>
                            <option value={400}>正常</option>
                            <option value={500}>中等</option>
                            <option value={600}>半粗</option>
                            <option value={700}>粗体</option>
                          </select>
                        </div>

                        {/* 对齐方式 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">对齐</label>
                          <select
                            value={area.align}
                            onChange={(e) => updateArea(area.id, { align: e.target.value as 'left' | 'center' | 'right' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">左对齐</option>
                            <option value="center">居中</option>
                            <option value="right">右对齐</option>
                          </select>
                        </div>

                        {/* 颜色 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">颜色</label>
                          <input
                            type="color"
                            value={area.color}
                            onChange={(e) => updateArea(area.id, { color: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧画布区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">布局预览</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {currentTemplate ? `${currentTemplate.width}mm × ${currentTemplate.height}mm` : '无模板'}
                  </span>
                </div>
              </div>

              {/* 画布 */}
              <div className="flex justify-center">
                <div
                  ref={canvasRef}
                  className="relative bg-white border-2 border-gray-300 shadow-lg"
                  style={{
                    width: currentTemplate ? `${currentTemplate.width * 4}px` : '320px',
                    height: currentTemplate ? `${currentTemplate.height * 4}px` : '200px',
                    minWidth: '320px',
                    minHeight: '200px'
                  }}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {/* 网格背景 */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* 布局区域 */}
                  {currentTemplate && currentTemplate.areas.map(area => (
                    <div
                      key={area.id}
                      className="absolute border-2 border-dashed border-blue-400 bg-blue-50/30 cursor-move hover:bg-blue-50/50 transition-colors"
                      style={{
                        left: `${(area.x / currentTemplate.width) * 100}%`,
                        top: `${(area.y / currentTemplate.height) * 100}%`,
                        width: `${(area.width / currentTemplate.width) * 100}%`,
                        height: `${(area.height / currentTemplate.height) * 100}%`,
                      }}
                      onMouseDown={(e) => handleDragStart(e, area.id)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="text-center px-2 py-1"
                          style={{
                            fontSize: `${area.fontSize}px`,
                            fontWeight: area.fontWeight,
                            color: area.color,
                            textAlign: area.align
                          }}
                        >
                          {contentOptions.find(opt => opt.value === area.content)?.label || area.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 预览说明 */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  拖拽区域来调整位置，在左侧面板中设置区域属性
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
