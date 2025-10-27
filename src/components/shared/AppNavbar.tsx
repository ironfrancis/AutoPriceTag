'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CloudSyncButton from '../editor/CloudSyncButton';

interface AppNavbarProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode; // 可选的右侧内容
}

/**
 * 共用的应用导航栏组件
 * 
 * 用于标签编辑器和整页排版页面
 * - 显示页面标题
 * - 显示登录状态
 * - 提供返回首页链接
 * - 可自定义右侧内容
 */
export default function AppNavbar({ 
  title, 
  subtitle, 
  backHref = '/',
  backLabel = '返回首页',
  children 
}: AppNavbarProps) {
  return (
    <nav className="bg-stone-100 border-b border-stone-200 shadow-sm flex-shrink-0">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={backHref}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
            <div className="h-6 w-px bg-stone-300"></div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-heading text-gray-900">{title}</span>
                {subtitle && (
                  <span className="text-xs text-gray-600">{subtitle}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 云同步状态 */}
            <CloudSyncButton />
            
            {/* 自定义内容（按钮、选择器等） */}
            {children && (
              <>
                <div className="h-6 w-px bg-stone-300"></div>
                {children}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
