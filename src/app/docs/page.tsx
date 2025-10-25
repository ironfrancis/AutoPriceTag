import Link from "next/link";
import { ArrowLeft, BookOpen, Code, HelpCircle, Zap, Download, Palette } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AutoPriceTag</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回首页</span>
              </Link>
              <Link
                href="/editor"
                className="btn btn-primary px-6 py-2"
              >
                开始设计
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            技术文档
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            AutoPriceTag 使用指南和技术架构说明
          </p>
        </div>

        {/* 快速开始 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 text-blue-600 mr-3" />
            快速开始
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">填写商品信息</h3>
                  <p className="text-gray-600">在左侧表单中输入商品名称、价格、品牌等基本信息</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">调整标签尺寸</h3>
                  <p className="text-gray-600">在预览区域下方调整标签的宽度和高度</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">预览和保存</h3>
                  <p className="text-gray-600">查看实时预览效果，满意后点击保存或导出</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能说明 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Palette className="h-6 w-6 text-blue-600 mr-3" />
            功能说明
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">商品信息管理</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 商品名称和价格设置</li>
                <li>• 品牌信息添加</li>
                <li>• 卖点说明（支持多个）</li>
                <li>• 规格参数自定义</li>
                <li>• 自定义字段扩展</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">标签设计</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 智能布局算法</li>
                <li>• 实时预览效果</li>
                <li>• 尺寸自定义调整</li>
                <li>• 字体大小自适应</li>
                <li>• 多行文本支持</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">保存和导出</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 本地标签保存</li>
                <li>• 缩略图预览</li>
                <li>• PNG 高清导出</li>
                <li>• JPG 压缩导出</li>
                <li>• PDF 矢量导出</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">用户体验</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 响应式设计</li>
                <li>• 实时保存状态</li>
                <li>• 错误提示友好</li>
                <li>• 加载状态显示</li>
                <li>• 键盘快捷键支持</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 技术架构 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Code className="h-6 w-6 text-blue-600 mr-3" />
            技术架构
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">前端技术栈</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>Next.js 16.0.0</strong> - React 全栈框架</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>TypeScript 5.9.3</strong> - 类型安全</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>Tailwind CSS 4.x</strong> - 样式系统</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>Canvas API</strong> - 画布渲染</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">数据存储</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>Dexie.js 3.2.7</strong> - IndexedDB 封装</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>Zustand 4.5.7</strong> - 状态管理</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>本地存储</strong> - 无需后端服务器</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700"><strong>实时同步</strong> - 数据持久化</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 技术文档链接 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">深入技术细节</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/docs/label-rendering"
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">标价签渲染技术</h5>
                    <p className="text-sm text-gray-600">Canvas渲染、智能布局算法详解</p>
                  </div>
                </Link>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg opacity-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-500">API 文档</h5>
                    <p className="text-sm text-gray-400">即将推出</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
            常见问题
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Q: 如何保存我的标签设计？</h3>
              <p className="text-gray-600">A: 填写完商品信息后，点击"保存标签"按钮即可将设计保存到本地。您可以通过"我的标签"按钮查看和管理已保存的标签。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Q: 支持哪些导出格式？</h3>
              <p className="text-gray-600">A: 目前支持 PNG（高清图片）、JPG（压缩图片）和 PDF（矢量文档）三种格式，满足不同的打印需求。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Q: 标签尺寸如何调整？</h3>
              <p className="text-gray-600">A: 在预览区域下方的尺寸编辑器中，您可以调整标签的宽度和高度（单位：毫米），系统会自动重新计算布局。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Q: 数据会丢失吗？</h3>
              <p className="text-gray-600">A: 所有数据都保存在浏览器的本地存储中，只要不清除浏览器数据，您的标签设计就会一直保存。建议定期导出备份重要设计。</p>
            </div>
          </div>
        </section>

        {/* 性能指标 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Download className="h-6 w-6 text-blue-600 mr-3" />
            性能指标
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 2s</div>
              <div className="text-gray-600">首屏加载时间</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">60fps</div>
              <div className="text-gray-600">画布渲染性能</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">&lt; 2MB</div>
              <div className="text-gray-600">包体积 (gzipped)</div>
            </div>
          </div>
        </section>

        {/* 开始使用 */}
        <section className="text-center">
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">准备开始设计了吗？</h2>
            <p className="text-blue-100 mb-6">立即体验 AutoPriceTag 的强大功能，让价签制作变得简单高效</p>
            <Link
              href="/editor"
              className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg inline-flex items-center"
            >
              开始设计
              <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
