'use client';

import { useState } from 'react';
import { Ruler, RotateCcw } from 'lucide-react';

interface SizeCustomizerProps {
  currentSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
}

// 预设的常用尺寸
const PRESET_SIZES = [
  { name: '小标签', width: 50, height: 30 },
  { name: '标准标签', width: 80, height: 50 },
  { name: '大标签', width: 100, height: 60 },
  { name: '横版标签', width: 120, height: 40 },
  { name: '竖版标签', width: 60, height: 100 },
  { name: '方形标签', width: 80, height: 80 },
];

export default function SizeCustomizer({ currentSize, onSizeChange }: SizeCustomizerProps) {
  const [customWidth, setCustomWidth] = useState(currentSize.width);
  const [customHeight, setCustomHeight] = useState(currentSize.height);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handlePresetSelect = (size: { width: number; height: number }) => {
    setCustomWidth(size.width);
    setCustomHeight(size.height);
    onSizeChange(size);
    setIsCustomMode(false);
  };

  const handleCustomSizeChange = () => {
    const newSize = { width: customWidth, height: customHeight };
    onSizeChange(newSize);
  };

  const handleReset = () => {
    const defaultSize = { width: 80, height: 50 };
    setCustomWidth(defaultSize.width);
    setCustomHeight(defaultSize.height);
    onSizeChange(defaultSize);
    setIsCustomMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Ruler className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">标签尺寸</h3>
      </div>

      {/* 当前尺寸显示 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-blue-600 mb-1">当前尺寸</div>
          <div className="text-xl font-bold text-blue-800">
            {currentSize.width} × {currentSize.height} mm
          </div>
          <div className="text-xs text-blue-600 mt-1">
            宽 × 高
          </div>
        </div>
      </div>

      {/* 预设尺寸 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">预设尺寸</h4>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_SIZES.map((size, index) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(size)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                currentSize.width === size.width && currentSize.height === size.height
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium">{size.name}</div>
              <div className="text-xs text-gray-500">{size.width}×{size.height}mm</div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义尺寸 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">自定义尺寸</h4>
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>重置</span>
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">宽度 (mm)</label>
            <input
              type="number"
              min="20"
              max="300"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="input w-full"
              placeholder="80"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">高度 (mm)</label>
            <input
              type="number"
              min="20"
              max="300"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="input w-full"
              placeholder="50"
            />
          </div>
          
          <button
            onClick={handleCustomSizeChange}
            className="btn btn-primary w-full py-2"
          >
            应用自定义尺寸
          </button>
        </div>
      </div>

      {/* 尺寸比例提示 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">尺寸建议：</div>
          <ul className="space-y-1 text-xs">
            <li>• 小标签：适合小商品，如饰品、配件</li>
            <li>• 标准标签：适合大部分商品</li>
            <li>• 大标签：适合大件商品或需要更多信息</li>
            <li>• 横版：适合需要展示更多文字内容</li>
            <li>• 竖版：适合需要突出价格信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
