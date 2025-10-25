'use client';

import { useState } from 'react';
import { Ruler, RotateCcw, Lock, Unlock } from 'lucide-react';

interface SizeInputProps {
  currentSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  className?: string;
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

export default function SizeInput({ currentSize, onSizeChange, className = '' }: SizeInputProps) {
  const [customWidth, setCustomWidth] = useState(currentSize.width);
  const [customHeight, setCustomHeight] = useState(currentSize.height);
  const [isLocked, setIsLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(currentSize.width / currentSize.height);

  const handlePresetSelect = (size: { width: number; height: number }) => {
    setCustomWidth(size.width);
    setCustomHeight(size.height);
    setAspectRatio(size.width / size.height);
    onSizeChange(size);
  };

  const handleWidthChange = (width: number) => {
    setCustomWidth(width);
    if (isLocked) {
      const newHeight = Math.round(width / aspectRatio);
      setCustomHeight(newHeight);
      onSizeChange({ width, height: newHeight });
    } else {
      onSizeChange({ width, height: customHeight });
    }
  };

  const handleHeightChange = (height: number) => {
    setCustomHeight(height);
    if (isLocked) {
      const newWidth = Math.round(height * aspectRatio);
      setCustomWidth(newWidth);
      onSizeChange({ width: newWidth, height });
    } else {
      onSizeChange({ width: customWidth, height });
    }
  };

  const handleLockToggle = () => {
    if (!isLocked) {
      // 锁定当前比例
      setAspectRatio(customWidth / customHeight);
    }
    setIsLocked(!isLocked);
  };

  const handleReset = () => {
    const defaultSize = { width: 80, height: 50 };
    setCustomWidth(defaultSize.width);
    setCustomHeight(defaultSize.height);
    setAspectRatio(defaultSize.width / defaultSize.height);
    setIsLocked(false);
    onSizeChange(defaultSize);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Ruler className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">标签尺寸</h3>
      </div>

      {/* 当前尺寸显示 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-center">
          <div className="text-xs text-blue-600 mb-1">当前尺寸</div>
          <div className="text-lg font-bold text-blue-800">
            {currentSize.width} × {currentSize.height} mm
          </div>
          <div className="text-xs text-blue-600 mt-1">
            比例: {(currentSize.width / currentSize.height).toFixed(2)}
          </div>
        </div>
      </div>

      {/* 预设尺寸 */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">预设尺寸</h4>
        <div className="grid grid-cols-2 gap-1">
          {PRESET_SIZES.map((size, index) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(size)}
              className={`p-2 rounded text-left transition-colors ${
                currentSize.width === size.width && currentSize.height === size.height
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium">{size.name}</div>
              <div className="text-xs text-gray-500">{size.width}×{size.height}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义尺寸 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gray-700">自定义尺寸</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLockToggle}
              className={`p-1 rounded transition-colors ${
                isLocked ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isLocked ? '解锁比例' : '锁定比例'}
            >
              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>重置</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">宽度 (mm)</label>
            <input
              type="number"
              min="20"
              max="300"
              value={customWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="input w-full text-sm"
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
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="input w-full text-sm"
              placeholder="50"
            />
          </div>
        </div>
      </div>

      {/* 尺寸建议 */}
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">尺寸建议：</div>
          <ul className="space-y-1 text-xs">
            <li>• 小标签：适合小商品</li>
            <li>• 标准标签：适合大部分商品</li>
            <li>• 大标签：适合大件商品</li>
            <li>• 横版：适合更多文字</li>
            <li>• 竖版：适合突出价格</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
