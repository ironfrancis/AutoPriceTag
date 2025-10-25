'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { LabelTemplate, ElementStyle } from '@/lib/types';
import { FONT_FAMILIES, COLOR_THEMES } from '@/lib/types';

interface StyleCustomizerProps {
  template: LabelTemplate | null;
  onStyleChange: (elementId: string, style: Partial<ElementStyle>) => void;
  className?: string;
}

export default function StyleCustomizer({ 
  template, 
  onStyleChange, 
  className = '' 
}: StyleCustomizerProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'text' | 'background'>('text');

  if (!template) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">样式设置</h3>
        <div className="text-center text-gray-500 py-8">
          <p>请先选择一个模板</p>
        </div>
      </div>
    );
  }

  const selectedElementData = template.elements.find(el => el.id === selectedElement);
  const currentStyle = selectedElementData?.style || {};

  const handleStyleChange = (styleUpdate: Partial<ElementStyle>) => {
    if (selectedElement) {
      onStyleChange(selectedElement, styleUpdate);
    }
  };

  const openColorPicker = (type: 'text' | 'background') => {
    setColorPickerType(type);
    setShowColorPicker(true);
  };

  const applyColor = (color: string) => {
    if (colorPickerType === 'text') {
      handleStyleChange({ color });
    } else {
      handleStyleChange({ backgroundColor: color });
    }
    setShowColorPicker(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">样式设置</h3>

      {/* 元素选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择元素
        </label>
        <select
          value={selectedElement || ''}
          onChange={(e) => setSelectedElement(e.target.value || null)}
          className="input"
        >
          <option value="">请选择要编辑的元素</option>
          {template.elements
            .filter(el => el.editable)
            .map(element => (
              <option key={element.id} value={element.id}>
                {element.type === 'text' ? `文本: ${element.content}` :
                 element.type === 'image' ? '图片' :
                 element.type === 'shape' ? '形状' : element.type}
              </option>
            ))}
        </select>
      </div>

      {selectedElementData && (
        <div className="space-y-4">
          {/* 字体设置 */}
          {selectedElementData.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体
                </label>
                <select
                  value={currentStyle.fontFamily || 'Arial'}
                  onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                  className="input"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体大小: {currentStyle.fontSize || 14}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={currentStyle.fontSize || 14}
                  onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>8px</span>
                  <span>48px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体粗细
                </label>
                <select
                  value={currentStyle.fontWeight || 'normal'}
                  onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
                  className="input"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                  <option value="lighter">细体</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文本对齐
                </label>
                <select
                  value={currentStyle.textAlign || 'left'}
                  onChange={(e) => handleStyleChange({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
                  className="input"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文本装饰
                </label>
                <select
                  value={currentStyle.textDecoration || 'none'}
                  onChange={(e) => handleStyleChange({ textDecoration: e.target.value as 'none' | 'line-through' })}
                  className="input"
                >
                  <option value="none">无</option>
                  <option value="line-through">删除线</option>
                </select>
              </div>
            </>
          )}

          {/* 颜色设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              颜色设置
            </label>
            <div className="space-y-3">
              {/* 文本颜色 */}
              {selectedElementData.type === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">文字颜色</span>
                    <button
                      type="button"
                      onClick={() => openColorPicker('text')}
                      className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: currentStyle.color || '#000000' }}
                      />
                      <span className="text-xs text-gray-600">选择颜色</span>
                    </button>
                  </div>
                  
                  {/* 预设颜色 */}
                  <div className="flex space-x-2">
                    {Object.entries(COLOR_THEMES).map(([name, color]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleStyleChange({ color })}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 背景颜色 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">背景颜色</span>
                  <button
                    type="button"
                    onClick={() => openColorPicker('background')}
                    className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: currentStyle.backgroundColor || 'transparent' }}
                    />
                    <span className="text-xs text-gray-600">选择颜色</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              透明度: {Math.round((currentStyle.opacity || 1) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.opacity || 1}
              onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 圆角 (仅对形状元素) */}
          {selectedElementData.type === 'shape' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                圆角: {currentStyle.borderRadius || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={currentStyle.borderRadius || 0}
                onChange={(e) => handleStyleChange({ borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>20px</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 颜色选择器弹窗 */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              选择{colorPickerType === 'text' ? '文字' : '背景'}颜色
            </h4>
            <HexColorPicker
              color={colorPickerType === 'text' ? currentStyle.color || '#000000' : currentStyle.backgroundColor || '#ffffff'}
              onChange={applyColor}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowColorPicker(false)}
                className="btn btn-outline px-4 py-2"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => setShowColorPicker(false)}
                className="btn btn-primary px-4 py-2"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 样式预览 */}
      {selectedElementData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">样式预览</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>字体: {currentStyle.fontFamily || 'Arial'}</p>
            <p>大小: {currentStyle.fontSize || 14}px</p>
            <p>颜色: {currentStyle.color || '#000000'}</p>
            <p>对齐: {currentStyle.textAlign || 'left'}</p>
            <p>透明度: {Math.round((currentStyle.opacity || 1) * 100)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
