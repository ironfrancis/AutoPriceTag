'use client';

import { useState } from 'react';
import { LabelTemplate } from '@/lib/types';
import { defaultTemplates } from '@/lib/templates';

interface TemplateSelectorProps {
  selectedTemplate: LabelTemplate | null;
  onTemplateSelect: (template: LabelTemplate) => void;
  className?: string;
}

export default function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  className = '' 
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const renderTemplatePreview = (template: LabelTemplate) => {
    const { type, size, background, elements } = template;
    
    return (
      <div 
        className="relative w-full h-20 rounded-lg overflow-hidden border-2 transition-all duration-200"
        style={{
          backgroundColor: background.type === 'solid' ? background.color : '#f0f0f0',
          background: background.type === 'gradient' && background.gradient 
            ? `linear-gradient(${background.gradient.direction === 'horizontal' ? '90deg' : '180deg'}, ${background.gradient.start}, ${background.gradient.end})`
            : undefined,
          borderColor: selectedTemplate?.id === template.id ? '#1E88E5' : '#E5E7EB',
          boxShadow: selectedTemplate?.id === template.id ? '0 0 0 2px #1E88E5' : 'none',
        }}
      >
        {/* 渲染元素预览 */}
        {elements.map((element, index) => {
          const x = (element.position.x / 100) * 100;
          const y = (element.position.y / 100) * 100;
          const width = (element.size.width / 100) * 100;
          const height = (element.size.height / 100) * 100;

          if (element.type === 'text') {
            return (
              <div
                key={index}
                className="absolute text-xs font-medium"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  color: element.style.color || '#000000',
                  fontSize: `${Math.max(8, (element.style.fontSize || 14) * 0.6)}px`,
                  fontWeight: element.style.fontWeight || 'normal',
                  textAlign: element.style.textAlign || 'left',
                  textDecoration: element.style.textDecoration || 'none',
                  opacity: element.style.opacity || 1,
                }}
              >
                {typeof element.content === 'string' ? (
                  element.content === '{{product.name}}' ? '商品名称' :
                  element.content === '{{product.price}}' ? '¥99.00' :
                  element.content === '{{product.originalPrice}}' ? '¥199.00' :
                  element.content === '{{product.discount}}' ? '5折' :
                  element.content === '促销' ? '促销' :
                  element.content === '{{product.sellingPoints.0}}' ? '卖点描述' :
                  element.content === '{{product.specs}}' ? '规格参数' :
                  element.content
                ) : '图片'}
              </div>
            );
          }

          if (element.type === 'image') {
            return (
              <div
                key={index}
                className="absolute rounded"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  backgroundColor: '#1E88E5',
                  borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '4px',
                }}
              />
            );
          }

          if (element.type === 'shape') {
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  backgroundColor: element.style.backgroundColor || 'transparent',
                  border: `1px solid ${element.style.color || '#000000'}`,
                  borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '0px',
                }}
              />
            );
          }

          return null;
        })}

        {/* 选中状态覆盖层 */}
        {selectedTemplate?.id === template.id && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              已选择
            </div>
          </div>
        )}

        {/* 悬停状态覆盖层 */}
        {hoveredTemplate === template.id && selectedTemplate?.id !== template.id && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-10 flex items-center justify-center">
            <div className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
              点击选择
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">选择模板</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {defaultTemplates.map((template) => (
          <div
            key={template.id}
            className="card p-4 cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onTemplateSelect(template)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* 模板预览 */}
            {renderTemplatePreview(template)}
            
            {/* 模板信息 */}
            <div className="mt-3">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {template.type === 'simple' && '简洁大方，适合通用场景'}
                {template.type === 'promotion' && '色彩鲜明，突出优惠信息'}
                {template.type === 'premium' && '优雅设计，适合高端场景'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {template.size.width}×{template.size.height}mm
                </span>
                <span className="text-xs text-gray-500">
                  {template.elements.length} 个元素
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 模板说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">模板说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>基础简约款:</strong> 适合超市、便利店等通用场景</li>
          <li>• <strong>促销活动款:</strong> 适合促销活动、节日营销</li>
          <li>• <strong>高端质感款:</strong> 适合精品店、美妆店等高端场景</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">
          选择模板后，您可以在右侧预览区进行样式调整
        </p>
      </div>
    </div>
  );
}
