'use client';

import { useEffect } from 'react';
import { FontConfig } from './FontCustomizer';
import FontCustomizer from './FontCustomizer';
import PositionControl from './PositionControl';

/**
 * 元素属性编辑器
 * 
 * 统一的文字元素属性编辑组件，支持：
 * 1. 位置控制（百分比格式）
 * 2. 字体样式（大小、粗细、颜色等）
 * 3. 文本内容编辑
 * 4. 删除功能
 * 
 * 所有文字元素都共用这个编辑器
 */
export interface ElementPropertyEditorProps {
  elementId: string | null;
  position: { x: number; y: number } | null;
  labelSize: { width: number; height: number };
  fontConfig: FontConfig | null;
  elementText?: string;
  onPositionChange: (x: number, y: number) => void;
  onFontConfigChange: (config: FontConfig) => void;
  onDelete?: (elementId: string) => void;
  onTextChange?: (newText: string) => void;
}

export default function ElementPropertyEditor({
  elementId,
  position,
  labelSize,
  fontConfig,
  elementText,
  onPositionChange,
  onFontConfigChange,
  onDelete,
  onTextChange
}: ElementPropertyEditorProps) {
  
  // 如果未选中元素，返回提示
  if (!elementId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
        <div className="text-sm text-blue-700">
          👆 点击画布上的元素以编辑其属性
        </div>
      </div>
    );
  }
  
  // 如果缺少 fontConfig，使用默认配置
  const defaultFontConfig: FontConfig = {
    fontSize: 14,
    fontWeight: 400,
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };
  
  const effectiveFontConfig = fontConfig || defaultFontConfig;

  return (
    <div className="bg-white rounded-lg border border-stone-200">
      {/* 头部：元素名称 + 删除按钮 */}
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          元素属性
        </h3>
        {onDelete && (
          <button
            onClick={() => onDelete(elementId)}
            className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center space-x-1"
          >
            <span>🗑️</span>
            <span>删除</span>
          </button>
        )}
      </div>
      
      {/* 属性编辑区域 */}
      <div className="p-4 space-y-4">
        {/* 1. 位置控制 */}
        {position && (
          <div className="border-b border-stone-200 pb-4">
            <PositionControl
              elementId={elementId}
              position={position}
              labelSize={labelSize}
              onPositionChange={onPositionChange}
            />
          </div>
        )}
        
        {/* 2. 字体样式编辑 */}
        <div className="border-b border-stone-200 pb-4">
          <FontCustomizer
            title="字体样式"
            config={effectiveFontConfig}
            onChange={onFontConfigChange}
          />
        </div>
        
        {/* 3. 文本内容编辑（可选） */}
        {onTextChange && elementText !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              文本内容
            </label>
            <textarea
              value={elementText}
              onChange={(e) => onTextChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="编辑文本内容..."
            />
            <p className="text-xs text-gray-500 mt-2">
              双击画布上的元素也可以直接编辑
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
