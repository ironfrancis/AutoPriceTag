'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';

interface LabelDesign {
  labelId?: string;
  labelName?: string;
  createdAt?: string;
  updatedAt?: string;
  labelSize: { width: number; height: number };
  productData: any;
  layout: { elements: any[] };
  fontConfigs: any;
  settings: any;
}

interface DesignListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (design: LabelDesign) => void;
}

export default function DesignListDialog({ isOpen, onClose, onSelect }: DesignListDialogProps) {
  const [designs, setDesigns] = useState<LabelDesign[]>([]);

  const loadDesigns = async () => {
    try {
      // 尝试从云端加载
      const { loadDesignsFromCloud } = await import('@/lib/storage/cloud-storage');
      const { designs: cloudDesigns, error } = await loadDesignsFromCloud();
      
      if (cloudDesigns.length > 0 && !error) {
        setDesigns(cloudDesigns);
        return;
      }

      // 如果云端没有或失败，从本地加载
      const storageKey = 'auto-price-tag-designs';
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const designs: LabelDesign[] = JSON.parse(storedData);
        setDesigns(designs);
      } else {
        // 兼容旧格式（单条记录）
        const oldData = localStorage.getItem('auto-price-tag-label-design');
        if (oldData) {
          const design: LabelDesign = JSON.parse(oldData);
          setDesigns([design]);
        } else {
          setDesigns([]);
        }
      }
    } catch (error) {
      console.error('加载设计列表失败:', error);
      setDesigns([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDesigns();
    }
  }, [isOpen]);

  const handleDelete = async (design: LabelDesign, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发选择事件
    
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      // 先尝试从云端删除
      const { deleteDesignFromCloud } = await import('@/lib/storage/cloud-storage');
      const result = await deleteDesignFromCloud(design.labelId || '');
      
      if (result.success) {
        // 云端删除成功，更新列表
        setDesigns(prev => prev.filter(d => d.labelId !== design.labelId));
      } else {
        // 云端删除失败，尝试本地删除
        const storageKey = 'auto-price-tag-designs';
        const updatedDesigns = designs.filter(d => d.labelId !== design.labelId);
        localStorage.setItem(storageKey, JSON.stringify(updatedDesigns));
        setDesigns(updatedDesigns);
      }
    } catch (error) {
      // 如果云端服务失败，使用本地删除
      const storageKey = 'auto-price-tag-designs';
      const updatedDesigns = designs.filter(d => d.labelId !== design.labelId);
      localStorage.setItem(storageKey, JSON.stringify(updatedDesigns));
      setDesigns(updatedDesigns);
    }
  };

  const handleSelect = (design: LabelDesign) => {
    onSelect(design);
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未知日期';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">加载标签设计</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {designs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <p className="text-gray-600 mb-2">暂无保存的设计</p>
              <p className="text-sm text-gray-500">
                先创建一个设计并保存，即可在这里加载
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {designs.map((design, index) => (
                <div
                  key={index}
                  className="border border-stone-200 rounded-lg p-4 hover:bg-stone-50 transition-colors cursor-pointer relative"
                  onClick={() => handleSelect(design)}
                >
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(design, e)}
                    className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="删除记录"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-start justify-between pr-8">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {design.productData?.name || '未命名标签'}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">尺寸:</span>
                          <span>{design.labelSize.width}×{design.labelSize.height}mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">品牌:</span>
                          <span>{design.productData?.brand || '未知'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">价格:</span>
                          <span>¥{design.productData?.price || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>保存时间: {formatDate(design.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        点击加载
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

