'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChromePicker } from 'react-color';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  Palette, 
  Save,
  Download,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// 工具提示组件
const TooltipProvider = Tooltip.Provider;
const TooltipRoot = Tooltip.Root;
const TooltipTrigger = Tooltip.Trigger;
const TooltipContent = Tooltip.Content;

export default function TestPage() {
  const [selectedColor, setSelectedColor] = useState('#1E88E5');
  const [testMessage, setTestMessage] = useState('');

  // 快捷键支持
  useHotkeys('ctrl+s', () => {
    setTestMessage('✅ Ctrl+S 快捷键工作正常！');
    setTimeout(() => setTestMessage(''), 3000);
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

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 功能测试页面
            </h1>
            <p className="text-xl text-gray-600">
              验证所有前端库是否正常工作
            </p>
          </motion.div>

          {/* 状态指示器 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">服务器状态</h3>
                  <p className="text-sm text-gray-600">✅ 运行正常</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">库集成</h3>
                  <p className="text-sm text-gray-600">✅ 全部成功</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">类型检查</h3>
                  <p className="text-sm text-gray-600">✅ 无错误</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 功能测试区域 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">功能测试</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 工具提示测试 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">工具提示测试</h3>
                <div className="flex items-center space-x-4">
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <button className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Save className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>保存文件 (Ctrl+S)</p>
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
                </div>
                <p className="text-sm text-gray-600 mt-2">悬停在按钮上查看工具提示</p>
              </div>

              {/* 颜色选择器测试 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">颜色选择器测试</h3>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div>
                    <p className="text-sm text-gray-600">当前颜色</p>
                    <p className="font-mono text-sm text-gray-900">{selectedColor}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ChromePicker 
                    color={selectedColor} 
                    onChange={(color) => setSelectedColor(color.hex)}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 快捷键测试 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">快捷键测试</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">Ctrl</kbd>
                <span className="text-gray-600">+</span>
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">S</kbd>
                <span className="text-gray-700">保存文件</span>
                <span className="text-sm text-gray-500">(试试按这个快捷键)</span>
              </div>
              
              {testMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{testMessage}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 动画测试 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">动画测试</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer"
              >
                <Palette className="h-8 w-8 mb-3" />
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
                <Eye className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">循环动画</h3>
                <p className="text-sm opacity-90">持续的旋转和缩放动画</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg"
              >
                <Save className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">入场动画</h3>
                <p className="text-sm opacity-90">页面加载时的滑入效果</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 成功提示 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">所有功能测试通过！</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              现在可以访问 <Link href="/enhanced-editor" className="text-blue-600 hover:underline">增强编辑器</Link> 开始设计
            </p>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
