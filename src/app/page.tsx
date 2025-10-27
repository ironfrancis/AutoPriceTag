import Link from "next/link";
import { ArrowRight, Palette, Download, Zap, Move } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">AutoPriceTag</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/draggable-editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                标签编辑器
              </Link>
              <Link href="/page-layout" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                整页排版
              </Link>
              <Link href="/cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                案例展示
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                文档
              </Link>
              <Link
                href="/draggable-editor"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                开始设计
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">
              价签排版助手
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              智能设计商品价签，一键生成专业排版
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-4">
              <Link
                href="/draggable-editor"
                className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                开始设计
              </Link>
              <Link
                href="/page-layout"
                className="px-6 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                整页排版
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 拖拽编辑 */}
            <Link href="/draggable-editor" className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors group">
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Move className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">拖拽编辑</h3>
              <p className="mt-1 text-xs text-gray-600">
                自由拖拽布局，所见即所得
              </p>
            </Link>

            {/* 整页排版 */}
            <Link href="/page-layout" className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors group">
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">整页排版</h3>
              <p className="mt-1 text-xs text-gray-600">
                混合排列多个标签到标准纸张
              </p>
            </Link>

            {/* 智能设计 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                <Palette className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">智能设计</h3>
              <p className="mt-1 text-xs text-gray-600">
                预设模板，智能布局
              </p>
            </div>

            {/* 高清导出 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                <Download className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">高清导出</h3>
              <p className="mt-1 text-xs text-gray-600">
                PNG、PDF多种格式
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-12 border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              开始设计您的价签
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              无需注册，打开即用
            </p>
            <div className="mt-6">
              <Link
                href="/draggable-editor"
                className="inline-flex items-center px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                开始设计
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-6 w-6 rounded bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-xs">APT</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">AutoPriceTag</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              © 2025 AutoPriceTag
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
