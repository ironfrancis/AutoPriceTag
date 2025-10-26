'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Lock, Unlock } from 'lucide-react';

interface SizeInputProps {
  currentSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  className?: string;
}

export default function SizeInput({ currentSize, onSizeChange, className = '' }: SizeInputProps) {
  const [customWidth, setCustomWidth] = useState(currentSize.width || 65);
  const [customHeight, setCustomHeight] = useState(currentSize.height || 35);
  const [isLocked, setIsLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState((currentSize.width || 65) / (currentSize.height || 35));

  // 监听 currentSize 变化，同步更新自定义尺寸输入框
  useEffect(() => {
    setCustomWidth(currentSize.width);
    setCustomHeight(currentSize.height);
  }, [currentSize]);

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
    const defaultSize = { width: 65, height: 35 };
    setCustomWidth(defaultSize.width);
    setCustomHeight(defaultSize.height);
    setAspectRatio(defaultSize.width / defaultSize.height);
    setIsLocked(false);
    onSizeChange(defaultSize);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <div className="flex items-center justify-end mb-1">
          <div className="flex items-center space-x-1">
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
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-label text-gray-700 mb-1 block">
              宽度 <span className="text-gray-400">(毫米)</span>
            </label>
            <input
              type="number"
              min="20"
              max="300"
              value={customWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="input w-full text-sm"
              placeholder="65"
            />
          </div>
          
          <div>
            <label className="text-label text-gray-700 mb-1 block">
              高度 <span className="text-gray-400">(毫米)</span>
            </label>
            <input
              type="number"
              min="20"
              max="300"
              value={customHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="input w-full text-sm"
              placeholder="35"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
