'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Tabs from '@radix-ui/react-tabs';
import { ChromePicker } from 'react-color';
import { 
  Palette, 
  Type, 
  Image, 
  Layers, 
  Undo, 
  Redo, 
  Copy, 
  Trash2, 
  Save,
  Download,
  Eye,
  Grid,
  Brush,
  Zap
} from 'lucide-react';

// 工具提示组件
const TooltipProvider = Tooltip.Provider;
const TooltipRoot = Tooltip.Root;
const TooltipTrigger = Tooltip.Trigger;
const TooltipContent = Tooltip.Content;

// 弹窗组件
const PopoverRoot = Popover.Root;
const PopoverTrigger = Popover.Trigger;
const PopoverContent = Popover.Content;

// 标签页组件
const TabsRoot = Tabs.Root;
const TabsList = Tabs.List;
const TabsTrigger = Tabs.Trigger;
const TabsContent = Tabs.Content;

interface EnhancedEditorProps {
  onSave?: (data: any) => void;
  onExport?: (format: string) => void;
}

export default function EnhancedEditor({ onSave, onExport }: EnhancedEditorProps) {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedColor, setSelectedColor] = useState('#1E88E5');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 快捷键支持
  useHotkeys('ctrl+s', () => {
    handleSave();
  }, { preventDefault: true });

  useHotkeys('ctrl+z', () => {
    handleUndo();
  }, { preventDefault: true });

  useHotkeys('ctrl+y', () => {
    handleRedo();
  }, { preventDefault: true });

  useHotkeys('ctrl+c', () => {
    handleCopy();
  }, { preventDefault: true });

  useHotkeys('delete', () => {
    handleDelete();
  }, { preventDefault: true });

  // 工具函数
  const displayToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const handleSave = () => {
    onSave?.({});
    displayToast('保存成功！');
  };

  const handleUndo = () => {
    displayToast('撤销操作');
  };

  const handleRedo = () => {
    displayToast('重做操作');
  };

  const handleCopy = () => {
    displayToast('复制成功！');
  };

  const handleDelete = () => {
    displayToast('删除成功！');
  };

  const handleExport = (format: string) => {
    onExport?.(format);
    displayToast(`${format.toUpperCase()} 导出成功！`);
  };

  return (
    <TooltipProvider>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* 顶部工具栏 */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">增强编辑器</h1>
              <div className="flex items-center space-x-2">
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleUndo}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Undo className="h-5 w-5 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>撤销 (Ctrl+Z)</p>
                  </TooltipContent>
                </TooltipRoot>

                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleRedo}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Redo className="h-5 w-5 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>重做 (Ctrl+Y)</p>
                  </TooltipContent>
                </TooltipRoot>

                <div className="w-px h-6 bg-gray-300"></div>

                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleSave}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Save className="h-5 w-5 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存 (Ctrl+S)</p>
                  </TooltipContent>
                </TooltipRoot>

                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => handleExport('png')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>导出 PNG</p>
                  </TooltipContent>
                </TooltipRoot>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Eye className="h-4 w-4 mr-2 inline" />
                预览
              </button>
            </div>
          </div>
        </motion.div>

        {/* 主编辑区域 */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* 左侧面板 */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full bg-white border-r border-gray-200">
              <TabsRoot value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 border-b border-gray-200">
                  <TabsTrigger value="design" className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>设计</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <Type className="h-4 w-4" />
                    <span>文字</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center space-x-2">
                    <Image className="h-4 w-4" />
                    <span>媒体</span>
                  </TabsTrigger>
                  <TabsTrigger value="layers" className="flex items-center space-x-2">
                    <Layers className="h-4 w-4" />
                    <span>图层</span>
                  </TabsTrigger>
                </TabsList>

                <div className="p-4">
                  <TabsContent value="design" className="space-y-4">
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">颜色设置</h3>
                        <div className="space-y-3">
                          <PopoverRoot open={showColorPicker} onOpenChange={setShowColorPicker}>
                            <PopoverTrigger asChild>
                              <button className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
                                <div 
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: selectedColor }}
                                />
                                <span className="text-sm text-gray-700">{selectedColor}</span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <ChromePicker 
                                color={selectedColor} 
                                onChange={(color) => setSelectedColor(color.hex)}
                              />
                            </PopoverContent>
                          </PopoverRoot>

                          <div className="grid grid-cols-4 gap-2">
                            {['#1E88E5', '#FF9800', '#4CAF50', '#F44336'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded border-2 ${
                                  selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">特效</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                            <Brush className="h-4 w-4 mx-auto" />
                            <div className="text-xs mt-1">阴影</div>
                          </button>
                          <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                            <Grid className="h-4 w-4 mx-auto" />
                            <div className="text-xs mt-1">渐变</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">字体</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>思源黑体</option>
                          <option>微软雅黑</option>
                          <option>Arial</option>
                          <option>Helvetica</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">字号</label>
                        <input 
                          type="range" 
                          min="8" 
                          max="72" 
                          defaultValue="16"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                      <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">点击上传图片</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="layers" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Type className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">文本层</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Image className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">图片层</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </TabsRoot>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* 中间画布区域 */}
          <Panel defaultSize={50}>
            <div className="h-full bg-gray-100 flex items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-64 border border-gray-200 rounded"
                />
                <div className="mt-4 text-center text-sm text-gray-500">
                  画布区域 - 支持拖拽、缩放、旋转
                </div>
              </motion.div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* 右侧属性面板 */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full bg-white border-l border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">属性面板</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">位置</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="X" 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input 
                      type="number" 
                      placeholder="Y" 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="宽" 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input 
                      type="number" 
                      placeholder="高" 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">旋转</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    defaultValue="0"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">透明度</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="100"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>

        {/* Toast 通知 */}
        {isToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}