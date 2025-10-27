'use client';

import { useState, useRef, useEffect } from 'react';
import { PlacedLabelInstance } from '@/lib/types';
import LabelCanvas from './LabelCanvas';

interface PlacedLabelItemProps {
  instance: PlacedLabelInstance;
  isSelected: boolean;
  onSelect: (instance: PlacedLabelInstance) => void;
  onDragStart: (instance: PlacedLabelInstance, event: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: (instance: PlacedLabelInstance) => void;
  scale?: number; // 画布缩放比例（用于显示）
}

/**
 * PlacedLabelItem 组件
 * 
 * 功能：
 * - 渲染单个标签实例
 * - 支持选中/取消选中
 * - 支持拖拽移动
 * - 显示删除按钮
 * - 响应缩放显示
 */
export default function PlacedLabelItem({
  instance,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onDelete,
  scale = 1
}: PlacedLabelItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理点击事件（选中/取消选中）
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onSelect(instance);
    }
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(instance, e);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个标签吗？')) {
      onDelete(instance);
    }
  };

  // 计算显示尺寸（考虑缩放）
  // 注意：instance.position 已经是 mm 单位，需要转换为像素
  const mmToPx = 3.7795275591; // mm转像素
  
  const displaySize = {
    width: instance.labelDesign.labelSize.width * mmToPx * scale,
    height: instance.labelDesign.labelSize.height * mmToPx * scale
  };

  const displayPosition = {
    left: instance.position.x * mmToPx * scale,
    top: instance.position.y * mmToPx * scale
  };

  // 确保选中状态
  useEffect(() => {
    if (isSelected && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={containerRef}
      className={`absolute cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: `${displayPosition.left}px`,
        top: `${displayPosition.top}px`,
        width: `${displaySize.width}px`,
        height: `${displaySize.height}px`,
        zIndex: isSelected ? 10 : 1
      }}
      draggable={false} // 暂时禁用了拖拽功能
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* 标签渲染区域 */}
      <div className="absolute inset-0 bg-white border border-gray-200 rounded overflow-hidden pointer-events-none">
        <LabelCanvas
          labelSize={instance.labelDesign.labelSize}
          productData={instance.labelDesign.productData}
          fontConfigs={instance.labelDesign.fontConfigs}
          elementStyles={instance.labelDesign.elementStyles}
          savedLayout={instance.labelDesign.layout}
          className="w-full h-full"
          isExporting={false}
          showMetadata={false} // 在整页排版中不显示元信息
          disableInternalScaling={false} // 使用内部缩放，保持与单页编辑一致
        />
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
      )}

      {/* 选中时的操作按钮 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            title="删除标签"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 拖拽提示 */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-10">
          <div className="text-blue-600 text-sm font-medium">拖拽中...</div>
        </div>
      )}
    </div>
  );
}
