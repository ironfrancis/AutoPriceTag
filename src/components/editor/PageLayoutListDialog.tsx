'use client';

import { useState, useEffect } from 'react';
import { PageLayoutDesign } from '@/lib/types';
import { loadPageLayouts, deletePageLayout } from '@/lib/storage/page-layout-storage';
import { X, Trash2, Download } from 'lucide-react';

interface PageLayoutListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (layout: PageLayoutDesign) => void;
}

/**
 * 整页排版列表对话框
 * 
 * 功能：
 * - 显示已保存的整页排版列表
 * - 支持选择加载排版
 * - 支持删除排版
 */
export default function PageLayoutListDialog({
  isOpen,
  onClose,
  onSelect,
}: PageLayoutListDialogProps) {
  const [layouts, setLayouts] = useState<PageLayoutDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 加载排版列表
  useEffect(() => {
    if (isOpen) {
      loadLayouts();
    }
  }, [isOpen]);

  const loadLayouts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await loadPageLayouts();
      if (result.error) {
        setError(result.error);
      } else {
        setLayouts(result.layouts);
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (layoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个排版吗？')) {
      return;
    }

    const result = await deletePageLayout(layoutId);
    if (result.success) {
      setLayouts(layouts.filter(l => l.layoutId !== layoutId));
    } else {
      alert(result.error || '删除失败');
    }
  };

  const handleSelect = (layout: PageLayoutDesign) => {
    onSelect(layout);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">加载已保存的排版</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadLayouts}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                重试
              </button>
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无保存的排版</p>
              <p className="text-sm text-gray-400 mt-2">创建排版后点击保存按钮</p>
            </div>
          ) : (
            <div className="space-y-2">
              {layouts.map((layout) => (
                <div
                  key={layout.layoutId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(layout)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {layout.layoutName}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        画布: {layout.canvasPreset.name} ({layout.canvasPreset.width}×{layout.canvasPreset.height}mm)
                      </p>
                      <p className="text-xs text-gray-600">
                        标签数: {layout.instances.length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        更新于: {new Date(layout.updatedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(layout.layoutId, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}


