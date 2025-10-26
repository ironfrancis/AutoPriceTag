'use client';

import { useState, useRef, useEffect } from 'react';
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// 字体配置接口
export interface FontConfig {
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  fontFamily: string;
}

// 字体预设
const FONT_PRESETS = [
  { name: '系统默认', family: 'system-ui, -apple-system, sans-serif' },
  { name: 'PingFang SC', family: 'PingFang SC, "PingFang SC", "Microsoft YaHei", sans-serif' },
  { name: '微软雅黑', family: '"Microsoft YaHei", "微软雅黑", sans-serif' },
  { name: '宋体', family: 'SimSun, "宋体", serif' },
  { name: '黑体', family: 'SimHei, "黑体", sans-serif' },
  { name: '楷体', family: 'KaiTi, "楷体", serif' },
  { name: '仿宋', family: 'FangSong, "仿宋", serif' },
  { name: '思源黑体', family: '"Noto Sans SC", "Source Han Sans SC", sans-serif' },
  { name: '思源宋体', family: '"Noto Serif SC", "Source Han Serif SC", serif' },
  { name: '阿里巴巴普惠体', family: '"Alibaba PuHuiTi", sans-serif' },
  { name: 'Inter', family: 'Inter, system-ui, sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
];

// 颜色预设
const COLOR_PRESETS = [
  '#111827', // 深灰
  '#374151', // 中灰
  '#6B7280', // 浅灰
  '#2563eb', // 蓝色
  '#DC2626', // 红色
  '#059669', // 绿色
  '#7C3AED', // 紫色
  '#EA580C', // 橙色
];

interface FontCustomizerProps {
  config: FontConfig;
  onChange: (config: FontConfig) => void;
  title?: string;
}

export default function FontCustomizer({ config, onChange, title = "字体设置" }: FontCustomizerProps) {
  const [currentFontFamily, setCurrentFontFamily] = useState(config.fontFamily);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const updateConfig = (updates: Partial<FontConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
          {/* 字体族选择 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字体</label>
            <div
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                setHoveredIndex(-1);
              }}
            >
              <select
                value={currentFontFamily}
                onChange={(e) => {
                  const newFont = e.target.value;
                  setCurrentFontFamily(newFont);
                  // 立即应用到画布
                  updateConfig({ fontFamily: newFont });
                }}
                onMouseMove={(e) => {
                  if (isHovering) {
                    const selectElement = e.currentTarget;
                    const hoveredFont = FONT_PRESETS[selectElement.selectedIndex]?.family;
                    if (hoveredFont && selectElement.value !== currentFontFamily) {
                      setHoveredIndex(selectElement.selectedIndex);
                      updateConfig({ fontFamily: hoveredFont });
                    }
                  }
                }}
                onBlur={() => {
                  // 失去焦点时恢复原字体
                  updateConfig({ fontFamily: currentFontFamily });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FONT_PRESETS.map(preset => (
                  <option 
                    key={preset.name} 
                    value={preset.family}
                  >
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字体大小</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="8"
                max="48"
                value={config.fontSize}
                onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={config.fontSize}
                onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) || 12 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                min="8"
                max="48"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>

          {/* 字体粗细 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字体粗细</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateConfig({ fontWeight: 300 })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontWeight === 300 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                细体
              </button>
              <button
                onClick={() => updateConfig({ fontWeight: 400 })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontWeight === 400 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                正常
              </button>
              <button
                onClick={() => updateConfig({ fontWeight: 500 })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontWeight === 500 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                中等
              </button>
              <button
                onClick={() => updateConfig({ fontWeight: 600 })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontWeight === 600 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                半粗
              </button>
              <button
                onClick={() => updateConfig({ fontWeight: 700 })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontWeight === 700 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                粗体
              </button>
            </div>
          </div>

          {/* 字体样式 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字体样式</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateConfig({ fontStyle: 'normal' })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontStyle === 'normal' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                正常
              </button>
              <button
                onClick={() => updateConfig({ fontStyle: 'italic' })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  config.fontStyle === 'italic' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                斜体
              </button>
            </div>
          </div>

          {/* 文本对齐 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">文本对齐</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateConfig({ textAlign: 'left' })}
                className={`p-2 rounded-md border transition-colors ${
                  config.textAlign === 'left' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateConfig({ textAlign: 'center' })}
                className={`p-2 rounded-md border transition-colors ${
                  config.textAlign === 'center' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateConfig({ textAlign: 'right' })}
                className={`p-2 rounded-md border transition-colors ${
                  config.textAlign === 'right' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">颜色</label>
            <div className="space-y-2">
              {/* 颜色预设 */}
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateConfig({ color })}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      config.color === color 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* 自定义颜色 */}
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => updateConfig({ color: e.target.value })}
                  className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={config.color}
                  onChange={(e) => updateConfig({ color: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

    </div>
  );
}
