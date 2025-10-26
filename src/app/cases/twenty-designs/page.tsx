'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Tag, Palette, Settings, Copy, Star, Heart, ShoppingCart, Coffee, Book, Smartphone, Watch, Headphones, Camera, Gamepad2, Laptop } from 'lucide-react';

export default function TwentyDesignsShowcase() {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  // 20种精美设计数据
  const designs = [
    {
      id: 'design-1',
      name: '简约现代风格',
      category: '数码电子',
      icon: Smartphone,
      description: '现代简约设计，突出价格对比和产品特色',
      colors: ['#3B82F6', '#6B7280', '#FFFFFF'],
      features: ['价格对比', '产品特色', '现代设计', '清晰层次'],
      preview: {
        productName: '无线耳机',
        price: '¥299',
        brand: '高清音质',
        originalPrice: '¥399',
        sellingPoints: ['原价¥399', '限时优惠', '现代设计']
      },
      popularity: 95,
      useCases: ['数码店', '电子产品', '现代零售']
    },
    {
      id: 'design-2',
      name: '促销活动风格',
      category: '零售商品',
      icon: Tag,
      description: '醒目的促销设计，突出限时优惠和折扣信息',
      colors: ['#FEF2F2', '#DC2626', '#FFFFFF'],
      features: ['限时标签', '折扣突出', '促销信息', '红色主题'],
      preview: {
        productName: '机械键盘',
        price: '¥199',
        brand: '立减50元',
        originalPrice: '¥249',
        sellingPoints: ['限时优惠', '原价¥249', '促销活动']
      },
      popularity: 88,
      useCases: ['促销活动', '限时优惠', '折扣商品']
    },
    {
      id: 'design-3',
      name: '高端质感风格',
      category: '时尚配饰',
      icon: Watch,
      description: '深色高端设计，突出产品品质和限量特性',
      colors: ['#111827', '#374151', '#FFFFFF'],
      features: ['深色主题', '限量标识', '高端质感', '品质保证'],
      preview: {
        productName: '智能手表',
        price: '¥1299',
        brand: '限量版',
        sellingPoints: ['含保修', '高端品质', '限量发售']
      },
      popularity: 85,
      useCases: ['奢侈品', '高端产品', '限量商品']
    },
    {
      id: 'design-4',
      name: '清新自然风格',
      category: '食品饮料',
      icon: Coffee,
      description: '绿色清新设计，突出有机和自然特色',
      colors: ['#F0FDF4', '#16A34A', '#FFFFFF'],
      features: ['绿色主题', '有机标识', '自然元素', '清新设计'],
      preview: {
        productName: '有机蔬菜',
        price: '¥5.99',
        brand: '每500g',
        sellingPoints: ['有机认证', '新鲜直达', '健康生活']
      },
      popularity: 82,
      useCases: ['有机食品', '健康产品', '生鲜超市']
    },
    {
      id: 'design-5',
      name: '复古怀旧风格',
      category: '食品饮料',
      icon: Coffee,
      description: '温暖复古设计，突出手工和传统特色',
      colors: ['#FEFCE8', '#CA8A04', '#FFFFFF'],
      features: ['复古色调', '手工标识', '传统元素', '温暖设计'],
      preview: {
        productName: '手工面包',
        price: '¥8.50',
        brand: '新鲜出炉',
        sellingPoints: ['手工制作', '传统工艺', '新鲜出炉']
      },
      popularity: 78,
      useCases: ['手工食品', '传统工艺', '烘焙店']
    },
    {
      id: 'design-6',
      name: '科技感风格',
      category: '数码电子',
      icon: Smartphone,
      description: '深蓝科技设计，突出高科技和性能特色',
      colors: ['#1E3A8A', '#3B82F6', '#FFFFFF'],
      features: ['科技元素', '条纹图案', '深蓝主题', '高性能标识'],
      preview: {
        productName: '处理器',
        price: '¥2499',
        brand: '高性能',
        sellingPoints: ['科技领先', '性能强劲', '专业级']
      },
      popularity: 90,
      useCases: ['电脑硬件', '科技产品', '专业设备']
    },
    {
      id: 'design-7',
      name: '极简主义风格',
      category: '服装配饰',
      icon: ShoppingCart,
      description: '极简设计，突出产品本质和简洁美感',
      colors: ['#FFFFFF', '#6B7280', '#000000'],
      features: ['极简设计', '纯色背景', '简洁布局', '产品本质'],
      preview: {
        productName: '纯棉T恤',
        price: '¥59',
        brand: '白色 / M',
        sellingPoints: ['纯棉材质', '舒适透气', '基础款']
      },
      popularity: 75,
      useCases: ['基础服装', '简约风格', '日常用品']
    },
    {
      id: 'design-8',
      name: '会员专享风格',
      category: '零售商品',
      icon: Tag,
      description: '紫色会员设计，突出会员特权和专属优惠',
      colors: ['#FAF5FF', '#9333EA', '#FFFFFF'],
      features: ['会员标识', '紫色主题', '专属优惠', '特权服务'],
      preview: {
        productName: '进口红酒',
        price: '¥159',
        brand: '会员价',
        originalPrice: '¥199',
        sellingPoints: ['原价¥199', '会员专享', '品质保证']
      },
      popularity: 80,
      useCases: ['会员商品', '专属优惠', '高端零售']
    },
    {
      id: 'design-9',
      name: '折扣突出风格',
      category: '服装配饰',
      icon: ShoppingCart,
      description: '红色折扣设计，突出大幅折扣和优惠力度',
      colors: ['#FFFFFF', '#DC2626', '#000000'],
      features: ['折扣标识', '红色主题', '优惠突出', '促销力度'],
      preview: {
        productName: '运动鞋',
        price: '¥419',
        brand: '30%折扣',
        originalPrice: '¥599',
        sellingPoints: ['原价¥599', '大幅优惠', '限时特价']
      },
      popularity: 92,
      useCases: ['运动用品', '大幅折扣', '促销活动']
    },
    {
      id: 'design-10',
      name: '黑白简约风格',
      category: '食品饮料',
      icon: Coffee,
      description: '经典黑白设计，突出产品品质和简约美感',
      colors: ['#FFFFFF', '#000000', '#6B7280'],
      features: ['黑白配色', '简约设计', '品质突出', '经典风格'],
      preview: {
        productName: '精品咖啡',
        price: '¥32',
        brand: '中杯 / 热',
        sellingPoints: ['精品豆', '现磨现做', '品质保证']
      },
      popularity: 85,
      useCases: ['咖啡店', '精品饮品', '简约风格']
    },
    {
      id: 'design-11',
      name: '活泼童趣风格',
      category: '儿童用品',
      icon: ShoppingCart,
      description: '橙色活泼设计，突出儿童产品和趣味性',
      colors: ['#FFF7ED', '#EA580C', '#FFFFFF'],
      features: ['橙色主题', '童趣元素', '活泼设计', '儿童友好'],
      preview: {
        productName: '儿童玩具',
        price: '¥79',
        brand: '限时特惠',
        sellingPoints: ['安全材质', '益智玩具', '儿童喜爱']
      },
      popularity: 88,
      useCases: ['儿童用品', '玩具店', '亲子商品']
    },
    {
      id: 'design-12',
      name: '专业设备风格',
      category: '摄影器材',
      icon: Camera,
      description: '灰色专业设计，突出专业级设备和品质',
      colors: ['#F9FAFB', '#374151', '#FFFFFF'],
      features: ['灰色主题', '专业标识', '设备图标', '品质保证'],
      preview: {
        productName: '数码相机',
        price: '¥5999',
        brand: '专业级',
        sellingPoints: ['专业设备', '高画质', '专业摄影']
      },
      popularity: 82,
      useCases: ['摄影器材', '专业设备', '数码产品']
    },
    {
      id: 'design-13',
      name: '食品标签风格',
      category: '食品饮料',
      icon: Coffee,
      description: '红色食品设计，突出新鲜和健康特色',
      colors: ['#FEF2F2', '#DC2626', '#FFFFFF'],
      features: ['红色主题', '新鲜标识', '食品图标', '健康元素'],
      preview: {
        productName: '新鲜水果盒',
        price: '¥15.8',
        brand: '今日新鲜',
        sellingPoints: ['新鲜直达', '营养丰富', '健康生活']
      },
      popularity: 85,
      useCases: ['生鲜食品', '健康产品', '超市商品']
    },
    {
      id: 'design-14',
      name: '服务类风格',
      category: '生活服务',
      icon: ShoppingCart,
      description: '靛蓝服务设计，突出专业服务和时间标识',
      colors: ['#EEF2FF', '#4F46E5', '#FFFFFF'],
      features: ['靛蓝主题', '服务标识', '时间标注', '专业服务'],
      preview: {
        productName: '按摩服务',
        price: '¥198',
        brand: '60分钟',
        sellingPoints: ['专业技师', '舒适体验', '放松身心']
      },
      popularity: 78,
      useCases: ['生活服务', '健康服务', '专业服务']
    },
    {
      id: 'design-15',
      name: '会员积分风格',
      category: '生活服务',
      icon: ShoppingCart,
      description: '青色积分设计，突出会员积分和健身特色',
      colors: ['#F0FDFA', '#0D9488', '#FFFFFF'],
      features: ['青色主题', '积分标识', '健身元素', '会员福利'],
      preview: {
        productName: '健身课程',
        price: '¥88',
        brand: '可积100分',
        sellingPoints: ['专业教练', '会员积分', '健康生活']
      },
      popularity: 80,
      useCases: ['健身服务', '会员积分', '健康生活']
    },
    {
      id: 'design-16',
      name: '限量款风格',
      category: '时尚配饰',
      icon: Watch,
      description: '深色限量设计，突出限量特性和设计师款',
      colors: ['#1F2937', '#DC2626', '#FFFFFF'],
      features: ['深色主题', '限量标识', '设计师款', '稀缺性'],
      preview: {
        productName: '设计师款',
        price: '¥1299',
        brand: '仅50件',
        sellingPoints: ['限量发售', '设计师款', '独特设计']
      },
      popularity: 90,
      useCases: ['限量商品', '设计师款', '高端时尚']
    },
    {
      id: 'design-17',
      name: '季节性风格',
      category: '服装配饰',
      icon: ShoppingCart,
      description: '蓝色季节设计，突出新品上市和季节特色',
      colors: ['#EFF6FF', '#2563EB', '#FFFFFF'],
      features: ['蓝色主题', '季节元素', '新品标识', '季节特色'],
      preview: {
        productName: '冬季外套',
        price: '¥399',
        brand: '新品上市',
        sellingPoints: ['保暖舒适', '时尚设计', '冬季必备']
      },
      popularity: 85,
      useCases: ['季节性商品', '服装配饰', '新品上市']
    },
    {
      id: 'design-18',
      name: '组合套餐风格',
      category: '餐饮服务',
      icon: Coffee,
      description: '绿色套餐设计，突出组合优惠和餐饮特色',
      colors: ['#F0FDF4', '#16A34A', '#FFFFFF'],
      features: ['绿色主题', '套餐标识', '餐饮元素', '组合优惠'],
      preview: {
        productName: '三人套餐',
        price: '¥298',
        brand: '组合优惠',
        originalPrice: '¥368',
        sellingPoints: ['原价¥368', '超值套餐', '丰富菜品']
      },
      popularity: 88,
      useCases: ['餐饮套餐', '组合优惠', '团购商品']
    },
    {
      id: 'design-19',
      name: '电子礼品卡风格',
      category: '礼品服务',
      icon: Tag,
      description: '渐变礼品设计，突出电子券和礼品特色',
      colors: ['#7C3AED', '#4F46E5', '#FFFFFF'],
      features: ['渐变背景', '礼品标识', '电子券', '点状图案'],
      preview: {
        productName: '礼品卡',
        price: '¥500',
        brand: '电子券',
        sellingPoints: ['电子礼品', '便捷使用', '精美设计']
      },
      popularity: 82,
      useCases: ['礼品卡', '电子券', '礼品服务']
    },
    {
      id: 'design-20',
      name: '基础款风格',
      category: '图书文具',
      icon: Book,
      description: '简洁基础设计，突出产品规格和实用特色',
      colors: ['#FFFFFF', '#6B7280', '#000000'],
      features: ['简洁设计', '规格标识', '基础款', '实用特色'],
      preview: {
        productName: '笔记本',
        price: '¥12.9',
        brand: 'A5规格',
        sellingPoints: ['优质纸张', '实用设计', '基础必备']
      },
      popularity: 75,
      useCases: ['文具用品', '基础商品', '办公用品']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/cases" className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">返回案例</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                编辑器
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                文档
              </Link>
              <Link href="/layout-templates" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                布局模板
              </Link>
              <Link href="/cases" className="text-blue-600 font-medium text-sm">
                案例展示
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            20种精美标价签设计
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            严格套用优秀设计示范，涵盖各种风格和场景的标价签设计案例
          </p>
        </div>

        {/* 设计网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {designs.map((design) => {
            const IconComponent = design.icon;
            return (
              <div
                key={design.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => setSelectedDesign(design.id)}
              >
                {/* 设计预览 */}
                <div className="p-4 bg-gray-50">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mx-auto" style={{ maxWidth: '200px' }}>
                    <div className="text-xs text-gray-500 mb-1">{design.preview.brand}</div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{design.preview.productName}</div>
                    <div className="text-lg font-bold text-blue-600">{design.preview.price}</div>
                    {design.preview.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">{design.preview.originalPrice}</div>
                    )}
                  </div>
                </div>

                {/* 设计信息 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-blue-50 rounded">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {design.name}
                        </h3>
                        <p className="text-xs text-gray-500">{design.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">{design.popularity}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {design.description}
                  </p>

                  {/* 颜色预览 */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs text-gray-500">配色:</span>
                    <div className="flex space-x-1">
                      {design.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 功能特性 */}
                  <div className="flex flex-wrap gap-1">
                    {design.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 卡片底部 */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      适用: {design.useCases.slice(0, 1).join(', ')}
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700">
                      <span className="text-xs font-medium">查看详情</span>
                      <Eye className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部行动号召 */}
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            开始使用这些精美设计
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            选择您喜欢的设计风格，在编辑器中创建专属的标价签布局
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/editor"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-5 w-5 mr-2" />
              开始设计
            </Link>
            <Link
              href="/cases"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              浏览所有案例
            </Link>
          </div>
        </div>
      </div>

      {/* 设计详情模态框 */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const design = designs.find(d => d.id === selectedDesign);
              if (!design) return null;
              
              const IconComponent = design.icon;
              return (
                <div className="p-6">
                  {/* 模态框头部 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{design.name}</h2>
                        <p className="text-gray-600">{design.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDesign(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左侧：详细信息 */}
                    <div className="space-y-6">
                      {/* 描述 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">设计描述</h3>
                        <p className="text-gray-600">{design.description}</p>
                      </div>

                      {/* 功能特性 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">设计特点</h3>
                        <div className="flex flex-wrap gap-2">
                          {design.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 适用场景 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">适用场景</h3>
                        <div className="flex flex-wrap gap-2">
                          {design.useCases.map((useCase, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-md"
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 配色方案 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">配色方案</h3>
                        <div className="flex items-center space-x-4">
                          {design.colors.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div
                                className="w-8 h-8 rounded-lg border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm text-gray-600">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 右侧：预览和操作 */}
                    <div className="space-y-6">
                      {/* 预览区域 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">设计预览</h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mx-auto" style={{ maxWidth: '300px' }}>
                            <div className="text-xs text-gray-500 mb-1">{design.preview.brand}</div>
                            <div className="text-sm font-medium text-gray-900 mb-2">{design.preview.productName}</div>
                            <div className="text-lg font-bold text-blue-600 mb-2">{design.preview.price}</div>
                            {design.preview.originalPrice && (
                              <div className="text-xs text-gray-400 line-through mb-2">{design.preview.originalPrice}</div>
                            )}
                            <div className="space-y-1">
                              {design.preview.sellingPoints.map((point, index) => (
                                <div key={index} className="text-xs text-gray-500">• {point}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="space-y-3">
                        <Link
                          href={`/editor?template=${design.id}`}
                          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          使用此设计
                        </Link>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <Copy className="h-5 w-5 mr-2" />
                          复制设计
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition-colors">
                          <Download className="h-5 w-5 mr-2" />
                          下载模板
                        </button>
                      </div>

                      {/* 热度信息 */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">设计热度</div>
                            <div className="text-2xl font-bold text-gray-900">{design.popularity}</div>
                          </div>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
