import Link from "next/link";
import { ArrowRight, Palette, Download, Zap, Move } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* 极简导航栏 */}
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
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                智能编辑器
              </Link>
              <Link href="/draggable-editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                可拖拽编辑器
              </Link>
              <Link href="/cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                案例展示
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                文档
              </Link>
              <Link
                href="/editor"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                开始设计
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              自动价签排版助手
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              智能设计商品标价签，一键生成专业排版，支持多种模板和高清导出。
              让价签制作变得简单高效，提升您的零售运营效率。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/editor"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                立即开始
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/cases"
                className="btn btn-outline px-8 py-3 text-lg"
              >
                浏览案例
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              核心功能特性
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              专业的设计工具，让价签制作变得简单高效
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* 智能设计 */}
            <div className="card p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Palette className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">智能设计</h3>
              <p className="mt-2 text-gray-600">
                预设多种精美模板，支持自定义样式，智能布局让设计变得简单
              </p>
            </div>

            {/* 可拖拽编辑 - 新功能 */}
            <Link href="/draggable-editor" className="card p-8 text-center hover:shadow-lg transition-all group">
              <div className="mx-auto h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Move className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">可拖拽编辑</h3>
              <p className="mt-2 text-gray-600">
                拖动调整元素位置，自由布局，所见即所得的编辑体验
              </p>
              <span className="mt-2 inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✨ 新功能</span>
            </Link>

            {/* 一键导出 */}
            <div className="card p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">一键导出</h3>
              <p className="mt-2 text-gray-600">
                支持PNG、PDF等多种格式，高清打印质量，满足各种打印需求
              </p>
            </div>

            {/* 高效排版 */}
            <div className="card p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">高效排版</h3>
              <p className="mt-2 text-gray-600">
                智能计算最优布局，支持批量操作，大幅提升工作效率
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 模板预览 */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              精选模板
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              多种风格模板，满足不同场景需求
            </p>
            <div className="mt-6">
              <Link
                href="/editor"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                立即创建标签
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* 基础简约款 */}
            <div className="card p-6">
              <div className="aspect-[4/3] bg-white border-2 border-gray-200 rounded-lg flex flex-col justify-between p-4">
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">商品名称</div>
                  <div className="text-xs text-gray-500 mt-1">规格参数</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">¥99.00</div>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">基础简约款</h3>
              <p className="mt-2 text-sm text-gray-600">简洁大方，适合超市、便利店等通用场景</p>
            </div>

            {/* 促销活动款 */}
            <div className="card p-6">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex flex-col justify-between p-4">
                <div className="text-center">
                  <div className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mb-2">促销</div>
                  <div className="text-sm font-medium text-white">商品名称</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white line-through">¥199.00</div>
                  <div className="text-lg font-bold text-yellow-300">¥99.00</div>
                  <div className="text-xs text-white">5折</div>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">促销活动款</h3>
              <p className="mt-2 text-sm text-gray-600">色彩鲜明，突出优惠信息，适合促销活动</p>
            </div>

            {/* 高端质感款 */}
            <div className="card p-6">
              <div className="aspect-[4/3] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg flex flex-col justify-between p-4">
                <div className="flex items-start justify-between">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">商品名称</div>
                    <div className="text-lg font-bold text-gray-900">¥299.00</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">高端品质，值得信赖</div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">高端质感款</h3>
              <p className="mt-2 text-sm text-gray-600">优雅设计，适合精品店、美妆店等高端场景</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              立即开始设计您的价签
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              无需注册，打开即用，让价签制作变得简单高效
            </p>
            <div className="mt-8">
              <Link
                href="/editor"
                className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                开始设计
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-bold text-white">AutoPriceTag</span>
            </div>
            <p className="mt-4 text-gray-400">
              © 2024 AutoPriceTag. 让价签制作变得简单高效.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
