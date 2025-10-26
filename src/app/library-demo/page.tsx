'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Tabs from '@radix-ui/react-tabs';
import { ChromePicker } from 'react-color';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  Palette, 
  Type, 
  Image, 
  Settings,
  Save,
  Download,
  Eye,
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

export default function LibraryDemoPage() {
  const [selectedColor, setSelectedColor] = useState('#1E88E5');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  // 快捷键支持
  useHotkeys('ctrl+s', () => {
    alert('保存快捷键触发！');
  }, { preventDefault: true });

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
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
                <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  基础编辑器
                </Link>
                <Link href="/enhanced-editor" className="text-blue-600 font-medium text-sm">
                  增强编辑器
                </Link>
                <Link href="/library-demo" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  库演示
                </Link>
                <Link href="/cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  案例展示
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              前端库功能演示
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              展示已安装的前端库的强大功能，包括动画、交互、颜色选择等
            </motion.p>
          </div>

          {/* 工具栏演示 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">工具栏演示</h2>
            
            <div className="flex items-center space-x-4">
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Save className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>保存 (Ctrl+S)</p>
                </TooltipContent>
              </TooltipRoot>

              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>导出文件</p>
                </TooltipContent>
              </TooltipRoot>

              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>预览效果</p>
                </TooltipContent>
              </TooltipRoot>

              <div className="w-px h-8 bg-gray-300"></div>

              <PopoverRoot open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-sm">选择颜色</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <ChromePicker 
                    color={selectedColor} 
                    onChange={(color) => setSelectedColor(color.hex)}
                  />
                </PopoverContent>
              </PopoverRoot>
            </div>
          </motion.div>

          {/* 标签页演示 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">标签页演示</h2>
            
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
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>设置</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">颜色设置</h3>
                      <p className="text-sm text-blue-700">调整主题色彩和配色方案</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">布局选项</h3>
                      <p className="text-sm text-green-700">选择不同的布局模板</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">字体选择</h3>
                      <p className="text-sm text-purple-700">选择适合的字体样式</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">字号调整</h3>
                      <p className="text-sm text-orange-700">调整文字大小和间距</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">图片上传</h3>
                      <p className="text-sm text-red-700">上传和编辑图片资源</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">视频嵌入</h3>
                      <p className="text-sm text-yellow-700">添加视频内容</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">通用设置</h3>
                      <p className="text-sm text-gray-700">调整应用的基本设置</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h3 className="font-semibold text-indigo-900 mb-2">高级选项</h3>
                      <p className="text-sm text-indigo-700">配置高级功能选项</p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </TabsRoot>
          </motion.div>

          {/* 动画演示 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">动画演示</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer"
              >
                <Zap className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">悬停效果</h3>
                <p className="text-sm opacity-90">鼠标悬停查看缩放效果</p>
              </motion.div>

              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg"
              >
                <Palette className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">循环动画</h3>
                <p className="text-sm opacity-90">持续的旋转和缩放动画</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg"
              >
                <Type className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">入场动画</h3>
                <p className="text-sm opacity-90">页面加载时的滑入效果</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 快捷键提示 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">快捷键支持</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Ctrl</kbd>
                <span className="text-gray-600">+</span>
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">S</kbd>
                <span className="text-gray-700">保存文件</span>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Ctrl</kbd>
                <span className="text-gray-600">+</span>
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Z</kbd>
                <span className="text-gray-700">撤销操作</span>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Ctrl</kbd>
                <span className="text-gray-600">+</span>
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Y</kbd>
                <span className="text-gray-700">重做操作</span>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">Delete</kbd>
                <span className="text-gray-700">删除选中元素</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              试试按 <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Ctrl+S</kbd> 触发保存功能！
            </p>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
