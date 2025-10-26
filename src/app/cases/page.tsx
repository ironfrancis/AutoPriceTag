'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Eye, Star, Tag, ShoppingCart, Coffee, Book, Smartphone, Watch, Headphones, Camera, Gamepad2, Laptop, X, Copy, ExternalLink } from 'lucide-react';

// 预设的标价签案例数据
const labelCases = [
  {
    id: 'case-1',
    name: '经典商品标价签',
    description: '适用于大多数零售商品的通用标价签设计',
    category: '零售商品',
    icon: ShoppingCart,
    size: { width: 50, height: 30 },
    ratio: '5:3',
    features: ['商品名称', '价格突出', '品牌标识', '简洁布局'],
    colors: ['#1E88E5', '#FF9800', '#4CAF50'],
    preview: {
      productName: '苹果 iPhone 15 Pro',
      price: '¥8,999',
      brand: 'Apple',
      sellingPoints: ['A17 Pro芯片', '钛金属设计', '专业摄影']
    },
    popularity: 95,
    useCases: ['电子产品', '服装', '日用品']
  },
  {
    id: 'case-2',
    name: '餐饮菜单标价',
    description: '专为餐饮行业设计的菜单标价签',
    category: '餐饮服务',
    icon: Coffee,
    size: { width: 60, height: 40 },
    ratio: '3:2',
    features: ['菜品名称', '价格醒目', '特色标注', '营养信息'],
    colors: ['#FF5722', '#4CAF50', '#FFC107'],
    preview: {
      productName: '招牌牛肉面',
      price: '¥28',
      brand: '老北京',
      sellingPoints: ['手工拉面', '秘制汤底', '新鲜牛肉']
    },
    popularity: 88,
    useCases: ['餐厅', '咖啡厅', '快餐店']
  },
  {
    id: 'case-3',
    name: '图书标价签',
    description: '适合书店和图书馆的图书标价设计',
    category: '图书文具',
    icon: Book,
    size: { width: 45, height: 35 },
    ratio: '9:7',
    features: ['书名', '作者', '价格', 'ISBN'],
    colors: ['#673AB7', '#2196F3', '#795548'],
    preview: {
      productName: '《三体》',
      price: '¥39.8',
      brand: '刘慈欣',
      sellingPoints: ['科幻经典', '雨果奖', '全系列']
    },
    popularity: 82,
    useCases: ['书店', '图书馆', '文具店']
  },
  {
    id: 'case-4',
    name: '数码产品标价',
    description: '专为数码产品设计的专业标价签',
    category: '数码电子',
    icon: Smartphone,
    size: { width: 55, height: 25 },
    ratio: '11:5',
    features: ['产品型号', '规格参数', '价格对比', '促销信息'],
    colors: ['#00BCD4', '#FF9800', '#E91E63'],
    preview: {
      productName: 'MacBook Pro 16"',
      price: '¥19,999',
      brand: 'Apple',
      sellingPoints: ['M3 Max芯片', '32GB内存', '1TB存储']
    },
    popularity: 91,
    useCases: ['数码店', '电脑城', '电商展示']
  },
  {
    id: 'case-5',
    name: '时尚配饰标价',
    description: '适合时尚配饰的精致标价设计',
    category: '时尚配饰',
    icon: Watch,
    size: { width: 40, height: 40 },
    ratio: '1:1',
    features: ['品牌标识', '产品名称', '价格', '材质信息'],
    colors: ['#9C27B0', '#FF5722', '#607D8B'],
    preview: {
      productName: 'Rolex Submariner',
      price: '¥85,000',
      brand: 'Rolex',
      sellingPoints: ['潜水表', '瑞士制造', '经典设计']
    },
    popularity: 76,
    useCases: ['珠宝店', '手表店', '奢侈品']
  },
  {
    id: 'case-6',
    name: '音响设备标价',
    description: '音响设备的专业标价签设计',
    category: '音响设备',
    icon: Headphones,
    size: { width: 50, height: 35 },
    ratio: '10:7',
    features: ['产品型号', '技术规格', '价格', '音质标识'],
    colors: ['#3F51B5', '#FF9800', '#4CAF50'],
    preview: {
      productName: 'Sony WH-1000XM5',
      price: '¥2,299',
      brand: 'Sony',
      sellingPoints: ['降噪耳机', '30小时续航', 'Hi-Res音质']
    },
    popularity: 84,
    useCases: ['音响店', '数码城', '专业设备']
  },
  {
    id: 'case-7',
    name: '摄影器材标价',
    description: '摄影器材的专业标价设计',
    category: '摄影器材',
    icon: Camera,
    size: { width: 60, height: 30 },
    ratio: '2:1',
    features: ['相机型号', '镜头规格', '价格', '技术参数'],
    colors: ['#FF5722', '#2196F3', '#4CAF50'],
    preview: {
      productName: 'Canon EOS R5',
      price: '¥25,999',
      brand: 'Canon',
      sellingPoints: ['8K视频', '4500万像素', '全画幅']
    },
    popularity: 79,
    useCases: ['摄影器材店', '专业设备', '租赁服务']
  },
  {
    id: 'case-8',
    name: '游戏设备标价',
    description: '游戏设备的炫酷标价设计',
    category: '游戏设备',
    icon: Gamepad2,
    size: { width: 55, height: 35 },
    ratio: '11:7',
    features: ['游戏名称', '平台标识', '价格', '特色功能'],
    colors: ['#E91E63', '#00BCD4', '#FF9800'],
    preview: {
      productName: 'PlayStation 5',
      price: '¥4,299',
      brand: 'Sony',
      sellingPoints: ['4K游戏', 'SSD存储', 'DualSense手柄']
    },
    popularity: 87,
    useCases: ['游戏店', '数码城', '娱乐设备']
  },
  {
    id: 'case-9',
    name: '笔记本电脑标价',
    description: '笔记本电脑的专业标价设计',
    category: '电脑设备',
    icon: Laptop,
    size: { width: 65, height: 25 },
    ratio: '13:5',
    features: ['型号规格', '配置信息', '价格', '性能标识'],
    colors: ['#2196F3', '#FF9800', '#4CAF50'],
    preview: {
      productName: 'ThinkPad X1 Carbon',
      price: '¥12,999',
      brand: 'Lenovo',
      sellingPoints: ['轻薄便携', '商务首选', '长续航']
    },
    popularity: 83,
    useCases: ['电脑城', '办公设备', '商务用品']
  },
  {
    id: 'case-10',
    name: '简洁双栏标价签',
    description: '简洁优雅的双栏布局设计，突出品牌和价格信息',
    category: '零售商品',
    icon: Tag,
    size: { width: 50, height: 30 },
    ratio: '5:3',
    features: ['品牌标识', '产品名称', '价格突出', '简洁布局'],
    colors: ['#FFB6C1', '#000000', '#DC143C'],
    preview: {
      productName: '爱好',
      price: '3元',
      brand: '品牌',
      sellingPoints: ['热可擦 红', '简洁设计', '价格醒目']
    },
    popularity: 92,
    useCases: ['文具店', '日用品', '小商品']
  },
  // 新增20种精美标价签设计
  {
    id: 'case-11',
    name: '简约现代风格',
    description: '现代简约设计，突出价格对比和产品特色',
    category: '数码电子',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['价格对比', '产品特色', '现代设计', '清晰层次'],
    colors: ['#3B82F6', '#6B7280', '#FFFFFF'],
    preview: {
      productName: '无线耳机',
      price: '¥299',
      brand: '高清音质',
      sellingPoints: ['原价¥399', '限时优惠', '现代设计']
    },
    popularity: 95,
    useCases: ['数码店', '电子产品', '现代零售']
  },
  {
    id: 'case-12',
    name: '促销活动风格',
    description: '醒目的促销设计，突出限时优惠和折扣信息',
    category: '零售商品',
    icon: Tag,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['限时标签', '折扣突出', '促销信息', '红色主题'],
    colors: ['#FEF2F2', '#DC2626', '#FFFFFF'],
    preview: {
      productName: '机械键盘',
      price: '¥199',
      brand: '立减50元',
      sellingPoints: ['限时优惠', '原价¥249', '促销活动']
    },
    popularity: 88,
    useCases: ['促销活动', '限时优惠', '折扣商品']
  },
  {
    id: 'case-13',
    name: '高端质感风格',
    description: '深色高端设计，突出产品品质和限量特性',
    category: '时尚配饰',
    icon: Watch,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['深色主题', '限量标识', '高端质感', '品质保证'],
    colors: ['#111827', '#374151', '#FFFFFF'],
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
    id: 'case-14',
    name: '清新自然风格',
    description: '绿色清新设计，突出有机和自然特色',
    category: '食品饮料',
    icon: Coffee,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['绿色主题', '有机标识', '自然元素', '清新设计'],
    colors: ['#F0FDF4', '#16A34A', '#FFFFFF'],
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
    id: 'case-15',
    name: '复古怀旧风格',
    description: '温暖复古设计，突出手工和传统特色',
    category: '食品饮料',
    icon: Coffee,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['复古色调', '手工标识', '传统元素', '温暖设计'],
    colors: ['#FEFCE8', '#CA8A04', '#FFFFFF'],
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
    id: 'case-16',
    name: '科技感风格',
    description: '深蓝科技设计，突出高科技和性能特色',
    category: '数码电子',
    icon: Smartphone,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['科技元素', '条纹图案', '深蓝主题', '高性能标识'],
    colors: ['#1E3A8A', '#3B82F6', '#FFFFFF'],
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
    id: 'case-17',
    name: '极简主义风格',
    description: '极简设计，突出产品本质和简洁美感',
    category: '服装配饰',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['极简设计', '纯色背景', '简洁布局', '产品本质'],
    colors: ['#FFFFFF', '#6B7280', '#000000'],
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
    id: 'case-18',
    name: '会员专享风格',
    description: '紫色会员设计，突出会员特权和专属优惠',
    category: '零售商品',
    icon: Tag,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['会员标识', '紫色主题', '专属优惠', '特权服务'],
    colors: ['#FAF5FF', '#9333EA', '#FFFFFF'],
    preview: {
      productName: '进口红酒',
      price: '¥159',
      brand: '会员价',
      sellingPoints: ['原价¥199', '会员专享', '品质保证']
    },
    popularity: 80,
    useCases: ['会员商品', '专属优惠', '高端零售']
  },
  {
    id: 'case-19',
    name: '折扣突出风格',
    description: '红色折扣设计，突出大幅折扣和优惠力度',
    category: '服装配饰',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['折扣标识', '红色主题', '优惠突出', '促销力度'],
    colors: ['#FFFFFF', '#DC2626', '#000000'],
    preview: {
      productName: '运动鞋',
      price: '¥419',
      brand: '30%折扣',
      sellingPoints: ['原价¥599', '大幅优惠', '限时特价']
    },
    popularity: 92,
    useCases: ['运动用品', '大幅折扣', '促销活动']
  },
  {
    id: 'case-20',
    name: '黑白简约风格',
    description: '经典黑白设计，突出产品品质和简约美感',
    category: '食品饮料',
    icon: Coffee,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['黑白配色', '简约设计', '品质突出', '经典风格'],
    colors: ['#FFFFFF', '#000000', '#6B7280'],
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
    id: 'case-21',
    name: '活泼童趣风格',
    description: '橙色活泼设计，突出儿童产品和趣味性',
    category: '儿童用品',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['橙色主题', '童趣元素', '活泼设计', '儿童友好'],
    colors: ['#FFF7ED', '#EA580C', '#FFFFFF'],
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
    id: 'case-22',
    name: '专业设备风格',
    description: '灰色专业设计，突出专业级设备和品质',
    category: '摄影器材',
    icon: Camera,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['灰色主题', '专业标识', '设备图标', '品质保证'],
    colors: ['#F9FAFB', '#374151', '#FFFFFF'],
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
    id: 'case-23',
    name: '食品标签风格',
    description: '红色食品设计，突出新鲜和健康特色',
    category: '食品饮料',
    icon: Coffee,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['红色主题', '新鲜标识', '食品图标', '健康元素'],
    colors: ['#FEF2F2', '#DC2626', '#FFFFFF'],
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
    id: 'case-24',
    name: '服务类风格',
    description: '靛蓝服务设计，突出专业服务和时间标识',
    category: '生活服务',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['靛蓝主题', '服务标识', '时间标注', '专业服务'],
    colors: ['#EEF2FF', '#4F46E5', '#FFFFFF'],
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
    id: 'case-25',
    name: '会员积分风格',
    description: '青色积分设计，突出会员积分和健身特色',
    category: '生活服务',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['青色主题', '积分标识', '健身元素', '会员福利'],
    colors: ['#F0FDFA', '#0D9488', '#FFFFFF'],
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
    id: 'case-26',
    name: '限量款风格',
    description: '深色限量设计，突出限量特性和设计师款',
    category: '时尚配饰',
    icon: Watch,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['深色主题', '限量标识', '设计师款', '稀缺性'],
    colors: ['#1F2937', '#DC2626', '#FFFFFF'],
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
    id: 'case-27',
    name: '季节性风格',
    description: '蓝色季节设计，突出新品上市和季节特色',
    category: '服装配饰',
    icon: ShoppingCart,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['蓝色主题', '季节元素', '新品标识', '季节特色'],
    colors: ['#EFF6FF', '#2563EB', '#FFFFFF'],
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
    id: 'case-28',
    name: '组合套餐风格',
    description: '绿色套餐设计，突出组合优惠和餐饮特色',
    category: '餐饮服务',
    icon: Coffee,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['绿色主题', '套餐标识', '餐饮元素', '组合优惠'],
    colors: ['#F0FDF4', '#16A34A', '#FFFFFF'],
    preview: {
      productName: '三人套餐',
      price: '¥298',
      brand: '组合优惠',
      sellingPoints: ['原价¥368', '超值套餐', '丰富菜品']
    },
    popularity: 88,
    useCases: ['餐饮套餐', '组合优惠', '团购商品']
  },
  {
    id: 'case-29',
    name: '电子礼品卡风格',
    description: '渐变礼品设计，突出电子券和礼品特色',
    category: '礼品服务',
    icon: Tag,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['渐变背景', '礼品标识', '电子券', '点状图案'],
    colors: ['#7C3AED', '#4F46E5', '#FFFFFF'],
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
    id: 'case-30',
    name: '基础款风格',
    description: '简洁基础设计，突出产品规格和实用特色',
    category: '图书文具',
    icon: Book,
    size: { width: 80, height: 30 },
    ratio: '8:3',
    features: ['简洁设计', '规格标识', '基础款', '实用特色'],
    colors: ['#FFFFFF', '#6B7280', '#000000'],
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

// 分类数据
const categories = [
  { id: 'all', name: '全部', count: labelCases.length },
  { id: 'retail', name: '零售商品', count: labelCases.filter(c => c.category === '零售商品').length },
  { id: 'food', name: '餐饮服务', count: labelCases.filter(c => c.category === '餐饮服务').length },
  { id: 'book', name: '图书文具', count: labelCases.filter(c => c.category === '图书文具').length },
  { id: 'digital', name: '数码电子', count: labelCases.filter(c => c.category === '数码电子').length },
  { id: 'fashion', name: '时尚配饰', count: labelCases.filter(c => c.category === '时尚配饰').length },
  { id: 'audio', name: '音响设备', count: labelCases.filter(c => c.category === '音响设备').length },
  { id: 'photo', name: '摄影器材', count: labelCases.filter(c => c.category === '摄影器材').length },
  { id: 'gaming', name: '游戏设备', count: labelCases.filter(c => c.category === '游戏设备').length },
  { id: 'computer', name: '电脑设备', count: labelCases.filter(c => c.category === '电脑设备').length },
  { id: 'children', name: '儿童用品', count: labelCases.filter(c => c.category === '儿童用品').length },
  { id: 'service', name: '生活服务', count: labelCases.filter(c => c.category === '生活服务').length },
  { id: 'gift', name: '礼品服务', count: labelCases.filter(c => c.category === '礼品服务').length },
  { id: 'clothing', name: '服装配饰', count: labelCases.filter(c => c.category === '服装配饰').length },
  { id: 'beverage', name: '食品饮料', count: labelCases.filter(c => c.category === '食品饮料').length }
];

export default function CasesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // 过滤案例
  const filteredCases = selectedCategory === 'all' 
    ? labelCases 
    : labelCases.filter(case_ => {
        const categoryMap: Record<string, string> = {
          'retail': '零售商品',
          'food': '餐饮服务', 
          'book': '图书文具',
          'digital': '数码电子',
          'fashion': '时尚配饰',
          'audio': '音响设备',
          'photo': '摄影器材',
          'gaming': '游戏设备',
          'computer': '电脑设备',
          'children': '儿童用品',
          'service': '生活服务',
          'gift': '礼品服务',
          'clothing': '服装配饰',
          'beverage': '食品饮料'
        };
        return case_.category === categoryMap[selectedCategory];
      });

  // 按热度排序
  const sortedCases = [...filteredCases].sort((a, b) => b.popularity - a.popularity);

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
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                首页
              </Link>
              <Link href="/editor" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                编辑器
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                文档
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
            30种精美标价签设计案例
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            涵盖各种行业和场景的标价签设计案例，从简约现代到高端质感，找到适合您业务需求的完美布局
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 案例网格 */}
        <div className="cases-grid mb-12">
          {sortedCases.map(case_ => {
            const IconComponent = case_.icon;
            return (
              <div
                key={case_.id}
                className="case-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedCase(case_.id)}
              >
                {/* 卡片头部 */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {case_.name}
                        </h3>
                        <p className="text-sm text-gray-500">{case_.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{case_.popularity}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {case_.description}
                  </p>

                  {/* 尺寸和比例信息 */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {case_.size.width}×{case_.size.height}mm
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{case_.ratio}</span>
                    </div>
                  </div>

                  {/* 颜色预览 */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-500">配色:</span>
                    <div className="flex space-x-1">
                      {case_.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 预览区域 */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">{case_.preview.brand}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{case_.preview.productName}</div>
                      <div className="text-lg font-bold text-blue-600">{case_.preview.price}</div>
                    </div>
                  </div>

                  {/* 功能特性 */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">主要功能:</div>
                    <div className="flex flex-wrap gap-1">
                      {case_.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 卡片底部 */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      适用场景: {case_.useCases.slice(0, 2).join(', ')}
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">查看详情</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            开始创建您的标价签
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            选择您喜欢的案例，或者从零开始设计专属的标价签布局
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
              href="/cases/twenty-designs"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Star className="h-5 w-5 mr-2" />
              查看20种精美设计
            </Link>
            <Link
              href="/layout-templates"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              浏览模板
            </Link>
          </div>
        </div>
      </div>

      {/* 案例详情模态框 */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const case_ = labelCases.find(c => c.id === selectedCase);
              if (!case_) return null;
              
              const IconComponent = case_.icon;
              return (
                <div className="p-6">
                  {/* 模态框头部 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{case_.name}</h2>
                        <p className="text-gray-600">{case_.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左侧：详细信息 */}
                    <div className="space-y-6">
                      {/* 描述 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">案例描述</h3>
                        <p className="text-gray-600">{case_.description}</p>
                      </div>

                      {/* 规格信息 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">规格信息</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-1">尺寸</div>
                            <div className="font-semibold text-gray-900">
                              {case_.size.width} × {case_.size.height} mm
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-1">比例</div>
                            <div className="font-semibold text-gray-900">{case_.ratio}</div>
                          </div>
                        </div>
                      </div>

                      {/* 功能特性 */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">功能特性</h3>
                        <div className="flex flex-wrap gap-2">
                          {case_.features.map((feature, index) => (
                            <span
                              key={index}
                              className="tag tag-blue"
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
                          {case_.useCases.map((useCase, index) => (
                            <span
                              key={index}
                              className="tag tag-green"
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
                          {case_.colors.map((color, index) => (
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">预览效果</h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mx-auto" style={{ maxWidth: '300px' }}>
                            <div className="text-xs text-gray-500 mb-1">{case_.preview.brand}</div>
                            <div className="text-sm font-medium text-gray-900 mb-2">{case_.preview.productName}</div>
                            <div className="text-lg font-bold text-blue-600 mb-2">{case_.preview.price}</div>
                            <div className="space-y-1">
                              {case_.preview.sellingPoints.map((point, index) => (
                                <div key={index} className="text-xs text-gray-500">• {point}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="space-y-3">
                        {case_.id === 'case-10' ? (
                          <Link
                            href="/cases/simple-two-column"
                            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            查看演示
                          </Link>
                        ) : (
                          <Link
                            href={`/editor?template=${case_.id}`}
                            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            使用此案例
                          </Link>
                        )}
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <Copy className="h-5 w-5 mr-2" />
                          复制案例
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
                            <div className="text-sm text-gray-600">案例热度</div>
                            <div className="text-2xl font-bold text-gray-900">{case_.popularity}</div>
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
