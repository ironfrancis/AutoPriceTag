'use client';

import { useState, useEffect } from 'react';

interface PositionControlProps {
  elementId: string | null;
  position: { x: number; y: number };
  labelSize: { width: number; height: number };
  onPositionChange: (x: number, y: number) => void;
}

export default function PositionControl({
  elementId,
  position,
  labelSize,
  onPositionChange
}: PositionControlProps) {
  // 将 mm 转换为像素
  const mmToPixels = (mm: number): number => {
    return mm * 3.7795275591;
  };
  
  const labelWidthPx = mmToPixels(labelSize.width);
  const labelHeightPx = mmToPixels(labelSize.height);
  
  // 计算相对位置（百分比）
  const relativeX = labelWidthPx > 0 ? Math.round((position.x / labelWidthPx) * 100) : 0;
  const relativeY = labelHeightPx > 0 ? Math.round((position.y / labelHeightPx) * 100) : 0;

  // 相对位置
  const [relativeXValue, setRelativeXValue] = useState(relativeX.toString());
  const [relativeYValue, setRelativeYValue] = useState(relativeY.toString());

  // 当外部位置变化时，更新内部状态
  useEffect(() => {
    const labelWidthPx = mmToPixels(labelSize.width);
    const labelHeightPx = mmToPixels(labelSize.height);
    const newRelX = labelWidthPx > 0 ? Math.round((position.x / labelWidthPx) * 100) : 0;
    const newRelY = labelHeightPx > 0 ? Math.round((position.y / labelHeightPx) * 100) : 0;
    setRelativeXValue(Math.min(100, Math.max(0, newRelX)).toString());
    setRelativeYValue(Math.min(100, Math.max(0, newRelY)).toString());
  }, [position.x, position.y, labelSize.width, labelSize.height]);

  const handleRelativeXChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setRelativeXValue(clampedValue.toString());
      const labelWidthPx = mmToPixels(labelSize.width);
      const newX = Math.round((clampedValue / 100) * labelWidthPx);
      onPositionChange(newX, Math.round(position.y));
    }
  };

  const handleRelativeYChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setRelativeYValue(clampedValue.toString());
      const labelHeightPx = mmToPixels(labelSize.height);
      const newY = Math.round((clampedValue / 100) * labelHeightPx);
      onPositionChange(Math.round(position.x), newY);
    }
  };

  if (!elementId) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
        <div className="text-sm text-gray-700">
          👆 请先选择一个元素
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">位置 (相对于标签组件的百分比)</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">X</label>
          <input
            type="number"
            value={relativeXValue}
            onChange={(e) => handleRelativeXChange(e.target.value)}
            onBlur={(e) => {
              const numValue = parseInt(e.target.value);
              if (!isNaN(numValue)) {
                setRelativeXValue(Math.max(0, Math.min(100, numValue)).toString());
              }
            }}
            step="1"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Y</label>
          <input
            type="number"
            value={relativeYValue}
            onChange={(e) => handleRelativeYChange(e.target.value)}
            onBlur={(e) => {
              const numValue = parseInt(e.target.value);
              if (!isNaN(numValue)) {
                setRelativeYValue(Math.max(0, Math.min(100, numValue)).toString());
              }
            }}
            step="1"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

