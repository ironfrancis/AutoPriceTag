'use client';

import Link from 'next/link';
import EnhancedEditor from '@/components/editor/EnhancedEditor';

export default function EnhancedEditorPage() {
  const handleSave = (data: any) => {
    console.log('保存数据:', data);
  };

  const handleExport = (format: string) => {
    console.log('导出格式:', format);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">AutoPriceTag</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                基础编辑器
              </Link>
              <Link href="/enhanced-editor" className="text-blue-600 font-medium text-sm">
                增强编辑器
              </Link>
              <Link href="/cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                案例展示
              </Link>
              <Link href="/layout-templates" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                布局模板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 增强编辑器 */}
      <EnhancedEditor onSave={handleSave} onExport={handleExport} />
    </div>
  );
}
