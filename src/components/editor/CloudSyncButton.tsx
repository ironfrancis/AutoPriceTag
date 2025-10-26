'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Cloud, CloudOff, User, LogOut, Loader2 } from 'lucide-react';

/**
 * 云端同步状态指示器
 * 
 * 功能：
 * - 显示登录状态
 * - 提供登录/注册界面
 * - 不执行保存操作，仅作为状态指示
 */

interface CloudSyncButtonProps {
  // 移除 onSync 回调，不再执行保存操作
}

// 行业选项
const INDUSTRIES = [
  { value: 'retail', label: '零售业', icon: '🛍️' },
  { value: 'manufacturing', label: '制造业', icon: '🏭' },
  { value: 'food', label: '餐饮业', icon: '🍽️' },
  { value: 'hospitality', label: '酒店业', icon: '🏨' },
  { value: 'medical', label: '医疗业', icon: '⚕️' },
  { value: 'education', label: '教育业', icon: '🎓' },
  { value: 'logistics', label: '物流业', icon: '📦' },
  { value: 'other', label: '其他', icon: '📋' },
];

// 职位选项
const POSITIONS = [
  { value: 'owner', label: '企业主/店主', icon: '👔' },
  { value: 'manager', label: '经理/主管', icon: '💼' },
  { value: 'staff', label: '普通员工', icon: '👤' },
  { value: 'designer', label: '设计师', icon: '🎨' },
  { value: 'other', label: '其他', icon: '🙋' },
];

export default function CloudSyncButton({ }: CloudSyncButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // 新用户信息
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [position, setPosition] = useState('');
  const [workplaceSize, setWorkplaceSize] = useState('');

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
    
    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage('请填写邮箱和密码');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName,
              industry: industry,
              position: position,
              workplace_size: workplaceSize,
            }
          }
        });

        if (error) {
          setMessage(error.message);
        } else {
          // 保存用户信息到 Supabase
          if (data.user) {
            try {
              await supabase
                .from('user_profiles')
                .insert({
                  user_id: data.user.id,
                  company_name: companyName,
                  industry: industry,
                  position: position,
                  workplace_size: workplaceSize,
                });
            } catch (err) {
              console.log('保存用户信息失败（可选）:', err);
            }
          }
          
          setMessage('注册成功！请检查邮箱验证链接。');
          setTimeout(() => setShowLoginModal(false), 2000);
        }
      } else {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          setShowLoginModal(false);
          setIsLoggedIn(true);
          // 不再自动触发保存操作
        }
      }
    } catch (error) {
      setMessage('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
          <Cloud className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">已连接</span>
          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-2">
            <User className="h-4 w-4" />
            <span className="max-w-[100px] truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
            title="登出"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
          <CloudOff className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">未连接</span>
          <button
            onClick={() => setShowLoginModal(true)}
            className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
          >
            登录
          </button>
        </div>
      )}

      {/* 登录/注册弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* 标题 */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {isSignUp ? '创建账号' : '登录账号'}
              </h2>
              <p className="text-sm text-gray-500">
                {isSignUp ? '填写以下信息以创建账号' : '登录以访问云端存储'}
              </p>
            </div>

            <div className="space-y-5">
              {/* 基本信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="至少6位字符"
                />
              </div>

              {/* 注册时才显示的信息 */}
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司/店铺名称
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：XX商店"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      所属行业
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind.value}
                          type="button"
                          onClick={() => setIndustry(ind.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            industry === ind.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{ind.icon}</span>
                            <span className="text-sm font-medium">{ind.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      职位身份
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {POSITIONS.map((pos) => (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => setPosition(pos.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            position === pos.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{pos.icon}</span>
                            <span className="text-sm font-medium">{pos.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      团队规模
                    </label>
                    <select
                      value={workplaceSize}
                      onChange={(e) => setWorkplaceSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">请选择...</option>
                      <option value="1-5">1-5人</option>
                      <option value="6-20">6-20人</option>
                      <option value="21-50">21-50人</option>
                      <option value="51-100">51-100人</option>
                      <option value="100+">100人以上</option>
                    </select>
                  </div>
                </>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('成功') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp ? '已有账号？登录' : '没有账号？注册'}
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  取消
                </button>
              </div>

              <button
                onClick={handleAuth}
                disabled={loading || !email || !password || (isSignUp && password.length < 6)}
                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    处理中...
                  </>
                ) : (
                  isSignUp ? '注册账号' : '登录'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

