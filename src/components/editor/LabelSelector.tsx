'use client';

import { useState, useEffect } from 'react';
import { LabelDesign } from '@/lib/types';
import { getSavedLabels } from '@/lib/db';
import { loadDesignsFromCloud } from '@/lib/storage/cloud-storage';
import { Check, Plus, X } from 'lucide-react';

interface LabelSelectorProps {
  onAddLabels: (labels: LabelDesign[], repeatCount?: number) => void;
}

/**
 * LabelSelector 组件
 * 
 * 功能：
 * - 显示已保存标签列表
 * - 支持多选（复选框）
 * - 支持设置重复次数
 * - 添加到画布功能
 */
export default function LabelSelector({ onAddLabels }: LabelSelectorProps) {
  const [savedLabels, setSavedLabels] = useState<LabelDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedLabels();
  }, []);

  const loadSavedLabels = async () => {
    setIsLoading(true);
    try {
      // 从本地数据库加载
      const localLabels = await getSavedLabels();
      console.log('从本地加载的标签数量:', localLabels.length);
      
      // 从云端加载（如果已登录）
      const { designs: cloudLabels, error: cloudError } = await loadDesignsFromCloud();
      console.log('从云端加载的标签数量:', cloudLabels.length);
      
      if (cloudError && !cloudError.includes('未登录')) {
        console.warn('云存储加载警告:', cloudError);
      }
      
      // 合并本地和云端标签（避免重复）
      const allLabelsMap = new Map();
      
      // 先添加本地标签
      localLabels.forEach(label => {
        const key = label.labelId || label.productData?.name || '';
        if (key) allLabelsMap.set(key, label);
      });
      
      // 再添加云端标签（覆盖重复的）
      cloudLabels.forEach(label => {
        const key = label.labelId || label.productData?.name || '';
        if (key) allLabelsMap.set(key, label);
      });
      
      const allLabels = Array.from(allLabelsMap.values());
      console.log('合并后的标签总数:', allLabels.length);
      console.log('所有标签数据:', allLabels);
      
      setSavedLabels(allLabels);
      
      if (allLabels.length === 0) {
        console.log('没有找到已保存的标签。请先在标签编辑器中创建并保存标签。');
      }
    } catch (error) {
      console.error('加载保存的标签失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理点击标签，直接添加到画布
  const handleAddLabel = (label: LabelDesign) => {
    console.log('添加标签到画布:', label);
    onAddLabels([label]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">选择标签</h3>
          <button
            onClick={loadSavedLabels}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            title="刷新标签列表"
          >
            {isLoading ? '加载中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 标签列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">加载中...</span>
          </div>
        ) : savedLabels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">暂无保存的标签</p>
            <p className="text-xs text-gray-400 mt-2">请先到标签编辑器创建并保存标签</p>
            <div className="mt-4">
              <a 
                href="/editor"
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                前往标签编辑器
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {savedLabels.map((label, index) => {
              const labelId = label.labelId || `label_${index}`;

              return (
                <div
                  key={labelId}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => handleAddLabel(label)}
                >
                  <div className="flex items-start gap-3">
                    {/* 添加图标 */}
                    <div className="flex items-center justify-center w-8 h-8 border-2 border-blue-500 bg-blue-50 rounded">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>

                    {/* 标签信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {label.labelName || '未命名标签'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {label.productData?.name || '未知商品'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {label.labelSize.width}×{label.labelSize.height}mm
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      {savedLabels.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <span className="text-gray-500">
              点击标签即可添加到画布，重复点击可添加多个
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
