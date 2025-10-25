'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Download } from 'lucide-react';
import { SavedLabel } from '@/lib/types';
import { getSavedLabels, deleteSavedLabel } from '@/lib/db';

interface SavedLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLabel: (label: SavedLabel) => void;
}

export default function SavedLabelsDialog({ 
  isOpen, 
  onClose, 
  onLoadLabel 
}: SavedLabelsDialogProps) {
  const [savedLabels, setSavedLabels] = useState<SavedLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedLabels();
    }
  }, [isOpen]);

  const loadSavedLabels = async () => {
    setIsLoading(true);
    try {
      const labels = await getSavedLabels();
      setSavedLabels(labels);
    } catch (error) {
      console.error('加载保存的标签失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    
    setDeletingId(id);
    try {
      await deleteSavedLabel(id);
      setSavedLabels(prev => prev.filter(label => label.id !== id));
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadLabel = (label: SavedLabel) => {
    onLoadLabel(label);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">我的标签</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : savedLabels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Download className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无保存的标签</h3>
              <p className="text-gray-600">开始设计您的第一个标签吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLabels.map((label) => (
                <div key={label.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* 缩略图 */}
                  <div className="aspect-[4/3] bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={label.thumbnail}
                      alt={label.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* 标签信息 */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 truncate">{label.name}</h3>
                    <div className="text-sm text-gray-600">
                      <p>尺寸: {label.labelSize.width}×{label.labelSize.height}mm</p>
                      <p>商品: {label.productData.name}</p>
                      <p>保存时间: {new Date(label.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => handleLoadLabel(label)}
                        className="btn btn-primary flex-1 px-3 py-1 text-sm"
                      >
                        加载
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        disabled={deletingId === label.id}
                        className="btn btn-outline px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === label.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              共 {savedLabels.length} 个保存的标签
            </div>
            <button
              onClick={onClose}
              className="btn btn-outline px-4 py-2"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
